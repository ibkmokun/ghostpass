# ETHGlobal OpenAgents Submission Answers

## What is GhostPass? (min 280 characters)

**GhostPass is the first stealth address protocol built specifically for autonomous AI agents.**

AI agents are becoming first-class economic actors—they trade, hire each other, and settle payments onchain. But every transaction leaks their wallet address, exposing their financial history, client relationships, and strategies to anyone watching the blockchain. A trading agent can be frontrun. A research agent's clients can be copied. A service agent's revenue can be tracked.

GhostPass fixes this by giving agents **persistent, human-readable ENS identities** (like `trader-alpha.ghostpass.eth`) that resolve to **unique, never-before-used stealth addresses on every single query**. When Agent A pays Agent B, the payment goes to a one-time address that has never existed before and will never exist again. No observer can link the payment to Agent B's identity. The transaction graph is completely broken.

Under the hood, GhostPass combines three technologies into a single protocol:
1. **ENS subnames** for persistent, human-readable agent identity and discoverability
2. **CCIP Read (EIP-3668)** for dynamic, offchain stealth address resolution
3. **Elliptic-curve stealth addresses** for privacy-preserving payments using ECDH + keccak256

The protocol includes a smart contract registry (GhostPassRegistry) for agent profiles, a CCIP-enabled resolver (GhostPassResolver) that delegates lookups to an offchain gateway, an Express.js gateway that derives and signs stealth addresses, a TypeScript SDK for key management and payment recovery, and a Next.js frontend for registration, discovery, payments, and an interactive demo.

Agents can register with gasless ENS subnames via NameStone, set capabilities and pricing in ENS text records, discover each other by capability, and transact with guaranteed privacy. The same ENS name resolves to a completely different address every time—proving auto-rotating privacy on every lookup.

GhostPass is deployed on Base Sepolia with contracts verified on Sourcify, the gateway running on Vercel, and the frontend live at ghostpass-coral.vercel.app.

---

## How it's made (min 280 characters)

**GhostPass was built as a monorepo with four integrated packages: smart contracts, CCIP gateway, TypeScript SDK, and Next.js frontend.**

### Smart Contracts (Solidity 0.8.20, Foundry)
We wrote two core contracts from scratch:
- **GhostPassRegistry.sol** — Handles agent registration with ownership, profile updates, and PaymentAnnounced events for onchain discovery. Uses OpenZeppelin's Ownable and ReentrancyGuard. Key insight: we store only `bytes32` public key hashes onchain to keep gas low, while the full meta-address lives in ENS text records.
- **GhostPassResolver.sol** — Implements EIP-3668 CCIP Read. Instead of returning a static address, it reverts with an `OffchainLookup` that instructs the client to call our gateway. The gateway returns a signed response, and the resolver verifies the signature against a trusted signer address before accepting the stealth address. This is the critical bridge between ENS onchain resolution and offchain stealth derivation.

Both contracts were compiled and deployed via Remix to Base Sepolia (chain ID 84532) because Foundry wasn't available in our build environment. We verified both on Sourcify for transparency.

### CCIP Gateway (Node.js, Express, Viem)
The gateway is a lightweight TypeScript server deployed as a Vercel serverless function. When a client resolves `agent.ghostpass.eth`:
1. It fetches the `ghostpass.metaaddress` text record from ENS (or falls back to the registry)
2. Parses the meta-address into spending and viewing public keys
3. Generates a cryptographically secure ephemeral key pair
4. Derives a stealth address via ECDH: `sharedSecret = ephemeralPriv × spendingPub`, then `stealthAddress = keccak256(sharedSecret + spendingPub)[12:]`
5. Signs the response with the gateway's private key
6. Returns `{ stealthAddress, signature, ephemeralPubKey }`

The signature is verified onchain in the resolver, ensuring only our gateway can dictate resolution results.

### SDK (TypeScript, Viem)
We built a reusable SDK with five modules:
- **keys.ts** — Generates secp256k1 key pairs, serializes meta-addresses, derives and recovers stealth addresses
- **registry.ts** — Reads agent profiles from GhostPassRegistry
- **resolution.ts** — Calls the CCIP gateway via HTTP
- **payment.ts** — Constructs and sends payments to stealth addresses, optionally announces them onchain
- **recovery.ts** — Scans PaymentAnnounced events, derives candidate addresses with the viewing key, and sweeps funds

### Frontend (Next.js 14, Wagmi, RainbowKit, Tailwind CSS)
The frontend has six pages:
- `/` — Landing with problem/solution narrative
- `/register` — 3-step form: generate keys → set profile → submit to registry
- `/dashboard` — Agent profile, balance, payment history with scan/recover buttons
- `/discover` — Browse agents by capability with search and filters
- `/pay/:ensName` — Resolve stealth address (with "resolve again" to prove address rotation), send payment
- `/demo` — Interactive two-agent simulation showing the full flow

**Hacky/notable details:**
- We couldn't install Foundry on Windows, so we built a **viem-based deployment script** that compiles contracts via `solc-js` and deploys them programmatically. When `solc-js` import callbacks failed with npm dependencies, we pivoted to deploying via Remix and wrote a **standalone resolver update script** that takes the contract address as a CLI argument—no deployment artifacts needed.
- The stealth address derivation is **deterministic but salted**: the same ephemeral key + spending pub always produces the same stealth address, but the ephemeral key is randomly generated per resolution, guaranteeing uniqueness.
- We used **NameStone's gasless subname API** to mint `agent-name.ghostpass.eth` without requiring users to pay mainnet gas—critical for a hackathon demo where users shouldn't need real ETH to register.

**Partner technologies used:**
- **ENS** — Subnames for identity, text records for metadata, CCIP Read for dynamic resolution
- **Base** — Low-cost, fast EVM testnet for deployment and transactions
- **Viem** — Type-safe Ethereum client for contracts, transactions, and ENS resolution
- **RainbowKit + Wagmi** — Wallet connection with support for 20+ wallets out of the box
- **Vercel** — Zero-config deployment for both frontend and gateway serverless functions
- **NameStone** — Gasless ENS subname issuance on Base L2
- **Alchemy** — Reliable Base Sepolia RPC endpoint
- **Sourcify** — Contract verification for transparency

**Repo:** https://github.com/ibkmokun/ghostpass
**Live Demo:** https://ghostpass-coral.vercel.app
