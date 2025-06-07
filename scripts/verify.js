import { run } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const network = process.env.HARDHAT_NETWORK || "mumbai";
  
  console.log(`🔍 Starting verification process for ${network}...`);
  
  // Read deployment info
  const deploymentFile = path.join(process.cwd(), "deployments", `${network}-deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment first: npm run deploy:mumbai");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const factoryAddress = deploymentInfo.contracts.ElectionFactory.address;
  
  console.log(`📋 Verifying ElectionFactory at: ${factoryAddress}`);
  
  try {
    await run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [],
    });
    
    console.log("✅ ElectionFactory verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ Contract already verified");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
  
  console.log("\n🎉 Verification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });