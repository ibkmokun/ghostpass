# GhostPass — Build Plan

> **Duration**: 12 days (April 24 – May 6, 2026)  
> **Format**: Async / Virtual  
> **Team Size**: 2–3 people recommended  

This build plan breaks the project into **8 major phases**, **47 work packages**, and **~180 granular sub-tasks**. Each sub-task has an estimated time, owner role, and deliverable.

---

## Phase 0: Pre-Flight & Environment Setup
**Days**: -2 to 0 (before hacking begins)  
**Goal**: Every tool, key, and dependency is ready before Day 1.

### 0.1 Repository & Project Structure
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 0.1.1 | Create GitHub repo `ghostpass` with MIT license | 15m | Any | Public repo URL |
| 0.1.2 | Set up monorepo structure: `contracts/`, `gateway/`, `web/`, `sdk/`, `docs/` | 30m | Any | Folder structure committed |
| 0.1.3 | Add root `.gitignore` for Solidity, Node, Python artifacts | 10m | Any | `.gitignore` committed |
| 0.1.4 | Create `README.md` template with project description and placeholder sections | 20m | Any | Initial README committed |
| 0.1.5 | Set up branch protection rules: `main` requires PR, `dev` is working branch | 15m | Any | GitHub settings configured |

### 0.2 Development Environment
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 0.2.1 | Install Foundry (`curl -L https://foundry.paradigm.xyz | bash`) | 10m | Smart Contract Dev | `forge --version` works |
| 0.2.2 | Install Node.js 20+ and pnpm (`npm install -g pnpm`) | 10m | Frontend Dev | `node -v` → v20.x |
| 0.2.3 | Install VS Code extensions: Solidity, ESLint, Prettier, Tailwind CSS IntelliSense | 10m | All | Extensions active |
| 0.2.4 | Configure Foundry `foundry.toml` with optimizer, remappings, fmt settings | 20m | Smart Contract Dev | `forge build` succeeds on empty project |
| 0.2.5 | Set up Prettier + ESLint config at repo root for TypeScript consistency | 20m | Frontend Dev | `pnpm format` works |

### 0.3 Wallet & Testnet Preparation
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 0.3.1 | Create dedicated hackathon Metamask wallet (do NOT use personal wallet) | 10m | Any | New wallet address saved |
| 0.3.2 | Fund wallet with Base Sepolia ETH from `https://faucet.quicknode.com/base/sepolia` | 15m | Any | 0.5+ ETH balance confirmed |
| 0.3.3 | Fund wallet with Sepolia ETH from `https://sepoliafaucet.com` | 15m | Any | 0.5+ ETH balance confirmed |
| 0.3.4 | Export wallet private key, store in `.env` (never commit `.env`) | 5m | Any | `.env` file created locally |
| 0.3.5 | Add Base Sepolia and Sepolia networks to Metamask with RPC endpoints | 10m | Any | Networks visible in MM |

### 0.4 ENS Name Acquisition
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 0.4.1 | Check availability of `ghostpass.eth` on ENS app | 5m | Any | Availability confirmed |
| 0.4.2 | If unavailable, register `ghostpass.eth` on mainnet (or use testnet `ghostpass.test` for hackathon) | 30m | Any | Name registered |
| 0.4.3 | Wrap `ghostpass.eth` with ENS NameWrapper to enable subnames | 20m | Smart Contract Dev | Wrapped status confirmed on Etherscan |
| 0.4.4 | Set `ghostpass.eth` resolver to a PublicResolver or custom resolver placeholder | 15m | Smart Contract Dev | Resolver set and confirmed |
| 0.4.5 | Sign up for NameStone API key at `https://namestone.xyz` | 10m | Any | API key received and saved in `.env` |
| 0.4.6 | Test NameStone API with curl: create one test subname | 20m | Any | Test subname resolves on Base |

### 0.5 Infrastructure Accounts
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 0.5.1 | Create Vercel account and link GitHub repo | 15m | Any | Vercel project created |
| 0.5.2 | Create Railway account (for gateway backend if not using Vercel) | 10m | Any | Railway project ready |
| 0.5.3 | Create Alchemy or Infura account for Base Sepolia RPC | 10m | Any | API key saved |
| 0.5.4 | Get Basescan API key for contract verification | 10m | Any | API key saved in `.env` |
| 0.5.5 | Test RPC connectivity: `cast block-number --rpc-url $BASE_SEPOLIA_RPC` | 5m | Any | Current block number returned |

### 0.6 Cryptography Research & Validation
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 0.6.1 | Read Umbra protocol docs to understand their stealth address derivation | 45m | Backend/Crypto | Notes on derivation formula |
| 0.6.2 | Implement a pure JS/TS prototype of: generate keys → derive stealth address → recover private key | 60m | Backend/Crypto | Working prototype in `experiments/crypto-proto.ts` |
| 0.6.3 | Validate prototype against known test vectors (if any) or round-trip test | 30m | Backend/Crypto | 100% round-trip success rate |
| 0.6.4 | Document the exact derivation formula in `docs/CRYPTOGRAPHY.md` | 30m | Backend/Crypto | Formula documented with pseudocode |
| 0.6.5 | Decide on key serialization format (hex, base64, compressed/uncompressed) | 15m | Backend/Crypto | Format documented |

