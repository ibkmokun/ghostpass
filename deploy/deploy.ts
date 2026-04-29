import {
  createWalletClient,
  createPublicClient,
  http,
  hexToBytes,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import * as fs from "fs";
import * as path from "path";
import * as solc from "solc";
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

function compileContract(fileName: string, contractName: string) {
  const filePath = path.join(__dirname, "..", "contracts", "src", fileName);
  const source = fs.readFileSync(filePath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      [fileName]: { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const hasError = output.errors.some((e: any) => e.severity === "error");
    if (hasError) {
      console.error("Compilation errors:", output.errors);
      process.exit(1);
    }
  }

  const contract = output.contracts[fileName][contractName];
  return {
    abi: contract.abi,
    bytecode: `0x${contract.evm.bytecode.object}` as `0x${string}`,
  };
}

async function deploy() {
  console.log(`Deploying from: ${account.address}`);

  // 1. Compile and deploy GhostPassRegistry
  console.log("\n[1/3] Compiling GhostPassRegistry...");
  const registry = compileContract("GhostPassRegistry.sol", "GhostPassRegistry");

  console.log("Deploying GhostPassRegistry...");
  const registryHash = await walletClient.deployContract({
    abi: registry.abi,
    bytecode: registry.bytecode,
    args: [account.address],
  });

  console.log(`Transaction hash: ${registryHash}`);
  const registryReceipt = await publicClient.waitForTransactionReceipt({
    hash: registryHash,
  });
  const registryAddress = registryReceipt.contractAddress;
  console.log(`GhostPassRegistry deployed at: ${registryAddress}`);

  // 2. Compile and deploy GhostPassResolver
  console.log("\n[2/3] Compiling GhostPassResolver...");
  const resolver = compileContract("GhostPassResolver.sol", "GhostPassResolver");

  // For now, use placeholder gateway URL. Update after gateway deployment.
  const placeholderGateway = "https://ghostpass-gateway.vercel.app/resolve";

  console.log("Deploying GhostPassResolver...");
  const resolverHash = await walletClient.deployContract({
    abi: resolver.abi,
    bytecode: resolver.bytecode,
    args: [placeholderGateway, account.address],
  });

  console.log(`Transaction hash: ${resolverHash}`);
  const resolverReceipt = await publicClient.waitForTransactionReceipt({
    hash: resolverHash,
  });
  const resolverAddress = resolverReceipt.contractAddress;
  console.log(`GhostPassResolver deployed at: ${resolverAddress}`);

  // 3. Save deployment info
  const deploymentInfo = {
    network: "base-sepolia",
    deployer: account.address,
    registry: registryAddress,
    resolver: resolverAddress,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "contracts", "DEPLOYMENTS.md"),
    `# Deployments\n\n| Contract | Address | Network |\n|----------|---------|---------|\n| GhostPassRegistry | ${registryAddress} | Base Sepolia |\n| GhostPassResolver | ${resolverAddress} | Base Sepolia |\n\nDeployed at: ${deploymentInfo.timestamp}\n`
  );

  fs.writeFileSync(
    path.join(__dirname, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n[3/3] Deployment complete!");
  console.log(`\nRegistry: ${registryAddress}`);
  console.log(`Resolver: ${resolverAddress}`);
  console.log("\nNext steps:");
  console.log("1. Update gateway/.env with GHOSTPASS_REGISTRY_ADDRESS");
  console.log("2. Deploy gateway to Vercel");
  console.log("3. Update GhostPassResolver with actual gateway URL");
  console.log("4. Update web/.env.local with contract addresses");
}

deploy().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
