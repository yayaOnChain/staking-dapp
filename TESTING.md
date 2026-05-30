# Test Suite Documentation

## Overview

This project has a comprehensive frontend test suite with **29 Vitest files** and **451 tests** covering unit tests, integration tests, hooks, providers, and component behavior for the Staking DApp application. An additional **2 contract test files** (53 tests) exist under `src/__tests__/contracts/` but are excluded from the Vitest run.

**Current Status:** ✅ All 451 tests passing

## Test Structure

```
src/__tests__/ (29 test files run — 2 contract files excluded via vitest config)
├── App.test.tsx                  # App shell and tab navigation (2 tests)
├── abis/
│   └── index.test.ts              # ABI structure validation (34 tests)
├── components/
│   ├── features/
│   │   ├── LiquidityProvider.test.tsx   # Liquidity feature states and flows (34 tests)
│   │   ├── SwapInterface.test.tsx       # Swap feature states and flows (20 tests)
│   │   └── YieldFarmDashboard.test.tsx  # Yield farm feature states and flows (13 tests)
│   ├── layout/
│   │   ├── Footer.test.tsx              # Footer content and contract references (4 tests)
│   │   └── Navbar.test.tsx              # Navbar wallet/network states (4 tests)
│   ├── ui/
│   │   ├── Button.test.tsx              # Button component (23 tests)
│   │   ├── Card.test.tsx                # Card components (18 tests)
│   │   ├── ErrorBoundary.test.tsx       # Error fallback handling (5 tests)
│   │   ├── Input.test.tsx               # Input component (23 tests)
│   │   ├── SettingsModal.test.tsx       # Slippage settings modal (12 tests)
│   │   ├── StatBox.test.tsx             # StatBox component (26 tests)
│   │   ├── TokenSelect.test.tsx         # Token selector button (27 tests)
│   │   └── TransactionHistoryModal.test.tsx # Transaction drawer behavior (10 tests)
│   └── web3/
│       └── TransactionToast.test.tsx    # Transaction receipt feedback (4 tests)
├── config/
│   ├── constants.test.ts          # Network & contract config (40 tests)
│   ├── contracts.test.ts          # Contract exports (6 tests)
│   └── wagmi.test.ts              # Wagmi config wiring (2 tests)
├── contracts/ (excluded from vitest run)
│   ├── LiquidityPool.test.ts      # Liquidity pool contract tests (25 tests)
│   └── YieldFarm.test.ts          # Yield farm contract tests (28 tests)
├── lib/
│   └── utils.test.ts              # Utility functions (12 tests)
├── hooks/
│   ├── useApproval.test.tsx       # Token approval hook (13 tests)
│   ├── useLiquidity.test.tsx      # Liquidity management hook (37 tests)
│   ├── useNetworkConfig.test.tsx  # Network resolution hook (5 tests)
│   ├── useSettings.test.tsx       # Slippage settings hook (8 tests)
│   ├── useSwap.test.tsx           # Swap functionality hook (23 tests)
│   ├── useTransactions.test.tsx   # Transaction state hook/provider integration (12 tests)
│   └── useYieldFarm.test.tsx      # Yield farming hook (27 tests)
└── providers/
    ├── AppProviders.test.tsx      # Root provider composition (6 tests)
    └── TransactionProvider.test.tsx # Transaction provider standalone (1 test)
```

## Test Summary

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| **ABIs** | 1 | 34 | ABI structure validation |
| **Config** | 3 | 48 | Network, contracts, and Wagmi configuration |
| **Lib/Utils** | 1 | 12 | Utility functions |
| **Hooks** | 7 | 125 | Custom React hooks and transaction state |
| **UI Components** | 8 | 144 | Reusable UI components and modal/error states |
| **Layout/Web3** | 3 | 12 | Navbar, footer, and transaction notifications |
| **Feature Components** | 3 | 67 | Feature interfaces and UI states |
| **Providers/App** | 3 | 9 | App shell and provider composition |
| **Contracts** (excluded) | 2 | 53 | Contract integration tests |
| **TOTAL** (vitest) | **29** | **451** | ✅ All passing |

## Running Tests

### Run all tests in watch mode
```bash
npm run test
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm run test -- src/__tests__/hooks/useSwap.test.tsx
```

### Run tests matching pattern
```bash
npm run test -- -t "approve"
```

## Test Coverage

After running `npm run test:coverage`, open the coverage report:

```bash
open coverage/index.html
```

### Coverage Thresholds

The project is configured with the following coverage thresholds in `vitest.config.ts`:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Test Categories

### Unit Tests

Test individual functions and hooks in isolation.

**Examples:**
- `utils.test.ts` - Tests for `cn()` utility function
- `useApproval.test.tsx` - Tests for token approval hook
- `useSwap.test.tsx` - Tests for swap functionality hook

### Component Tests

Test UI components for rendering, interactions, and styling.

**Examples:**
- `Button.test.tsx` - Button variants, sizes, states
- `Card.test.tsx` - Card layouts and sub-components
- `Input.test.tsx` - Input field with validation

### Integration Tests

Test feature components with mocked hooks.

**Examples:**
- `SwapInterface.test.tsx` - Full swap interface
- `LiquidityProvider.test.tsx` - Liquidity pool management
- `YieldFarmDashboard.test.tsx` - Yield farming dashboard

## Mocking Strategy

### External Dependencies

The following external dependencies are mocked in `src/tests/setup-tests.tsx`:

