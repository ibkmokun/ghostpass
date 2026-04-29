import hre from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log(`Deploying from: ${deployer.account.address}`);

  // Deploy GhostPassRegistry
  console.log("\n[1/2] Deploying GhostPassRegistry...");
  const registry = await hre.viem.deployContract("GhostPassRegistry", [
    deployer.account.address,
  ]);
  console.log(`GhostPassRegistry deployed at: ${registry.address}`);

  // Deploy GhostPassResolver
  console.log("\n[2/2] Deploying GhostPassResolver...");
  const placeholderGateway = "https://ghostpass-gateway.vercel.app/resolve";
  const resolver = await hre.viem.deployContract("GhostPassResolver", [
    placeholderGateway,
    deployer.account.address,
  ]);
  console.log(`GhostPassResolver deployed at: ${resolver.address}`);

  // Save deployment info
  const deploymentInfo = {
    network: "base-sepolia",
    deployer: deployer.account.address,
    registry: registry.address,
    resolver: resolver.address,
    timestamp: new Date().toISOString(),
  };

  writeFileSync(
    join(__dirname, "..", "contracts", "DEPLOYMENTS.md"),
    `# Deployments\n\n| Contract | Address | Network |\n|----------|---------|---------|\n| GhostPassRegistry | ${registry.address} | Base Sepolia |\n| GhostPassResolver | ${resolver.address} | Base Sepolia |\n\nDeployed at: ${deploymentInfo.timestamp}\n`
  );

  writeFileSync(
    join(__dirname, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment complete!");
  console.log("\nNext steps:");
  console.log("1. Update gateway/.env with GHOSTPASS_REGISTRY_ADDRESS");
  console.log("2. Deploy gateway to Vercel");
  console.log("3. Update GhostPassResolver with actual gateway URL");
  console.log("4. Update web/.env.local with contract addresses");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
