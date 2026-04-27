# GhostPass — Project Overview

> **Project Name**: GhostPass  
> **Tagline**: Invisible Wallets for Autonomous Agents  
> **Primary Track**: ENS — Most Creative Use of ENS ($1,250 1st place)  
> **Secondary Track**: ENS — Best ENS Integration for AI Agents ($1,250 1st place)  
> **Hackathon**: ETHGlobal OpenAgents (April 24 – May 6, 2026)

---

## The Problem

AI agents are becoming first-class economic actors. They trade, hire each other, and settle payments autonomously. But every onchain transaction leaks identity through the wallet address. If Agent A pays Agent B, anyone can trace:
- How much Agent B earns
- Who Agent B's customers are
- Agent B's entire financial history

For human users, this is a privacy concern. For autonomous agents operating in competitive or adversarial environments, it's an existential vulnerability. A trading agent whose positions are visible onchain can be frontrun. A research agent whose clients are traceable can have its revenue model copied.

Current solutions don't work for agents:
- **EOAs** expose everything
- **Multi-sig wallets** don't hide transaction graphs
- **Existing stealth address protocols** (like Umbra) are designed for humans, not autonomous systems with no "user" to enter a password

Agents need **persistent, human-readable identities** (for discovery and reputation) **and** **privacy-preserving payment endpoints** (for operational security).

---

## The Solution

**GhostPass** gives every AI agent an ENS subname identity that resolves to a **unique one-time stealth address on every query**.

When Agent A wants to pay Agent B:
1. Agent A resolves `trader-7a3f.ghostpass.eth`
2. The resolver returns a **fresh stealth address** — never seen before
3. Agent A sends payment to that address
4. Agent B scans the blockchain and recovers the funds using its viewing key
5. No observer can link the payment to Agent B's real wallet

GhostPass combines three technologies into a single protocol:
- **ENS subnames** for persistent, human-readable agent identity
- **CCIP Read (EIP-3668)** for dynamic, offchain stealth address resolution
- **Elliptic-curve stealth addresses** for privacy-preserving payments

---

## How It Works (High Level)

### Core Actors

| Actor | Role |
|---|---|
| **Agent Registry** | Smart contract that verifies agent identity and links it to an ENS subname |
| **CCIP Gateway** | Offchain server that derives stealth addresses from an agent's public stealth meta-address |
| **Agent Client** | SDK/library that agents use to register, resolve, pay, and recover funds |
| **ENS Resolver** | CCIP-enabled resolver contract that delegates address lookups to the gateway |

### The Stealth Address Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  REGISTRATION (One-time setup)                                          │
│  ─────────────────────────────                                          │
│  Agent generates:                                                       │
│    • Spending key pair (spending_private, spending_public)              │
│    • Viewing key pair (viewing_private, viewing_public)                 │
│    • Stealth meta-address = spending_public + viewing_public            │
│                                                                         │
│  Agent registers on AgentRegistry.sol → gets ENS subname                │
│  Stealth meta-address is stored in ENS text record via resolver         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  RESOLUTION (Every payment)                                             │
│  ──────────────────────────                                             │
│  Payer agent resolves payee.ens.subname                                 │
│  ↓                                                                      │
│  ENS Registry → CCIP Resolver → CCIP Gateway (offchain)                 │
│  ↓                                                                      │
│  Gateway retrieves stealth meta-address from text record                │
│  Gateway generates ephemeral key pair                                   │
│  Gateway derives one-time stealth address from:                         │
│    stealth_address = ECDH(ephemeral_private, spending_public)           │
│  ↓                                                                      │
│  Gateway returns stealth address to payer                               │
│  Payer sends payment to stealth_address                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  RECOVERY (Payee scans blockchain)                                      │
│  ────────────────────────────────────────                               │
│  Payee agent monitors blockchain for transfers to fresh addresses       │
│  For each transfer to address X:                                        │
│    Derive candidate stealth address from tx sender + viewing_private    │
│    If match: recover private key for X, sweep funds                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Identity Layer

Beyond stealth payments, GhostPass uses ENS text records as an **agent profile system**:

