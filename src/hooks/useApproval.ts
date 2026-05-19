import { useState, useCallback, useEffect } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import type { Address } from "viem";
import { ERC20_ABI } from "@/abis";

interface UseApprovalParams {
  tokenAddress: Address;
  spenderAddress: Address;
  userAddress?: Address;
}

interface UseApprovalReturn {
  allowance: bigint | undefined;
  isApproved: boolean;
  isApproving: boolean;
  approve: (amount?: bigint) => Promise<void>;
  resetApproval: () => void;
  refetchAllowance: () => void;
}

/**
 * Custom hook for handling ERC20 token approvals
 */
export const useApproval = ({
  tokenAddress,
  spenderAddress,
  userAddress,
}: UseApprovalParams): UseApprovalReturn => {
  const [isApproving, setIsApproving] = useState(false);

  // Read current allowance
  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [userAddress as Address, spenderAddress],
    query: {
      enabled: !!userAddress,
      refetchInterval: isApproving ? 2000 : false, // Poll while approving
    },
  });

  // Setup write contract
  const { writeContractAsync } = useWriteContract();

  // Check if approved based on current allowance from contract
  const isApproved = allowance !== undefined && allowance > 0n;

  // Auto-stop approving when allowance is detected
  useEffect(() => {
    if (isApproving && allowance !== undefined && allowance > 0n) {
      setIsApproving(false);
    }
  }, [isApproving, allowance]);

  // Approve tokens
  const approve = useCallback(
    async (amount?: bigint) => {
      if (!userAddress) return;

      setIsApproving(true);

      try {
        await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spenderAddress, amount ?? (2n ** 256n) - 1n], // Max uint256 if not specified
        });
      } catch (error) {
        console.error("Approval error:", error);
        setIsApproving(false);
        throw error;
      }
    },
    [userAddress, tokenAddress, spenderAddress, writeContractAsync],
  );

  // Reset approval state
  const resetApproval = useCallback(() => {
    refetch();
  }, [refetch]);

  // Manual refetch function
  const refetchAllowance = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    allowance,
    isApproved,
    isApproving,
    approve,
    resetApproval,
    refetchAllowance,
  };
};
