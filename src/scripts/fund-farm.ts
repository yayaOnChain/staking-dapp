import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting YieldFarm funding process...\n");

  const networkName = network.name;
  const filename = networkName === "localhost"
    ? "contract-addresses-local.json"
    : networkName === "sepolia"
      ? "contract-addresses-sepolia.json"
      : `contract-addresses-${networkName}.json`;

  const contractAddressPath = path.join(__dirname, `../../${filename}`);
  if (!fs.existsSync(contractAddressPath)) {
    console.error(`❌ Address file not found: ${filename}`);
    console.error("Please run the deployment script first.");
    process.exit(1);
  }

  const addressesStr = fs.readFileSync(contractAddressPath, "utf-8");
  const addressesData = JSON.parse(addressesStr);
  
  // Assuming the structure is like { "sepolia": { "REWARD_TOKEN": "...", "FARM": "..." } }
  // We'll extract the first network key found
  const networkKey = Object.keys(addressesData)[0]; 
  const addresses = addressesData[networkKey];

  const rewardTokenAddress = addresses.REWARD_TOKEN;
  const yieldFarmAddress = addresses.FARM;

  if (!rewardTokenAddress || !yieldFarmAddress) {
    console.error("❌ Missing REWARD_TOKEN or FARM address in the JSON file.");
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Operating with account: ${deployer.address}`);

  // Attach to the deployed RewardToken contract
  const RewardToken = await ethers.getContractAt("RewardToken", rewardTokenAddress);
  
  const balance = await RewardToken.balanceOf(deployer.address);
  console.log(`💰 Deployer RewardToken Balance: ${ethers.formatEther(balance)}`);

  // Define amount to fund (e.g., 500,000 tokens or half of the balance)
  // Here we check if balance is at least 100,000, we'll fund 100,000.
  // Otherwise we fund 50% of whatever the deployer has.
  let amountToFund;
  const targetFund = ethers.parseEther("100000"); 
  if (balance >= targetFund) {
    amountToFund = targetFund;
  } else {
    amountToFund = balance / 2n; // 50% of balance
  }

  if (amountToFund === 0n) {
    console.error("❌ You have 0 RewardToken balance. Cannot fund the Farm.");
    process.exit(1);
  }

  console.log(`🚀 Transferring ${ethers.formatEther(amountToFund)} RewardToken to YieldFarm (${yieldFarmAddress})...`);
  
  const tx = await RewardToken.transfer(yieldFarmAddress, amountToFund);
  console.log(`⏳ Waiting for transaction confirmation... (Tx Hash: ${tx.hash})`);
  
  await tx.wait();

  console.log("✅ Successfully funded YieldFarm with RewardTokens!");
  console.log("\n🌾 Users can now stake LP tokens and earn rewards!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