---

## Phase 1: Smart Contracts
**Days**: 1–2  
**Goal**: All Solidity contracts written, tested, and ready for deployment.

### 1.1 GhostPassRegistry Contract
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 1.1.1 | Scaffold `GhostPassRegistry.sol` with imports (Ownable, ReentrancyGuard) | 15m | Smart Contract Dev | File created |
| 1.1.2 | Define `Agent` struct: owner, subname, spendingPubKey, viewingPubKey, capabilities, createdAt | 20m | Smart Contract Dev | Struct defined |
| 1.1.3 | Define `PaymentAnnouncement` struct and `PaymentAnnounced` event | 15m | Smart Contract Dev | Event defined |
| 1.1.4 | Implement `registerAgent(string calldata subname, bytes32 spendingPubKey, bytes32 viewingPubKey, string calldata capabilities, string calldata pricing)` | 45m | Smart Contract Dev | Function compiles |
| 1.1.5 | Add validation: subname not already registered, keys are valid format, owner not zero address | 20m | Smart Contract Dev | Revert tests pass |
| 1.1.6 | Implement `updateAgentProfile(string calldata subname, string calldata capabilities, string calldata pricing)` with onlyOwner or agent owner check | 30m | Smart Contract Dev | Function compiles |
| 1.1.7 | Implement `announce(bytes32 stealthAddress, bytes32 ephemeralPubKey, address token, uint256 amount)` external payable | 30m | Smart Contract Dev | Event emitted correctly |
| 1.1.8 | Implement `getAgent(string calldata subname) → Agent` view function | 15m | Smart Contract Dev | Returns correct data |
| 1.1.9 | Implement `isRegistered(string calldata subname) → bool` view function | 10m | Smart Contract Dev | Returns correct boolean |
| 1.1.10 | Add `AgentRegistered`, `AgentUpdated` events | 10m | Smart Contract Dev | Events defined |
| 1.1.11 | Write NatSpec comments for all public/external functions | 20m | Smart Contract Dev | All functions documented |
| 1.1.12 | Run `forge build` and fix any compilation errors | 15m | Smart Contract Dev | Clean build |

### 1.2 GhostPassResolver (CCIP-Enabled)
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 1.2.1 | Study EIP-3668 (CCIP Read) and ENSIP-10 (Wildcard Resolution) reference implementations | 60m | Smart Contract Dev | Understanding documented |
| 1.2.2 | Study `OffchainResolver` example from ENS domains GitHub | 30m | Smart Contract Dev | Example code reviewed |
| 1.2.3 | Scaffold `GhostPassResolver.sol` inheriting from `IExtendedResolver` | 20m | Smart Contract Dev | File created |
| 1.2.4 | Implement `resolve(bytes calldata name, bytes calldata data) → bytes` with CCIP Read revert pattern | 60m | Smart Contract Dev | Returns correct revert data |
| 1.2.5 | Encode CCIP callback URL and callback data in revert | 30m | Smart Contract Dev | Encoding matches spec |
| 1.2.6 | Implement signature verification for gateway responses | 45m | Smart Contract Dev | Only valid signatures accepted |
| 1.2.7 | Set gateway URL and trusted signer address (owner-only setter) | 15m | Smart Contract Dev | Config functions work |
| 1.2.8 | Add `supportsInterface` for ERC-165 compatibility | 10m | Smart Contract Dev | Interface detection works |
| 1.2.9 | Write NatSpec comments | 15m | Smart Contract Dev | All functions documented |
| 1.2.10 | Run `forge build` and fix compilation errors | 15m | Smart Contract Dev | Clean build |

### 1.3 Contract Testing
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 1.3.1 | Write `GhostPassRegistryTest.t.sol`: test registerAgent happy path | 30m | Smart Contract Dev | Test passes |
| 1.3.2 | Test registerAgent reverts: duplicate subname, invalid keys, zero address | 30m | Smart Contract Dev | All revert tests pass |
| 1.3.3 | Test updateAgentProfile: happy path and unauthorized access | 20m | Smart Contract Dev | Tests pass |
| 1.3.4 | Test announce event emission and data correctness | 20m | Smart Contract Dev | Event data verified |
| 1.3.5 | Test getAgent and isRegistered view functions | 15m | Smart Contract Dev | Return values correct |
| 1.3.6 | Write `GhostPassResolverTest.t.sol`: test CCIP Read revert encoding | 45m | Smart Contract Dev | Revert data matches spec |
| 1.3.7 | Test signature verification with valid and invalid signatures | 30m | Smart Contract Dev | Only valid sigs accepted |
| 1.3.8 | Run full test suite: `forge test` | 15m | Smart Contract Dev | All tests pass |
| 1.3.9 | Run `forge coverage` and ensure >80% line coverage | 15m | Smart Contract Dev | Coverage report generated |
| 1.3.10 | Fix any failing tests or coverage gaps | 30m | Smart Contract Dev | All tests green |

