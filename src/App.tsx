import { useState } from "react";
import { Toaster } from "sonner";
import { AppProviders } from "@/providers/AppProviders";
import { ErrorBoundary } from "@/components/ui";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SwapInterface } from "@/components/features/SwapInterface";
import { LiquidityProvider } from "@/components/features/LiquidityProvider";
import { YieldFarmDashboard } from "@/components/features/YieldFarmDashboard";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

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

const contracts = CONTRACT_ADDRESSES.sepolia;

/**
 * Main dashboard content with tab navigation
 */
const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>("swap");

  const renderContent = () => {
    switch (activeTab) {
      case "swap":
        return (
          <SwapInterface
            poolAddress={contracts.POOL}
            token0Address={contracts.TOKEN_A}
            token1Address={contracts.TOKEN_B}
          />
        );
      case "pool":
        return (
          <LiquidityProvider
            poolAddress={contracts.POOL}
            token0Address={contracts.TOKEN_A}
            token1Address={contracts.TOKEN_B}
          />
        );
      case "farm":
        return (
          <YieldFarmDashboard
            farmAddress={contracts.FARM}
            lpTokenAddress={contracts.POOL}
            rewardTokenAddress={contracts.REWARD_TOKEN}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />

      {/* Tab Navigation */}
      <div className="flex justify-center mt-8 mb-6 px-4">
        <div className="bg-gray-800 p-1 rounded-xl inline-flex shadow-lg">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg capitalize font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <main className="flex-1 max-w-6xl mx-auto p-4 w-full">
        {renderContent()}
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
