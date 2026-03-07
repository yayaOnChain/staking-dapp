import { useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner"; // Using sonner for modern toasts

interface TransactionToastProps {
  hash: `0x${string}` | undefined;
  onSuccess?: () => void;
}

/**
 * Component to monitor transaction status and show user feedback
 */
export const TransactionMonitor = ({
  hash,
  onSuccess,
}: TransactionToastProps) => {
  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt(
    {
      hash,
    },
  );

  // Monitor pending state
  if (isLoading) {
    // Toast is usually triggered when hash is first received in the component calling this
    // This component handles the state change
  }

  // Handle Success
  if (isSuccess && hash) {
    toast.success("Transaction Confirmed!", {
      description: `Hash: ${hash.slice(0, 6)}...${hash.slice(-4)}`,
      action: {
        label: "Explorer",
        onClick: () =>
          window.open(`https://sepolia.etherscan.io/tx/${hash}`, "_blank"),
      },
    });
    if (onSuccess) onSuccess();
  }

  // Handle Error
  if (isError) {
    toast.error("Transaction Failed", {
      description: error?.message || "Unknown error occurred",
    });
  }

  return null; // This is a logic-only component
};
