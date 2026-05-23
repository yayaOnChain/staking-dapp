import { useState, useCallback, useRef, useEffect } from "react";
import { useAccount, useBlockNumber, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { hardhat } from "wagmi/chains";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther, formatEther, type Address } from "viem";
import { toast } from "sonner";
import { YIELD_FARM_ABI, ERC20_ABI } from "@/abis";
import { useApproval } from "@/hooks/useApproval";
import { useTransactions } from "@/hooks/useTransactions";

interface UseYieldFarmParams {
  farmAddress: Address;
  lpTokenAddress: Address;
}

interface UseYieldFarmReturn {
  amount: string;
  setAmount: (value: string) => void;
  totalStaked: bigint | undefined;
  lpBalance: bigint | undefined;
  stakedAmount: string;
  pendingRewards: bigint | undefined;
  isApproved: boolean;
  isApproving: boolean;
  isConfirming: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  hash: Address | undefined;
  approve: () => Promise<void>;
  deposit: () => Promise<void>;
  withdraw: () => Promise<void>;
  harvest: () => Promise<void>;
  resetState: () => void;
}

/**
 * Custom hook for yield farming (stake/unstake/harvest)
 */
export const useYieldFarm = ({
  farmAddress,
  lpTokenAddress,
}: UseYieldFarmParams): UseYieldFarmReturn => {
  const { address, chainId } = useAccount();
  const isHardhatNetwork = chainId === hardhat.id;
  const [amount, setAmount] = useState("");
  const [hash, setHash] = useState<Address | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);
  const queryClient = useQueryClient();
  const { addTransaction, updateTransactionStatus } = useTransactions();

  // Setup approval hook
  const { isApproved, isApproving, approve, refetchAllowance } = useApproval({
    tokenAddress: lpTokenAddress,
    spenderAddress: farmAddress,
    userAddress: address,
  });

  // Setup write contract
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction - isLoading is true while waiting for confirmation
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash,
  });

  // Farm statistics
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: farmAddress,
    abi: YIELD_FARM_ABI,
    functionName: "totalStaked",
  });

  // User LP balance
  const { data: lpBalance, refetch: refetchLpBalance } = useReadContract({
    address: lpTokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  // User staked info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: farmAddress,
    abi: YIELD_FARM_ABI,
    functionName: "userInfo",
    args: [address as Address],
  });

  // User pending rewards
  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    address: farmAddress,
    abi: YIELD_FARM_ABI,
    functionName: "pendingReward",
    args: [address as Address],
  });

  const { data: blockNumber } = useBlockNumber({
    // On local Hardhat, blocks are mined on a fixed interval.
    // Polling block updates every second keeps the UI responsive
    // without changing the actual on-chain reward cadence.
    watch: isHardhatNetwork
      ? {
          enabled: true,
          pollingInterval: 1000,
        }
      : false,
  });

  const stakedAmount = formatEther(userInfo?.[0] || 0n);

  // Invalidate and refetch data after successful transaction
  useEffect(() => {
    if (hash && isSuccess) {
      updateTransactionStatus(hash, "success");
      
      // Refetch all farm-related data
      refetchTotalStaked();
      refetchLpBalance();
      refetchUserInfo();
      refetchPendingRewards();
      refetchAllowance();

      // Also invalidate react-query cache for this address
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
                (key.address === farmAddress || key.address === lpTokenAddress)
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
    farmAddress,
    lpTokenAddress,
    refetchTotalStaked,
    refetchLpBalance,
    refetchUserInfo,
    refetchPendingRewards,
    refetchAllowance,
    queryClient,
    updateTransactionStatus,
  ]);

  useEffect(() => {
    if (!isHardhatNetwork || !address) {
      return;
    }

    refetchPendingRewards();
  }, [address, blockNumber, isHardhatNetwork, refetchPendingRewards]);

  // Handle deposit
  const deposit = useCallback(async () => {
    if (!amount) return;

    try {
      setIsSubmitting(true);
      toastIdRef.current = toast.loading("Confirm transaction in your wallet...");

      const txHash = await writeContractAsync({
        address: farmAddress,
        abi: YIELD_FARM_ABI,
        functionName: "deposit",
        args: [parseEther(amount)],
      });

      setHash(txHash as Address);
      addTransaction({
        hash: txHash,
        type: "Stake",
        description: `Stake ${amount} LP Tokens`,
        status: "pending",
        timestamp: Date.now(),
      });
      setIsSubmitting(false);
      toast.loading("Transaction submitted! Waiting for confirmation...", {
        id: toastIdRef.current,
      });
    } catch (error) {
      console.error("Deposit error:", error);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.error("Deposit failed");
      setIsSubmitting(false);
      throw error;
    }
  }, [amount, farmAddress, writeContractAsync, addTransaction]);

  // Handle withdraw
  const withdraw = useCallback(async () => {
    if (!amount) return;

    try {
      setIsSubmitting(true);
      toastIdRef.current = toast.loading("Confirm transaction in your wallet...");

      const txHash = await writeContractAsync({
        address: farmAddress,
        abi: YIELD_FARM_ABI,
        functionName: "withdraw",
        args: [parseEther(amount)],
      });

      setHash(txHash as Address);
      addTransaction({
        hash: txHash,
        type: "Unstake",
        description: `Unstake ${amount} LP Tokens`,
        status: "pending",
        timestamp: Date.now(),
      });
      setIsSubmitting(false);
      toast.loading("Transaction submitted! Waiting for confirmation...", {
        id: toastIdRef.current,
      });
    } catch (error) {
      console.error("Withdraw error:", error);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.error("Withdraw failed");
      setIsSubmitting(false);
      throw error;
    }
  }, [amount, farmAddress, writeContractAsync, addTransaction]);

  // Handle harvest only
  const harvest = useCallback(async () => {
    try {
      setIsSubmitting(true);
      toastIdRef.current = toast.loading("Confirm transaction in your wallet...");

      const txHash = await writeContractAsync({
        address: farmAddress,
        abi: YIELD_FARM_ABI,
        functionName: "withdraw",
        args: [0n],
      });

      setHash(txHash as Address);
      addTransaction({
        hash: txHash,
        type: "Harvest",
        description: `Harvest Pending Rewards`,
        status: "pending",
        timestamp: Date.now(),
      });
      setIsSubmitting(false);
      toast.loading("Transaction submitted! Waiting for confirmation...", {
        id: toastIdRef.current,
      });
    } catch (error) {
      console.error("Harvest error:", error);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.error("Harvest failed");
      setIsSubmitting(false);
      throw error;
    }
  }, [farmAddress, writeContractAsync, addTransaction]);

  // Reset state
  const resetState = useCallback(() => {
    setAmount("");
    setHash(undefined);
    setIsSubmitting(false);
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
  }, []);

  return {
    amount,
    setAmount,
    totalStaked,
    lpBalance,
    stakedAmount,
    pendingRewards,
    isApproved,
    isApproving,
    isConfirming,
    isSubmitting,
    isSuccess,
    hash,
    approve,
    deposit,
    withdraw,
    harvest,
    resetState,
  };
};
