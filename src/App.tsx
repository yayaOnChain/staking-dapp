import { useState } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { AppProviders } from "@/providers/AppProviders";
import { ErrorBoundary } from "@/components/ui";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SwapInterface } from "@/components/features/SwapInterface";
import { LiquidityProvider } from "@/components/features/LiquidityProvider";
import { YieldFarmDashboard } from "@/components/features/YieldFarmDashboard";
import { useNetworkConfig } from "@/hooks";

type Tab = "swap" | "pool" | "farm";

interface TabConfig {
  id: Tab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: "swap", label: "Swap", icon: "🔄" },
  { id: "pool", label: "Liquidity", icon: "💧" },
  { id: "farm", label: "Farm", icon: "🌾" },
];

// Reusable animation variants for page transitions
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

/**
 * Main dashboard content with tab navigation
 */
const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>("swap");
  const { contracts } = useNetworkConfig();

  const renderContent = () => {
    switch (activeTab) {
      case "swap":
        return (
          <motion.div 
            key="swap"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SwapInterface
              poolAddress={contracts.POOL}
              token0Address={contracts.TOKEN_A}
              token1Address={contracts.TOKEN_B}
            />
          </motion.div>
        );
      case "pool":
        return (
          <motion.div 
            key="pool"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LiquidityProvider
              poolAddress={contracts.POOL}
              token0Address={contracts.TOKEN_A}
              token1Address={contracts.TOKEN_B}
            />
          </motion.div>
        );
      case "farm":
        return (
          <motion.div 
            key="farm"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <YieldFarmDashboard
              farmAddress={contracts.FARM}
              lpTokenAddress={contracts.POOL}
              rewardTokenAddress={contracts.REWARD_TOKEN}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />

      {/* Tab Navigation */}
      <div className="flex justify-center mt-8 mb-6 max-w-6xl mx-auto w-full px-4">
        <div className="bg-gray-800 p-1 rounded-xl inline-flex shadow-lg relative">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-lg capitalize font-medium transition-colors z-10 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg -z-10 shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="mr-2 relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <main className="flex-1 max-w-6xl mx-auto p-4 w-full">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
};

/**
 * Main App component wrapped with providers and error boundary
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <DashboardContent />
      </AppProviders>
    </ErrorBoundary>
  );
}
