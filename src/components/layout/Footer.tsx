import { Card } from "@/components/ui";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG, DEFAULT_NETWORK } from "@/config/constants";

interface SocialLink {
  label: string;
  href: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/yayaOnChain/staking-dapp" },
  { label: "Documentation", href: "https://github.com/yayaOnChain/staking-dapp/blob/main/README.md" },
  { label: "Twitter", href: "https://x.com/yayaOnChain" },
];

/**
 * Truncate address for display (e.g., 0x1234...5678)
 */
const truncateAddress = (address: string): string => {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "Not deployed";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Footer component with links and contract addresses
 */
export const Footer = () => {
  const contracts = CONTRACT_ADDRESSES[DEFAULT_NETWORK];
  const networkName = NETWORK_CONFIG[DEFAULT_NETWORK].name;

  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
      <div className="max-w-6xl mx-auto p-6">
        {/* Contract Addresses (For Reference) */}
        <Card padding="md" className="mb-6 bg-gray-800/50">
          <p className="text-xs text-gray-400 mb-3">
            Deployed Contracts ({networkName})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">AMM Pool</span>
              <span className={contracts.POOL.startsWith("0x0000") ? "text-red-400" : "text-gray-300"}>
                {truncateAddress(contracts.POOL)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">LP Token</span>
              <span className={contracts.TOKEN_A.startsWith("0x0000") ? "text-red-400" : "text-gray-300"}>
                {truncateAddress(contracts.TOKEN_A)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Yield Farm</span>
              <span className={contracts.FARM.startsWith("0x0000") ? "text-red-400" : "text-gray-300"}>
                {truncateAddress(contracts.FARM)}
              </span>
            </div>
          </div>
        </Card>

        {/* Links & Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Staking DApp. Built with ❤️ on Ethereum.</p>
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
