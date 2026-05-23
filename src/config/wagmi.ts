import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, hardhat/*, mainnet */} from "wagmi/chains";
import { APP_NAME, NETWORK_CONFIG, WALLET_CONNECT_PROJECT_ID } from "@/config/constants";

// Configure Wagmi with supported chains
export const config = getDefaultConfig({
  appName: APP_NAME,
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [hardhat, sepolia/*, mainnet*/],
  transports: {
    [hardhat.id]: http(NETWORK_CONFIG.hardhat.rpcUrl as string),
    [sepolia.id]: http(NETWORK_CONFIG.sepolia.rpcUrl as string),
    // [mainnet.id]: http("https://cloudflare-eth.com"),
  },
});
