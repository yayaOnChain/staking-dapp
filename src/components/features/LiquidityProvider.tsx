import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther, parseEther, type Address } from "viem";
import { toast } from "sonner";
import { TransactionMonitor } from "@/components/web3/TransactionToast";
import { useLiquidity } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import {
  Card,
  Button,
  Input,
  StatBox,
  SettingsModal,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface LiquidityProviderProps {
  poolAddress: Address;
  token0Address: Address;
  token1Address: Address;
}

/**
 * Refactored Liquidity Provider Interface with clean architecture
 * Uses custom hooks for business logic and shared UI components
 */
export const LiquidityProvider = ({
  poolAddress,
  token0Address,
  token1Address,
}: LiquidityProviderProps) => {
  const { address } = useAccount();
  const { slippageTolerance } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
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
    token0Balance,
    token1Balance,
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
  } = useLiquidity({
    poolAddress,
    token0Address,
    token1Address,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      toast.success(mode === "add" ? "Liquidity added!" : "Liquidity removed!");
      resetState();
    }
  }, [isSuccess, mode, resetState]);

  const handleApprove = async () => {
    try {
      await approve();
    } catch {
      // Error handled in hook
    }
  };

  const handleAddLiquidity = async () => {
    try {
      await addLiquidity();
    } catch {
      // Error handled in hook
    }
  };

  const handleRemoveLiquidity = async () => {
    try {
      await removeLiquidity();
    } catch {
      // Error handled in hook
    }
  };

  // Disable all buttons during any transaction (submitting, approval, or confirmation)
  const isTransactionPending = isSubmitting || isConfirming || isApproving;

  if (!address) {
    return (
      <Card padding="lg" className="max-w-lg mx-auto text-center">
        <p className="text-gray-400">Connect your wallet to provide liquidity</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="max-w-lg mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Liquidity Pool</h2>
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

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "add" ? "primary" : "secondary"}
          className="flex-1"
          onClick={() => setMode("add")}
          disabled={isTransactionPending}
        >
          Add Liquidity
        </Button>
        <Button
          variant={mode === "remove" ? "danger" : "secondary"}
          className="flex-1"
          onClick={() => setMode("remove")}
          disabled={isTransactionPending}
        >
          Remove Liquidity
        </Button>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <StatBox
          label="Pool Reserve Token 0"
          value={Number(formatEther(reserve0 || 0n)).toFixed(4)}
        />
        <StatBox
          label="Pool Reserve Token 1"
          value={Number(formatEther(reserve1 || 0n)).toFixed(4)}
        />
      </div>

      {/* Input Section */}
      {mode === "add" ? (
        <div className="space-y-4">
          <Input
            label="Token 0 Amount"
            type="number"
            value={amount0}
            onChange={(e) => setAmount0(e.target.value)}
            placeholder="0.0"
            disabled={isTransactionPending}
            rightElement={
              <span className="text-sm text-gray-400">
                Bal: {formatEther(token0Balance || 0n)}
              </span>
            }
          />

          <Input
            label="Token 1 Amount"
            type="number"
            value={amount1}
            onChange={(e) => setAmount1(e.target.value)}
            placeholder="0.0"
            disabled={isTransactionPending}
            rightElement={
              <span className="text-sm text-gray-400">
                Bal: {formatEther(token1Balance || 0n)}
              </span>
            }
          />

          {/* Expected LP Tokens */}
          {amount0 && amount1 && (
            <div className="p-4 bg-gray-900/50 rounded-lg text-sm text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Expected LP Tokens</span>
                <span className="text-white font-medium">{expectedLP} LP</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Minimum Expected (after {slippageTolerance}% slippage)</span>
                <span className="text-gray-300">
                  {expectedLP ? (Number(expectedLP) * ((100 - slippageTolerance) / 100)).toFixed(6) : "0"} LP
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="LP Tokens to Remove"
            type="number"
            value={amount0}
            onChange={(e) => setAmount0(e.target.value)}
            placeholder="0.0"
            disabled={isTransactionPending}
          />
          
          {amount0 && (
            <div className="p-4 bg-gray-900/50 rounded-lg text-sm text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Expected Token 0</span>
                <span className="text-white font-medium">{expectedRemove0}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Token 1</span>
                <span className="text-white font-medium">{expectedRemove1}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-gray-800">
                <span>Minimum Expected (after {slippageTolerance}% slippage)</span>
                <span className="text-gray-300 flex flex-col items-end">
                  <span>{expectedRemove0 ? (Number(expectedRemove0) * ((100 - slippageTolerance) / 100)).toFixed(6) : "0"}</span>
                  <span>{expectedRemove1 ? (Number(expectedRemove1) * ((100 - slippageTolerance) / 100)).toFixed(6) : "0"}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {mode === "add" && !isApproved && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
          onClick={handleApprove}
          isLoading={isApproving}
          disabled={isTransactionPending || !amount0 || parseEther(amount0) === 0n || parseEther(amount0) > token0Balance! || !amount1 || parseEther(amount1) === 0n || parseEther(amount1) > token1Balance!}
        >
          🔓 Approve Both Tokens
        </Button>
      )}

      {(mode === "remove" || isApproved) && (
        <Button
          variant={mode === "add" ? "success" : "danger"}
          size="lg"
          fullWidth
          className="mt-6"
          onClick={mode === "add" ? handleAddLiquidity : handleRemoveLiquidity}
          isLoading={isSubmitting}
          disabled={
            isTransactionPending ||
            !amount0 || parseEther(amount0) === 0n ||
            (mode === "add" && !amount1)
          }
        >
          {isConfirming
            ? "Confirming..."
            : mode === "add"
              ? "💧 Add Liquidity"
              : "🔥 Remove Liquidity"}
        </Button>
      )}

      {/* Approval Status Indicator */}
      {mode === "add" && (
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <span
            className={cn(
              token0Balance && token0Balance > 0n ? "text-green-400" : "text-gray-500"
            )}
          >
            {token0Balance && token0Balance > 0n ? "✓" : "○"} Token 0
          </span>
          <span
            className={cn(
              token1Balance && token1Balance > 0n ? "text-green-400" : "text-gray-500"
            )}
          >
            {token1Balance && token1Balance > 0n ? "✓" : "○"} Token 1
          </span>
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 p-3 bg-green-900/50 text-green-400 rounded-lg text-center">
          ✓ Transaction Confirmed
        </div>
      )}
    </Card>
  );
};
