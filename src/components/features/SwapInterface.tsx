import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, type Address } from "viem";
import { toast } from "sonner";
import { TransactionMonitor } from "@/components/web3/TransactionToast";
import { useSwap } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import {
  Card,
  Button,
  Input,
  TokenSelectButton,
  SettingsModal,
} from "@/components/ui";

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
  const { slippageTolerance } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  // Calculate minimum received
  const expectedOutputNum = Number(estimatedOutput) || 0;
  const minimumReceived = expectedOutputNum * ((100 - slippageTolerance) / 100);

  if (!address) {
    return (
      <Card padding="lg" className="max-w-md mx-auto text-center">
        <p className="text-gray-400">Connect your wallet to start swapping</p>
      </Card>
    );
  }

  return (
      <Card padding="lg" className="max-w-md mx-auto relative w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-2xl font-bold text-white">Swap Tokens</h2>
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Transaction Settings"
          >
            ⚙️
          </button>
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        </div>
      </div>

      {hash && <TransactionMonitor hash={hash} />}

      {/* Input Section */}
      <div className="space-y-4">
        {/* Token In */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
          <div className="flex justify-between mb-2 gap-2">
            <label className="text-sm text-gray-400 shrink-0">From</label>
            <span className="text-sm text-gray-400 truncate">
              Balance: {formatEther(balance || 0n)}
            </span>
          </div>
          <div className="flex gap-2 items-center min-w-0">
            <div className="flex-1 min-w-0">
              <Input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="text-lg sm:text-xl"
                disabled={isTransactionPending}
              />
            </div>
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
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center -my-2 relative z-10">
            <span className="text-gray-400">↓</span>
          </div>
        </div>

        {/* Token Out (Read Only) */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
          <label className="text-sm text-gray-400 mb-2 block">
            To (Estimated)
          </label>
          <div className="flex gap-2 items-center min-w-0">
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                value={estimatedOutput}
                readOnly
                placeholder="0.0"
                className="text-lg sm:text-xl"
                disabled={isTransactionPending}
              />
            </div>
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
            <span>Minimum Received</span>
            <span className="text-white font-medium">
              {minimumReceived.toFixed(6)} {outputTokenSymbol}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Slippage Tolerance</span>
            <span>{slippageTolerance}%</span>
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
