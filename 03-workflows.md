# GhostPass — Workflows

This document describes every user and agent workflow in GhostPass, from registration to payment recovery. Each workflow includes a sequence diagram, preconditions, postconditions, and error states.

---

## Workflow 1: Agent Registration

**Goal**: A new agent obtains an ENS subname, generates stealth keys, and publishes its profile.

### Actors
- **Agent Owner**: The entity (human or another agent) that creates and funds the agent
- **GhostPass Registry**: Smart contract that records agent metadata
- **NameStone API**: Gasless subname issuance service
- **ENS Registry**: Onchain ENS name registry
- **CCIP Gateway**: Offchain gateway for dynamic resolution

### Preconditions
- Agent Owner has a wallet with testnet ETH on Base Sepolia
- `ghostpass.eth` is owned by the GhostPass team and wrapped with the NameWrapper
- NameStone API key is configured

### Steps

```
Agent Owner                          GhostPass Registry       NameStone API        ENS Registry
     │                                      │                      │                    │
     │  1. Connect wallet                   │                      │                    │
     │◄─────────────────────────────────────│                      │                    │
     │                                      │                      │                    │
     │  2. Generate stealth keys            │                      │                    │
     │     (spending + viewing pairs)       │                      │                    │
     │◄─────────────────────────────────────│                      │                    │
     │                                      │                      │                    │
     │  3. Enter agent profile              │                      │                    │
     │     (name, capabilities, pricing)    │                      │                    │
     │──────────────────────────────────────►                      │                    │
     │                                      │                      │                    │
     │  4. Call registerAgent()             │                      │                    │
     │     with meta-address + profile      │                      │                    │
     │──────────────────────────────────────►                      │                    │
     │                                      │  5. Mint subname     │                    │
     │                                      │     via API          │                    │
     │                                      │─────────────────────►│                    │
     │                                      │                      │  6. Create subname │
     │                                      │                      │     on Base L2     │
     │                                      │◄─────────────────────│                    │
     │                                      │  7. Set text records │                    │
     │                                      │     (meta-address,   │                    │
     │                                      │      capabilities,   │                    │
     │                                      │      pricing)        │                    │
     │                                      │──────────────────────────────────────────►│
     │                                      │                      │                    │
     │  8. Return subname + tx hash         │                      │                    │
     │◄─────────────────────────────────────│                      │                    │
     │                                      │                      │                    │
```

### Postconditions
- Agent has ENS subname: `agent-{id}.ghostpass.eth`
- Stealth meta-address is stored in ENS text record `ghostpass.metaaddress`
- Agent capabilities stored in `ai.capabilities`
- Agent pricing stored in `ai.pricing`
- Registration event emitted onchain

### Error States
| Error | Cause | Resolution |
|---|---|---|
| `NameTaken` | Subname already exists | Append random suffix or increment ID |
| `InvalidMetaAddress` | Malformed public key | Validate key format before submission |
| `RegistrationFailed` | NameStone API error | Retry with exponential backoff |
| `InsufficientFunds` | Owner lacks gas for registry call | Request testnet ETH from faucet |

---

## Workflow 2: Stealth Address Resolution

**Goal**: A payer agent resolves a payee's ENS subname to obtain a one-time stealth address.

### Actors
- **Payer Agent**: The agent sending payment
- **Payee Agent**: The agent receiving payment (identified by ENS)
- **ENS Registry**: Resolves name to resolver
- **GhostPass Resolver**: CCIP-enabled resolver
- **CCIP Gateway**: Derives stealth address offchain

### Preconditions
- Payee has registered with GhostPass (Workflow 1 complete)
- Payer knows the payee's ENS subname

### Steps

