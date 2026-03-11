export const CONTRACT_ADDRESSES = {
  sepolia: {
    POOL: import.meta.env.VITE_POOL_ADDRESS, // LiquidityPool contract (for swap + liquidity)
    FARM: import.meta.env.VITE_FARM_ADDRESS,
    TOKEN_A: import.meta.env.VITE_TOKEN_A_ADDRESS,
    TOKEN_B: import.meta.env.VITE_TOKEN_B_ADDRESS,
    REWARD_TOKEN: import.meta.env.VITE_REWARD_TOKEN_ADDRESS,
  },
  mainnet: {
    // Add mainnet addresses here
  },
} as const;

// Helper to get address based on current chain ID
export const getContractAddress = (
  contractName: keyof typeof CONTRACT_ADDRESSES.sepolia,
  // chainId: number,
) => {
  // Logic to select correct address based on chainId
  // For simplicity in this example, we assume sepolia
  return CONTRACT_ADDRESSES.sepolia[contractName];
};
