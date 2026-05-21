import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { Button } from "@/components/ui/Button";
import { TransactionHistoryModal } from "@/components/ui/TransactionHistoryModal";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isWrongNetwork = chain?.id !== sepolia.id && chain?.id !== mainnet.id;

  return (
    <nav className="w-full bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="flex justify-between items-center max-w-6xl mx-auto px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">SD</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-xl font-bold text-white truncate">Staking DApp</h1>
              <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">AMM • LP • Farming</p>
            </div>
          </div>

          <div className="flex-1" />

          <motion.div
            className="flex items-center gap-1.5 sm:gap-3 ml-2 sm:ml-4 min-h-[36px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            layout
          >
            <AnimatePresence mode="popLayout">
              {isConnected && isWrongNetwork && (
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

              {isConnected && (
                <motion.button
                  key="tx-history"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex items-center justify-center shadow-sm"
                  title="Recent Transactions"
                  layout
                >
                  📜
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div layout>
              <ConnectButton showBalance={false} chainStatus="icon" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </nav>
  );
};