```
Payer Agent              ENS Registry        GhostPass Resolver      CCIP Gateway
     │                        │                      │                     │
     │  1. Resolve address    │                      │                     │
     │     for payee.ens      │                      │                     │
     │───────────────────────►│                      │                     │
     │                        │  2. Find resolver    │                     │
     │                        │     for subname      │                     │
     │                        │─────────────────────►│                     │
     │                        │                      │  3. Resolver calls  │
     │                        │                      │     CCIP Read       │
     │                        │                      │     (revert with    │
     │                        │                      │      callback data) │
     │                        │◄─────────────────────│                     │
     │  4. CCIP callback URL  │                      │                     │
     │     returned to payer  │                      │                     │
     │◄───────────────────────│                      │                     │
     │                        │                      │                     │
     │  5. HTTP GET to gateway│                      │                     │
     │     /resolve/payee.ens │                      │                     │
     │────────────────────────────────────────────────────────────────────►│
     │                        │                      │                     │
     │                        │                      │  6. Gateway fetches │
     │                        │                      │     meta-address    │
     │                        │                      │     from ENS record │
     │                        │                      │                     │
     │                        │                      │  7. Gateway generates│
     │                        │                      │     ephemeral key R │
     │                        │                      │                     │
     │                        │                      │  8. Gateway derives │
     │                        │                      │     stealth address │
     │                        │                      │     S' = hash(R*S)*G + S│
     │                        │                      │                     │
     │  9. Return stealth addr│                      │                     │
     │     + ephemeral pub R  │                      │                     │
     │◄────────────────────────────────────────────────────────────────────│
     │                        │                      │                     │
     │  10. Payer verifies     │                      │                     │
     │      derivation locally │                      │                     │
     │◄────────────────────────────────────────────────────────────────────│
```

### Postconditions
- Payer has a unique stealth address that has never been used before
- Payer has the ephemeral public key `R` needed for payee recovery
- No observer can link this address to the payee's identity

### Error States
| Error | Cause | Resolution |
|---|---|---|
| `NameNotRegistered` | ENS name not in GhostPass | Return clear error: "Agent not found" |
| `GatewayUnavailable` | CCIP Gateway down | Retry with fallback gateway |
| `InvalidResponse` | Gateway returned bad data | Verify signature, reject if invalid |
| `ResolutionTimeout` | CCIP Read timeout | Retry with longer timeout |

---

## Workflow 3: Payment & Announcement

**Goal**: Payer sends funds to the stealth address and publishes the ephemeral public key so the payee can recover.

### Actors
- **Payer Agent**: Initiates payment
- **Blockchain**: Base Sepolia network
- **Payee Agent**: Will recover funds later

### Preconditions
- Stealth address resolved (Workflow 2 complete)
- Payer has sufficient token balance and ETH for gas

### Steps

```
Payer Agent                          Blockchain
     │                                    │
     │  1. Construct payment tx           │
     │     to: stealth_address            │
     │     value: amount                  │
     │     data: ephemeral_pub_R          │
     │────────────────────────────────────►│
     │                                    │
     │  2. Wait for confirmation          │
     │◄────────────────────────────────────│
     │                                    │
     │  3. Emit announcement (optional)   │
     │     GhostPassRegistry.announce()   │
     │     with R, stealth_addr, sender   │
     │────────────────────────────────────►│
     │                                    │
     │  4. Log payment metadata           │
     │     (for payer's records)          │
     │◄────────────────────────────────────│
```

### Payment Announcement Contract
The optional `announce()` function helps payees discover payments without scanning every block:

```solidity
event PaymentAnnounced(
    bytes32 indexed stealthAddress,
    bytes32 indexed ephemeralPubKey,
    address indexed sender,
    uint256 amount,
    address token
);

function announce(
    bytes32 stealthAddress,
    bytes32 ephemeralPubKey,
    address token,
    uint256 amount
) external;
```

### Postconditions
- Funds sit in stealth address (EOA with no prior transactions)
- Ephemeral public key `R` is published onchain
- Payee can now recover funds using `R` + viewing key

### Error States
| Error | Cause | Resolution |
|---|---|---|
| `InsufficientBalance` | Payer lacks tokens | Abort, notify payer |
| `TransferFailed` | Token contract reverts | Check allowance, approve if needed |
| `AnnouncementFailed` | Out of gas for announce | Payment still succeeded; announce can be skipped |

---

## Workflow 4: Payment Recovery

