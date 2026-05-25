# Test Suite Documentation

## Overview

This project has a comprehensive frontend test suite with **28 Vitest files** and **295 tests** covering unit tests, integration tests, hooks, providers, and component behavior for the Staking DApp application.

**Current Status:** ✅ All 295 frontend tests passing

## Test Structure

```
src/__tests__/
├── App.test.tsx                  # App shell and tab navigation
├── abis/
│   └── index.test.ts              # ABI structure validation (34 tests)
├── components/
│   ├── features/
│   │   ├── LiquidityProvider.test.tsx   # Liquidity feature states and flows
│   │   ├── SwapInterface.test.tsx       # Swap feature states and flows
│   │   └── YieldFarmDashboard.test.tsx  # Yield farm feature states and flows
│   ├── layout/
│   │   ├── Footer.test.tsx              # Footer content and contract references
│   │   └── Navbar.test.tsx              # Navbar wallet/network states
│   ├── ui/
│   │   ├── Button.test.tsx              # Button component
│   │   ├── Card.test.tsx                # Card components
│   │   ├── ErrorBoundary.test.tsx       # Error fallback handling
│   │   ├── Input.test.tsx               # Input component
│   │   ├── SettingsModal.test.tsx       # Slippage settings modal
│   │   ├── StatBox.test.tsx             # StatBox component
│   │   ├── TokenSelect.test.tsx         # Token selector button
│   │   └── TransactionHistoryModal.test.tsx # Transaction drawer behavior
│   └── web3/
│       └── TransactionToast.test.tsx    # Transaction receipt feedback
├── config/
│   ├── constants.test.ts          # Network & contract config (24 tests)
│   └── contracts.test.ts          # Contract exports (6 tests)
│   └── wagmi.test.ts              # Wagmi config wiring
├── lib/
│   └── utils.test.ts              # Utility functions (12 tests)
├── hooks/
│   ├── useApproval.test.tsx       # Token approval hook (7 tests)
│   ├── useNetworkConfig.test.tsx  # Network resolution hook
│   ├── useSettings.test.tsx       # Slippage settings hook
│   ├── useSwap.test.tsx           # Swap functionality hook (9 tests)
│   ├── useTransactions.test.tsx   # Transaction state hook/provider integration
│   ├── useLiquidity.test.tsx      # Liquidity management hook (11 tests)
│   └── useYieldFarm.test.tsx      # Yield farming hook (9 tests)
└── providers/
    └── AppProviders.test.tsx      # Root provider composition
```

## Test Summary

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| **ABIs** | 1 | 34 | ABI structure validation |
| **Config** | 3 | 31 | Network, contracts, and Wagmi configuration |
| **Lib/Utils** | 1 | 12 | Utility functions |
| **Hooks** | 7 | 56 | Custom React hooks and transaction state |
| **UI Components** | 8 | 125 | Reusable UI components and modal/error states |
| **Layout/Web3** | 3 | 12 | Navbar, footer, and transaction notifications |
| **Feature Components** | 3 | 22 | Feature interfaces and UI states |
| **Providers/App** | 2 | 4 | App shell and provider composition |
| **TOTAL** | **28** | **295** | ✅ All passing |

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

- **wagmi** - All hooks mocked to return predictable values
- **viem** - `parseEther`, `formatEther` mocked
- **@rainbow-me/rainbowkit** - ConnectButton mocked
- **sonner** - Toast notifications mocked
- **@tanstack/react-query** - QueryClient mocked

### Custom Mocks

Located in `src/tests/setup-tests.tsx` and `test-providers.tsx`:
- Wallet connection state
- Contract read/write operations
- Transaction receipts
- Toast notifications
- **GLOBAL STATE**: Mocked `SettingsProvider` and `TransactionProvider` wrap all React testing environments to prevent isolated hook Context failures.

## Test Utilities

Located in `src/tests/test-utils.tsx`:

### Render Helpers
```typescript
import { renderWithProviders, TestProviders } from '../../tests/test-utils';

// Render with QueryClientProvider
renderWithProviders(<MyComponent />);
```

### Mock Data
```typescript
import { mockAddresses } from '../../tests/test-utils';

// Use predefined test addresses
const { pool, farm, tokenA, tokenB } = mockAddresses;
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
- ✅ All button variants and states (27 tests)
- ✅ Card layouts and padding (14 tests)
- ✅ Input validation and errors (23 tests)
- ✅ Stat box variants (14 tests)
- ✅ Token selection buttons (28 tests)

## Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup-tests.tsx'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
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