### 1.4 Deployment Scripts
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 1.4.1 | Write `script/DeployRegistry.s.sol`: deploy GhostPassRegistry to Base Sepolia | 30m | Smart Contract Dev | Script compiles |
| 1.4.2 | Write `script/DeployResolver.s.sol`: deploy GhostPassResolver to Base Sepolia | 30m | Smart Contract Dev | Script compiles |
| 1.4.3 | Write `script/VerifyContracts.s.sol`: verify contracts on Basescan post-deployment | 20m | Smart Contract Dev | Verification script ready |
| 1.4.4 | Test deployment scripts against Base Sepolia fork (`anvil --fork-url`) | 30m | Smart Contract Dev | Fork deployment succeeds |
| 1.4.5 | Document contract addresses and deployment commands in `contracts/DEPLOYMENTS.md` | 15m | Smart Contract Dev | Deployment docs complete |

---

## Phase 2: CCIP Gateway
**Days**: 2–3  
**Goal**: Offchain gateway running that can derive stealth addresses and sign CCIP responses.

### 2.1 Gateway Foundation
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 2.1.1 | Initialize `gateway/` as Node.js project: `npm init -y`, install TypeScript | 15m | Backend Dev | `package.json` created |
| 2.1.2 | Install dependencies: express, viem, cors, dotenv | 10m | Backend Dev | Dependencies installed |
| 2.1.3 | Install dev dependencies: typescript, tsx, @types/express, nodemon | 10m | Backend Dev | Dev deps installed |
| 2.1.4 | Create `tsconfig.json` with strict mode | 15m | Backend Dev | Config committed |
| 2.1.5 | Create `.env.example` with all required variables | 10m | Backend Dev | Example env committed |
| 2.1.6 | Create `src/index.ts`: basic Express server with health endpoint | 20m | Backend Dev | Server starts on port 3000 |
| 2.1.7 | Add middleware: CORS, JSON body parser, request logging | 15m | Backend Dev | Middleware active |
| 2.1.8 | Add error handling middleware | 15m | Backend Dev | Errors return JSON |

### 2.2 ENS Resolution & CCIP Logic
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 2.2.1 | Implement `src/ens.ts`: function to resolve ENS name to text records using viem | 45m | Backend Dev | Text records fetched correctly |
| 2.2.2 | Implement `src/stealth.ts`: `deriveStealthAddress(metaAddress)` using elliptic curve math | 60m | Backend Dev | Derivation matches prototype |
| 2.2.3 | Implement `src/ccip.ts`: encode CCIP response according to EIP-3668 spec | 45m | Backend Dev | Encoding matches Solidity expectation |
| 2.2.4 | Implement `src/sign.ts`: sign CCIP response with gateway private key using viem | 30m | Backend Dev | Signatures verifiable onchain |
| 2.2.5 | Wire together: `GET /resolve/:name` endpoint that fetches text record, derives address, signs response | 60m | Backend Dev | Endpoint returns valid CCIP data |
| 2.2.6 | Add input validation: ENS name format, name exists in GhostPass | 20m | Backend Dev | Invalid names return 400 |
| 2.2.7 | Add caching: cache text records for 60 seconds to reduce RPC calls | 20m | Backend Dev | Cache hits reduce latency |
| 2.2.8 | Add rate limiting: max 30 requests per minute per IP | 15m | Backend Dev | Rate limiter active |

### 2.3 Gateway Testing
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 2.3.1 | Write unit test for stealth address derivation: round-trip test | 30m | Backend Dev | Test passes |
| 2.3.2 | Write unit test for CCIP response encoding/decoding | 30m | Backend Dev | Encoding matches Solidity |
| 2.3.3 | Write unit test for signature verification | 20m | Backend Dev | Sig verification passes |
| 2.3.4 | Write integration test: full `/resolve/:name` endpoint with mocked ENS | 30m | Backend Dev | Integration test passes |
| 2.3.5 | Test against local anvil fork with real ENS registry | 30m | Backend Dev | Real resolution works |
| 2.3.6 | Run `npm test` and ensure all tests pass | 15m | Backend Dev | Test suite green |

### 2.4 Gateway Deployment
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 2.4.1 | Create `vercel.json` for serverless function configuration | 15m | Backend Dev | Config committed |
| 2.4.2 | Deploy gateway to Vercel: `vercel --prod` | 10m | Backend Dev | Live URL returned |
| 2.4.3 | Test live endpoint with curl: `curl https://gateway-url/resolve/agent-123.ghostpass.eth` | 10m | Backend Dev | Valid JSON response |
| 2.4.4 | Set custom domain or note the vercel.app URL | 5m | Backend Dev | URL saved in `.env` and docs |
| 2.4.5 | Configure gateway signer address in deployed GhostPassResolver | 15m | Smart Contract Dev | Resolver points to correct gateway |

---

## Phase 3: Stealth Address SDK
**Days**: 3–4  
**Goal**: Reusable TypeScript SDK that handles all cryptography, registry calls, and recovery.

