/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { YieldFarmDashboard } from '../../../components/features/YieldFarmDashboard';
import { mockAddresses } from '../../../tests/test-utils';

vi.mock('../../../hooks/useYieldFarm', () => ({
  useYieldFarm: vi.fn(() => ({
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
});
