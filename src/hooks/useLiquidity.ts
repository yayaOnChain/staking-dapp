import { useState, useCallback, useRef, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther, formatEther, type Address } from "viem";
import { toast } from "sonner";
import { LIQUIDITY_POOL_ABI, ERC20_ABI } from "@/abis";
import { useApproval } from "@/hooks/useApproval";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import type { LiquidityMode } from "@/types";

interface UseLiquidityParams {
  poolAddress: Address;
  token0Address: Address;
  token1Address: Address;
}

interface UseLiquidityReturn {
  mode: LiquidityMode;
  setMode: (mode: LiquidityMode) => void;
  amount0: string;
  setAmount0: (value: string) => void;
  amount1: string;
  setAmount1: (value: string) => void;
  expectedLP: string;
  expectedRemove0: string;
  expectedRemove1: string;
  reserve0: bigint | undefined;
  reserve1: bigint | undefined;
  totalSupply: bigint | undefined;
  token0Balance: bigint | undefined;
  token1Balance: bigint | undefined;
  lpBalance: bigint | undefined;
  isApproved: boolean;
  isApproving: boolean;
  isConfirming: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  hash: Address | undefined;
  addLiquidity: () => Promise<void>;
  removeLiquidity: () => Promise<void>;
  approve: () => Promise<void>;
  resetState: () => void;
}

/**
 * Custom hook for liquidity management (add/remove)
 */
