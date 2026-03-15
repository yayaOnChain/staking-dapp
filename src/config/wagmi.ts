import { http, createConfig } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

// Configure Wagmi with supported chains and connectors
export const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    // MetaMask connector with better UX
    metaMask({
      dappMetadata: {
        name: "Staking DApp",
        url: window.location.origin,
      },
    }),
  ],
});
