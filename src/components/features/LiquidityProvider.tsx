import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, maxUint256, type Address } from "viem";
import { toast } from "sonner";
import { TransactionMonitor } from "../web3/TransactionToast";

// LP Contract ABI
const LP_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amount0", type: "uint256" },
      { internalType: "uint256", name: "amount1", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [{ internalType: "uint256", name: "lpTokens", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lpTokens", type: "uint256" }],
    name: "removeLiquidity",
    outputs: [
      { internalType: "uint256", name: "amount0", type: "uint256" },
      { internalType: "uint256", name: "amount1", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserve0",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserve1",
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

interface LiquidityProviderProps {
  lpAddress: Address;
  token0Address: Address;
  token1Address: Address;
}

/**
 * Complete Liquidity Provider Interface with deposit/withdraw functionality
 */
export const LiquidityProvider = ({
  lpAddress,
  token0Address,
  token1Address,
}: LiquidityProviderProps) => {
  const { address } = useAccount();
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [hash, setHash] = useState<Address | undefined>();
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [isApproved, setIsApproved] = useState(false);

  const { writeContract, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Pool statistics
  const { data: totalSupply } = useReadContract({
    address: lpAddress,
    abi: LP_ABI,
    functionName: "totalSupply",
  });

  const { data: reserve0 } = useReadContract({
    address: lpAddress,
    abi: LP_ABI,
    functionName: "reserve0",
  });

  const { data: reserve1 } = useReadContract({
    address: lpAddress,
    abi: LP_ABI,
    functionName: "reserve1",
  });

  // User balances
  const { data: token0Balance } = useReadContract({
    address: token0Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  const { data: token1Balance } = useReadContract({
    address: token1Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  const { data: token0Allowance } = useReadContract({
    address: token0Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as Address, lpAddress],
  });

  const { data: token1Allowance } = useReadContract({
    address: token1Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as Address, lpAddress],
  });

  useEffect(() => {
    if (!token0Allowance || !token1Allowance || !amount0 || !amount1) {
      setIsApproved(false);
      return;
    }
    setIsApproved(
      token0Allowance >= parseEther(amount0) &&
        token1Allowance >= parseEther(amount1),
    );
  }, [token0Allowance, token1Allowance, amount0, amount1]);

  // Calculate expected LP tokens
  const calculateLP = () => {
    if (!amount0 || !amount1 || !totalSupply || !reserve0 || !reserve1)
      return "0";

    if (totalSupply === 0n) {
      return amount0; // Initial liquidity
    }

    const liquidity0 = (parseEther(amount0) * totalSupply) / reserve0;
    const liquidity1 = (parseEther(amount1) * totalSupply) / reserve1;

    return formatEther(liquidity0 < liquidity1 ? liquidity0 : liquidity1);
  };

  const expectedLP = calculateLP();

  // Handle approval for both tokens
  const handleApprove = () => {
    try {
      writeContract({
        address: token0Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [lpAddress, maxUint256],
      });
      writeContract({
        address: token1Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [lpAddress, maxUint256],
      });
      toast.loading("Approving tokens...");
    } catch (error) {
      console.error(error);
      toast.error("Approval failed");
    }
  };

  // Handle add liquidity
  const handleAddLiquidity = async () => {
    try {
      const txHash = await writeContractAsync({
        address: lpAddress,
        abi: LP_ABI,
        functionName: "addLiquidity",
        args: [parseEther(amount0), parseEther(amount1)],
      });
      setHash(txHash as Address);
      toast.loading("Adding liquidity...");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add liquidity");
    }
  };

  // Handle remove liquidity
  const handleRemoveLiquidity = async () => {
    try {
      const txHash = await writeContractAsync({
        address: lpAddress,
        abi: LP_ABI,
        functionName: "removeLiquidity",
        args: [parseEther(amount0)], // Using amount0 as LP token amount in remove mode
      });
      setHash(txHash as Address);
      toast.loading("Removing liquidity...");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove liquidity");
    }
  };

  const handleSuccess = () => {
    toast.success(mode === "add" ? "Liquidity added!" : "Liquidity removed!");
    setAmount0("");
    setAmount1("");
    setHash(undefined);
  };

  if (!address) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Connect your wallet to provide liquidity</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Liquidity Pool</h2>

      {hash && <TransactionMonitor hash={hash} onSuccess={handleSuccess} />}

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("add")}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            mode === "add"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setMode("remove")}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            mode === "remove"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          Remove Liquidity
        </button>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-xs text-gray-400">Pool Reserve Token 0</p>
          <p className="text-lg font-mono text-white">
            {formatEther(reserve0 || 0n)}
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-xs text-gray-400">Pool Reserve Token 1</p>
          <p className="text-lg font-mono text-white">
            {formatEther(reserve1 || 0n)}
          </p>
        </div>
      </div>

      {/* Input Section */}
      {mode === "add" ? (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Token 0 Amount</label>
              <span className="text-sm text-gray-400">
                Balance: {formatEther(token0Balance || 0n)}
              </span>
            </div>
            <input
              type="number"
              value={amount0}
              onChange={(e) => setAmount0(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-white text-xl outline-none"
            />
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Token 1 Amount</label>
              <span className="text-sm text-gray-400">
                Balance: {formatEther(token1Balance || 0n)}
              </span>
            </div>
            <input
              type="number"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-white text-xl outline-none"
            />
          </div>

          {/* Expected LP Tokens */}
          {amount0 && amount1 && (
            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <p className="text-sm text-blue-400">Expected LP Tokens</p>
              <p className="text-2xl font-mono text-white">{expectedLP}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <label className="text-sm text-gray-400 mb-2 block">
              LP Tokens to Remove
            </label>
            <input
              type="number"
              value={amount0}
              onChange={(e) => setAmount0(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-white text-xl outline-none"
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      {mode === "add" && !isApproved && (
        <button
          onClick={handleApprove}
          disabled={isPending || isConfirming || !amount0 || !amount1}
          className="w-full mt-6 py-4 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConfirming ? "Confirming..." : "🔓 Approve Both Tokens"}
        </button>
      )}

      {(mode === "remove" || isApproved) && (
        <button
          onClick={mode === "add" ? handleAddLiquidity : handleRemoveLiquidity}
          disabled={
            isPending ||
            isConfirming ||
            !amount0 ||
            (mode === "add" && !amount1)
          }
          className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition ${
            isPending || isConfirming
              ? "bg-yellow-600 text-white"
              : mode === "add"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isConfirming
            ? "Confirming..."
            : mode === "add"
              ? "💧 Add Liquidity"
              : "🔥 Remove Liquidity"}
        </button>
      )}

      {/* ✅ Approval Status Indicator */}
      {mode === "add" && (
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <span
            className={
              token0Allowance && token0Allowance > 0n
                ? "text-green-400"
                : "text-gray-500"
            }
          >
            {token0Allowance && token0Allowance > 0n ? "✓" : "○"} Token 0
          </span>
          <span
            className={
              token1Allowance && token1Allowance > 0n
                ? "text-green-400"
                : "text-gray-500"
            }
          >
            {token1Allowance && token1Allowance > 0n ? "✓" : "○"} Token 1
          </span>
        </div>
      )}

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-900/50 text-green-400 rounded-lg text-center">
          ✓ Transaction Confirmed
        </div>
      )}
    </div>
  );
};
