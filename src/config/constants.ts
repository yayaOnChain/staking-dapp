import type { Address } from "viem";
import type { ContractAddresses, Network } from "../types";

/**
 * Contract addresses by network
 */
export const CONTRACT_ADDRESSES: Record<Network, ContractAddresses> = {
  sepolia: {
    POOL: import.meta.env.VITE_POOL_ADDRESS as Address,
    FARM: import.meta.env.VITE_FARM_ADDRESS as Address,
    TOKEN_A: import.meta.env.VITE_TOKEN_A_ADDRESS as Address,
    TOKEN_B: import.meta.env.VITE_TOKEN_B_ADDRESS as Address,
    REWARD_TOKEN: import.meta.env.VITE_REWARD_TOKEN_ADDRESS as Address,
  },
  mainnet: {
    POOL: "0x0000000000000000000000000000000000000000" as Address,
    FARM: "0x0000000000000000000000000000000000000000" as Address,
    TOKEN_A: "0x0000000000000000000000000000000000000000" as Address,
    TOKEN_B: "0x0000000000000000000000000000000000000000" as Address,
    REWARD_TOKEN: "0x0000000000000000000000000000000000000000" as Address,
  },
};

/**
 * Network configurations
 */
export const NETWORK_CONFIG = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
  },
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    explorerUrl: "https://etherscan.io",
    rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL || "https://rpc.ankr.com/eth",
  },
} as const;

/**
 * Default network (can be overridden by env)
 */
export const DEFAULT_NETWORK: Network = "sepolia";

/**
 * Get contract address helper
 */
export const getContractAddress = (
  contractName: keyof ContractAddresses,
  network: Network = DEFAULT_NETWORK,
): Address => {
  return CONTRACT_ADDRESSES[network][contractName];
};

/**
 * Get explorer URL for transaction
 */
export const getExplorerTxUrl = (txHash: string, network: Network = DEFAULT_NETWORK): string => {
  return `${NETWORK_CONFIG[network].explorerUrl}/tx/${txHash}`;
};

/**
 * Get explorer URL for address
 */
export const getExplorerAddressUrl = (address: string, network: Network = DEFAULT_NETWORK): string => {
  return `${NETWORK_CONFIG[network].explorerUrl}/address/${address}`;
};
