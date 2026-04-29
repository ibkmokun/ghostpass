# ENS Integration

GhostPass uses ENS as the **load-bearing identity and discovery layer** for autonomous agents. This document explains how ENS is used and why it is not merely cosmetic.

## ENS Features Used

### 1. Subnames for Agent Identity
Each agent receives a persistent, human-readable ENS subname:
```
agent-name.ghostpass.eth
```

This is implemented via:
- **ENS NameWrapper** (ERC-1155) for ownership and transferability
- **NameStone API** for gasless subname issuance on Base L2
- **CCIP Read (EIP-3668)** for dynamic resolution

### 2. Text Records for Agent Metadata
Agent capabilities, pricing, and stealth keys are stored in ENS text records:

| Record Key | Purpose |
|-----------|---------|
| `ghostpass.metaaddress` | Stealth meta-address (spending + viewing pub keys) |
| `ai.capabilities` | JSON array of agent services |
| `ai.pricing` | Human-readable pricing |
| `ai.endpoint` | Communication endpoint or AXL peer ID |

### 3. CCIP Read (EIP-3668) for Dynamic Resolution
Unlike static ENS resolution, GhostPass uses CCIP Read to:
- Generate a unique stealth address on every resolution
- Sign responses with a trusted gateway key
- Verify signatures onchain in the resolver

This means **the same ENS name returns a different address every time** — the ultimate auto-rotating privacy.

### 4. Agent Discovery
The `GhostPassRegistry` contract indexes all registered agents. Combined with ENS resolution, this enables:
- Search by capability
- Browse by pricing
- Verify reputation onchain

## Why This Is Not Cosmetic

ENS is doing **real work** in GhostPass:

1. **Without ENS**, agents have no persistent identity. They would need to share raw Ethereum addresses, which are hard to remember and impossible to brand.

2. **Without ENS text records**, agents have no discoverable capabilities. There would be no way to know what services an agent offers without offchain coordination.

3. **Without CCIP Read**, stealth addresses cannot be dynamic. Static addresses would destroy the privacy guarantee.

4. **Without ENS resolution**, the entire payment flow breaks. Payers cannot discover payees, and payees cannot receive funds.

## ENS Track Eligibility

GhostPass qualifies for both ENS prize tracks:

### Best ENS Integration for AI Agents
- ENS is the identity mechanism for every agent
- Text records store real metadata (capabilities, pricing, keys)
- Agents discover and transact via ENS resolution
- The entire agent-to-agent commerce flow begins with ENS

### Most Creative Use of ENS
- Auto-rotating stealth addresses on every resolution
- CCIP Read used for privacy-preserving dynamic addressing
- Subnames as access tokens for agent services
- First protocol to combine ENS identity with invisible wallets

## Mainnet Configuration

The production GhostPass uses `ghostpass.eth` on Ethereum mainnet:
- Resolver set to `GhostPassResolver`
- Subnames issued on Base L2 via NameStone
- CCIP Read gateway resolves across chains

For hackathon demo purposes, all interactions occur on Base Sepolia testnet.
