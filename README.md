# GhostPass

> **Invisible Wallets for Autonomous Agents**

GhostPass gives AI agents **persistent, human-readable ENS identities** that resolve to **unique one-time stealth addresses** on every query. Break the transaction graph. Preserve agent privacy.

**Hackathon**: ETHGlobal OpenAgents 2026  
**Tracks**: ENS — Most Creative Use of ENS + Best ENS Integration for AI Agents  
**Live Demo**: [https://ghostpass.vercel.app](https://ghostpass.vercel.app)  
**Demo Video**: [YouTube](https://youtube.com/your-video-link)  

---

## The Problem

AI agents are becoming first-class economic actors. They trade, hire each other, and settle payments autonomously. But every onchain transaction leaks their wallet address. If you can see who pays whom, you can:
- Frontrun a trading agent
- Copy a researcher's client list
- Trace an agent's entire financial history

## The Solution

**GhostPass** combines three technologies into a single protocol:
- **ENS subnames** for persistent, human-readable agent identity
- **CCIP Read (EIP-3668)** for dynamic, offchain stealth address resolution
- **Elliptic-curve stealth addresses** for privacy-preserving payments

When Agent A pays Agent B:
1. Agent A resolves `trader-alpha.ghostpass.eth`
2. GhostPass returns a **fresh stealth address** — never seen before
3. Agent A sends payment to that address
4. Agent B scans and recovers funds using its viewing key
5. No observer can link the payment to Agent B's real wallet

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Agent A   │────▶│    ENS      │────▶│   CCIP      │
│   (Payer)   │     │  Registry   │     │  Gateway    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │   Stealth   │
                                        │  Derivation │
                                        └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │   Agent B   │
                                        │  (Payee)    │
                                        └─────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Contracts** | Solidity 0.8.20, Foundry, OpenZeppelin |
| **Gateway** | Node.js, Express, TypeScript, Viem |
| **SDK** | TypeScript, Viem, Noble-secp256k1 |
| **Frontend** | Next.js 14, Wagmi, RainbowKit, Tailwind CSS |
| **ENS** | CCIP Read (EIP-3668), NameStone (gasless subnames) |
| **Network** | Base Sepolia |

## Quick Start

### Prerequisites
- Node.js 20+
- Foundry (for contracts)
- Git

### Clone & Install

```bash
git clone https://github.com/ibkmokun/ghostpass-clean.git
cd ghostpass

# Install contract dependencies (requires Foundry)
cd contracts
forge install

# Install gateway dependencies
cd ../gateway
npm install

# Install SDK dependencies
cd ../sdk
npm install

# Install frontend dependencies
cd ../web
npm install
```

### Environment Variables

Create `.env` files in each package:

**contracts/.env**
```
PRIVATE_KEY=your_deployer_private_key
BASE_SEPOLIA_RPC=https://sepolia.base.org
ETHERSCAN_API_KEY=your_basescan_api_key
```

**gateway/.env**
```
GATEWAY_SIGNER_PRIVATE_KEY=your_gateway_signer_key
GATEWAY_SIGNER_ADDRESS=0x...
BASE_SEPOLIA_RPC=https://sepolia.base.org
GHOSTPASS_REGISTRY_ADDRESS=0x...
FRONTEND_URL=https://ghostpass.vercel.app
PORT=3000
```

**web/.env.local**
```
NEXT_PUBLIC_GATEWAY_URL=https://your-gateway.vercel.app
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
```

### Deploy Contracts

```bash
cd contracts
source .env
forge script script/DeployRegistry.s.sol --rpc-url base_sepolia --broadcast --verify
forge script script/DeployResolver.s.sol --rpc-url base_sepolia --broadcast --verify
```

### Run Gateway

```bash
cd gateway
npm run dev
```

### Run Frontend

```bash
cd web
npm run dev
```

## Contract Addresses

| Contract | Address | Network |
|----------|---------|---------|
| GhostPassRegistry | `0x...` | Base Sepolia |
| GhostPassResolver | `0x...` | Base Sepolia |

## Project Structure

```
ghostpass/
├── contracts/          # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── GhostPassRegistry.sol
│   │   └── GhostPassResolver.sol
│   ├── test/
│   └── script/
├── gateway/            # CCIP Read gateway (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts
│   │   ├── stealth.ts
│   │   └── routes/
│   │       └── resolve.ts
├── sdk/                # TypeScript SDK for agents
│   └── src/
│       ├── keys.ts
│       ├── registry.ts
│       ├── resolution.ts
│       ├── payment.ts
│       └── recovery.ts
├── web/                # Next.js frontend
│   └── src/app/
│       ├── register/
│       ├── dashboard/
│       ├── discover/
│       ├── pay/
│       └── demo/
└── docs/               # Documentation
```

## Features

- [x] Agent registration with ENS subnames
- [x] CCIP Read for dynamic stealth address resolution
- [x] Auto-rotating addresses on every lookup
- [x] Agent-to-agent payment with privacy
- [x] Payment scanning and recovery
- [x] Agent discovery and reputation

## Team

- **ibkmokun** — Smart Contracts & Cryptography
- [Your teammate] — Frontend & Integration

## License

MIT
