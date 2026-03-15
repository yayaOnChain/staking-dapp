import { useAccount } from "wagmi";
import { useMemo } from "react";
import { mainnet, sepolia } from "wagmi/chains";
import { CONTRACT_ADDRESSES, DEFAULT_NETWORK } from "@/config/constants";
import type { Network, ContractAddresses } from "@/types";

export interface NetworkConfigReturn {
  network: Network;
  contracts: ContractAddresses;
  chainId: number | undefined;
}

/**
 * Custom hook to dynamically manage and resolve network state and corresponding contract addresses.
 */
export const useNetworkConfig = (): NetworkConfigReturn => {
  const { chainId } = useAccount();

  const networkConfig = useMemo(() => {
    let resolvedNetwork: Network = DEFAULT_NETWORK;

    if (chainId === mainnet.id) {
      resolvedNetwork = "mainnet";
    } else if (chainId === sepolia.id) {
      resolvedNetwork = "sepolia";
    }
    // If connected to an unsupported chain or disconnected, it falls back to DEFAULT_NETWORK

    return {
      network: resolvedNetwork,
      contracts: CONTRACT_ADDRESSES[resolvedNetwork],
      chainId,
    };
  }, [chainId]);

  return networkConfig;
};
