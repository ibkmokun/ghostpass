# GhostPass — Context Files

This document provides the complete file architecture and implementation context for every file in the GhostPass codebase. It serves as the single source of truth for what needs to be built, what each file does, and how the pieces fit together.

Use this document when:
- You're unsure which file to edit
- You need to onboard a new team member
- You're writing the README and need file descriptions
- You're debugging and need to trace data flow

---

## Repository Root

| File | Purpose | When to Edit |
|------|---------|--------------|
| `README.md` | Project overview, setup, demo links | Before submission |
| `LICENSE` | MIT license | Once, at start |
| `.gitignore` | Ignore build artifacts, .env, node_modules | When adding new tools |
| `.env.example` | Template for all environment variables | When adding new env vars |
| `package.json` | Root workspace config (if using pnpm workspaces) | When adding packages |

---

## contracts/

### foundry.toml
**Purpose**: Foundry configuration — compiler version, optimizer, remappings, RPC endpoints for testing.

**Key settings**:
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC}"
sepolia = "${SEPOLIA_RPC}"

[etherscan]
base_sepolia = { key = "${ETHERSCAN_API_KEY}", url = "https://api-sepolia.basescan.org/api" }
```

### src/GhostPassRegistry.sol
**Purpose**: Core registry contract. Stores agent profiles, handles registration, and emits payment announcements.

**State variables**:
```solidity
struct Agent {
    address owner;
    bytes32 spendingPubKey;
    bytes32 viewingPubKey;
    string capabilities;
    string pricing;
    uint256 createdAt;
}

mapping(string => Agent) public agents;
mapping(string => bool) public isRegistered;
```

**Key functions**:
- `registerAgent(string, bytes32, bytes32, string, string)` — Creates agent record
- `updateAgentProfile(string, string, string)` — Updates capabilities/pricing
- `announce(bytes32, bytes32, address, uint256)` — Emits PaymentAnnounced event
- `getAgent(string) → Agent` — View function for agent data

**Events**:
- `AgentRegistered(string subname, address owner, uint256 timestamp)`
- `AgentUpdated(string subname, uint256 timestamp)`
- `PaymentAnnounced(bytes32 stealthAddress, bytes32 ephemeralPubKey, address sender, uint256 amount)`

**Access control**: Ownable for admin functions; agent owner for profile updates.

### src/GhostPassResolver.sol
**Purpose**: CCIP-enabled ENS resolver (EIP-3668). Reverts with offchain lookup data so the client calls the gateway.

**Key concept**: Instead of returning an address directly, this resolver reverts with encoded callback data. The ENS client catches this revert, calls the gateway URL, and returns the gateway's signed response.

**Key functions**:
- `resolve(bytes calldata name, bytes calldata data) → bytes` — Main resolution entry point
- `setGatewayURL(string)` — Owner-only setter for gateway endpoint
- `setSigner(address)` — Owner-only setter for trusted signer

**Internal logic**:
```solidity
function resolve(bytes calldata name, bytes calldata data) external view returns (bytes) {
    // Encode the CCIP Read revert
    string[] memory urls = new string[](1);
    urls[0] = gatewayURL;
    
    revert OffchainLookup(
        address(this),
        urls,
        abi.encodeCall(this.resolve, (name, data)),
        this.resolveWithProof.selector,
        abi.encode(name)
    );
}

