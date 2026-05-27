/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SwapInterface } from "@/components/features/SwapInterface";
import { mockAddresses } from "@/tests/test-utils";

const mockUseSwap = vi.fn();
const mockUseAccount = vi.fn();
const mockToastSuccess = vi.fn();
const approveMock = vi.fn();
const swapMock = vi.fn();
const resetStateMock = vi.fn();
const setTokenInMock = vi.fn();
const setAmountInMock = vi.fn();

vi.mock('../../../hooks/useSwap', () => ({
  useSwap: () => mockUseSwap(),
}));

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useWaitForTransactionReceipt: vi.fn(() => ({
    isLoading: false,
    isSuccess: false,
    isError: false,
    data: undefined,
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

vi.mock('@/components/web3/TransactionToast', () => ({
  TransactionMonitor: ({ hash }: { hash: string }) => <div data-testid="transaction-monitor">{hash}</div>,
}));

import { SettingsProvider } from "@/providers/SettingsProvider";

const createSwapState = () => ({
  amountIn: '',
  setAmountIn: setAmountInMock,
  tokenIn: 'token0',
  setTokenIn: setTokenInMock,
  estimatedOutput: '0',
  balance: BigInt(100 * 1e18),
  hasLiquidity: true,
  isApproved: false,
  isApproving: false,
  isConfirming: false,
  isSubmitting: false,
  isSuccess: false,
  hash: undefined,
  approve: approveMock,
  swap: swapMock,
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

describe('SwapInterface', () => {
  const defaultProps = {
    poolAddress: mockAddresses.pool,
    token0Address: mockAddresses.tokenA,
    token1Address: mockAddresses.tokenB,
  };

  beforeEach(() => {
    approveMock.mockReset();
    swapMock.mockReset();
    resetStateMock.mockReset();
    setTokenInMock.mockReset();
    setAmountInMock.mockReset();
    mockToastSuccess.mockReset();
    mockUseAccount.mockReturnValue({
      address: mockAddresses.user,
      isConnected: true,
      chainId: 11155111,
    });
    mockUseSwap.mockReturnValue(createSwapState());
  });

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

  it('should render connect wallet prompt when user is disconnected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      chainId: undefined,
    });

    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Connect your wallet to start swapping')).toBeInTheDocument();
  });

  it('should toggle input token when token select is clicked', async () => {
    const user = userEvent.setup();
    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: 'TOKEN0' }));
    expect(setTokenInMock).toHaveBeenCalledWith('token1');
  });

  it('should show swap action and success state when already approved', () => {
    mockUseSwap.mockReturnValue({
      ...createSwapState(),
      amountIn: '1',
      estimatedOutput: '0.8',
      isApproved: true,
      isSuccess: true,
      hash: '0xhash',
      approve: approveMock,
      swap: swapMock,
      resetState: resetStateMock,
    });

    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('Swap')).toBeInTheDocument();
    expect(screen.getByText('Minimum Received')).toBeInTheDocument();
    expect(screen.getByText('✓ Transaction Confirmed')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-monitor')).toHaveTextContent('0xhash');
    expect(mockToastSuccess).toHaveBeenCalledWith('Swap completed successfully!');
    expect(resetStateMock).toHaveBeenCalledTimes(1);
  });

  it('should call approve when approve button is clicked', async () => {
    const user = userEvent.setup();
    mockUseSwap.mockReturnValue({
      ...createSwapState(),
      amountIn: '1',
      approve: approveMock,
    });

    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Approve Token'));
    expect(approveMock).toHaveBeenCalledTimes(1);
  });

  it('should call swap when approved action button is clicked', async () => {
    const user = userEvent.setup();
    mockUseSwap.mockReturnValue({
      ...createSwapState(),
      amountIn: '1',
      estimatedOutput: '0.8',
      isApproved: true,
      swap: swapMock,
    });

    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Swap'));
    expect(swapMock).toHaveBeenCalledTimes(1);
  });

  it('should render insufficient liquidity state when pool has no liquidity', () => {
    mockUseSwap.mockReturnValue({
      ...createSwapState(),
      hasLiquidity: false,
    });

    render(<SwapInterface {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Insufficient Liquidity')).toBeInTheDocument();
  });
});