### 3.1 SDK Structure
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 3.1.1 | Initialize `sdk/` as TypeScript project with `tsconfig.json` | 15m | Backend Dev | Project initialized |
| 3.1.2 | Set up build pipeline: `tsc` + `vite` for bundling | 20m | Backend Dev | Build script works |
| 3.1.3 | Set up Vitest for testing | 15m | Backend Dev | `npm test` runs |
| 3.1.4 | Create package structure: `src/keys.ts`, `src/registry.ts`, `src/resolution.ts`, `src/payment.ts`, `src/recovery.ts`, `src/index.ts` | 15m | Backend Dev | Files created |

### 3.2 Cryptographic Primitives
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 3.2.1 | Implement `generateStealthKeys()`: returns spending + viewing key pairs | 30m | Backend Dev | Keys generated correctly |
| 3.2.2 | Implement `deriveStealthAddress(spendingPubKey, viewingPubKey, ephemeralPrivKey)` | 45m | Backend Dev | Matches gateway derivation |
| 3.2.3 | Implement `recoverStealthPrivateKey(ephemeralPubKey, viewingPrivKey, spendingPrivKey)` | 45m | Backend Dev | Recovered key signs valid tx |
| 3.2.4 | Implement `serializeMetaAddress(viewingPubKey, spendingPubKey) → string` | 15m | Backend Dev | Serialization deterministic |
| 3.2.5 | Implement `parseMetaAddress(metaAddressString) → {viewingPubKey, spendingPubKey}` | 15m | Backend Dev | Parsing is inverse of serialize |
| 3.2.6 | Write comprehensive tests for all crypto functions | 45m | Backend Dev | 100% pass rate |
| 3.2.7 | Export crypto utilities from `src/keys.ts` | 10m | Backend Dev | Clean public API |

### 3.3 Registry & Resolution
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 3.3.1 | Implement `registerAgent(subname, metaAddress, capabilities, pricing, signer)` | 45m | Backend Dev | Calls GhostPassRegistry correctly |
| 3.3.2 | Implement `getAgentProfile(subname, provider)` view function | 20m | Backend Dev | Returns parsed profile |
| 3.3.3 | Implement `resolveStealthAddress(ensName, provider)` | 30m | Backend Dev | Returns address + ephemeral pub key |
| 3.3.4 | Implement `resolveAgentCapabilities(ensName, provider)` | 20m | Backend Dev | Returns parsed capabilities JSON |
| 3.3.5 | Write tests for registry interactions using mocked provider | 30m | Backend Dev | Tests pass |

### 3.4 Payment & Recovery
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 3.4.1 | Implement `sendStealthPayment(ensName, amount, token, signer, provider)` | 60m | Backend Dev | Constructs and sends tx |
| 3.4.2 | Implement `announcePayment(stealthAddress, ephemeralPubKey, token, amount, signer)` | 30m | Backend Dev | Calls registry announce() |
| 3.4.3 | Implement `scanForPayments(viewingPrivKey, spendingPubKey, provider, fromBlock)` | 60m | Backend Dev | Scans and returns matches |
| 3.4.4 | Implement `recoverPayment(stealthAddress, ephemeralPubKey, viewingPrivKey, spendingPrivKey, recipient, signer)` | 45m | Backend Dev | Sweeps funds successfully |
| 3.4.5 | Write tests for payment and recovery with local anvil | 45m | Backend Dev | Round-trip test passes |
| 3.4.6 | Export all payment/recovery functions from `src/payment.ts` and `src/recovery.ts` | 10m | Backend Dev | Clean public API |

### 3.5 SDK Packaging
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 3.5.1 | Write `README.md` for SDK with installation and usage examples | 30m | Backend Dev | SDK README complete |
| 3.5.2 | Build SDK: `npm run build` | 10m | Backend Dev | `dist/` folder generated |
| 3.5.3 | Test SDK import in a fresh project: `npm link` or local install | 15m | Backend Dev | SDK imports correctly |
| 3.5.4 | (Optional) Publish to npm as `@ghostpass/sdk` | 20m | Backend Dev | Package on npm registry |

---

## Phase 4: Frontend Application
**Days**: 5–7  
**Goal**: Working Next.js app with registration, dashboard, discovery, and demo pages.

### 4.1 Project Setup
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.1.1 | Initialize Next.js 14 app: `npx create-next-app@latest web --typescript --tailwind --app` | 5m | Frontend Dev | Project scaffolded |
| 4.1.2 | Install dependencies: wagmi, viem, @rainbow-me/rainbowkit, @tanstack/react-query, zustand | 10m | Frontend Dev | Dependencies installed |
| 4.1.3 | Install shadcn/ui: `npx shadcn-ui@latest init` | 10m | Frontend Dev | shadcn configured |
| 4.1.4 | Add shadcn components: button, input, dialog, card, badge, toast, tabs | 10m | Frontend Dev | Components installed |
| 4.1.5 | Configure `wagmi.ts`: chains, transports, connectors for Base Sepolia | 30m | Frontend Dev | Wagmi config works |
| 4.1.6 | Configure `rainbowkit.ts`: theme, app info, cool mode | 15m | Frontend Dev | RainbowKit modal works |
| 4.1.7 | Create root layout with providers (Wagmi, QueryClient, RainbowKit) | 20m | Frontend Dev | App loads without errors |
| 4.1.8 | Create `src/lib/utils.ts` with `cn()` helper (shadcn standard) | 5m | Frontend Dev | Utility function ready |

