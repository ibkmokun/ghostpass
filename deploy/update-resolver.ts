import {
  createWalletClient,
  createPublicClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", "contracts", ".env") });

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.BASE_SEPOLIA_RPC;

if (!PRIVATE_KEY || !RPC_URL) {
  console.error("Missing PRIVATE_KEY or BASE_SEPOLIA_RPC");
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

async function updateResolver() {
  const resolverAddress = process.argv[2] as `0x${string}`;
  const gatewayURL = process.argv[3];

  if (!resolverAddress || !gatewayURL) {
    console.error("Usage: npx tsx update-resolver.ts <resolver-address> <gateway-url>");
    console.error("Example: npx tsx update-resolver.ts 0xd82310576278B6962e6c977C3f2f09e433704115 https://ghostpass-gateway.vercel.app/resolve");
    process.exit(1);
  }

  console.log(`Updating resolver ${resolverAddress} with gateway URL: ${gatewayURL}`);

  const hash = await walletClient.writeContract({
    address: resolverAddress,
    abi: [
      {
        inputs: [{ internalType: "string", name: "_gatewayURL", type: "string" }],
        name: "setGatewayURL",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const,
    functionName: "setGatewayURL",
    args: [gatewayURL],
  });

  console.log(`Transaction hash: ${hash}`);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("Resolver updated successfully!");
}

updateResolver().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
