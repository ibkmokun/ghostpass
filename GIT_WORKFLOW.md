# GhostPass — Git Workflow & Branching Strategy

> **Repository**: https://github.com/ibkmokun/ghostpass  
> **Owner**: ibkmokun (GitHub user ID: 222699865)  
> **Default Branch**: `main`  
> **Collaboration Model**: Trunk-based with staging gate

---

## ⚠️ Security Notice

The GitHub PAT used to initialize this repository was shared in plaintext during this conversation. **Please revoke this token immediately** at https://github.com/settings/tokens and generate a new one with minimum required scopes (`repo`, `read:user`).

---

## Branch Architecture

We use a **two-main-branch model** with short-lived feature/fix branches.

```
main (production / submission-ready)
 │
 ├─ merge from ──► staging (integration / testing)
 │                  │
 │                  ├─ merge from ──► feature/agent-registration
 │                  ├─ merge from ──► feature/ccip-gateway
 │                  ├─ merge from ──► feature/stealth-sdk
 │                  ├─ merge from ──► fix/contract-revert-bug
 │                  └─ merge from ──► fix/gateway-cors
```

### Protected Branches

| Branch | Purpose | Protection Rules |
|--------|---------|------------------|
| **`main`** | Production / submission-ready code | Require PR + 1 approval, require status checks, no force push |
| **`staging`** | Integration branch — all changes merge here first for end-to-end testing | Require PR, no force push, squash merge recommended |

### Branch Naming Conventions

| Prefix | Use For | Example |
|--------|---------|---------|
| `feature/` | New functionality, tracks, sub-tracks | `feature/ens-ccip-resolver` |
| `fix/` | Bug fixes, patches | `fix/stealth-derivation-mismatch` |
| `hotfix/` | Critical production fixes (rare in hackathon) | `hotfix/contract-vulnerability` |
| `docs/` | README, architecture diagrams, demo scripts | `docs/demo-video-script` |
| `chore/` | Tooling, dependencies, config changes | `chore/foundry-upgrade` |

**Never commit directly to `main` or `staging`.** All work happens on prefixed branches merged via Pull Request.

---

## Workflow Rules

### Rule 1: Start From Staging

Every new branch must branch from the latest `staging`:

```bash
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name
```

### Rule 2: Atomic Commits

Each commit should represent a single logical change. Commit messages follow:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | Meaning | Example |
|------|---------|---------|
| `feat` | New feature | `feat(contracts): add GhostPassRegistry with agent struct` |
| `fix` | Bug fix | `fix(gateway): correct ECDH shared secret derivation` |
| `docs` | Documentation only | `docs(readme): add architecture diagram` |
| `test` | Adding or updating tests | `test(registry): add fuzz tests for registerAgent` |
| `refactor` | Code restructuring | `refactor(sdk): split payment.ts into pay and announce` |
| `chore` | Maintenance | `chore(deps): upgrade viem to v2.10` |

### Rule 3: Pull Request Requirements

Before merging to `staging`:

- [ ] Branch is up to date with `staging` (rebase if needed)
- [ ] PR title follows commit message convention
- [ ] PR description explains what changed and why
- [ ] For `feature/*`: demo video or screenshot attached (if UI-related)
- [ ] For `contracts/*`: `forge test` passes locally
- [ ] For `gateway/*`: unit tests pass (`npm test`)
- [ ] For `sdk/*`: round-trip tests pass
- [ ] No `.env` files or private keys in the diff

**Merging to `staging`**: Use **Squash and Merge** to keep `staging` history clean.

### Rule 4: Staging to Main Gate

Before `staging` merges to `main`:

- [ ] Full end-to-end test passes (register → resolve → pay → recover)
- [ ] All demo agents are functional
- [ ] Contract addresses documented in `docs/DEPLOYMENTS.md`
- [ ] Demo video is finalized and linked in README
- [ ] `README.md` is complete and proofread
- [ ] No `console.log`, `debugger`, or `TODO` left in production code
- [ ] Code review by at least one team member

