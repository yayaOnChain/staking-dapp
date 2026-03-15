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
- 0.3% swap fee integrated into pricing
- Transaction status tracking with toast notifications
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

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19.2, TypeScript |
| **Build Tool** | Vite 7.3 |
| **Styling** | Tailwind CSS 4.2 |
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
│   └── web3/               # Web3-specific components
├── config/                 # Network & contract configuration
├── hooks/                  # Custom React hooks
│   ├── useSwap.ts          # Swap logic
│   ├── useLiquidity.ts     # Liquidity management
│   ├── useYieldFarm.ts     # Staking/harvesting
│   └── useApproval.ts      # Token approval
├── providers/              # App providers (Web3, Query)
├── tests/                  # Test utilities and mocks
├── types/                  # TypeScript type definitions
└── lib/                    # Utility functions
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
# Sepolia RPC
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org

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

This project has a comprehensive test suite with **235 tests** covering all features.

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
| Config | 2 | 30 | ✅ |
| Utils | 1 | 12 | ✅ |
| Hooks | 4 | 46 | ✅ |
| UI Components | 5 | 96 | ✅ |
| Feature Components | 3 | 17 | ✅ |
| **Total** | **16** | **235** | ✅ |

---

## 📱 Usage Guide

### 1. Connect Wallet
Click "Connect Wallet" in the top-right corner and select your Web3 wallet.

### 2. Swap Tokens
1. Navigate to the **Swap** tab
2. Enter the amount you want to swap
3. Click **Approve** to allow token spending (first time only)
4. Click **Swap** and confirm in your wallet

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

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |

---

## 🌐 Network Support

| Network | Chain ID | Status |
|---------|----------|--------|
| Sepolia | 11155111 | ✅ Active |
| Ethereum Mainnet | 1 | 🔜 Coming Soon |

---

## 📄 Smart Contracts

The DApp interacts with the following smart contracts:

| Contract | Purpose |
|----------|---------|
| **Liquidity Pool** | Token swaps and liquidity management |
| **Yield Farm** | Staking LP tokens and reward distribution |
| **ERC20 Tokens** | Standard token operations (approve, transfer) |

---

## 🎨 UI Components

### Built-in Components
- **Button** - Multiple variants (primary, secondary, outline) with loading states
- **Card** - Responsive card layouts with padding variants
- **Input** - Numeric input with validation and error states
- **StatBox** - Display statistics with different visual styles
- **TokenSelect** - Token selection dropdown with balance display

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
