import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTransactions } from "@/providers/TransactionProvider";
import { useNetworkConfig } from "@/hooks";
import { getExplorerTxUrl } from "@/config/constants";
import { Button } from "./Button";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionHistoryModal = ({ isOpen, onClose }: TransactionHistoryProps) => {
  const { transactions, clearHistory } = useTransactions();
  const { network } = useNetworkConfig();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <button 
                onClick={onClose}
                className="p-2 w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex items-center justify-center focus:outline-hidden cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {transactions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center py-10"
                >
                  <p className="text-gray-500">No recent transactions</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {transactions.map((tx) => (
                    <motion.div 
                      key={tx.hash}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 mb-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-white">{tx.type}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === "success" ? "bg-green-500/10 text-green-400" :
                          tx.status === "failed" ? "bg-red-500/10 text-red-400" :
                          "bg-yellow-500/10 text-yellow-400 animate-pulse"
                        }`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{tx.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <a 
                          href={getExplorerTxUrl(tx.hash, network)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                        >
                          View on Explorer ↗
                        </a>
                        <span className="text-gray-500">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {transactions.length > 0 && (
              <div className="p-6 border-t border-gray-800">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={clearHistory}
                >
                  Clear History
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
