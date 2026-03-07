/**
 * Footer component with links and roadmap progress
 */
export const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
      <div className="max-w-6xl mx-auto p-6">
        {/* Contract Addresses (For Reference) */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">
            Deployed Contracts (Sepolia Testnet)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono text-gray-500">
            <span>AMM: 0x1234...5678</span>
            <span>LP Token: 0xabcd...efgh</span>
            <span>Farm: 0x9876...5432</span>
          </div>
        </div>
        {/* Links & Info */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Staking DApp. Built with ❤️ on Ethereum.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition">
              Documentation
            </a>
            <a href="#" className="hover:text-white transition">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