### 4.2 Global UI Components
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.2.1 | Create `ConnectButton` component wrapping RainbowKit | 15m | Frontend Dev | Button renders and works |
| 4.2.2 | Create `Header` component with logo, nav links, connect button | 30m | Frontend Dev | Header on all pages |
| 4.2.3 | Create `Footer` component with links to GitHub, docs, team info | 15m | Frontend Dev | Footer on all pages |
| 4.2.4 | Create `Layout` component composing Header + Footer + main content | 10m | Frontend Dev | Consistent layout |
| 4.2.5 | Create `Toast` system for transaction notifications | 20m | Frontend Dev | Toasts show on tx submit/confirm |
| 4.2.6 | Create `LoadingSpinner` component for async states | 10m | Frontend Dev | Spinner used across app |
| 4.2.7 | Create `ErrorBoundary` for graceful error handling | 20m | Frontend Dev | Errors caught and displayed |

### 4.3 Registration Page (`/register`)
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.3.1 | Create page layout with step indicator (3 steps) | 20m | Frontend Dev | Layout renders |
| 4.3.2 | Step 1 UI: "Generate Keys" — button to generate stealth key pair, display public keys | 30m | Frontend Dev | Keys generated in browser |
| 4.3.3 | Step 1: Download key backup file (encrypted with password) | 30m | Frontend Dev | Download works |
| 4.3.4 | Step 2 UI: "Agent Profile" — form for name, capabilities (JSON), pricing | 20m | Frontend Dev | Form validates inputs |
| 4.3.5 | Step 3 UI: "Register" — summary of data, confirm and submit | 20m | Frontend Dev | Summary displays correctly |
| 4.3.6 | Wire Step 3 to `GhostPassRegistry.registerAgent()` via wagmi `useWriteContract` | 45m | Frontend Dev | Transaction submits |
| 4.3.7 | Handle transaction states: pending, success, error with toasts | 20m | Frontend Dev | States handled |
| 4.3.8 | On success: call NameStone API to mint subname, update text records | 45m | Frontend Dev | Subname minted successfully |
| 4.3.9 | Show success screen with new ENS subname and link to dashboard | 15m | Frontend Dev | Success screen complete |
| 4.3.10 | Test full registration flow end-to-end on Base Sepolia | 30m | Frontend Dev | Flow works |

### 4.4 Dashboard Page (`/dashboard`)
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.4.1 | Create page layout with agent profile card (name, subname, reputation) | 20m | Frontend Dev | Profile card renders |
| 4.4.2 | Fetch and display agent profile from GhostPassRegistry using `useReadContract` | 30m | Frontend Dev | Data displays correctly |
| 4.4.3 | Display balance section: ETH balance, token balances | 20m | Frontend Dev | Balances update |
| 4.4.4 | Display "Received Payments" table with stealth addresses, amounts, dates | 30m | Frontend Dev | Table populated |
| 4.4.5 | Implement "Scan for Payments" button that triggers SDK `scanForPayments` | 45m | Frontend Dev | Scanner finds payments |
| 4.4.6 | Implement "Recover" button per payment row to sweep funds | 30m | Frontend Dev | Recovery works |
| 4.4.7 | Add "Copy Subname" and "Share Profile" buttons | 10m | Frontend Dev | Clipboard works |
| 4.4.8 | Add "Edit Profile" modal to update capabilities/pricing | 30m | Frontend Dev | Updates saved onchain |
| 4.4.9 | Test dashboard with registered agent | 20m | Frontend Dev | All features work |

### 4.5 Discovery Page (`/discover`)
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.5.1 | Create page with search bar and filter tags (capabilities) | 20m | Frontend Dev | Search UI renders |
| 4.5.2 | Fetch registered agents from GhostPassRegistry (or subgraph if available) | 30m | Frontend Dev | Agent list populated |
| 4.5.3 | Display agents as cards with name, capabilities, pricing, reputation | 20m | Frontend Dev | Cards render correctly |
| 4.5.4 | Add "Resolve & Pay" button on each card | 15m | Frontend Dev | Button navigates to pay page |
| 4.5.5 | Implement search/filter by capability or name | 20m | Frontend Dev | Filter works |
| 4.5.6 | Add empty state for no results | 10m | Frontend Dev | Empty state shows |
| 4.5.7 | Test discovery with 3+ registered agents | 15m | Frontend Dev | Page works |