**Goal**: Payee agent scans the blockchain, discovers payments to its stealth addresses, and recovers the funds.

### Actors
- **Payee Agent**: The agent receiving payment
- **Scanner Service**: Background service monitoring blockchain
- **Blockchain**: Base Sepolia network

### Preconditions
- Payee has generated and saved its spending and viewing keys
- Payee's stealth meta-address was published during registration

### Steps

```
Payee Agent               Scanner Service              Blockchain
     │                           │                          │
     │  1. Start scanner         │                          │
     │     with viewing_key      │                          │
     │──────────────────────────►│                          │
     │                           │                          │
     │                           │  2. Poll for new blocks  │
     │                           │     since last scan      │
     │                           │─────────────────────────►│
     │                           │                          │
     │                           │  3. Fetch Transfer events│
     │                           │     to fresh addresses   │
     │                           │◄─────────────────────────│
     │                           │                          │
     │                           │  4. For each announcement│
     │                           │     extract R value      │
     │                           │                          │
     │                           │  5. Derive candidate addr│
     │                           │     shared = v * R       │
     │                           │     addr = hash(shared)*G + S│
     │                           │                          │
     │                           │  6. Match against event  │
     │                           │     recipient addresses  │
     │                           │                          │
     │  7. Return matches        │                          │
     │◄──────────────────────────│                          │
     │                           │                          │
     │  8. Derive private key    │                          │
     │     stealth_priv = hash(v*R) + s                     │
     │                           │                          │
     │  9. Sign sweep tx         │                          │
     │     to: payee_wallet      │                          │
     │                           │                          │
     │  10. Broadcast tx         │                          │
     │─────────────────────────────────────────────────────►│
     │                           │                          │
     │  11. Confirm + update bal │                          │
     │◄─────────────────────────────────────────────────────│
```

### Postconditions
- Payee's main wallet balance increased by payment amount minus gas
- Stealth address is now empty
- Payment record stored in payee's history

### Error States
| Error | Cause | Resolution |
|---|---|---|
| `NoPaymentsFound` | Scanner missed or no new payments | Continue polling |
| `InvalidKey` | Viewing key doesn't match | Log error, skip |
| `SweepFailed` | Insufficient gas in stealth address | Payee must fund with ETH first (or use GSN/meta-transactions) |
| `AlreadySwept` | Funds already withdrawn | Check nonce, skip |

---

## Workflow 5: Agent-to-Agent Discovery & Commerce

**Goal**: Agents find each other, verify capabilities, and establish trust before transacting.

### Actors
- **Buyer Agent**: Agent seeking services
- **Seller Agent**: Agent offering services
- **ENS Registry**: Identity resolution
- **GhostPass Registry**: Verification and reputation

### Steps

```
Buyer Agent              ENS Registry           GhostPass Registry
     │                        │                          │
     │  1. Search for agents  │                          │
     │     by capability      │                          │
     │     "sentiment-analysis"│                         │
     │───────────────────────►│                          │
     │                        │                          │
     │  2. Return matching    │                          │
     │     subnames           │                          │
     │◄───────────────────────│                          │
     │                        │                          │
     │  3. Resolve seller.ens │                          │
     │     for full profile   │                          │
     │───────────────────────►│                          │
     │                        │                          │
     │  4. Return text records│                          │
     │     (capabilities,     │                          │
     │      pricing,          │                          │
     │      reputation)       │                          │
     │◄───────────────────────│                          │
     │                        │                          │
     │  5. Verify reputation  │                          │
     │     onchain            │                          │
     │───────────────────────────────────────────────────►│
     │                        │                          │
     │  6. Return verified    │                          │
     │     reputation score   │                          │
     │◄───────────────────────────────────────────────────│
     │                        │                          │
     │  7. Initiate payment   │                          │
     │     (Workflows 2-4)    │                          │
     │                        │                          │
```

### Reputation System

GhostPass includes a lightweight reputation layer:

