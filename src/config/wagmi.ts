import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
// import { connectKit } from '@reown/appkit-adapter-wagmi'; // Example connector

// Configure Wagmi with supported chains
export const config = createConfig({
  chains: [sepolia], // Add mainnet, polygon, etc. in production
  transports: {
    [sepolia.id]: http(), // Uses public RPC or your own API key
  },
});