### 4.6 Payment Page (`/pay/:ensName`)
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.6.1 | Create dynamic route for `/pay/:ensName` | 10m | Frontend Dev | Route matches |
| 4.6.2 | Fetch agent profile from ENS text records on page load | 20m | Frontend Dev | Profile displays |
| 4.6.3 | Display agent capabilities and pricing prominently | 10m | Frontend Dev | Pricing visible |
| 4.6.4 | "Resolve Stealth Address" button: calls SDK, shows derived address | 30m | Frontend Dev | Address displays |
| 4.6.5 | Show "Previous Resolution" comparison to prove address changes | 15m | Frontend Dev | Different addresses shown |
| 4.6.6 | Payment form: token selector (ETH, USDC), amount input | 20m | Frontend Dev | Form validates |
| 4.6.7 | "Send Payment" button: constructs and sends transaction via wagmi | 30m | Frontend Dev | Payment sends |
| 4.6.8 | Optional "Announce Payment" checkbox to call registry announce() | 20m | Frontend Dev | Announcement works |
| 4.6.9 | Show transaction status with link to Basescan | 15m | Frontend Dev | Link works |
| 4.6.10 | Test payment flow end-to-end | 30m | Frontend Dev | Full flow works |

### 4.7 Demo Page (`/demo`)
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.7.1 | Create split-screen layout: left panel (Seller Agent), right panel (Buyer Agent) | 30m | Frontend Dev | Layout renders |
| 4.7.2 | Left panel: simulate Seller Agent dashboard with mock data | 20m | Frontend Dev | Panel populated |
| 4.7.3 | Right panel: simulate Buyer Agent with ENS resolution input | 20m | Frontend Dev | Input works |
| 4.7.4 | "Simulate Discovery" button: shows Buyer finding Seller via ENS | 15m | Frontend Dev | Discovery animated |
| 4.7.5 | "Resolve Stealth Address" button: shows address derivation with math explanation | 30m | Frontend Dev | Derivation animated |
| 4.7.6 | "Send Payment" button: simulates transaction with progress bar | 20m | Frontend Dev | Animation plays |
| 4.7.7 | "Recover Payment" button: shows Seller scanning and sweeping funds | 30m | Frontend Dev | Recovery animated |
| 4.7.8 | Add explanatory tooltips for each step (stealth address, ephemeral key, etc.) | 20m | Frontend Dev | Tooltips informative |
| 4.7.9 | Test demo page flow | 15m | Frontend Dev | Demo plays smoothly |

### 4.8 Landing Page (`/`)
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 4.8.1 | Create hero section with tagline, problem statement, and CTA buttons | 30m | Frontend Dev | Hero renders |
| 4.8.2 | Create "How It Works" section with 3-step visual explanation | 30m | Frontend Dev | Steps illustrated |
| 4.8.3 | Create "For Agents" section explaining agent-to-agent commerce | 20m | Frontend Dev | Section complete |
| 4.8.4 | Create "Tech Stack" section with sponsor logos (ENS, Base) | 15m | Frontend Dev | Logos displayed |
| 4.8.5 | Add CTA footer: "Register Your Agent" and "View Demo" buttons | 10m | Frontend Dev | CTAs link correctly |
| 4.8.6 | Make landing page responsive (mobile, tablet, desktop) | 30m | Frontend Dev | Responsive on all sizes |

---

## Phase 5: Integration & End-to-End Testing
**Days**: 8–9  
**Goal**: All components work together. Bugs fixed. Edge cases handled.

### 5.1 Integration Testing
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 5.1.1 | Test complete flow: Register Agent A → Register Agent B → B pays A → A recovers | 60m | All | Full flow works |
| 5.1.2 | Test edge case: resolve same name twice, confirm different addresses | 15m | All | Addresses differ |
| 5.1.3 | Test edge case: pay to unregistered name, confirm graceful error | 15m | All | Error handled |
| 5.1.4 | Test edge case: recover with wrong viewing key, confirm no match | 15m | All | No false positives |
| 5.1.5 | Test edge case: insufficient gas for recovery, confirm helpful error | 15m | All | Error message clear |
| 5.1.6 | Test on mobile browser (Metamask mobile) | 30m | Frontend Dev | Mobile flow works |
| 5.1.7 | Test with different wallets (Rabby, Coinbase Wallet, WalletConnect) | 30m | Frontend Dev | Major wallets work |

### 5.2 Performance & Security
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 5.2.1 | Add input sanitization to all gateway endpoints | 20m | Backend Dev | No injection vectors |
| 5.2.2 | Verify gateway private key is NOT in frontend bundle | 15m | Backend Dev | Key server-side only |
| 5.2.3 | Add CORS restrictions: only allow GhostPass frontend domain | 10m | Backend Dev | CORS restricted |
| 5.2.4 | Optimize gateway response time: target <200ms for resolution | 20m | Backend Dev | Latency measured |
| 5.2.5 | Add frontend loading states for all async operations | 20m | Frontend Dev | No jarring jumps |
| 5.2.6 | Run Lighthouse audit, fix critical issues | 30m | Frontend Dev | Score >80 |

### 5.3 Bug Fixes
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 5.3.1 | Triage all bugs found during integration testing | 30m | All | Bug list prioritized |
| 5.3.2 | Fix P0 bugs (blocking flows) | 60m | All | P0 bugs resolved |
| 5.3.3 | Fix P1 bugs (UX issues, confusing errors) | 60m | All | P1 bugs resolved |
| 5.3.4 | Fix P2 bugs (nice-to-have polish) if time permits | 60m | All | P2 bugs resolved |
| 5.3.5 | Regression test: re-run full flows after fixes | 30m | All | No regressions |

---