| Text Record Key | Purpose |
|---|---|
| `ai.capabilities` | JSON array of services the agent offers |
| `ai.endpoint` | URL or AXL peer ID for agent communication |
| `ai.pricing` | Per-task or per-use pricing in USDC |
| `ai.reputation` | Aggregated reputation score (updated by marketplace) |
| `ghostpass.version` | Protocol version for compatibility |
| `ghostpass.metaaddress` | Stealth meta-address (required for resolution) |

This means **ENS is doing real work**: identity, discovery, capability advertisement, pricing, reputation, and payment routing — all in a single resolution.

---

## Track Eligibility

### ENS — Most Creative Use of ENS ($2,500 pool)

GhostPass directly implements what the ENS track explicitly asks for:

> "Store verifiable credentials or zk proofs in text records. Build privacy features with auto-rotating addresses on each resolution. Use subnames as access tokens. Surprise us!"

GhostPass delivers:
- **Auto-rotating addresses**: Every resolution returns a unique stealth address (the ultimate auto-rotation)
- **Subnames as access tokens**: Agent subnames gate access to services (no payment = no resolution)
- **Privacy innovation**: First stealth address protocol designed specifically for autonomous agents

### ENS — Best ENS Integration for AI Agents ($2,500 pool)

The ENS track requires:

> "It should be obvious how ENS improves your agent's identity or discoverability — not just a cosmetic add-on."

GhostPass makes ENS **load-bearing**:
- Agents cannot receive private payments without their ENS subname
- Agents cannot be discovered by other agents without ENS resolution
- Agent capabilities, pricing, and reputation are all stored in ENS text records
- The entire agent-to-agent commerce flow begins with an ENS lookup

---

## Key Differentiators

1. **First stealth address protocol for agents**  
   Umbra, Fluidkey, and Sneaky serve humans. GhostPass is built for autonomous systems with no human in the loop.

2. **ENS-native discovery + privacy in one**  
   Other solutions give you privacy OR identity. GhostPass gives both: human-readable names that resolve to invisible wallets.

3. **Agent-to-agent commerce ready**  
   The protocol includes reputation, pricing, and capability discovery — not just payments.

4. **No modifications to wallets**  
   Uses standard ENS resolution (CCIP Read). Works with any wallet or agent framework that can resolve ENS.

5. **Autonomous recovery**  
   Agents scan and recover funds automatically using their viewing key — no manual password entry.

---

## Success Criteria

For this hackathon, GhostPass succeeds if:

- [ ] An agent can register and receive an ENS subname (e.g., `agent-123.ghostpass.eth`)
- [ ] Resolving that subname returns a different address every time
- [ ] A payment sent to that address can be recovered by the agent
- [ ] Text records store agent capabilities, pricing, and reputation
- [ ] The demo video shows a complete payee setup → payer resolution → payment → recovery flow
- [ ] README includes setup instructions and architecture diagram
- [ ] All contracts are deployed to testnet with verified addresses

---

## Vision Beyond the Hackathon

GhostPass is the first step toward **autonomous agent economies with privacy guarantees**. Future iterations could include:

- **ZK reputation proofs**: Prove reputation > threshold without revealing exact score
- **Rate-limited resolution**: Pay per resolution to prevent spam
- **Cross-chain stealth**: Same ENS name resolves to stealth addresses on any chain
- **Agent breeding via privacy**: Two agents merge their stealth keys to create offspring agents with inherited privacy

---

## Team Roles (Recommended)

| Role | Responsibility |
|---|---|
| **Smart Contract Developer** | AgentRegistry.sol, CCIP Resolver, stealth address verification |
| **Cryptography / Backend** | CCIP Gateway, stealth address derivation, scanning/recovery service |
| **Frontend / Agent Client** | Registration UI, agent dashboard, demo interface |
| **Integration / Docs** | ENS setup, testnet deployment, README, demo video, architecture diagram |

---

## In This Directory

| File | Contents |
|---|---|
| `01-overview.md` | This file — project concept, problem, solution, vision |
| `02-tech-stack.md` | Complete technology stack and tool choices |
| `03-workflows.md` | All user/agent workflows with sequence diagrams |
| `04-build-plan.md` | Granular day-by-day and phase-by-phase build plan |
| `05-context-files.md` | Complete file architecture and key implementation details |
| `06-demo-script.md` | 3-minute demo video script with visual cues |
