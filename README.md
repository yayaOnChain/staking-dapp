# 🌾 Staking DApp

A modern, feature-rich **Decentralized Finance (DeFi)** application built on Ethereum that enables users to swap tokens, provide liquidity, and earn rewards through yield farming.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff.svg)

---

## ✨ Features

### 🔄 Token Swap
- Swap between ERC20 tokens directly from the interface
- Real-time price calculation using constant product formula (x * y = k)
- ⚙️ **Customizable Slippage Tolerance** to protect against front-running
- 0.3% swap fee integrated into pricing
- 📜 **Activity Feed** tracking with persistent local storage
- Gas estimation and confirmation states

### 💧 Liquidity Provision
- Add liquidity to token pools and earn LP tokens
- Remove liquidity from existing pools
- Dual-token approval flow for security
- Real-time pool statistics and LP token calculations
- View your share of the liquidity pool

### 🌾 Yield Farming
- Stake LP tokens to earn reward tokens
- Harvest rewards without unstaking
- Flexible unstaking with no lock-up period
- Track staked amounts and pending rewards
- Real-time APY and farm statistics

### 🌐 Multi-Network & UI Polish
- **Dynamic Network Support:** Seamlessly switch between Ethereum Mainnet and Sepolia Testnet.
- **Premium Fluid UI:** Powered by Framer Motion, featuring layout transitions, interactive tab-indicators, and tactile button micro-interactions.
- **Path Aliasing:** Clean structural imports using `@/*`.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19.2, TypeScript |
| **Build Tool** | Vite 7.3 |
| **Styling** | Tailwind CSS 4.2 |
| **Animation**| Framer Motion 12 |
| **Web3** | wagmi 2.19, viem 2.46 |
| **Wallet** | Rainbow Kit 2.2 |
| **State** | TanStack Query 5.90 |
| **Notifications** | Sonner 2.0 |
| **Testing** | Vitest 4.1, Testing Library |

---

## 📦 Project Structure