## Phase 6: Demo Video Preparation
**Days**: 10  
**Goal**: 3-minute demo video recorded, edited, and uploaded.

### 6.1 Script & Storyboard
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 6.1.1 | Finalize demo script (see `06-demo-script.md`) | 30m | All | Script approved |
| 6.1.2 | Create shot list: which screens, which transitions, timing | 30m | All | Shot list complete |
| 6.1.3 | Prepare demo data: 2 pre-registered agents with balances | 20m | All | Demo agents ready |
| 6.1.4 | Seed testnet tokens to demo agents for realistic balances | 15m | All | Balances show >0 |
| 6.1.5 | Rehearse full demo 3 times, time each section | 45m | All | Rehearsal timing logged |

### 6.2 Recording
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 6.2.1 | Set up recording environment: clean desktop, no notifications, good lighting | 15m | All | Environment ready |
| 6.2.2 | Record introduction (15s) — multiple takes | 10m | All | Best take selected |
| 6.2.3 | Record problem statement (15s) | 10m | All | Best take selected |
| 6.2.4 | Record Agent A registration (30s) | 15m | All | Best take selected |
| 6.2.5 | Record Agent B discovery & resolution (30s) | 15m | All | Best take selected |
| 6.2.6 | Record payment & confirmation (20s) | 10m | All | Best take selected |
| 6.2.7 | Record recovery & balance update (25s) | 10m | All | Best take selected |
| 6.2.8 | Record double-resolution magic moment (15s) | 10m | All | Best take selected |
| 6.2.9 | Record outro & team info (20s) | 10m | All | Best take selected |

### 6.3 Editing
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 6.3.1 | Import all takes into video editor (CapCut, iMovie, or DaVinci Resolve) | 15m | All | Project created |
| 6.3.2 | Cut best takes together, remove dead air and mistakes | 30m | All | Rough cut complete |
| 6.3.3 | Add title card: "GhostPass — Invisible Wallets for Autonomous Agents" | 10m | All | Title card added |
| 6.3.4 | Add lower thirds for speaker names and roles | 15m | All | Lower thirds added |
| 6.3.5 | Add zoom/cursor highlight for key clicks (resolution, payment send) | 20m | All | Highlights added |
| 6.3.6 | Add background music (low volume, instrumental, no lyrics) | 15m | All | Music mixed |
| 6.3.7 | Export at 1080p, review for audio sync and clarity | 15m | All | Export reviewed |
| 6.3.8 | Upload to YouTube as unlisted or public | 10m | All | Video URL saved |
| 6.3.9 | Create thumbnail: 1280x720 with project name and hackathon logo | 20m | All | Thumbnail uploaded |

---

## Phase 7: Documentation & Submission
**Days**: 11–12  
**Goal**: README, architecture diagram, and submission materials are complete and polished.

### 7.1 README
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 7.1.1 | Write "Overview" section: what, why, and 30-second pitch | 20m | All | Section complete |
| 7.1.2 | Write "Features" section with bullet points and GIFs/screenshots | 20m | All | Features documented |
| 7.1.3 | Write "Tech Stack" section with all tools and versions | 15m | All | Stack documented |
| 7.1.4 | Write "Architecture" section with Mermaid diagram | 30m | All | Diagram renders in GitHub |
| 7.1.5 | Write "Setup Instructions": clone, install, env vars, run locally | 30m | All | Instructions tested |
| 7.1.6 | Write "Deployment" section: contract addresses, gateway URL, frontend URL | 15m | All | Addresses documented |
| 7.1.7 | Write "Demo" section with embedded YouTube video | 10m | All | Video embedded |
| 7.1.8 | Write "Team" section with names, roles, Telegram handles, X handles | 10m | All | Team documented |
| 7.1.9 | Add LICENSE file (MIT) | 5m | All | LICENSE committed |
| 7.1.10 | Add CONTRIBUTING.md with basic guidelines | 10m | All | File committed |
| 7.1.11 | Proofread entire README for typos and clarity | 20m | All | README polished |

### 7.2 Architecture Diagram
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 7.2.1 | Draw high-level system architecture in Figma, Excalidraw, or Mermaid | 45m | All | Diagram created |
| 7.2.2 | Include all components: contracts, gateway, frontend, SDK, ENS, NameStone | 15m | All | All components present |
| 7.2.3 | Show data flow arrows for registration, resolution, payment, recovery | 15m | All | Flows clear |
| 7.2.4 | Export as PNG and SVG, add to README and docs/ folder | 10m | All | Assets committed |
| 7.2.5 | Create simplified "How It Works" diagram for landing page | 20m | All | Simplified diagram done |

### 7.3 ETHGlobal Submission
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 7.3.1 | Create project on ETHGlobal platform with name and description | 15m | All | Project created |
| 7.3.2 | Add team members with correct roles and contact info | 10m | All | Team added |
| 7.3.3 | Link GitHub repo | 5m | All | Repo linked |
| 7.3.4 | Link demo video (YouTube) | 5m | All | Video linked |
| 7.3.5 | Link live demo (Vercel URL) | 5m | All | Live demo linked |
| 7.3.6 | Fill "Which tracks are you applying for?" with ENS tracks | 5m | All | Tracks selected |
| 7.3.7 | Add contract deployment addresses in description | 5m | All | Addresses listed |
| 7.3.8 | Submit project before deadline (May 3, 12:00pm) | 5m | All | Submitted |

