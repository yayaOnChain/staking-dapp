import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, maxUint256, type Address } from "viem";
import { toast } from "sonner";
import { TransactionMonitor } from "../web3/TransactionToast";

// Farm Contract ABI
const FARM_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "pendingReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userInfo",
    outputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "rewardDebt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStaked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface YieldFarmDashboardProps {
  farmAddress: Address;
  lpTokenAddress: Address;
  rewardTokenAddress: Address;
}

/**
 * Complete Yield Farm Dashboard with stake/unstake/harvest functionality
 */
export const YieldFarmDashboard = ({
  farmAddress,
  lpTokenAddress,
  // rewardTokenAddress,
}: YieldFarmDashboardProps) => {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [hash, setHash] = useState<Address | undefined>();

  const { writeContract, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Farm statistics
  const { data: totalStaked } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: "totalStaked",
  });

  // User LP balance
  const { data: lpBalance } = useReadContract({
    address: lpTokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  // User allowance
  const { data: allowance } = useReadContract({
    address: lpTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as Address, farmAddress],
  });

  // User staked info
  const { data: userInfo } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: "userInfo",
    args: [address as Address],
  });

  // User pending rewards
  const { data: pendingRewards } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: "pendingReward",
    args: [address as Address],
  });

  const stakedAmount = formatEther(userInfo?.[0] || 0n);
  const isApproved =
    allowance && lpBalance && allowance >= parseEther(amount || "0");

  // Handle approval
  const handleApprove = () => {
    try {
      writeContract({
        address: lpTokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [farmAddress, maxUint256],
      });
      toast.loading("Approving LP tokens...");
    } catch (error) {
      console.error(error);
      toast.error("Approval failed");
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    try {
      const txHash = await writeContractAsync({
        address: farmAddress,
        abi: FARM_ABI,
        functionName: "deposit",
        args: [parseEther(amount)],
      });
      setHash(txHash as Address);
      toast.loading("Staking LP tokens...");
    } catch (error) {
      console.error(error);
      toast.error("Deposit failed");
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    try {
      const txHash = await writeContractAsync({
        address: farmAddress,
        abi: FARM_ABI,
        functionName: "withdraw",
        args: [parseEther(amount)],
      });
      setHash(txHash as Address);
      toast.loading("Unstaking LP tokens...");
    } catch (error) {
      console.error(error);
      toast.error("Withdraw failed");
    }
  };

  // Handle harvest only
  const handleHarvest = async () => {
    try {
      const txHash = await writeContractAsync({
        address: farmAddress,
        abi: FARM_ABI,
        functionName: "withdraw",
        args: [0n], // Withdraw 0 = harvest only
      });
      setHash(txHash as Address);
      toast.loading("Harvesting rewards...");
    } catch (error) {
      console.error(error);
      toast.error("Harvest failed");
    }
  };

  const handleSuccess = () => {
    toast.success("Transaction confirmed!");
    setAmount("");
    setHash(undefined);
  };

  if (!address) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Connect your wallet to start farming</p>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl max-w-lg mx-auto border border-yellow-500/20">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌾</span>
        <div>
          <h2 className="text-2xl font-bold text-white">Yield Farm</h2>
          <p className="text-sm text-gray-400">Stake LP • Earn Rewards</p>
        </div>
      </div>

      {hash && <TransactionMonitor hash={hash} onSuccess={handleSuccess} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Your LP Balance</p>
          <p className="text-xl font-mono text-white">
            {formatEther(lpBalance || 0n)}
          </p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-green-700">
          <p className="text-xs text-gray-400 mb-1">Your Staked</p>
          <p className="text-xl font-mono text-green-400">{stakedAmount}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-700 col-span-2">
          <p className="text-xs text-gray-400 mb-1">Pending Rewards</p>
          <p className="text-2xl font-mono text-yellow-400">
            {formatEther(pendingRewards || 0n)}
          </p>
        </div>
      </div>

      {/* Total Pool Stats */}
      <div className="mb-6 p-4 bg-gray-900/30 rounded-lg">
        <p className="text-xs text-gray-400">Total Pool Staked</p>
        <p className="text-lg font-mono text-white">
          {formatEther(totalStaked || 0n)} LP
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <label className="text-sm text-gray-400 mb-2 block">
            Amount of LP Tokens
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-transparent text-white text-xl outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {!isApproved ? (
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition disabled:opacity-50"
            >
              Approve LP Tokens
            </button>
          ) : (
            <>
              <button
                onClick={handleDeposit}
                disabled={isPending || isConfirming || !amount}
                className="py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition disabled:opacity-50"
              >
                Stake
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isPending || isConfirming || !amount}
                className="py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition disabled:opacity-50"
              >
                Unstake
              </button>
            </>
          )}
        </div>

        {/* Harvest Button */}
        <button
          onClick={handleHarvest}
          disabled={
            isPending ||
            isConfirming ||
            !pendingRewards ||
            pendingRewards === 0n
          }
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition disabled:opacity-50"
        >
          🎁 Harvest Rewards
        </button>
      </div>

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-900/50 text-green-400 rounded-lg text-center">
          ✓ Transaction Confirmed
        </div>
      )}

      {isPending && (
        <div className="mt-4 p-3 bg-yellow-900/50 text-yellow-400 rounded-lg text-center">
          ⏳ Waiting for confirmation...
        </div>
      )}
    </div>
  );
};
