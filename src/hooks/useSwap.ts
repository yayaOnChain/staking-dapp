import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther, formatEther, type Address } from "viem";
import { toast } from "sonner";
import { LIQUIDITY_POOL_ABI, ERC20_ABI } from "@/abis";
import { useApproval } from "@/hooks/useApproval";
import type { SwapMode } from "@/types";

interface UseSwapParams {
  poolAddress: Address;
  token0Address: Address;
  token1Address: Address;
}

interface UseSwapReturn {
  amountIn: string;
  setAmountIn: (value: string) => void;
  tokenIn: SwapMode;
  setTokenIn: (mode: SwapMode) => void;
  estimatedOutput: string;
  balance: bigint | undefined;
  isApproved: boolean;
  isApproving: boolean;
  isConfirming: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  hash: Address | undefined;
  approve: () => Promise<void>;
  swap: () => Promise<void>;
  resetState: () => void;
}

/**
 * Custom hook for swap functionality
 */
export const useSwap = ({
  poolAddress,
  token0Address,
  token1Address,
}: UseSwapParams): UseSwapReturn => {
  const { address } = useAccount();
  const [amountIn, setAmountIn] = useState("");
  const [tokenIn, setTokenIn] = useState<SwapMode>("token0");
  const [hash, setHash] = useState<Address | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Determine current token addresses based on swap direction
  const currentTokenAddress = tokenIn === "token0" ? token0Address : token1Address;

  // Setup approval hook
  const { isApproved, isApproving, approve, refetchAllowance } = useApproval({
    tokenAddress: currentTokenAddress,
    spenderAddress: poolAddress,
    userAddress: address,
  });

  // Setup write contract
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction - isLoading is true while waiting for confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read pool reserves for price calculation
  const { data: reserve0, refetch: refetchReserve0 } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "reserve0",
  });

  const { data: reserve1, refetch: refetchReserve1 } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "reserve1",
  });

  // Read user token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: currentTokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  // Calculate output based on constant product formula (x * y = k)
  const calculateOutput = useCallback((): string => {
    if (!amountIn || !reserve0 || !reserve1) return "0";

    const amountInWei = parseEther(amountIn);
    const isToken0In = tokenIn === "token0";
    const reserveIn = isToken0In ? reserve0 : reserve1;
    const reserveOut = isToken0In ? reserve1 : reserve0;

    // Constant product formula with 0.3% fee
    const amountInWithFee = amountInWei * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;

    if (denominator === 0n) return "0";

    return formatEther(numerator / denominator);
  }, [amountIn, reserve0, reserve1, tokenIn]);

  const estimatedOutput = calculateOutput();

  // Handle swap transaction
  const swap = useCallback(async () => {
    if (!amountIn) return;

    try {
      // Check pool liquidity
      if (!reserve0 || !reserve1 || reserve0 === 0n || reserve1 === 0n) {
        toast.error("Pool has no liquidity! Add liquidity first.");
        return;
      }

      setIsSubmitting(true); // Disable button immediately
      toast.loading("Swapping tokens...", { id: "swap" });

      const txHash = await writeContractAsync({
        address: poolAddress,
        abi: LIQUIDITY_POOL_ABI,
        functionName: "swap",
        args: [parseEther(amountIn), currentTokenAddress],
      });

      setHash(txHash as Address);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Swap error:", error);
      toast.dismiss("swap");
      setIsSubmitting(false);

      if (error instanceof Error && error.message.includes("gas limit")) {
        toast.error("Gas limit too high. Pool may have no liquidity.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Swap failed");
      }
      throw error;
    }
  }, [amountIn, reserve0, reserve1, poolAddress, currentTokenAddress, writeContractAsync]);

  // Reset state
  const resetState = useCallback(() => {
    setAmountIn("");
    setHash(undefined);
    setIsSubmitting(false);
    toast.dismiss("swap");
  }, []);

  // Invalidate and refetch data after successful transaction
  useEffect(() => {
    if (isSuccess) {
      // Refetch all swap-related data
      refetchReserve0();
      refetchReserve1();
      refetchTokenBalance();
      refetchAllowance();

      // Also invalidate react-query cache for these addresses
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey.some(
              (key) =>
                typeof key === "object" &&
                key !== null &&
                "address" in key &&
                (key.address === poolAddress ||
                  key.address === token0Address ||
                  key.address === token1Address)
            )
          );
        },
      });
    }
  }, [
    isSuccess,
    poolAddress,
    token0Address,
    token1Address,
    refetchReserve0,
    refetchReserve1,
    refetchTokenBalance,
    refetchAllowance,
    queryClient,
  ]);

  return {
    amountIn,
    setAmountIn,
    tokenIn,
    setTokenIn,
    estimatedOutput,
    balance: tokenBalance,
    isApproved,
    isApproving,
    isConfirming,
    isSubmitting,
    isSuccess,
    hash,
    approve,
    swap,
    resetState,
  };
};
