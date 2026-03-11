import { useEffect } from "react";
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
  const { isSuccess, isError, error } = useWaitForTransactionReceipt(
    {
      hash,
    },
  );

  // Handle Success - use useEffect to avoid calling during render
  useEffect(() => {
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
  }, [isSuccess, hash, onSuccess]);

  // Handle Error - use useEffect to avoid calling during render
  useEffect(() => {
    if (isError) {
      toast.error("Transaction Failed", {
        description: error?.message || "Unknown error occurred",
      });
    }
  }, [isError, error]);

  return null; // This is a logic-only component
};
