import { useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther, parseEther, type Address } from "viem";
import { toast } from "sonner";
import { TransactionMonitor } from "../web3/TransactionToast";
import { useYieldFarm } from "../../hooks";
import {
  Card,
  Button,
  Input,
  StatBox,
} from "../../components/ui";

interface YieldFarmDashboardProps {
  farmAddress: Address;
  lpTokenAddress: Address;
  rewardTokenAddress: Address;
}

/**
 * Refactored Yield Farm Dashboard with clean architecture
 * Uses custom hooks for business logic and shared UI components
 */
export const YieldFarmDashboard = ({
  farmAddress,
  lpTokenAddress,
}: YieldFarmDashboardProps) => {
  const { address } = useAccount();

  const {
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
  } = useYieldFarm({
    farmAddress,
    lpTokenAddress,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed!");
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

  const handleDeposit = async () => {
    try {
      await deposit();
    } catch {
      // Error handled in hook
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw();
    } catch {
      // Error handled in hook
    }
  };

  const handleHarvest = async () => {
    try {
      await harvest();
    } catch {
      // Error handled in hook
    }
  };

  // Disable all buttons during any transaction (submitting, approval, or confirmation)
  const isTransactionPending = isSubmitting || isConfirming || isApproving;

  if (!address) {
    return (
      <Card padding="lg" className="max-w-lg mx-auto text-center border border-yellow-500/20">
        <p className="text-gray-400">Connect your wallet to start farming</p>
      </Card>
    );
  }

  return (
    <Card
      padding="lg"
      className="max-w-lg mx-auto border border-yellow-500/20 bg-linear-to-br from-gray-800 to-gray-900"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌾</span>
        <div>
          <h2 className="text-2xl font-bold text-white">Yield Farm</h2>
          <p className="text-sm text-gray-400">Stake LP • Earn Rewards</p>
        </div>
      </div>

      {hash && <TransactionMonitor hash={hash} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatBox
          label="Your LP Balance"
          value={formatEther(lpBalance || 0n)}
        />
        <StatBox
          label="Your Staked"
          value={stakedAmount}
          variant="success"
        />
        <StatBox
          label="Pending Rewards"
          value={formatEther(pendingRewards || 0n)}
          variant="warning"
          className="col-span-2"
        />
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
        <Input
          label="Amount of LP Tokens"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          disabled={isTransactionPending}
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {!isApproved ? (
            <Button
              variant="primary"
              className="col-span-2"
              onClick={handleApprove}
              isLoading={isApproving}
              disabled={isTransactionPending}
            >
              Approve LP Tokens
            </Button>
          ) : (
            <>
              <Button
                variant="success"
                onClick={handleDeposit}
                isLoading={isSubmitting}
                disabled={isTransactionPending || !amount || parseEther(amount) === 0n || parseEther(amount) > lpBalance!}
              >
                Stake
              </Button>
              <Button
                variant="danger"
                onClick={handleWithdraw}
                isLoading={isSubmitting}
                disabled={isTransactionPending || !amount || parseEther(amount) === 0n || stakedAmount === "0" || parseEther(amount) > parseEther(stakedAmount)}
              >
                Unstake
              </Button>
            </>
          )}
        </div>

        {/* Harvest Button */}
        <Button
          variant="warning"
          fullWidth
          onClick={handleHarvest}
          isLoading={isSubmitting}
          disabled={isTransactionPending || !pendingRewards || pendingRewards === 0n}
        >
          🎁 Harvest Rewards
        </Button>
      </div>

      {isSuccess && (
        <div className="mt-4 p-3 bg-green-900/50 text-green-400 rounded-lg text-center">
          ✓ Transaction Confirmed
        </div>
      )}

      {(isConfirming || isSubmitting) && (
        <div className="mt-4 p-3 bg-yellow-900/50 text-yellow-400 rounded-lg text-center">
          ⏳ Waiting for confirmation...
        </div>
      )}
    </Card>
  );
};
