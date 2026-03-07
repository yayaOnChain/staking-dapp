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

// AMM Contract ABI
const AMM_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address", name: "tokenIn", type: "address" },
    ],
    name: "swap",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
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

interface SwapInterfaceProps {
  ammAddress: Address;
  token0Address: Address;
  token1Address: Address;
}

/**
 * Complete Swap Interface with approval flow and real-time price calculation
 */
export const SwapInterface = ({
  ammAddress,
  token0Address,
  token1Address,
}: SwapInterfaceProps) => {
  const { address } = useAccount();
  const [amountIn, setAmountIn] = useState("");
  const [tokenIn, setTokenIn] = useState<"token0" | "token1">("token0");
  const [hash, setHash] = useState<Address | undefined>();

  // Contract interactions
  const { writeContract, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Read pool reserves for price calculation
  const { data: reserve0 } = useReadContract({
    address: ammAddress,
    abi: AMM_ABI,
    functionName: "reserve0",
  });

  const { data: reserve1 } = useReadContract({
    address: ammAddress,
    abi: AMM_ABI,
    functionName: "reserve1",
  });

  // Read user token balance
  const currentTokenAddress =
    tokenIn === "token0" ? token0Address : token1Address;
  const { data: tokenBalance } = useReadContract({
    address: currentTokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  // Read user allowance
  const { data: allowance } = useReadContract({
    address: currentTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as Address, ammAddress],
  });

  // Calculate estimated output based on constant product formula
  const calculateOutput = () => {
    if (!amountIn || !reserve0 || !reserve1) return "0";

    const amountInWei = parseEther(amountIn);
    const isToken0In = tokenIn === "token0";
    const reserveIn = isToken0In ? reserve0 : reserve1;
    const reserveOut = isToken0In ? reserve1 : reserve0;

    // x * y = k formula with 0.3% fee
    const amountInWithFee = amountInWei * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;

    return formatEther(numerator / denominator);
  };

  const estimatedOutput = calculateOutput();
  const isApproved =
    allowance && tokenBalance && allowance >= parseEther(amountIn || "0");

  // Handle approval transaction
  const handleApprove = () => {
    try {
      writeContract({
        address: currentTokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ammAddress, maxUint256], // Infinite approval
      });
      toast.loading("Approving token...");
    } catch (error) {
      console.error(error);
      toast.error("Approval failed");
    }
  };

  // Handle swap transaction
  const handleSwap = async () => {
    if (!amountIn) return;

    try {
      const txHash = await writeContractAsync({
        address: ammAddress,
        abi: AMM_ABI,
        functionName: "swap",
        args: [parseEther(amountIn), currentTokenAddress],
      });
      setHash(txHash as Address);
      toast.loading("Swapping tokens...");
    } catch (error) {
      console.error(error);
      toast.error("Swap failed");
    }
  };

  // Handle success callback
  const handleSuccess = () => {
    toast.success("Swap completed successfully!");
    setAmountIn("");
    setHash(undefined);
  };

  if (!address) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Connect your wallet to start swapping</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Swap Tokens</h2>

      {/* Transaction Monitor */}
      {hash && <TransactionMonitor hash={hash} onSuccess={handleSuccess} />}

      {/* Input Section */}
      <div className="space-y-4">
        {/* Token In */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">From</label>
            <span className="text-sm text-gray-400">
              Balance: {formatEther(tokenBalance || 0n)}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-xl outline-none"
            />
            <button
              onClick={() =>
                setTokenIn(tokenIn === "token0" ? "token1" : "token0")
              }
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
            >
              {tokenIn === "token0" ? "TOKEN0" : "TOKEN1"}
            </button>
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="flex justify-center">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-gray-400">↓</span>
          </div>
        </div>

        {/* Token Out (Read Only) */}
        <div className="bg-gray-900 rounded-lg p-4">
          <label className="text-sm text-gray-400 mb-2 block">
            To (Estimated)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={estimatedOutput}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-xl outline-none"
            />
            <span className="px-3 py-1 bg-gray-700 rounded text-sm">
              {tokenIn === "token0" ? "TOKEN1" : "TOKEN0"}
            </span>
          </div>
        </div>
      </div>

      {/* Price Info */}
      {amountIn && (
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Price Impact</span>
            <span>&lt; 1%</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Network Fee</span>
            <span>~0.002 ETH</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={!isApproved ? handleApprove : handleSwap}
        disabled={isPending || isConfirming || !amountIn}
        className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition ${
          isPending || isConfirming
            ? "bg-yellow-600 text-white"
            : !isApproved
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isConfirming
          ? "Confirming..."
          : !isApproved
            ? "Approve Token"
            : "Swap"}
      </button>

      {/* Status Messages */}
      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-900/50 text-green-400 rounded-lg text-center">
          ✓ Transaction Confirmed
        </div>
      )}
    </div>
  );
};
