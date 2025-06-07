import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting deployment process...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`📍 Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy ElectionFactory
  console.log("\n📋 Deploying ElectionFactory...");
  const ElectionFactory = await ethers.getContractFactory("ElectionFactory");
  const electionFactory = await ElectionFactory.deploy();
  
  await electionFactory.waitForDeployment();
  const factoryAddress = await electionFactory.getAddress();
  
  console.log(`✅ ElectionFactory deployed to: ${factoryAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      ElectionFactory: {
        address: factoryAddress,
        deploymentHash: electionFactory.deploymentTransaction()?.hash,
      }
    },
    timestamp: new Date().toISOString(),
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`📄 Deployment info saved to: ${deploymentFile}`);

  // Generate contract addresses for frontend
  const contractAddresses = {
    ELECTION_FACTORY_ADDRESS: factoryAddress,
    NETWORK_NAME: network.name,
    CHAIN_ID: Number(network.chainId),
  };

  const addressesFile = path.join(process.cwd(), "src", "contracts", "addresses.json");
  fs.writeFileSync(addressesFile, JSON.stringify(contractAddresses, null, 2));
  
  console.log(`📄 Contract addresses saved to: ${addressesFile}`);

  // Verification instructions
  console.log("\n🔍 To verify contracts on Polygonscan, run:");
  console.log(`npx hardhat verify --network ${network.name} ${factoryAddress}`);
  
  console.log("\n🎉 Deployment completed successfully!");
  
  return {
    electionFactory: factoryAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });