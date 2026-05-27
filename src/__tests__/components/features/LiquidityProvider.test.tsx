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
const approveMock = vi.fn();
const addLiquidityMock = vi.fn();
const removeLiquidityMock = vi.fn();
const setAmount0Mock = vi.fn();
const setAmount1Mock = vi.fn();

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

const createLiquidityState = () => ({
  mode: 'add',
  setMode: setModeMock,
  amount0: '',
  setAmount0: setAmount0Mock,
  amount1: '',
  setAmount1: setAmount1Mock,
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
  addLiquidity: addLiquidityMock,
  removeLiquidity: removeLiquidityMock,
  approve: approveMock,
  resetState: resetStateMock,
});

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
    approveMock.mockReset();
    addLiquidityMock.mockReset();
    removeLiquidityMock.mockReset();
    setAmount0Mock.mockReset();
    setAmount1Mock.mockReset();
    mockUseAccount.mockReturnValue({
      address: mockAddresses.user,
      isConnected: true,
      chainId: 11155111,
    });
    mockUseLiquidity.mockReturnValue(createLiquidityState());
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
      ...createLiquidityState(),
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
      ...createLiquidityState(),
      isSuccess: true,
      mode: 'add',
      resetState: resetStateMock,
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    expect(toastSuccessMock).toHaveBeenCalledWith('Liquidity added!');
    expect(resetStateMock).toHaveBeenCalledTimes(1);
  });

  it('should call approve in add mode when approval button is clicked', async () => {
    const user = userEvent.setup();
    mockUseLiquidity.mockReturnValue({
      ...createLiquidityState(),
      amount0: '1',
      amount1: '2',
      approve: approveMock,
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('🔓 Approve Both Tokens'));
    expect(approveMock).toHaveBeenCalledTimes(1);
  });

  it('should call addLiquidity when approved add-mode action is clicked', async () => {
    const user = userEvent.setup();
    mockUseLiquidity.mockReturnValue({
      ...createLiquidityState(),
      amount0: '1',
      amount1: '2',
      isApproved: true,
      addLiquidity: addLiquidityMock,
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('💧 Add Liquidity'));
    expect(addLiquidityMock).toHaveBeenCalledTimes(1);
  });

  it('should call removeLiquidity in remove mode when action is clicked', async () => {
    const user = userEvent.setup();
    mockUseLiquidity.mockReturnValue({
      ...createLiquidityState(),
      mode: 'remove',
      amount0: '1',
      isApproved: true,
      removeLiquidity: removeLiquidityMock,
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('🔥 Remove Liquidity'));
    expect(removeLiquidityMock).toHaveBeenCalledTimes(1);
  });

  it('should render token approval indicators in add mode', () => {
    mockUseLiquidity.mockReturnValue({
      ...createLiquidityState(),
      token0Balance: 0n,
      token1Balance: BigInt(5e18),
    });

    render(<LiquidityProvider {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('○ Token 0')).toBeInTheDocument();
    expect(screen.getByText('✓ Token 1')).toBeInTheDocument();
  });
});
