/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

const mockUseNetworkConfig = vi.fn();

vi.mock('@/hooks', () => ({
  useNetworkConfig: () => mockUseNetworkConfig(),
}));

vi.mock('@/providers/AppProviders', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-providers">{children}</div>
  ),
}));

vi.mock('@/components/ui', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('@/components/layout/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/features/SwapInterface', () => ({
  SwapInterface: (props: { poolAddress: string; token0Address: string; token1Address: string }) => (
    <div data-testid="swap-interface">{JSON.stringify(props)}</div>
  ),
}));

vi.mock('@/components/features/LiquidityProvider', () => ({
  LiquidityProvider: (props: { poolAddress: string; token0Address: string; token1Address: string }) => (
    <div data-testid="liquidity-provider">{JSON.stringify(props)}</div>
  ),
}));

vi.mock('@/components/features/YieldFarmDashboard', () => ({
  YieldFarmDashboard: (props: { farmAddress: string; lpTokenAddress: string; rewardTokenAddress: string }) => (
    <div data-testid="yield-farm-dashboard">{JSON.stringify(props)}</div>
  ),
}));

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App', () => {
  beforeEach(() => {
    mockUseNetworkConfig.mockReturnValue({
      network: 'sepolia',
      chainId: 11155111,
      contracts: {
        POOL: '0xPool',
        FARM: '0xFarm',
        TOKEN_A: '0xTokenA',
        TOKEN_B: '0xTokenB',
        REWARD_TOKEN: '0xRewardToken',
      },
    });
  });

  it('should render the app shell with providers and default swap tab', () => {
    render(<App />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('app-providers')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
    expect(screen.getByTestId('swap-interface')).toHaveTextContent('"poolAddress":"0xPool"');
  });

  it('should switch between dashboard tabs and pass the correct contract props', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /liquidity/i }));
    expect(screen.getByTestId('liquidity-provider')).toHaveTextContent('"token0Address":"0xTokenA"');
    expect(screen.queryByTestId('swap-interface')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /farm/i }));
    expect(screen.getByTestId('yield-farm-dashboard')).toHaveTextContent('"farmAddress":"0xFarm"');
    expect(screen.getByTestId('yield-farm-dashboard')).toHaveTextContent('"rewardTokenAddress":"0xRewardToken"');
    expect(screen.queryByTestId('liquidity-provider')).not.toBeInTheDocument();
  });
});