- **viem** - `parseEther`, `formatEther`, `parseUnits`, `formatUnits`, `zeroAddress`
- **wagmi** - `useAccount`, `useReadContract`, `useWriteContract`, `useWaitForTransactionReceipt`, `useBalance`, `useConnect`, `useDisconnect`, `useChainId`, `useBlockNumber`
- **@rainbow-me/rainbowkit** - `ConnectButton` rendered as `<button>Connect Wallet</button>`
- **sonner** - `Toaster` component and `toast.{success,error,loading,dismiss,promise}`
- **@tanstack/react-query** - `useQueryClient` with `invalidateQueries`, `setQueryData`, `getQueryData`, `refetchQueries`

### Custom Mocks

Located in `src/tests/setup-tests.tsx`:
- **AppProviders** - Renders `<div data-testid="app-providers">`
- **ErrorBoundary** - Renders `<div data-testid="error-boundary">`
- **Navbar** - Renders `<nav data-testid="navbar">`
- **Footer** - Renders `<footer data-testid="footer">`

### Test Provider Wrappers

Located in `src/tests/test-providers.tsx`:
- **TestProviders** - Wraps all tests in `QueryClientProvider` > `SettingsProvider` > `TransactionProvider` to prevent isolated hook Context failures.

## Test Utilities

Located in `src/tests/test-utils.tsx`:

### Render Helpers
```typescript
import { renderWithProviders, TestProviders } from '../../tests/test-utils';

// Render with full provider stack (QueryClient + Settings + Transaction)
renderWithProviders(<MyComponent />);
```

### Mock Addresses
```typescript
import { mockAddresses, createMockAddress } from '../../tests/test-utils';

// Use predefined test addresses
const { pool, farm, tokenA, tokenB, rewardToken, user, zero } = mockAddresses;

// Generate custom addresses
const customAddress = createMockAddress('0xCustom');
```

### Mock Data Factories
```typescript
import { createMockTokenData, createMockPoolData, createMockFarmData } from '../../tests/test-utils';

const tokenData = createMockTokenData({ symbol: 'ETH', balance: BigInt(10 * 1e18) });
const poolData = createMockPoolData({ reserve0: BigInt(500 * 1e18) });
const farmData = createMockFarmData({ totalStaked: BigInt(1000 * 1e18) });
```

### Event Helpers
```typescript
import { fireEvent, waitForAsync } from '../../tests/test-utils';

// Simulate input change
fireEvent.change(inputElement, '100');

// Simulate click
fireEvent.click(buttonElement);

// Wait for async operations
await waitForAsync(200);
```

### Mock Hook Return Helper
```typescript
import { createMockHookReturn } from '../../tests/test-utils';

interface MyHookReturn { value: string; count: number; }
const mockHook = createMockHookReturn<MyHookReturn>({ value: 'test', count: 0 });
mockHook.mockUpdate({ count: 5 }); // update specific fields
mockHook.mockReset(); // reset to initial values
```

### Console Mock Helper
```typescript
import { mockConsole } from '../../tests/test-utils';

mockConsole.setup();  // spy on console.error/warn/log
// ... run test code ...
expect(mockConsole.error).toHaveBeenCalledWith(expectedError);
mockConsole.clear();   // clear all calls
mockConsole.restore();  // restore original console
```

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Hook Test Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBeDefined();
  });
});
```

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render and interact', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByText('Click me'));
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

## Test Scenarios Covered

### Swap Feature
- ✅ Token approval flow
- ✅ Swap calculation
- ✅ Transaction confirmation states
- ✅ Balance display
- ✅ Token toggle functionality

### Liquidity Feature
- ✅ Add liquidity flow
- ✅ Remove liquidity flow
- ✅ Dual token approval
- ✅ LP token calculation
- ✅ Pool statistics display
- ✅ Mode switching (add/remove)

### Yield Farm Feature
- ✅ Stake deposits
- ✅ Unstake withdrawals
- ✅ Reward harvesting
- ✅ LP token approval
- ✅ Farm statistics display
- ✅ Transaction states

### UI Components
- ✅ All button variants and states (23 tests)
- ✅ Card layouts and padding (18 tests)
- ✅ Input validation and errors (23 tests)
- ✅ Stat box variants (26 tests)
- ✅ Token selection buttons (27 tests)
- ✅ Settings modal (12 tests)
- ✅ Error boundary fallback states (5 tests)
- ✅ Transaction history modal (10 tests)

## Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup-tests.tsx'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.git', '.vscode', 'src/__tests__/contracts/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/tests/**',
        'src/scripts/**',
        'src/**/*.d.ts',
        'src/types/index.ts',
        'src/hooks/index.ts',
        'src/components/ui/index.ts',
        'src/config/contracts.ts',
        'src/**/*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/__tests__/contracts/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Troubleshooting

### Common Issues

1. **"Invalid Chai property"**: Make sure to use `@testing-library/jest-dom` matchers
2. **Mock not working**: Ensure mocks are hoisted with `vi.mock()` at the top of the file
3. **JSX syntax error**: Use `.tsx` extension for test files with JSX
4. **await in describe**: Use `beforeEach` or make test `async`

### Debug Mode

Run tests with verbose output:
```bash
npm run test:run -- --reporter=verbose
```

### Run specific test file
```bash
npm run test -- src/__tests__/hooks/useApproval.test.tsx
```

## Test File Naming Convention

- Test files should be placed in `src/__tests__/` directory
- Test files should end with `.test.tsx` or `.test.ts`
- Test files should mirror the source directory structure

## Continuous Integration

Tests are automatically run in CI mode with:
```bash
npm run test:run
```

This ensures all tests pass before deployment.

## Best Practices

1. **Descriptive test names** - Use clear, descriptive test case names
2. **Arrange-Act-Assert** - Structure tests with clear sections
3. **Test edge cases** - Include tests for edge cases and error conditions
4. **Mock external dependencies** - Don't test external libraries
5. **Keep tests independent** - Each test should be able to run in isolation
6. **Use test utilities** - Reuse common setup code in test utilities

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://react.dev/learn/testing)
