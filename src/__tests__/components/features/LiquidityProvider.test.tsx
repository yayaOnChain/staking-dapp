/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiquidityProvider } from "@/components/features/LiquidityProvider";
import { mockAddresses } from "@/tests/test-utils";

const mockUseLiquidity = vi.fn();
const mockUseAccount = vi.fn();
const setModeMock = vi.fn();
const resetStateMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('../../../hooks/useLiquidity', () => ({
  useLiquidity: () => mockUseLiquidity(),
}));

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

vi.mock('@/components/web3/TransactionToast', () => ({
  TransactionMonitor: ({ hash }: { hash: string }) => <div data-testid="transaction-monitor">{hash}</div>,
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

  beforeEach(() => {
    setModeMock.mockReset();
    resetStateMock.mockReset();
    toastSuccessMock.mockReset();
    mockUseAccount.mockReturnValue({
      address: mockAddresses.user,
      isConnected: true,
      chainId: 11155111,
    });
    mockUseLiquidity.mockReturnValue({
      mode: 'add',
      setMode: setModeMock,
      amount0: '',
      setAmount0: vi.fn(),
      amount1: '',
      setAmount1: vi.fn(),
      expectedLP: '0',
      expectedRemove0: '0',
      expectedRemove1: '0',
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
      resetState: resetStateMock,
    });
  });

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

  it('should render connect wallet prompt when user is disconnected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      chainId: undefined,
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Connect your wallet to provide liquidity')).toBeInTheDocument();
  });

  it('should switch to remove mode when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Remove Liquidity'));
    expect(setModeMock).toHaveBeenCalledWith('remove');
  });

  it('should render remove liquidity state and confirmation message', () => {
    mockUseLiquidity.mockReturnValue({
      ...mockUseLiquidity(),
      mode: 'remove',
      amount0: '1',
      expectedRemove0: '0.4',
      expectedRemove1: '0.6',
      isApproved: true,
      isConfirming: true,
      hash: '0xliquidity',
      resetState: resetStateMock,
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('LP Tokens to Remove')).toBeInTheDocument();
    expect(screen.getByText('Expected Token 0')).toBeInTheDocument();
    expect(screen.getByText('Confirming...')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-monitor')).toHaveTextContent('0xliquidity');
  });

  it('should show success toast and reset state after successful add liquidity', () => {
    mockUseLiquidity.mockReturnValue({
      ...mockUseLiquidity(),
      isSuccess: true,
      mode: 'add',
      resetState: resetStateMock,
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    expect(toastSuccessMock).toHaveBeenCalledWith('Liquidity added!');
    expect(resetStateMock).toHaveBeenCalledTimes(1);
  });
});