| Reputation Metric | Source | Storage |
|---|---|---|
| **Completed transactions** | Onchain event logs | GhostPassRegistry events |
| **Average rating** | Buyer reviews (1-5 stars) | 0G Storage KV or ENS text record |
| **Dispute count** | Onchain dispute registry | GhostPassRegistry |
| **Verification status** | World ID / ENSIP-25 | ENS text record |

---

## Workflow 6: Subname Transfer / Agent Sale

**Goal**: An agent owner sells their agent (with its stealth keys, reputation, and history) to a new owner.

### Actors
- **Current Owner**: Sells the agent
- **New Owner**: Buys the agent
- **NameWrapper**: Handles subname NFT transfer

### Steps

```
Current Owner            NameWrapper            New Owner
     │                        │                      │
     │  1. Initiate transfer  │                      │
     │     of subname NFT     │                      │
     │───────────────────────►│                      │
     │                        │                      │
     │  2. Transfer subname   │                      │
     │     to new owner       │                      │
     │───────────────────────►│                      │
     │                        │  3. New owner gets   │
     │                        │     subname + records│
     │                        │─────────────────────►│
     │                        │                      │
     │  4. Offchain: current  │                      │
     │     owner sends stealth│                      │
     │     keys to new owner  │                      │
     │─────────────────────────────────────────────────►│
     │                        │                      │
     │  5. New owner rotates  │                      │
     │     keys (optional)    │                      │
     │                        │                      │
```

### Security Note
Stealth keys are **offchain** by design. Transferring an agent requires securely transferring the private keys. Future versions could use **threshold cryptography** or **TEE re-encryption** (like 0G's iNFT model) to enable secure key transfer without exposing them.

---

## Workflow 7: Demo Mode (Two-Agent Simulation)

**Goal**: The hackathon demo shows two agents interacting in real-time.

### Setup
- **Agent A (Seller)**: `trader-alpha.ghostpass.eth` — offers trading signals
- **Agent B (Buyer)**: `researcher-beta.ghostpass.eth` — buys trading signals

### Demo Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEFT PANEL: Agent A (Seller)                                           │
│  ─────────────────────────────                                          │
│  1. Shows Agent A dashboard                                             │
│  2. Displays capabilities: ["trading-signals", "market-analysis"]       │
│  3. Pricing: 5 USDC per signal                                          │
│  4. Balance: 0 USDC                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  MIDDLE: Discovery & Resolution                                         │
│  ─────────────────────────────                                          │
│  5. Agent B searches for "trading-signals"                              │
│  6. Discovers trader-alpha.ghostpass.eth                                │
│  7. Resolves stealth address (shows: new address generated)             │
│  8. Shows ephemeral public key R                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  RIGHT PANEL: Agent B (Buyer)                                           │
│  ─────────────────────────────                                          │
│  9. Agent B sends 5 USDC to stealth address                             │
│  10. Transaction confirmed on Basescan                                  │
│  11. Agent B publishes ephemeral key R via announce()                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LEFT PANEL: Recovery                                                   │
│  ───────────────                                                        │
│  12. Agent A scanner detects new payment                                │
│  13. Derives stealth private key from R + viewing key                   │
│  14. Sweeps 5 USDC to Agent A main wallet                               │
│  15. Agent A balance updates: 5 USDC                                    │
│  16. Displays payment history with stealth address (no link to Agent B) │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Demo Moment
The presenter resolves `trader-alpha.ghostpass.eth` **twice** and shows two **different addresses**. This is the "magic moment" that proves stealth addresses work.

---

## Summary Table

| # | Workflow | Primary Actor | Time (Demo) | Complexity |
|---|----------|---------------|-------------|------------|
| 1 | Agent Registration | Agent Owner | 30s | Medium |
| 2 | Stealth Address Resolution | Payer Agent | 15s | Low |
| 3 | Payment & Announcement | Payer Agent | 20s | Low |
| 4 | Payment Recovery | Payee Agent | 25s | High |
| 5 | Discovery & Commerce | Buyer/Seller | 20s | Medium |
| 6 | Subname Transfer | Owner | 15s | Low |
| 7 | Two-Agent Demo | Presenter | 2m 30s | N/A |