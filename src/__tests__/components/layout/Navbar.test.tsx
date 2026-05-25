/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/layout/Navbar';

const mockUseAccount = vi.fn();
const mockSwitchChain = vi.fn();

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
    useSwitchChain: () => ({ switchChain: mockSwitchChain }),
  };
});

vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

vi.mock('@/components/ui/TransactionHistoryModal', () => ({
  TransactionHistoryModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="transaction-history-modal">
        <button onClick={onClose}>Close History</button>
      </div>
    ) : null,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Navbar', () => {
  beforeEach(() => {
    mockSwitchChain.mockReset();
    mockUseAccount.mockReturnValue({
      isConnected: true,
      chain: { id: 11155111, name: 'Sepolia' },
    });
  });

  it('should render branding and wallet actions', () => {
    render(<Navbar />);

    expect(screen.getByText('Staking DApp')).toBeInTheDocument();
    expect(screen.getByText('AMM • LP • Farming')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
    expect(screen.getByTitle('Recent Transactions')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /switch network/i })).not.toBeInTheDocument();
  });

  it('should show switch network action on unsupported chain and call switchChain', async () => {
    const user = userEvent.setup();
    mockUseAccount.mockReturnValue({
      isConnected: true,
      chain: { id: 137, name: 'Polygon' },
    });

    render(<Navbar />);

    await user.click(screen.getByRole('button', { name: /switch network/i }));
    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 11155111 });
  });

  it('should hide connected-only actions when wallet is disconnected', () => {
    mockUseAccount.mockReturnValue({
      isConnected: false,
      chain: undefined,
    });

    render(<Navbar />);

    expect(screen.queryByTitle('Recent Transactions')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /switch network/i })).not.toBeInTheDocument();
  });

  it('should open and close the transaction history modal', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByTitle('Recent Transactions'));
    expect(screen.getByTestId('transaction-history-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close History' }));
    expect(screen.queryByTestId('transaction-history-modal')).not.toBeInTheDocument();
  });
});
