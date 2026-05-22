/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiquidityProvider } from "@/components/features/LiquidityProvider";
import { mockAddresses } from "@/tests/test-utils";

vi.mock('../../../hooks/useLiquidity', () => ({
  useLiquidity: vi.fn(() => ({
    mode: 'add',
    setMode: vi.fn(),
    amount0: '',
    setAmount0: vi.fn(),
    amount1: '',
    setAmount1: vi.fn(),
    expectedLP: '0',
    reserve0: BigInt(1000 * 1e18),
    reserve1: BigInt(1000 * 1e18),
    totalSupply: BigInt(100 * 1e18),
    token0Balance: BigInt(100 * 1e18),
    token1Balance: BigInt(100 * 1e18),
    lpBalance: BigInt(100 * 1e18),
    isApproved: false,
    isApproving: false,
    isConfirming: false,
    isSubmitting: false,
    isSuccess: false,
    hash: undefined,
    addLiquidity: vi.fn(),
    removeLiquidity: vi.fn(),
    approve: vi.fn(),
    resetState: vi.fn(),
  })),
}));

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: mockAddresses.user,
    isConnected: true,
    chainId: 11155111,
  })),
}));

import { SettingsProvider } from "@/providers/SettingsProvider";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>{children}</SettingsProvider>
    </QueryClientProvider>
  );
};

describe('LiquidityProvider', () => {
  const defaultProps = {
    poolAddress: mockAddresses.pool,
    token0Address: mockAddresses.tokenA,
    token1Address: mockAddresses.tokenB,
  };

  it('should render liquidity provider interface with title', () => {
    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Liquidity Pool')).toBeInTheDocument();
  });

  it('should render mode toggle buttons', () => {
    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Add Liquidity')).toBeInTheDocument();
    expect(screen.getByText('Remove Liquidity')).toBeInTheDocument();
  });

  it('should render pool stats', () => {
    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Pool Reserve Token 0')).toBeInTheDocument();
  });

  it('should show approve button when not approved', () => {
    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('🔓 Approve Both Tokens')).toBeInTheDocument();
  });
});
