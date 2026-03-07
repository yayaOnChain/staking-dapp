import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";

/**
 * Navbar component with wallet connection and network switching
 */
export const Navbar = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // Check if user is on wrong network
  const isWrongNetwork = chain?.id !== sepolia.id;

  return (
    <nav className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">D</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">DeFi Mastery</h1>
          <p className="text-xs text-gray-400">AMM • LP • Farming</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Network Warning */}
        {isWrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: sepolia.id })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
          >
            Switch to Sepolia
          </button>
        )}

        {/* Wallet Connect Button */}
        <ConnectButton showBalance={false} chainStatus="full" />
      </div>
    </nav>
  );
};
