import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import * as dotenv from "dotenv";

// Load sensitive variables (.env.hardhat - private keys, API keys)
dotenv.config({ path: '.env.hardhat' });
// Load public variables (.env - contract addresses)
dotenv.config();

const intervalMiningEnabled = process.env.HARDHAT_INTERVAL_MINING === "true";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      mining: intervalMiningEnabled
        ? {
            // Local dev mode mines a block every 5 seconds to mimic a live network.
            // The frontend can poll for new blocks more frequently without changing
            // the actual reward accrual cadence on-chain.
            auto: false,
            interval: 5000,
          }
        : {
            auto: true,
          },
    },
    // Configuration for Sepolia Testnet (Best for testing)
    sepolia: {
      url: process.env.ALCHEMY_API_URL || process.env.SEPOLIA_RPC_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 60000, // 60 seconds timeout
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./src/contracts",
    tests: "./src/test",
    cache: "./cache/hardhat",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