### 7.4 Sponsor-Specific Materials
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 7.4.1 | Write `ENS_INTEGRATION.md` explaining how ENS is used (not cosmetic) | 20m | All | Document complete |
| 7.4.2 | Document which ENS features used: subnames, text records, CCIP Read, NameWrapper | 15m | All | Features listed |
| 7.4.3 | Create a short ENS-specific demo clip (30s) showing ENS resolution working | 20m | All | Clip recorded |
| 7.4.4 | Review ENS prize requirements checklist and confirm all met | 15m | All | Checklist complete |

### 7.5 Final Checks
| ID | Sub-task | Time | Owner | Deliverable |
|----|----------|------|-------|-------------|
| 7.5.1 | Verify GitHub repo is public and contains all code | 5m | All | Repo public |
| 7.5.2 | Verify no secrets or private keys in repo | 10m | All | `git grep` for keys |
| 7.5.3 | Verify live demo loads and main flows work | 15m | All | Demo functional |
| 7.5.4 | Verify demo video plays and audio is clear | 5m | All | Video verified |
| 7.5.5 | Do final read-through of all submission fields | 10m | All | No typos |
| 7.5.6 | Sleep (seriously, get rest before deadline) | 480m | All | Team rested |

---

## Appendix: Daily Schedule

| Day | Focus | Key Milestone |
|-----|-------|---------------|
| **Pre** | Environment setup, key generation, faucet funding | All tools installed, wallet funded |
| **1** | Smart contracts scaffolded | `GhostPassRegistry.sol` compiles |
| **2** | Smart contracts complete + tested | All tests pass, coverage >80% |
| **3** | CCIP Gateway built + deployed | Gateway live on Vercel, resolves test names |
| **4** | SDK complete with all crypto functions | SDK passes all round-trip tests |
| **5** | Frontend scaffolded + global components | Next.js app loads with wallet connect |
| **6** | Registration + Dashboard pages | Can register an agent and view dashboard |
| **7** | Discovery + Payment + Demo pages | Can discover, pay, and run demo |
| **8** | Integration testing | Full flow works end-to-end |
| **9** | Bug fixes + polish | All P0/P1 bugs resolved |
| **10** | Demo video recording + editing | Video uploaded to YouTube |
| **11** | README, architecture diagram, docs | Documentation complete |
| **12** | Submission + final checks | Project submitted to ETHGlobal |

---

## Appendix: Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CCIP Read too complex for 12 days | Medium | High | Fallback: simple onchain resolver with static addresses for demo |
| NameStone API unavailable | Low | High | Fallback: manual subname creation via ENS manager |
| Stealth address derivation bugs | Medium | High | Extensive unit tests + round-trip validation from day 0 |
| Frontend too ambitious | Medium | Medium | Cut Demo page if needed; core flows (register, pay, recover) are MVP |
| Testnet congestion | Low | Medium | Use Base Sepolia (fast, cheap); have extra testnet ETH |
| Team member drops out | Low | High | Solo-friendly scope: backend + contracts are enough for a winning demo |
| Demo video too long | Medium | Medium | Rehearse and time; cut fluff; target 2:45 |

---

## Appendix: Monorepo File Structure

```
ghostpass/
├── README.md
├── LICENSE
├── package.json (root scripts)
├── .env.example
├── .gitignore
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CRYPTOGRAPHY.md
│   ├── ENS_INTEGRATION.md
│   └── DEPLOYMENTS.md
├── contracts/
│   ├── foundry.toml
│   ├── remappings.txt
│   ├── src/
│   │   ├── GhostPassRegistry.sol
│   │   └── GhostPassResolver.sol
│   ├── test/
│   │   ├── GhostPassRegistryTest.t.sol
│   │   └── GhostPassResolverTest.t.sol
│   └── script/
│       ├── DeployRegistry.s.sol
│       ├── DeployResolver.s.sol
│       └── VerifyContracts.s.sol
├── gateway/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   └── src/
│       ├── index.ts
│       ├── ens.ts
│       ├── stealth.ts
│       ├── ccip.ts
│       ├── sign.ts
│       └── routes/
│           └── resolve.ts
├── sdk/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── index.ts
│       ├── keys.ts
│       ├── registry.ts
│       ├── resolution.ts
│       ├── payment.ts
│       └── recovery.ts
└── web/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json
    ├── public/
    │   └── images/
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── register/
        │   ├── dashboard/
        │   ├── discover/
        │   ├── pay/
        │   │   └── [ensName]/
        │   └── demo/
        ├── components/
        │   ├── ui/ (shadcn)
        │   ├── Header.tsx
        │   ├── Footer.tsx
        │   ├── ConnectButton.tsx
        │   └── ...
        ├── lib/
        │   ├── wagmi.ts
        │   ├── rainbowkit.ts
        │   └── utils.ts
        └── hooks/
            └── useAgentProfile.ts
```