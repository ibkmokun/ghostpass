import {
  createWalletClient,
  createPublicClient,
  http,
  Hex,
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
  console.error("Missing PRIVATE_KEY or BASE_SEPOLIA_RPC in contracts/.env");
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

/**
 * Deploy a contract from compiled bytecode and ABI.
 * Usage:
 *   1. Compile contracts via Remix (https://remix.ethereum.org)
 *   2. Export bytecode and ABI
 *   3. Paste them into the CONTRACTS object below
 *   4. Run: npx tsx deploy-remix.ts
 */

const CONTRACTS = {
  GhostPassRegistry: {
    // Paste bytecode from Remix here (must start with 0x)
    bytecode: "0x" as Hex,
    abi: [] as any[],
    args: [account.address],
  },
  GhostPassResolver: {
    // Paste bytecode from Remix here (must start with 0x)
    bytecode: "0x" as Hex,
    abi: [] as any[],
    args: ["https://ghostpass-gateway.vercel.app/resolve", account.address],
  },
};

async function deploy() {
  console.log(`Deploying from: ${account.address}`);

  const deploymentInfo: Record<string, string> = {};

  for (const [name, contract] of Object.entries(CONTRACTS)) {
    if (contract.bytecode === "0x") {
      console.error(`\n[SKIP] ${name}: bytecode not set. Compile via Remix and paste bytecode.`);
      continue;
    }

    console.log(`\n[Deploying] ${name}...`);
    const hash = await walletClient.deployContract({
      abi: contract.abi,
      bytecode: contract.bytecode,
      args: contract.args as any,
    });

    console.log(`Transaction hash: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const address = receipt.contractAddress;
    deploymentInfo[name] = address!;
    console.log(`${name} deployed at: ${address}`);
  }

  // Save deployment info
  fs.writeFileSync(
    path.join(__dirname, "deployment-remix.json"),
    JSON.stringify(
      {
        network: "base-sepolia",
        deployer: account.address,
        contracts: deploymentInfo,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log("\nDeployment complete!");
  console.log("Addresses saved to deploy/deployment-remix.json");
}

deploy().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
