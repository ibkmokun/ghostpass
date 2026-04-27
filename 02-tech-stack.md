# GhostPass — Tech Stack

## Philosophy

GhostPass is designed to be **minimal, composable, and standard-compliant**. We use battle-tested libraries and avoid exotic dependencies. Every component can be replaced or upgraded independently.

---

## Layer 1: Smart Contracts

### Language & Framework
| Choice | Rationale |
|---|---|
| **Solidity ^0.8.20** | Standard EVM language. Used for AgentRegistry and CCIP Resolver. |
| **Foundry** | Fast tests, forge scripting for deployments, built-in fuzzing. Hardhat is acceptable but Foundry is faster for hackathon iteration. |
| **OpenZeppelin Contracts v5** | battle-tested access control, Ownable, ReentrancyGuard. |
| **ENS Contracts** | ENSRegistry, PublicResolver, NameWrapper interfaces for integration. |

### Contracts to Build

| Contract | Purpose | Deploy Target |
|---|---|---|
| `GhostPassRegistry.sol` | Agent registration, verification, subname linking | Base Sepolia or Sepolia |
| `GhostPassResolver.sol` | CCIP-enabled resolver (EIP-3668) that calls the offchain gateway | Same as registry |
| `StealthVerifier.sol` | Onchain verification of stealth address derivation (optional, for ZK future) | Same as registry |

### Testing Strategy
- **Forge unit tests**: Every contract function tested with happy path + revert cases
- **Fork tests**: Test against live ENS registry on Sepolia
- **Fuzz tests**: Stealth address derivation with random inputs

---

## Layer 2: Stealth Address Cryptography

### Core Algorithm
GhostPass uses the **standard elliptic-curve stealth address protocol** (similar to Umbra but simplified for agents):

1. **Key generation**: Agent generates spending key pair `(s, S)` and viewing key pair `(v, V)`
2. **Meta-address**: Published as `V || S` (concatenated public keys)
3. **Address derivation**: 
   - Payer generates ephemeral key pair `(r, R)`
   - Shared secret: `shared = ECDH(r, S) = ECDH(s, R)`
   - Stealth private key: `stealth_priv = hash(shared) + s`
   - Stealth public key: `stealth_pub = hash(shared)*G + S`
   - Stealth address: `keccak256(stealth_pub)[12:]` (Ethereum address format)
4. **Recovery**: 
   - Payee scans announcements for `R` values
   - For each `R`, compute `shared = ECDH(v, R)` (using viewing key)
   - Derive candidate address, check if it received funds
   - If match, derive private key: `stealth_priv = hash(shared) + s`

### Libraries
| Library | Purpose |
|---|---|
| **ethers.js v6** or **viem** | Key pair generation, ECDH, keccak256, secp256k1 operations |
| **noble-secp256k1** | Lightweight, audited pure-JS secp256k1 implementation (fallback) |
| **elliptic** | Alternative if noble-secp256k1 has compatibility issues |

### Onchain vs Offchain
- **Address derivation happens OFFCHAIN** in the CCIP Gateway (gas-free, scalable)
- **Address verification can happen ONCHAIN** in StealthVerifier.sol (optional, for future ZK proofs)

---

## Layer 3: ENS & CCIP Read (EIP-3668)

### ENS Components
| Component | Tool | Purpose |
|---|---|---|
| **ENS NameWrapper** | Existing contract | Wrap `ghostpass.eth` to enable subname minting with fuses |
| **ENS PublicResolver** | Existing contract | Base resolver, extended with CCIP support |
| **CCIP Read (EIP-3668)** | Custom resolver | Offchain lookup for dynamic stealth addresses |
| **Subname issuance** | NameStone API or Namespace SDK | Gasless subname creation on L2 (Base) |

### NameStone vs Namespace vs Durin
| Provider | Best For | Notes |
|---|---|---|
| **NameStone** | Gasless subnames on L2 | API-driven, free tier, great for hackathons |
| **Namespace** | Self-hosted subnames | More control, requires backend |
| **Durin** | L2-native ENS | Good for production, more setup |

