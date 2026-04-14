/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POOL_ADDRESS: string;
  readonly VITE_FARM_ADDRESS: string;
  readonly VITE_TOKEN_A_ADDRESS: string;
  readonly VITE_TOKEN_B_ADDRESS: string;
  readonly VITE_REWARD_TOKEN_ADDRESS: string;
  readonly VITE_SEPOLIA_RPC_URL: string;
  readonly VITE_MAINNET_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
