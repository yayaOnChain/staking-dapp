/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { YieldFarmDashboard } from "@/components/features/YieldFarmDashboard";
import { mockAddresses } from "@/tests/test-utils";

const mockUseYieldFarm = vi.fn();
const mockUseAccount = vi.fn();
const resetStateMock = vi.fn();
const toastSuccessMock = vi.fn();

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
    mockUseAccount.mockReturnValue({
      address: mockAddresses.user,
      isConnected: true,
      chainId: 11155111,
    });
    mockUseYieldFarm.mockReturnValue({
      amount: '',
      setAmount: vi.fn(),
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
      approve: vi.fn(),
      deposit: vi.fn(),
      withdraw: vi.fn(),
      harvest: vi.fn(),
      resetState: resetStateMock,
    });
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
      ...mockUseYieldFarm(),
      amount: '1',
      isApproved: true,
    });

    render(<YieldFarmDashboard {...defaultProps} />, { wrapper: createWrapper() });
    expect(screen.getByText('Stake')).toBeInTheDocument();
    expect(screen.getByText('Unstake')).toBeInTheDocument();
  });

  it('should show success and confirming states when transaction is in progress', () => {
    mockUseYieldFarm.mockReturnValue({
      ...mockUseYieldFarm(),
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
});
