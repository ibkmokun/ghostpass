# Deployments

| Contract | Address | Network |
|----------|---------|---------|
| GhostPassRegistry | TBD | Base Sepolia |
| GhostPassResolver | TBD | Base Sepolia |

Deployed at: TBD

## Deployment Commands

### Using Foundry (if available)
```bash
cd contracts
source .env
forge script script/DeployRegistry.s.sol --rpc-url base_sepolia --broadcast --verify
forge script script/DeployResolver.s.sol --rpc-url base_sepolia --broadcast --verify
```

### Using Node.js Deployment Script
```bash
cd deploy
npm install
npx tsx deploy.ts
```

## Post-Deployment Steps

1. **Update Gateway**: Set `GHOSTPASS_REGISTRY_ADDRESS` in `gateway/.env`
2. **Deploy Gateway**: `vercel --prod` in `gateway/`
3. **Update Resolver**: Run `npx tsx update-resolver.ts https://your-gateway.vercel.app/resolve`
4. **Update Frontend**: Set contract addresses in `web/.env.local`
5. **Deploy Frontend**: `vercel --prod` in `web/`

## ENS Configuration

### Mainnet (Production)
- Name: `ghostpass.eth`
- Resolver: `GhostPassResolver` address
- Subname issuer: NameStone on Base

### Testnet (Hackathon Demo)
- Name: `ghostpass.test` or test subnames
- Network: Base Sepolia
- Gateway: Vercel serverless function