function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns (bytes) {
    // Verify gateway signature
    // Decode stealth address from response
    // Return ABI-encoded address
}
```

**Why this matters**: This is the bridge between ENS onchain resolution and GhostPass offchain stealth address derivation. Without this contract, ENS cannot delegate to the gateway.

### test/GhostPassRegistryTest.t.sol
**Purpose**: Unit and integration tests for the registry contract.

**Test cases**:
- `test_RegisterAgent()` — Happy path registration
- `test_RegisterAgent_DuplicateNameReverts()` — Cannot register same subname twice
- `test_RegisterAgent_InvalidKeysReverts()` — Malformed public keys rejected
- `test_UpdateProfile_AsOwner()` — Owner can update profile
- `test_UpdateProfile_AsNonOwnerReverts()` — Non-owner cannot update
- `test_Announce_EmitsEvent()` — Announcement event has correct data
- `test_GetAgent_ReturnsCorrectData()` — View function accuracy
- `testFuzz_RegisterAgent(string, bytes32, bytes32)` — Fuzz testing

### test/GhostPassResolverTest.t.sol
**Purpose**: Tests for CCIP resolution and signature verification.

**Test cases**:
- `test_Resolve_RevertsWithOffchainLookup()` — Correct revert encoding
- `test_ResolveWithProof_ValidSignature()` — Accepts valid gateway sig
- `test_ResolveWithProof_InvalidSignatureReverts()` — Rejects invalid sig
- `test_ResolveWithProof_WrongSignerReverts()` — Rejects sig from wrong key

### script/DeployRegistry.s.sol
**Purpose**: Deploys GhostPassRegistry to Base Sepolia.

**Usage**:
```bash
forge script script/DeployRegistry.s.sol --rpc-url base_sepolia --broadcast --verify
```

**Output**: Contract address written to stdout and `broadcast/` directory.

### script/DeployResolver.s.sol
**Purpose**: Deploys GhostPassResolver with initial gateway URL and signer address.

**Post-deployment**: Must call `setGatewayURL()` and `setSigner()` with live values.

---

## gateway/

### package.json
**Purpose**: Node.js dependencies for the CCIP gateway server.

**Key scripts**:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  }
}
```

### src/index.ts
**Purpose**: Express server entry point. Configures middleware, mounts routes, starts HTTP server.

**Key code**:
```typescript
import express from 'express';
import cors from 'cors';
import { resolveRoute } from './routes/resolve';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.get('/resolve/:name', resolveRoute);

app.listen(process.env.PORT || 3000);
```

### src/routes/resolve.ts
**Purpose**: HTTP handler for `GET /resolve/:name`. The heart of the gateway.

**Flow**:
1. Parse ENS name from URL params
2. Validate name format (must end in `.ghostpass.eth`)
3. Fetch `ghostpass.metaaddress` text record from ENS
4. Parse meta-address into viewingPubKey + spendingPubKey
5. Generate ephemeral key pair
6. Derive stealth address via ECDH + hashing
7. Encode response per EIP-3668
8. Sign response with gateway private key
9. Return JSON with `data`, `signature`, and `sender`

**Key code**:
```typescript
export async function resolveRoute(req: Request, res: Response) {
  const { name } = req.params;
  
  // 1. Validate
  if (!name.endsWith('.ghostpass.eth')) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  
  // 2. Fetch meta-address from ENS
  const metaAddress = await getTextRecord(name, 'ghostpass.metaaddress');
  if (!metaAddress) {
    return res.status(404).json({ error: 'Agent not registered' });
  }
  
  // 3. Parse keys
  const { spendingPubKey, viewingPubKey } = parseMetaAddress(metaAddress);
  
  // 4. Generate ephemeral key
  const ephemeralPriv = generatePrivateKey();
  const ephemeralPub = getPublicKey(ephemeralPriv);
  
  // 5. Derive stealth address
  const stealthAddress = deriveStealthAddress(spendingPubKey, ephemeralPriv);
  
  // 6. Encode and sign
  const responseData = encodeAbiParameters(
    [{ type: 'address' }],
    [stealthAddress]
  );
  const signature = await signMessage(responseData, process.env.GATEWAY_SIGNER_PRIVATE_KEY!);
  
  // 7. Return
  res.json({
    data: responseData,
    signature,
    sender: process.env.GATEWAY_SIGNER_ADDRESS,
    ephemeralPubKey: ephemeralPub
  });
}
```

### src/ens.ts
**Purpose**: ENS text record fetching using viem.

**Key function**:
```typescript
export async function getTextRecord(name: string, key: string): Promise<string | null> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC)
  });
  
  const resolver = await client.getEnsResolver({ name });
  if (!resolver) return null;
  
  const record = await client.readContract({
    address: resolver,
    abi: publicResolverABI,
    functionName: 'text',
    args: [namehash(name), key]
  });
  
  return record;
}
```

### src/stealth.ts
**Purpose**: Pure math for stealth address derivation.

**Key functions**:
- `generatePrivateKey(): Uint8Array` — Cryptographically secure random 32 bytes
- `getPublicKey(privateKey): Uint8Array` — secp256k1 point multiplication
- `deriveStealthAddress(spendingPubKey, ephemeralPrivKey): Address` — ECDH + keccak256
- `parseMetaAddress(metaAddressString): { spendingPubKey, viewingPubKey }` — Deserialize