export const useLiquidity = ({
  poolAddress,
  token0Address,
  token1Address,
}: UseLiquidityParams): UseLiquidityReturn => {
  const { address } = useAccount();
  const { slippageTolerance } = useSettings();
  const [mode, setMode] = useState<LiquidityMode>("add");
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [hash, setHash] = useState<Address | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);
  const queryClient = useQueryClient();
  const { addTransaction, updateTransactionStatus } = useTransactions();

  // Setup approvals for both tokens
  const token0Approval = useApproval({
    tokenAddress: token0Address,
    spenderAddress: poolAddress,
    userAddress: address,
  });

  const token1Approval = useApproval({
    tokenAddress: token1Address,
    spenderAddress: poolAddress,
    userAddress: address,
  });

  const isApproved = token0Approval.isApproved && token1Approval.isApproved;
  const isApproving = token0Approval.isApproving || token1Approval.isApproving;

  // Setup write contract
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction - isLoading is true while waiting for confirmation
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({ hash });

  // Pool statistics
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "totalSupply",
  });

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

  // User balances
  const { data: lpBalance, refetch: refetchLpBalance } = useReadContract({
    address: poolAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  const { data: token0Balance, refetch: refetchToken0Balance } = useReadContract({
    address: token0Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  const { data: token1Balance, refetch: refetchToken1Balance } = useReadContract({
    address: token1Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  // Calculate expected LP tokens
  const calculateLP = useCallback((): string => {
    if (!amount0 || !amount1 || !totalSupply || !reserve0 || !reserve1) {
      if (totalSupply === 0n) return amount0 || "0"; // Initial liquidity
      return "0";
    }

    const liquidity0 = (parseEther(amount0) * totalSupply) / reserve0;
    const liquidity1 = (parseEther(amount1) * totalSupply) / reserve1;

    return formatEther(liquidity0 < liquidity1 ? liquidity0 : liquidity1);
  }, [amount0, amount1, totalSupply, reserve0, reserve1]);

  const expectedLP = calculateLP();

  // Calculate expected remove amounts
  const calculateRemove = useCallback(() => {
    if (!amount0 || !totalSupply || !reserve0 || !reserve1 || totalSupply === 0n) {
      return { expectedAmount0: "0", expectedAmount1: "0" };
    }

    const lpTokensWei = parseEther(amount0);
    const amount0Out = (lpTokensWei * reserve0) / totalSupply;
    const amount1Out = (lpTokensWei * reserve1) / totalSupply;

    return {
      expectedAmount0: formatEther(amount0Out),
      expectedAmount1: formatEther(amount1Out),
    };
  }, [amount0, totalSupply, reserve0, reserve1]);

  const { expectedAmount0: expectedRemove0, expectedAmount1: expectedRemove1 } = calculateRemove();

  // Handle approval for both tokens
  const approve = useCallback(async () => {
    toastIdRef.current = toast.loading("Approving tokens...");

    try {
      // Request approvals sequentially to prevent wallet popup conflicts
      if (!token0Approval.isApproved) {
        await token0Approval.approve();
      }
      
      if (!token1Approval.isApproved) {
        await token1Approval.approve();
      }
      
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.success("Approval transaction(s) sent!");
    } catch (error) {
      console.error("Approval error:", error);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.error("Approval failed");
      throw error;
    }
  }, [token0Approval, token1Approval]);

  // Handle add liquidity
  const addLiquidity = useCallback(async () => {
    if (!amount0 || !amount1) return;

    try {
      setIsSubmitting(true); // Disable button immediately
      toastIdRef.current = toast.loading("Adding liquidity...");

      // Calculate min LP tokens based on expected LP and slippage
      const expectedLPNum = Number(expectedLP);
      const minLPTokensStr = (expectedLPNum * ((100 - slippageTolerance) / 100)).toFixed(18);

      const txHash = await writeContractAsync({
        address: poolAddress,
        abi: LIQUIDITY_POOL_ABI,
        functionName: "addLiquidity",
        args: [parseEther(amount0), parseEther(amount1), parseEther(minLPTokensStr)],
      });

      setHash(txHash as Address);
      addTransaction({
        hash: txHash,
        type: "Add Liquidity",
        description: `Add ${amount0} TOKEN0 and ${amount1} TOKEN1 to Pool`,
        status: "pending",
        timestamp: Date.now(),
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error("Add liquidity error:", error);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.error("Failed to add liquidity");
      setIsSubmitting(false);
      throw error;
    }
  }, [amount0, amount1, poolAddress, writeContractAsync, addTransaction, expectedLP, slippageTolerance]);

  // Handle remove liquidity
  const removeLiquidity = useCallback(async () => {
    if (!amount0) return;

    try {
      setIsSubmitting(true); // Disable button immediately
      toastIdRef.current = toast.loading("Removing liquidity...");

      // Calculate min amounts based on expected returns and slippage
      const expectedRemove0Num = Number(expectedRemove0);
      const expectedRemove1Num = Number(expectedRemove1);
      
      const minAmount0Str = (expectedRemove0Num * ((100 - slippageTolerance) / 100)).toFixed(18);
      const minAmount1Str = (expectedRemove1Num * ((100 - slippageTolerance) / 100)).toFixed(18);

      const txHash = await writeContractAsync({
        address: poolAddress,
        abi: LIQUIDITY_POOL_ABI,
        functionName: "removeLiquidity",
        args: [parseEther(amount0), parseEther(minAmount0Str), parseEther(minAmount1Str)],
      });

      setHash(txHash as Address);
      addTransaction({
        hash: txHash,
        type: "Remove Liquidity",
        description: `Remove ${amount0} LP tokens from Pool`,
        status: "pending",
        timestamp: Date.now(),
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error("Remove liquidity error:", error);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.error("Failed to remove liquidity");
      setIsSubmitting(false);
      throw error;
    }
  }, [amount0, poolAddress, writeContractAsync, addTransaction, expectedRemove0, expectedRemove1, slippageTolerance]);

  // Reset state
  const resetState = useCallback(() => {
    setAmount0("");
    setAmount1("");
    setHash(undefined);
    setIsSubmitting(false);
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
  }, []);

  // Sync approval state with amounts
  useEffect(() => {
    if (!amount0 || !amount1) {
      token0Approval.resetApproval();
      token1Approval.resetApproval();
    }
  }, [amount0, amount1, token0Approval, token1Approval]);

  // Invalidate and refetch data after successful transaction
  useEffect(() => {
    if (hash && isSuccess) {
      updateTransactionStatus(hash, "success");
      
      // Refetch all pool-related data
      refetchTotalSupply();
      refetchReserve0();
      refetchReserve1();
      refetchLpBalance();
      refetchToken0Balance();
      refetchToken1Balance();
      token0Approval.refetchAllowance();
      token1Approval.refetchAllowance();

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
    } else if (hash && isTxError) {
      updateTransactionStatus(hash, "failed");
    }
  }, [
    isSuccess,
    isTxError,
    hash,
    poolAddress,
    token0Address,
    token1Address,
    refetchTotalSupply,
    refetchReserve0,
    refetchReserve1,
    refetchLpBalance,
    refetchToken0Balance,
    refetchToken1Balance,
    token0Approval,
    token1Approval,
    queryClient,
    updateTransactionStatus,
  ]);

  return {
    mode,
    setMode,
    amount0,
    setAmount0,
    amount1,
    setAmount1,
    expectedLP,
    expectedRemove0,
    expectedRemove1,
    reserve0,
    reserve1,
    totalSupply,
    token0Balance,
    token1Balance,
    lpBalance,
    isApproved,
    isApproving,
    isConfirming,
    isSubmitting,
    isSuccess,
    hash,
    addLiquidity,
    removeLiquidity,
    approve,
    resetState,
  };
};
