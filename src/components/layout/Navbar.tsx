import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { Button } from "@/components/ui/Button";
import { TransactionHistoryModal } from "@/components/ui/TransactionHistoryModal";
import { motion, AnimatePresence } from "framer-motion";
/**
 * Navbar component with wallet connection and network switching
 */
export const Navbar = () => {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Check if user is on wrong network (neither sepolia nor mainnet)
  const isWrongNetwork = chain?.id !== sepolia.id && chain?.id !== mainnet.id;

  return (
    <nav className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">D</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Staking DApp</h1>
          <p className="text-xs text-gray-400">AMM • LP • Farming</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <motion.div 
        className="flex items-center justify-end gap-3 min-h-[40px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        layout
      >
        <AnimatePresence mode="popLayout">
          {/* Network Warning */}
          {isWrongNetwork && (
            <motion.div
              key="network-warning"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <Button
                variant="danger"
                size="sm"
                onClick={() => switchChain({ chainId: sepolia.id })}
              >
                Switch Network
              </Button>
            </motion.div>
          )}

          {/* Transaction History Toggle */}
          {isConnected && (
            <motion.button
              key="tx-history"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex items-center justify-center shadow-sm"
              title="Recent Transactions"
              layout
            >
              📜
            </motion.button>
          )}
        </AnimatePresence>

        {/* Wallet Connect Button */}
        <motion.div layout>
          <ConnectButton showBalance={false} chainStatus="full" />
        </motion.div>
      </motion.div>

      <TransactionHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </nav>
  );
};