**Critical math**:
```typescript
export function deriveStealthAddress(
  spendingPubKey: Uint8Array,
  ephemeralPrivKey: Uint8Array
): Address {
  // sharedSecret = ephemeralPriv * spendingPub (ECDH)
  const sharedSecret = secp256k1.getSharedSecret(ephemeralPrivKey, spendingPubKey);
  
  // hashedSecret = keccak256(sharedSecret)
  const hashedSecret = keccak256(sharedSecret);
  
  // stealthPubKey = spendingPub + hashedSecret * G
  const stealthPubKey = secp256k1.ProjectivePoint.fromHex(spendingPubKey)
    .add(secp256k1.ProjectivePoint.fromPrivateKey(hashedSecret))
    .toRawBytes(true);
  
  // stealthAddress = last 20 bytes of keccak256(stealthPubKey)
  return '0x' + keccak256(stealthPubKey).slice(-40);
}
```

**Why pure functions**: These must be deterministic and testable. The same inputs must always produce the same outputs.

### src/ccip.ts
**Purpose**: EIP-3668 response encoding.

**Key function**:
```typescript
export function encodeCCIPResponse(stealthAddress: Address): Hex {
  return encodeAbiParameters(
    [{ type: 'address' }],
    [stealthAddress]
  );
}
```

### src/sign.ts
**Purpose**: Sign gateway responses with the gateway's private key.

**Key function**:
```typescript
export async function signResponse(data: Hex, privateKey: Hex): Promise<Hex> {
  const messageHash = keccak256(data);
  const signature = await signMessage({ message: { raw: messageHash }, privateKey });
  return signature;
}
```

---

## sdk/

### src/index.ts
**Purpose**: Public API exports. Everything a developer needs to use GhostPass.

```typescript
export { generateStealthKeys, deriveStealthAddress, recoverStealthPrivateKey } from './keys';
export { registerAgent, getAgentProfile } from './registry';
export { resolveStealthAddress, resolveAgentCapabilities } from './resolution';
export { sendStealthPayment, announcePayment } from './payment';
export { scanForPayments, recoverPayment } from './recovery';
```

### src/keys.ts
**Purpose**: Cryptographic key generation and management.

**Key functions**:
- `generateStealthKeys(): { spendingPriv, spendingPub, viewingPriv, viewingPub, metaAddress }`
- `deriveStealthAddress(spendingPub, ephemeralPriv): Address`
- `recoverStealthPrivateKey(ephemeralPub, viewingPriv, spendingPriv): Hex`
- `serializeMetaAddress(viewingPub, spendingPub): string`
- `parseMetaAddress(metaAddress): { viewingPub, spendingPub }`

**Agent key backup format**:
```typescript
interface KeyBackup {
  version: 'ghostpass-v1';
  encrypted: boolean;
  spendingPubKey: string;
  viewingPubKey: string;
  // Private keys are encrypted with user password if backup is created
  spendingPrivKey?: string; // AES-encrypted
  viewingPrivKey?: string;  // AES-encrypted
}
```

### src/registry.ts
**Purpose**: Onchain registry interactions.

**Key functions**:
- `registerAgent(subname, metaAddress, capabilities, pricing, signer)` — Writes to GhostPassRegistry
- `getAgentProfile(subname, provider)` — Reads from GhostPassRegistry
- `updateAgentProfile(subname, capabilities, pricing, signer)` — Updates agent data

**Why viem over ethers**: viem has better TypeScript support, smaller bundle size, and first-class ENS utilities.

### src/resolution.ts
**Purpose**: Resolve ENS names to stealth addresses and agent metadata.

**Key functions**:
- `resolveStealthAddress(ensName, provider): Promise<{ address, ephemeralPubKey }>`
- `resolveAgentCapabilities(ensName, provider): Promise<JSON>`
- `resolveAgentPricing(ensName, provider): Promise<string>`

**How it works**:
```typescript
export async function resolveStealthAddress(ensName: string, provider: PublicClient) {
  // Standard ENS resolution triggers CCIP Read
  const address = await provider.getEnsAddress({ name: ensName });
  
  // The CCIP Read response includes the ephemeral pub key in extra data
  // We extract it from the gateway response
  const ephemeralPubKey = await fetchEphemeralPubKeyFromGateway(ensName);
  
  return { address, ephemeralPubKey };
}
```

### src/payment.ts
**Purpose**: Send payments to stealth addresses.

