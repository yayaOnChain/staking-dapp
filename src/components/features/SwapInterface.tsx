import { useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, type Address } from "viem";
import { toast } from "sonner";
import { TransactionMonitor } from "../web3/TransactionToast";
import { useSwap } from "../../hooks";
import {
  Card,
  Button,
  Input,
  TokenSelectButton,
} from "../../components/ui";

interface SwapInterfaceProps {
  poolAddress: Address;
  token0Address: Address;
  token1Address: Address;
}

/**
 * Refactored Swap Interface with clean architecture
 * Uses custom hooks for business logic and shared UI components
 */
export const SwapInterface = ({
  poolAddress,
  token0Address,
  token1Address,
}: SwapInterfaceProps) => {
  const { address } = useAccount();

  const {
    amountIn,
    setAmountIn,
    tokenIn,
    setTokenIn,
    estimatedOutput,
    balance,
    isApproved,
    isApproving,
    isConfirming,
    isSubmitting,
    isSuccess,
    approve,
    swap,
    resetState,
    hash,
  } = useSwap({
    poolAddress,
    token0Address,
    token1Address,
  });

  // Monitor transaction
  useWaitForTransactionReceipt({
    hash: hash as Address,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Swap completed successfully!");
      resetState();
    }
  }, [isSuccess, resetState]);

  const handleApprove = async () => {
    try {
      await approve();
    } catch {
      // Error handled in hook
    }
  };

  const handleSwap = async () => {
    try {
      await swap();
    } catch {
      // Error handled in hook
    }
  };

  const toggleTokenIn = () => {
    setTokenIn(tokenIn === "token0" ? "token1" : "token0");
  };

  // Disable all buttons during any transaction (submitting, approval, or confirmation)
  const isTransactionPending = isSubmitting || isConfirming || isApproving;

  const currentTokenSymbol = tokenIn === "token0" ? "TOKEN0" : "TOKEN1";
  const outputTokenSymbol = tokenIn === "token0" ? "TOKEN1" : "TOKEN0";

  if (!address) {
    return (
      <Card padding="lg" className="max-w-md mx-auto text-center">
        <p className="text-gray-400">Connect your wallet to start swapping</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Swap Tokens</h2>

      {hash && <TransactionMonitor hash={hash} />}

      {/* Input Section */}
      <div className="space-y-4">
        {/* Token In */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">From</label>
            <span className="text-sm text-gray-400">
              Balance: {formatEther(balance || 0n)}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 text-xl"
              disabled={isTransactionPending}
            />
            <TokenSelectButton
              symbol={currentTokenSymbol}
              isActive={true}
              onClick={toggleTokenIn}
              disabled={isTransactionPending}
            />
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
            <Input
              type="text"
              value={estimatedOutput}
              readOnly
              placeholder="0.0"
              className="flex-1 text-xl"
              disabled={isTransactionPending}
            />
            <TokenSelectButton
              symbol={outputTokenSymbol}
              isActive={false}
              disabled={true}
            />
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
      {!isApproved ? (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={handleApprove}
          isLoading={isApproving}
          disabled={isTransactionPending || !amountIn}
        >
          Approve Token
        </Button>
      ) : (
        <Button
          variant="success"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={handleSwap}
          isLoading={isSubmitting}
          disabled={isTransactionPending || !amountIn}
        >
          {isConfirming ? "Confirming..." : "Swap"}
        </Button>
      )}

      {/* Status Messages */}
      {isSuccess && (
        <div className="mt-4 p-3 bg-green-900/50 text-green-400 rounded-lg text-center">
          ✓ Transaction Confirmed
        </div>
      )}
    </Card>
  );
};
