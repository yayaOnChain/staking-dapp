/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SwapInterface } from "@/components/features/SwapInterface";
import { mockAddresses } from "@/tests/test-utils";

vi.mock('../../../hooks/useSwap', () => ({
  useSwap: vi.fn(() => ({
    amountIn: '',
    setAmountIn: vi.fn(),
    tokenIn: 'token0',
    setTokenIn: vi.fn(),
    estimatedOutput: '0',
    balance: BigInt(100 * 1e18),
    hasLiquidity: true,
    isApproved: false,
    isApproving: false,
    isConfirming: false,
    isSubmitting: false,
    isSuccess: false,
    hash: undefined,
    approve: vi.fn(),
    swap: vi.fn(),
    resetState: vi.fn(),
  })),
}));

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: mockAddresses.user,
    isConnected: true,
    chainId: 11155111,
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    isLoading: false,
    isSuccess: false,
    isError: false,
    data: undefined,
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

describe('SwapInterface', () => {
  const defaultProps = {
    poolAddress: mockAddresses.pool,
    token0Address: mockAddresses.tokenA,
    token1Address: mockAddresses.tokenB,
  };

  it('should render swap interface with title', () => {
    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Swap Tokens')).toBeInTheDocument();
  });

  it('should render input placeholder', () => {
    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });
    // Check for any input element
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should render token select buttons', () => {
    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('TOKEN0')).toBeInTheDocument();
  });

  it('should show approve button when not approved', () => {
    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Approve Token')).toBeInTheDocument();
  });
});