**Key functions**:
- `sendStealthPayment(ensName, amount, token, signer, provider)` — Full payment flow
- `announcePayment(stealthAddress, ephemeralPubKey, token, amount, signer)` — Optional announcement

**Token handling**:
- If token is ETH/native: send simple value transfer
- If token is ERC-20: check allowance, approve if needed, call transfer

### src/recovery.ts
**Purpose**: Scan blockchain and recover payments.

**Key functions**:
- `scanForPayments(viewingPriv, spendingPub, provider, fromBlock)` — Scan for matches
- `recoverPayment(stealthAddress, ephemeralPub, viewingPriv, spendingPriv, recipient, signer)` — Sweep funds

**Scanner algorithm**:
```typescript
export async function scanForPayments(
  viewingPriv: Uint8Array,
  spendingPub: Uint8Array,
  provider: PublicClient,
  fromBlock: bigint
) {
  const matches = [];
  
  // Get all transfer events from the announcement contract
  const logs = await provider.getLogs({
    address: GHOSTPASS_REGISTRY_ADDRESS,
    event: parseAbiItem('event PaymentAnnounced(bytes32,bytes32,address,uint256)'),
    fromBlock
  });
  
  for (const log of logs) {
    const { ephemeralPubKey } = log.args;
    
    // Derive candidate stealth address
    const sharedSecret = secp256k1.getSharedSecret(viewingPriv, ephemeralPubKey);
    const hashedSecret = keccak256(sharedSecret);
    const candidatePub = secp256k1.ProjectivePoint.fromHex(spendingPub)
      .add(secp256k1.ProjectivePoint.fromPrivateKey(hashedSecret))
      .toRawBytes(true);
    const candidateAddress = '0x' + keccak256(candidatePub).slice(-40);
    
    // Check if this address received funds
    const balance = await provider.getBalance({ address: candidateAddress });
    if (balance > 0n) {
      matches.push({ address: candidateAddress, ephemeralPubKey, amount: balance });
    }
  }
  
  return matches;
}
```

---

## web/

### src/app/layout.tsx
**Purpose**: Root layout with all React providers.

**Key providers**:
- `<WagmiProvider>` — Ethereum connection state
- `<QueryClientProvider>` — React Query for server state
- `<RainbowKitProvider>` — Wallet connection UI
- `<ToastProvider>` — Transaction notifications

### src/app/page.tsx
**Purpose**: Landing page.

**Sections**:
1. Hero: tagline, animated ghost/stealth visual, CTA buttons
2. Problem: "Every agent payment is visible onchain"
3. Solution: "GhostPass gives agents invisible wallets with human-readable names"
4. How It Works: 3-step visual (Register → Resolve → Recover)
5. Tech Stack: sponsor logos (ENS, Base)
6. CTA: "Register Your Agent" button

### src/app/register/page.tsx
**Purpose**: Agent registration flow.

**Steps**:
1. **Connect Wallet** — RainbowKit connect button
2. **Generate Keys** — Click button, browser generates key pairs, shows public keys, offers download of encrypted backup
3. **Agent Profile** — Form fields:
   - Agent name (display name)
   - Capabilities (textarea for JSON array)
   - Pricing (e.g., "5 USDC per analysis")
4. **Review & Submit** — Summary card, confirm button triggers `registerAgent()` transaction
5. **Success** — Shows new subname, link to dashboard, confetti animation

### src/app/dashboard/page.tsx
**Purpose**: Agent dashboard.

**Layout**:
- **Profile Card**: ENS subname, avatar, capabilities, pricing, reputation score
- **Balance Section**: ETH balance, USDC balance (fetched via wagmi `useBalance`)
- **Payments Table**: Columns — Stealth Address, Amount, Token, Date, Status, Action
  - Status: "Unclaimed" or "Recovered"
  - Action: "Recover" button for unclaimed payments
- **Scan Button**: Triggers `scanForPayments()` via SDK, shows loading spinner, updates table
- **Edit Button**: Opens modal to update capabilities/pricing

### src/app/discover/page.tsx
**Purpose**: Agent marketplace/directory.

**Layout**:
- **Search Bar**: Filter by name or capability
- **Filter Tags**: "trading", "research", "security", "data" — click to filter
- **Agent Cards**: Grid layout, each card shows:
  - ENS subname (clickable)
  - Display name
  - Capabilities (badge chips)
  - Pricing
  - Reputation score (stars or number)
  - "Pay This Agent" button → navigates to `/pay/:ensName`