**Hackathon Choice**: NameStone API for gasless subname issuance on Base. This lets us mint `agent-123.ghostpass.eth` instantly without gas costs.

### CCIP Gateway
| Aspect | Choice |
|---|---|
| **Runtime** | Node.js 20+ with Express |
| **Language** | TypeScript |
| **ENSIP-10 (Wildcard Resolution)** | Required for offchain resolution |
| **EIP-3668 (CCIP Read)** | Gateway signs responses with a known signer address |
| **Deployment** | Vercel Serverless Functions or Railway (free tier) |

---

## Layer 4: Backend Services

### CCIP Gateway Server
- **Framework**: Express.js with TypeScript
- **Endpoints**:
  - `GET /resolve/{name}` — Returns stealth address for given ENS name
  - `POST /register` — Links agent address to stealth meta-address
  - `GET /health` — Health check for CCIP verification
- **Response format**: EIP-3668 compliant with `data` and `sender` fields

### Blockchain Scanner (Recovery Service)
- **Purpose**: Monitors blockchain for payments to stealth addresses
- **Tool**: ethers.js `Provider.getLogs()` with event filters
- **Optimization**: Only scan blocks since last check, filter by Transfer events to unknown addresses
- **Storage**: Local JSON file or 0G Storage KV (for hackathon, local file is fine)

### Agent Registry API
- **Purpose**: CRUD operations for agent profiles, capabilities, reputation
- **Framework**: Express.js REST API
- **Database**: SQLite (for hackathon simplicity) or 0G Storage KV (to show 0G integration)

---

## Layer 5: Frontend

### Framework & Styling
| Choice | Rationale |
|---|---|
| **Next.js 14 (App Router)** | React framework with API routes, easy deployment to Vercel |
| **TypeScript** | Type safety across frontend and shared crypto utilities |
| **Tailwind CSS** | Rapid UI development, no design system needed |
| **shadcn/ui** | Pre-built accessible components (dialog, button, input, toast) |
| **Wagmi + Viem** | Best-in-class Ethereum React hooks and low-level client |
| **RainbowKit** | Easy wallet connection UI |

### Key Pages
| Page | Purpose |
|---|---|
| `/` | Landing page with problem statement and CTA |
| `/register` | Agent registration form (connect wallet, generate keys, mint subname) |
| `/dashboard` | Agent dashboard: balance, received payments, reputation |
| `/discover` | Agent directory: browse agents by capability, resolve and pay |
| `/pay/:ensName` | Payment page for a specific agent (stealth address resolution) |
| `/demo` | Interactive two-panel demo (payer + payee) |

### State Management
- **Wagmi hooks**: All onchain state (balances, transactions, ENS resolution)
- **React Query (TanStack Query)**: Server state (agent profiles, gateway responses)
- **Zustand**: Minimal global UI state (modal open/close, demo mode)

---

## Layer 6: Agent Client SDK

### Purpose
A lightweight JavaScript/TypeScript library that agents can import to:
- Register themselves with GhostPass
- Resolve other agents' stealth addresses
- Send payments to stealth addresses
- Scan and recover incoming payments

### Package: `@ghostpass/sdk`
| Module | Exports |
|---|---|
| `keys` | `generateStealthKeys()`, `deriveStealthAddress()`, `recoverStealthPrivateKey()` |
| `registry` | `registerAgent()`, `updateAgentProfile()`, `getAgentProfile()` |
| `resolution` | `resolveStealthAddress(ensName)`, `resolveAgentCapabilities(ensName)` |
| `payment` | `sendStealthPayment(ensName, amount, token)`, `scanForPayments(viewingKey)` |
| `recovery` | `recoverPayment(stealthAddress, viewingKey, spendingKey)` |

---

## Layer 7: Deployment & Infrastructure

### Networks
| Network | Purpose | Why |
|---|---|---|
| **Base Sepolia** | Primary testnet deployment | Low gas, fast blocks, NameStone supports Base |
| **Sepolia** | ENS testnet resolver verification | ENS core contracts live here |
| **Base Mainnet** | Optional: real subnames for demo | Only if mainnet ETH is available |

