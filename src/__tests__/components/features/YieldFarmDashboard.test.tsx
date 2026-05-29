/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { YieldFarmDashboard } from "@/components/features/YieldFarmDashboard";
import { mockAddresses } from "@/tests/test-utils";

const mockUseYieldFarm = vi.fn();
const mockUseAccount = vi.fn();
const resetStateMock = vi.fn();
const toastSuccessMock = vi.fn();
const approveMock = vi.fn();
const depositMock = vi.fn();
const withdrawMock = vi.fn();
const harvestMock = vi.fn();
const setAmountMock = vi.fn();

vi.mock('../../../hooks/useYieldFarm', () => ({
  useYieldFarm: () => mockUseYieldFarm(),
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

const createYieldFarmState = () => ({
  amount: '',
  setAmount: setAmountMock,
  totalStaked: BigInt(500 * 1e18),
  lpBalance: BigInt(100 * 1e18),
  stakedAmount: '10',
  pendingRewards: BigInt(5 * 1e18),
  isApproved: false,
  isApproving: false,
  isConfirming: false,
  isSubmitting: false,
  isSuccess: false,
  hash: undefined,
  approve: approveMock,
  deposit: depositMock,
  withdraw: withdrawMock,
  harvest: harvestMock,
  resetState: resetStateMock,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('YieldFarmDashboard', () => {
  const defaultProps = {
    farmAddress: mockAddresses.farm,
    lpTokenAddress: mockAddresses.pool,
    rewardTokenAddress: mockAddresses.rewardToken,
  };

  beforeEach(() => {
    resetStateMock.mockReset();
    toastSuccessMock.mockReset();
    approveMock.mockReset();
    depositMock.mockReset();
    withdrawMock.mockReset();
    harvestMock.mockReset();
    setAmountMock.mockReset();
    mockUseAccount.mockReturnValue({
      address: mockAddresses.user,
      isConnected: true,
      chainId: 11155111,
    });
    mockUseYieldFarm.mockReturnValue(createYieldFarmState());
  });

  it('should render yield farm dashboard with title', () => {
    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Yield Farm')).toBeInTheDocument();
  });

  it('should render farm icon and subtitle', () => {
    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('🌾')).toBeInTheDocument();
    expect(screen.getByText('Stake LP • Earn Rewards')).toBeInTheDocument();
  });

  it('should display stats', () => {
    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Your LP Balance')).toBeInTheDocument();
    expect(screen.getByText('Your Staked')).toBeInTheDocument();
    expect(screen.getByText('Pending Rewards')).toBeInTheDocument();
  });

  it('should show approve button when not approved', () => {
    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Approve LP Tokens')).toBeInTheDocument();
  });

  it('should render connect wallet prompt when user is disconnected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      chainId: undefined,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Connect your wallet to start farming')).toBeInTheDocument();
  });

  it('should show stake and unstake actions when already approved', () => {
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      amount: '1',
      isApproved: true,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Stake')).toBeInTheDocument();
    expect(screen.getByText('Unstake')).toBeInTheDocument();
  });

  it('should show success and confirming states when transaction is in progress', () => {
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      isApproved: true,
      isSuccess: true,
      isConfirming: true,
      hash: '0xfarmhash',
      resetState: resetStateMock,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('✓ Transaction Confirmed')).toBeInTheDocument();
    expect(screen.getByText('⏳ Waiting for confirmation...')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-monitor')).toHaveTextContent('0xfarmhash');
    expect(toastSuccessMock).toHaveBeenCalledWith('Transaction confirmed!');
    expect(resetStateMock).toHaveBeenCalledTimes(1);
  });

  it('should call approve when approval button is clicked', async () => {
    const user = userEvent.setup();
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      amount: '1',
      approve: approveMock,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Approve LP Tokens'));
    expect(approveMock).toHaveBeenCalledTimes(1);
  });

  it('should call stake, unstake, and harvest actions when enabled buttons are clicked', async () => {
    const user = userEvent.setup();
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      amount: '1',
      isApproved: true,
      pendingRewards: BigInt(2e18),
      deposit: depositMock,
      withdraw: withdrawMock,
      harvest: harvestMock,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Stake'));
    await user.click(screen.getByText('Unstake'));
    await user.click(screen.getByText('🎁 Harvest Rewards'));

    expect(depositMock).toHaveBeenCalledTimes(1);
    expect(withdrawMock).toHaveBeenCalledTimes(1);
    expect(harvestMock).toHaveBeenCalledTimes(1);
  });

  it('should disable harvest when there are no pending rewards', () => {
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      isApproved: true,
      pendingRewards: 0n,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('🎁 Harvest Rewards')).toBeDisabled();
  });

  it('should call setAmount when user types in the input', async () => {
    const user = userEvent.setup();
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      isApproved: true,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    const input = screen.getByPlaceholderText('0.0');
    await user.type(input, '5');
    expect(setAmountMock).toHaveBeenCalled();
  });

  it('should handle undefined lpBalance gracefully', () => {
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      lpBalance: undefined,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Yield Farm')).toBeInTheDocument();
  });

  it('should handle undefined totalStaked gracefully', () => {
    mockUseYieldFarm.mockReturnValue({
      ...createYieldFarmState(),
      totalStaked: undefined,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Yield Farm')).toBeInTheDocument();
  });
});