### src/app/pay/[ensName]/page.tsx
**Purpose**: Payment page for a specific agent.

**Layout**:
- **Agent Header**: Name, capabilities, pricing, reputation
- **Resolution Section**:
  - "Resolve Stealth Address" button
  - Shows derived address
  - Shows ephemeral public key
  - "Resolve Again" button to prove address changes
- **Payment Form**:
  - Token selector (ETH, USDC)
  - Amount input
  - "Announce Payment" checkbox
  - "Send Payment" button
- **Transaction Status**: Pending → Confirmed with Basescan link

### src/app/demo/page.tsx
**Purpose**: Interactive two-agent demo.

**Layout**: Split screen
- **Left Panel (Seller Agent)**:
  - Agent name: `trader-alpha.ghostpass.eth`
  - Capabilities: ["trading-signals"]
  - Pricing: 5 USDC
  - Balance: starts at 0
  - Payment history: empty
- **Middle Section (Interaction Log)**:
  - Step-by-step log of what happens
  - Animated arrows between panels
- **Right Panel (Buyer Agent)**:
  - Input field with seller's ENS pre-filled
  - "Discover" button
  - "Resolve" button
  - "Pay 5 USDC" button

**Animation flow**:
1. Buyer clicks "Discover" → log shows "Found trader-alpha.ghostpass.eth"
2. Buyer clicks "Resolve" → log shows "Derived stealth address: 0x..." and address appears in left panel
3. Buyer clicks "Pay" → transaction animation, log shows "Payment sent"
4. Left panel "Scan" button auto-clicks → log shows "Found 5 USDC payment"
5. Left panel "Recover" button auto-clicks → log shows "Recovered to main wallet"
6. Left panel balance updates to 5 USDC

### src/lib/wagmi.ts
**Purpose**: wagmi configuration.

```typescript
import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected(), walletConnect({ projectId: 'YOUR_PROJECT_ID' })],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC)
  }
});
```

### src/lib/rainbowkit.ts
**Purpose**: RainbowKit configuration.

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const rainbowKitConfig = getDefaultConfig({
  appName: 'GhostPass',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [baseSepolia]
});
```

### src/hooks/useAgentProfile.ts
**Purpose**: React hook for fetching agent profile data.

```typescript
export function useAgentProfile(ensName: string) {
  const { data: profile } = useReadContract({
    address: GHOSTPASS_REGISTRY_ADDRESS,
    abi: ghostPassRegistryABI,
    functionName: 'getAgent',
    args: [ensName]
  });
  
  const { data: capabilities } = useEnsText({
    name: ensName,
    key: 'ai.capabilities'
  });
  
  return { profile, capabilities };
}
```

---

## docs/

### docs/ARCHITECTURE.md
**Purpose**: High-level system architecture for judges and contributors.

**Contents**:
- System diagram (Mermaid)
- Data flow descriptions
- Component interactions
- Security considerations

### docs/CRYPTOGRAPHY.md
**Purpose**: Deep dive into the stealth address math.

**Contents**:
- Key generation algorithm
- Derivation formula with LaTeX math
- Recovery algorithm
- Security proofs (informal)
- Comparison to Umbra (what's different)

### docs/ENS_INTEGRATION.md
**Purpose**: Proof that ENS is doing real work (for prize eligibility).

**Contents**:
- Which ENS features are used
- How subnames are issued
- How text records store agent metadata
- How CCIP Read enables dynamic resolution
- Why this is not cosmetic

### docs/DEPLOYMENTS.md
**Purpose**: Contract addresses and deployment records.

**Contents**:
- Base Sepolia addresses
- Sepolia addresses (if any)
- Gateway URL
- Frontend URL
- Deployment transaction hashes
- Verification links (Basescan)

---

## Critical Data Flows

### Flow A: Registration
```
User → web/register/page.tsx → sdk/registry.ts → viem → GhostPassRegistry.sol
                                    ↓
                              NameStone API → Base L2 ENS
                                    ↓
                              ENS text records set
```

### Flow B: Resolution
```
Payer → web/pay/[ensName]/page.tsx → sdk/resolution.ts → viem → ENS Registry
                                                           ↓
                                                    GhostPassResolver.sol
                                                           ↓
                                                    CCIP Read revert
                                                           ↓
                                                    gateway/routes/resolve.ts
                                                           ↓
                                                    ENS text record fetch
                                                           ↓
                                                    Stealth address derivation
                                                           ↓
                                                    Signed response returned
