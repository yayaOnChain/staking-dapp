import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, hardhat/*, mainnet */} from "wagmi/chains";
import { APP_NAME, NETWORK_CONFIG, WALLET_CONNECT_PROJECT_ID } from "@/config/constants";

/**
 * Create wagmi configuration with optional hardhat network support.
 * Hardhat network is only included in development mode.
 */
export function createWagmiConfig(isHardhatEnabled: boolean) {
  const chains = isHardhatEnabled
    ? [hardhat, sepolia] as const
    : [sepolia/*, mainnet*/] as const;

  const transports: Record<number, ReturnType<typeof http>> = {
    [sepolia.id]: http(NETWORK_CONFIG.sepolia.rpcUrl as string),
    // [mainnet.id]: http("https://cloudflare-eth.com"),
  };

  if (isHardhatEnabled) {
    transports[hardhat.id] = http(NETWORK_CONFIG.hardhat.rpcUrl as string);
  }

  return getDefaultConfig({
    appName: APP_NAME,
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains,
    transports,
  });
}

// Configure Wagmi with supported chains
export const config = createWagmiConfig(import.meta.env.DEV);
