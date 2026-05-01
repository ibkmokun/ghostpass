# Deployments

| Contract | Address | Network | Verification |
|----------|---------|---------|-------------|
| GhostPassRegistry | `0xBA18C8c270476Ea2f02e1CA76B4A3a49edB9d163` | Base Sepolia | [Sourcify](https://repo.sourcify.dev/84532/0xBA18C8c270476Ea2f02e1CA76B4A3a49edB9d163) |
| GhostPassResolver | `0xd82310576278B6962e6c977C3f2f09e433704115` | Base Sepolia | [Sourcify](https://repo.sourcify.dev/84532/0xd82310576278B6962e6c977C3f2f09e433704115) |

**Deployer**: `0x8816dbb42e35D9dfEFd003f6D75038EfeF856Aa2`
**Network**: Base Sepolia (Chain ID: 84532)
**Deployed**: 2026-04-27

## Contract Configuration

### GhostPassRegistry
- `initialOwner`: `0x8816dbb42e35D9dfEFd003f6D75038EfeF856Aa2`

### GhostPassResolver
- `gatewayURL`: `https://ghostpass-gateway.vercel.app/resolve`
- `trustedSigner`: `0x8816dbb42e35D9dfEFd003f6D75038EfeF856Aa2`

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://ghostpass-coral.vercel.app |
| Gateway | https://ghostpass-gateway.vercel.app |

## Post-Deployment Steps

1. ✅ Contracts deployed to Base Sepolia
2. ✅ Contract addresses updated in `gateway/.env`
3. ✅ Contract addresses updated in `web/.env.local`
4. ✅ Gateway deployed to Vercel
5. ✅ Resolver updated with actual gateway URL
6. ✅ Frontend deployed to Vercel
7. ⬜ Configure `ghostpass.eth` resolver on mainnet ENS (post-hackathon)

## ENS Configuration

### Mainnet (Production)
- Name: `ghostpass.eth`
- Resolver: `GhostPassResolver` address
- Subname issuer: NameStone on Base

### Testnet (Hackathon Demo)
- Name: `ghostpass.test` or test subnames
- Network: Base Sepolia
- Gateway: Vercel serverless function
