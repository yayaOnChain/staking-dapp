/**
 * Footer component with links and roadmap progress
 */
export const Footer = () => {
  const roadmapProgress = [
    { day: "Day 1", topic: "AMM Concept", status: "completed" },
    { day: "Day 2", topic: "Liquidity Pool", status: "completed" },
    { day: "Day 3", topic: "Staking Logic", status: "completed" },
    { day: "Day 4", topic: "Yield Farming", status: "completed" },
    { day: "Day 5", topic: "DApp Integration", status: "completed" },
    { day: "Day 6", topic: "Testing & Deploy", status: "pending" },
  ];

  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
      <div className="max-w-6xl mx-auto p-6">
        {/* Roadmap Progress */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Learning Roadmap Progress
          </h3>
          <div className="flex flex-wrap gap-2">
            {roadmapProgress.map((item) => (
              <span
                key={item.day}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === "completed"
                    ? "bg-green-900/50 text-green-400 border border-green-700"
                    : "bg-gray-800 text-gray-500 border border-gray-700"
                }`}
              >
                {item.day}: {item.topic}
              </span>
            ))}
          </div>
        </div>

        {/* Links & Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2024 DeFi Mastery DApp. Built for learning purposes.</p>
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
      </div>
    </footer>
  );
};