**Merging to `main`**: Use **Create a Merge Commit** to preserve the staging integration point.

### Rule 5: No Force Push

Force push (`git push --force`) is **prohibited** on `main` and `staging`. On feature branches, only use `--force-with-lease` if absolutely necessary.

### Rule 6: Environment Separation

- `main` branch uses **production / mainnet-ready** config (or final testnet addresses)
- `staging` branch uses **development / testnet** config
- Feature branches can use local anvil or temporary testnet contracts

---

## Daily Workflow (Hackathon Speed)

### Morning Sync (5 minutes)
```bash
git checkout staging
git pull origin staging
# Check what merged overnight
```

### Start New Work
```bash
git checkout staging
git pull origin staging
git checkout -b feature/what-you-are-building
# ... work ...
git add .
git commit -m "feat(scope): description"
git push -u origin feature/what-you-are-building
# Open PR to staging
```

### Review & Merge (End of Day)
```bash
# On GitHub: review teammate's PR
# Approve and Squash Merge to staging
# Delete the feature branch after merge
```

### Pre-Submission Lock
24 hours before the ETHGlobal deadline:
- Freeze `staging` — no new feature branches
- Only `fix/*` and `docs/*` branches allowed
- Final `staging` → `main` merge happens 6 hours before deadline
- Tag the submission: `git tag -a v1.0.0 -m "ETHGlobal OpenAgents submission"`

---

## File Protection

These files must be treated with special care:

| File/Pattern | Rule |
|-------------|------|
| `.env` | In `.gitignore` — never committed |
| `*.pem`, `*.key` | In `.gitignore` — never committed |
| `broadcast/` (Foundry) | In `.gitignore` — may contain sensitive deployment data |
| `docs/DEPLOYMENTS.md` | Only updated on `main` or release tags |
| `README.md` | Only updated via PR, never direct commit |

---

## Emergency Procedures

### Undo a Bad Merge to Staging
```bash
git checkout staging
git log --oneline -5  # find the merge commit hash
git revert -m 1 <merge-commit-hash>  # creates a revert commit
git push origin staging
```

### Recover From Force Push Accident
```bash
# On any team member's machine with the old ref:
git checkout staging
git reflog  # find the commit before force push
git reset --hard <old-commit-hash>
git push origin staging --force-with-lease
```

### Hotfix Pipeline (If Main Is Broken)
```bash
git checkout main
git checkout -b hotfix/critical-fix
# ... fix ...
git commit -m "hotfix: description"
git push -u origin hotfix/critical-fix
# Open PR to BOTH main and staging
```

---

## Team-Specific Notes

| Git Config | Value |
|-----------|-------|
| `user.name` | `ibkmokun` (or your actual name) |
| `user.email` | Your GitHub-associated email (set in GitHub profile) |
| `init.defaultBranch` | `main` |
| `pull.rebase` | `true` (recommended for clean history) |

### Setting Up Locally

```bash
# Clone the repo
git clone https://github.com/ibkmokun/ghostpass.git
cd ghostpass

# Configure git (one-time)
git config user.name "ibkmokun"
git config user.email "your-email@example.com"
git config pull.rebase true

# Create and checkout staging branch
git checkout -b staging

# Push to remote
git push -u origin staging

# Set up branch protection on GitHub (web UI)
# Settings → Branches → Add rule → Pattern: main → Require PR
# Settings → Branches → Add rule → Pattern: staging → Require PR
```

---

## Summary Checklist

- [ ] `main` branch exists and is protected
- [ ] `staging` branch exists and is protected
- [ ] Team members can clone, branch, push, and open PRs
- [ ] Commit message convention understood by all
- [ ] `.env` and secrets in `.gitignore`
- [ ] No direct commits to `main` or `staging`
- [ ] Demo video linked only on `main` README
