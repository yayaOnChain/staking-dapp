export const CONTRACT_ADDRESSES = {
  sepolia: {
    AMM: "0x123...",
    LP_TOKEN: "0x456...",
    FARM: "0x789...",
    TOKEN_A: "0xAAA...",
    TOKEN_B: "0xBBB...",
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
