import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Starting deployment...\n");

  // 1 Get signer from the hardhat
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);

  // 2. Deploy Tokens
  console.log("📦 Deploying TokenA...");
  const TokenA = await ethers.deployContract("TokenA", [], deployer);
  await TokenA.waitForDeployment();
  const tokenAAddress = await TokenA.getAddress();
  console.log(`   ✅ TokenA deployed: ${tokenAAddress}`);

  console.log("📦 Deploying TokenB...");
  const TokenB = await ethers.deployContract("TokenB", [], deployer);
  await TokenB.waitForDeployment();
  const tokenBAddress = await TokenB.getAddress();
  console.log(`   ✅ TokenB deployed: ${tokenBAddress}`);

  console.log("📦 Deploying RewardToken...");
  const RewardToken = await ethers.deployContract("RewardToken", [], deployer);
  await RewardToken.waitForDeployment();
  const rewardTokenAddress = await RewardToken.getAddress();
  console.log(`   ✅ RewardToken deployed: ${rewardTokenAddress}`);

  // 3. Deploy LiquidityPool
  console.log("\n📦 Deploying LiquidityPool...");
  const LiquidityPool = await ethers.deployContract("LiquidityPool", [
    tokenAAddress,
    tokenBAddress,
  ], deployer);
  await LiquidityPool.waitForDeployment();
  const lpAddress = await LiquidityPool.getAddress();
  console.log(`   ✅ LiquidityPool deployed: ${lpAddress}`);

  // 4. Deploy YieldFarm
  console.log("\n📦 Deploying YieldFarm...");
  const YieldFarm = await ethers.getContractFactory("YieldFarm");
  const yieldFarm = await YieldFarm.deploy(
    lpAddress,
    rewardTokenAddress,
    ethers.parseEther("1") // 1 RWRD per block
  );
  await yieldFarm.waitForDeployment();
  const farmAddress = await yieldFarm.getAddress();
  console.log(`   ✅ YieldFarm deployed: ${farmAddress}`);

  // 5. Output addresses
  const addresses = {
    sepolia: {
      LP_TOKEN: lpAddress,
      FARM: farmAddress,
      TOKEN_A: tokenAAddress,
      TOKEN_B: tokenBAddress,
      REWARD_TOKEN: rewardTokenAddress,
    },
  };

  console.log("\n" + "=".repeat(50));
  console.log("📋 Contract Addresses:");
  console.log("=".repeat(50));
  console.log(JSON.stringify(addresses, null, 2));

  // 7. Save to file
  fs.writeFileSync(
    "./contract-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n💾 Addresses saved to contract-addresses.json");

  // 8. Instructions for frontend
  console.log("\n" + "=".repeat(50));
  console.log("📝 Next Steps:");
  console.log("=".repeat(50));
  console.log("1. Copy addresses above to src/config/contracts.ts");
  console.log("2. Fund deployer address with Sepolia ETH");
  console.log("3. Add liquidity to the pool");
  console.log("4. Transfer reward tokens to YieldFarm contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});