```
src/
├── abis/                    # Smart contract ABIs
├── assets/                  # Static assets
├── components/
│   ├── features/           # Feature components (Swap, Liquidity, Farm)
│   ├── layout/             # Layout components (Navbar, Footer)
│   ├── ui/                 # Reusable UI components
│   └── web3/               # Web3-specific components (TransactionToast)
├── config/                 # Network & contract configuration
│   ├── constants.ts        # Network & contract constants
│   ├── contracts.ts        # Contract address exports
│   └── wagmi.ts            # Wagmi client configuration
├── contracts/              # Smart contract implementations
│   ├── LiquidityPool.sol   # AMM liquidity pool with swap functionality
│   ├── YieldFarm.sol       # Reward distribution farming contract
│   └── tokens/             # ERC20 token implementations
│       ├── TokenA.sol      # First ERC20 token
│       ├── TokenB.sol      # Second ERC20 token
│       └── RewardToken.sol # Reward token for farming
├── hooks/                  # Custom React hooks
│   ├── useApproval.ts      # Token approval
│   ├── useLiquidity.ts     # Liquidity management
│   ├── useNetworkConfig.ts # Network resolution
│   ├── useSettings.ts      # Slippage settings
│   ├── useSwap.ts          # Swap logic
│   ├── useTransactions.ts  # Transaction state management
│   └── useYieldFarm.ts     # Staking/harvesting
├── lib/
│   └── utils.ts            # Utility functions (cn, etc.)
├── providers/              # React context providers
│   ├── AppProviders.tsx     # Root provider composition
│   ├── SettingsProvider.tsx # Slippage settings state
│   └── TransactionProvider.tsx # Transaction state management
├── scripts/                # Deployment scripts
│   ├── deploy.ts           # Contract deployment
│   └── fund-farm.ts        # Farm funding script
├── tests/                  # Test utilities and mocks
└── types/
    └── index.ts            # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/staking-dapp.git
cd staking-dapp

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Required: WalletConnect Project ID (get from https://cloud.walletconnect.com)
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id

# RPC URLs (optional — fallbacks are built-in)
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
VITE_MAINNET_RPC_URL=https://rpc.ankr.com/eth

# Contract Addresses (Sepolia)
VITE_POOL_ADDRESS=0x...
VITE_FARM_ADDRESS=0x...
VITE_TOKEN_A_ADDRESS=0x...
VITE_TOKEN_B_ADDRESS=0x...
VITE_REWARD_TOKEN_ADDRESS=0x...
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Testing

This project has a comprehensive test suite with **451 frontend tests** (29 Vitest files) and **53 contract tests** (2 Hardhat files), covering all features.

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

| Category | Files | Tests | Status |
|----------|-------|-------|--------|
| ABIs | 1 | 34 | ✅ |
| Config | 3 | 48 | ✅ |
| Lib/Utils | 1 | 12 | ✅ |
| Hooks | 7 | 125 | ✅ |
| UI Components | 8 | 144 | ✅ |
| Layout/Web3 | 3 | 12 | ✅ |
| Feature Components | 3 | 67 | ✅ |
| Providers/App | 3 | 9 | ✅ |
| **Frontend Total** | **29** | **451** | ✅ |
| Contracts (excluded) | 2 | 53 | ⏭️ Hardhat |

---

## 📱 Usage Guide

### 1. Connect Wallet
Click "Connect Wallet" in the top-right corner and select your Web3 wallet.

### 2. Swap Tokens
1. Navigate to the **Swap** tab
2. *(Optional)* Click the ⚙️ icon to adjust your **Slippage Tolerance** (default: 0.5%)
   - Slippage tolerance protects against price swings during transaction confirmation
   - Lower values provide better price execution but may cause transactions to fail during volatile markets
   - Higher values increase transaction success rate but may result in worse prices
3. Enter the amount you want to swap
4. Click **Approve** to allow token spending (first time only)
5. Click **Swap** and confirm in your wallet

### 3. Provide Liquidity
1. Navigate to the **Liquidity** tab
2. Select **Add** or **Remove** mode
3. Enter the amount of tokens to provide
4. Approve both tokens (first time only)
5. Click **Supply** to add liquidity and receive LP tokens

### 4. Yield Farming
1. Navigate to the **Farm** tab
2. Enter the amount of LP tokens to stake
3. Click **Approve** to allow farm to use LP tokens
4. Click **Deposit** to start earning rewards
5. Click **Harvest** anytime to claim rewards

### 5. View Activity
1. Click the 📜 icon in the Navbar to open the **Transaction History**
2. View real-time pending, success, and failed statuses
3. Click "View on Explorer" to verify transactions on-chain

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run all tests (contract + frontend) |
| `npm run test:run` | Run frontend tests once (CI) |
| `npm run test:ui` | Run frontend tests with UI |
| `npm run test:coverage` | Run frontend tests with coverage |
| `npm run test:contract` | Run Hardhat contract tests |
| `npm run compile` | Compile Solidity contracts |
| `npm run clean` | Clean Hardhat artifacts |
| `npm run deploy:local` | Deploy contracts to local Hardhat |
| `npm run deploy:sepolia` | Deploy contracts to Sepolia |
| `npm run fund:local` | Fund farm on local network |
| `npm run fund:sepolia` | Fund farm on Sepolia |
| `npm run predeploy` | Build + lint + type-check before deploy |

---

## 🌐 Network Support

| Network | Chain ID | Status |
|---------|----------|--------|
| Hardhat Local | 31337 | ✅ Active (development) |
| Sepolia | 11155111 | ✅ Active (testnet) |
| Ethereum Mainnet | 1 | ✅ Active (*Dynamically connects via Wagmi*) |

---

## 📄 Smart Contracts

The DApp interacts with the following smart contracts:

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| **Liquidity Pool** | Token swaps and liquidity management | Constant product formula (x*y=k) with 0.3% fee, ERC20 LP tokens, add/remove liquidity, swap functionality |
| **Yield Farm** | Staking LP tokens and reward distribution | Per-block reward distribution, harvest without unstaking, proportional reward sharing, secure reward accounting |
| **ERC20 Tokens** | Standard token operations | ERC20 standard implementation with approve, transfer, and balance functions |

---

## 🎨 UI Components

### Built-in Components
- **Button** - Multiple variants (primary, secondary, outline) with loading states
- **Card** - Responsive card layouts with padding variants
- **ErrorBoundary** - Error fallback UI with retry
- **Input** - Numeric input with validation and error states
- **SettingsModal** - Slippage tolerance configuration modal
- **StatBox** - Display statistics with different visual styles
- **TokenSelect** - Token selection dropdown with balance display
- **TransactionHistoryModal** - Transaction history drawer with explorer links

### Design System
- Dark theme optimized for DeFi applications
- Gradient accents (blue to purple)
- Responsive layout for mobile and desktop
- Accessible color contrast

---

## 🔐 Security Considerations

- ✅ Token approval flow with explicit user confirmation
- ✅ Transaction receipt verification before state updates
- ✅ Gas limit validation
- ✅ Balance checks before transactions
- ✅ Error handling with user-friendly messages
- ✅ No private keys stored or transmitted

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Rainbow Kit](https://rainbowkit.com/) - Wallet connection
- [wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [viem](https://viem.sh/) - TypeScript Interface for Ethereum
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vitest](https://vitest.dev/) - Blazing fast test framework

---

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the [TESTING.md](TESTING.md) for test documentation
- Review the code comments in individual hook files

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Web3**

</div>
