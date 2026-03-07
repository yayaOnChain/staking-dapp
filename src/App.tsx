import { useState } from "react";
import { AppProviders } from "./providers/AppProviders";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SwapInterface } from "./components/features/SwapInterface";
import { LiquidityProvider } from "./components/features/LiquidityProvider";
import { YieldFarmDashboard } from "./components/features/YieldFarmDashboard";
import { Toaster } from "sonner";

// Contract addresses (Update with your deployed addresses)
const CONTRACTS = {
  sepolia: {
    AMM: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    LP_TOKEN: "0x2345678901234567890123456789012345678901" as `0x${string}`,
    FARM: "0x3456789012345678901234567890123456789012" as `0x${string}`,
    TOKEN_A: "0x4567890123456789012345678901234567890123" as `0x${string}`,
    TOKEN_B: "0x5678901234567890123456789012345678901234" as `0x${string}`,
    REWARD_TOKEN: "0x6789012345678901234567890123456789012345" as `0x${string}`,
  },
};

type Tab = "swap" | "pool" | "farm";

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>("swap");
  const contracts = CONTRACTS.sepolia;

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
            ammAddress={contracts.AMM}
            token0Address={contracts.TOKEN_A}
            token1Address={contracts.TOKEN_B}
          />
        )}
        {activeTab === "pool" && (
          <LiquidityProvider
            lpAddress={contracts.LP_TOKEN}
            token0Address={contracts.TOKEN_A}
            token1Address={contracts.TOKEN_B}
          />
        )}
        {activeTab === "farm" && (
          <YieldFarmDashboard
            farmAddress={contracts.FARM}
            lpTokenAddress={contracts.LP_TOKEN}
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