### Deployment Pipeline
| Step | Tool |
|---|---|
| Contract compilation | `forge build` |
| Testnet deployment | `forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast` |
| Contract verification | `forge verify-contract` via Basescan API |
| Gateway deployment | `vercel --prod` |
| Frontend deployment | `vercel --prod` (same or separate project) |

### Environment Variables
```bash
# Smart Contract
PRIVATE_KEY=                    # Deployer private key
BASE_SEPOLIA_RPC=               # Alchemy or Infura RPC URL
ETHERSCAN_API_KEY=              # For contract verification

# Gateway
GATEWAY_SIGNER_PRIVATE_KEY=     # Signs CCIP responses
NAMESTONE_API_KEY=              # For gasless subname issuance
ENS_REGISTRY_ADDRESS=           # Sepolia or Base ENS registry
GHOSTPASS_REGISTRY_ADDRESS=     # Deployed contract address

# Frontend
NEXT_PUBLIC_GATEWAY_URL=        # CCIP gateway endpoint
NEXT_PUBLIC_REGISTRY_ADDRESS=   # GhostPassRegistry address
NEXT_PUBLIC_CHAIN_ID=           # 84532 for Base Sepolia
```

---

## Layer 8: Development Tools

| Tool | Purpose |
|---|---|
| **Git + GitHub** | Version control, public repo for submission |
| **VS Code** | IDE with Solidity, TypeScript extensions |
| **Metamask** | Testnet wallet for development |
| **Base Sepolia Faucet** | Get testnet ETH |
| **ENS Manager App** | Manage `ghostpass.eth` name |
| **Basescan** | Verify and inspect contracts |

---

## Complete Dependency List

### Smart Contracts (`contracts/`)
```json
{
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0",
    "@ensdomains/ens-contracts": "^1.0.0"
  },
  "devDependencies": {
    "forge-std": "github:foundry-rs/forge-std",
    "solhint": "^4.0.0"
  }
}
```

### Gateway & API (`gateway/`)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "viem": "^2.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/express": "^4.17.0",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.0"
  }
}
```

### Frontend (`web/`)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "viem": "^2.0.0",
    "wagmi": "^2.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### SDK (`sdk/`)
```json
{
  "dependencies": {
    "viem": "^2.0.0",
    "@noble/secp256k1": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Register   │  │  Dashboard   │  │   Discover   │  │    Demo      │ │
│  │    Page      │  │    Page      │  │    Page      │  │    Page      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         └───────────────────┴───────────────────┴───────────────────┘     │
│                              Wagmi + Viem                               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────┴────────────────────────────────────┐
│                           GHOSTPASS SDK (@ghostpass/sdk)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     keys     │  │   registry   │  │  resolution  │  │   payment    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
┌───────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   CCIP GATE   │         │  GHOSTPASS REG   │         │   BLOCKCHAIN     │
│   WAY (TS)    │         │   ISTRY (Solid)  │         │   (Base Sepolia) │
│               │         │                  │         │                  │
│ • /resolve    │         │ • registerAgent  │         │ • ENS Registry   │
│ • /register   │         │ • verifyAgent    │         │ • NameWrapper    │
│ • Sign CCIP   │         │ • linkSubname    │         │ • Transfers      │
└───────┬───────┘         └────────┬─────────┘         └──────────────────┘
        │                          │
        └──────────────────────────┴──────────────────────────────┐
                                ▼                                 │
                       ┌─────────────────┐                        │
                       │   NAMESTONE API │                        │
                       │  (Gasless subs) │                        │
                       └─────────────────┘                        │
                                                                  │
                       ┌─────────────────┐                        │
                       │  0G STORAGE KV  │◄───────────────────────┘
                       │ (Optional: agent│  (Agent profiles,     │
                       │   profiles)     │   reputation data)     │
                       └─────────────────┘                        │
                                                                  │
                       ┌─────────────────┐                        │
                       │  SCANNER SERVICE│                        │
                       │  (Payment recov)│                        │
                       └─────────────────┘                        │
                                                                  │
└─────────────────────────────────────────────────────────────────┘
```