```

### Flow C: Payment
```
Payer → sdk/payment.ts → viem → Blockchain (transfer to stealth address)
                    ↓
              Optional: GhostPassRegistry.announce()
```

### Flow D: Recovery
```
Payee → web/dashboard/page.tsx → sdk/recovery.ts → viem → Blockchain (scan logs)
                                                            ↓
                                                     Derive candidate addresses
                                                            ↓
                                                     Check balances
                                                            ↓
                                                     Sign sweep transaction
                                                            ↓
                                                     Broadcast to mempool
```

---

## File Ownership Matrix

| File | Primary Owner | Secondary Reviewer |
|------|--------------|-------------------|
| `GhostPassRegistry.sol` | Smart Contract Dev | Backend Dev |
| `GhostPassResolver.sol` | Smart Contract Dev | Backend Dev |
| `gateway/src/stealth.ts` | Backend Dev | Smart Contract Dev |
| `gateway/src/routes/resolve.ts` | Backend Dev | Frontend Dev |
| `sdk/src/keys.ts` | Backend Dev | Smart Contract Dev |
| `sdk/src/recovery.ts` | Backend Dev | Smart Contract Dev |
| `web/app/register/page.tsx` | Frontend Dev | Backend Dev |
| `web/app/pay/[ensName]/page.tsx` | Frontend Dev | Backend Dev |
| `web/app/demo/page.tsx` | Frontend Dev | All |

---

## Environment Variables Reference

| Variable | Required By | Description |
|----------|-------------|-------------|
| `PRIVATE_KEY` | Contracts | Deployer wallet private key |
| `BASE_SEPOLIA_RPC` | Contracts, Gateway, SDK, Web | Alchemy/Infura RPC endpoint |
| `ETHERSCAN_API_KEY` | Contracts | Basescan API key for verification |
| `GATEWAY_SIGNER_PRIVATE_KEY` | Gateway | Signs CCIP responses |
| `GATEWAY_SIGNER_ADDRESS` | Gateway, Contracts | Public address of signer |
| `NAMESTONE_API_KEY` | Gateway, Web | Gasless subname issuance |
| `GHOSTPASS_REGISTRY_ADDRESS` | Gateway, SDK, Web | Deployed registry contract |
| `GHOSTPASS_RESOLVER_ADDRESS` | Gateway | Deployed resolver contract |
| `FRONTEND_URL` | Gateway | CORS allowed origin |
| `NEXT_PUBLIC_GATEWAY_URL` | Web | CCIP gateway endpoint |
| `NEXT_PUBLIC_REGISTRY_ADDRESS` | Web | Registry address for wagmi |
| `NEXT_PUBLIC_CHAIN_ID` | Web | 84532 for Base Sepolia |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC` | Web | Public RPC for frontend |

---

## Key Decisions Log

| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| Base Sepolia as primary chain | Low gas, fast blocks, NameStone supports Base | Yes — can add more chains |
| NameStone for gasless subs | No gas costs for subname creation = better UX | Yes — can migrate to self-hosted |
| Viem over Ethers | Better TypeScript, smaller bundle, ENS-native | Yes — both work |
| Separate gateway server | Required for CCIP Read; enables caching | No — CCIP requires offchain component |
| Pure JS crypto (no WASM) | Simpler build, works everywhere | Yes — can add WASM for speed later |
| No password for agent recovery | Agents are autonomous; keys stored encrypted | Yes — can add TEE or HSM later |

---

## Debugging Cheat Sheet

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| CCIP resolution fails with "OffchainLookup" not caught | Client library doesn't support EIP-3668 | Use viem `getEnsAddress` which handles CCIP Read natively |
| Gateway returns 400 "Invalid name" | Name doesn't end in `.ghostpass.eth` | Validate name format before calling gateway |
| Stealth address derivation mismatch | Different curve implementations | Ensure both gateway and SDK use same library (noble-secp256k1) |
| Recovery finds no payments | Scanning wrong block range | Check `fromBlock` parameter, ensure it covers payment block |
| Subname not resolving | NameStone subname not propagated | Wait 1-2 minutes, or check NameStone dashboard |
| Contract verification fails | Wrong compiler version or optimizer settings | Match `foundry.toml` settings exactly with verification params |
| Frontend shows wrong chain | Wagmi not configured for Base Sepolia | Add Base Sepolia to `chains` array in wagmi config |
