import { useState } from "react";
import { AppProviders } from "./providers/AppProviders";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SwapInterface } from "./components/features/SwapInterface";
import { LiquidityProvider } from "./components/features/LiquidityProvider";
import { YieldFarmDashboard } from "./components/features/YieldFarmDashboard";
import { Toaster } from "sonner";
import { CONTRACT_ADDRESSES } from "./config/contracts";

type Tab = "swap" | "pool" | "farm";

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>("swap");
  const contracts = CONTRACT_ADDRESSES.sepolia;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />

      {/* Tab Navigation */}
      <div className="flex justify-center mt-8 mb-6 px-4">
        <div className="bg-gray-800 p-1 rounded-xl inline-flex">
          {(["swap", "pool", "farm"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg capitalize font-medium transition ${
                activeTab === tab
                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab === "swap" && "🔄 Swap"}
              {tab === "pool" && "💧 Liquidity"}
              {tab === "farm" && "🌾 Farm"}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <main className="flex-1 max-w-6xl mx-auto p-4 w-full">
        {activeTab === "swap" && (
          <SwapInterface
            poolAddress={contracts.POOL}
            token0Address={contracts.TOKEN_A}
            token1Address={contracts.TOKEN_B}
          />
        )}
        {activeTab === "pool" && (
          <LiquidityProvider
            poolAddress={contracts.POOL}
            token0Address={contracts.TOKEN_A}
            token1Address={contracts.TOKEN_B}
          />
        )}
        {activeTab === "farm" && (
          <YieldFarmDashboard
            farmAddress={contracts.FARM}
            lpTokenAddress={contracts.POOL}
            rewardTokenAddress={contracts.REWARD_TOKEN}
          />
        )}
      </main>

      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default function App() {
  return (
    <AppProviders>
      <DashboardContent />
    </AppProviders>
  );
}
