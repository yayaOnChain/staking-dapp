/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionHistoryModal } from '@/components/ui/TransactionHistoryModal';

const mockUseTransactions = vi.fn();
const mockUseNetworkConfig = vi.fn();

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => mockUseTransactions(),
}));

vi.mock('@/hooks', () => ({
  useNetworkConfig: () => mockUseNetworkConfig(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TransactionHistoryModal', () => {
  beforeEach(() => {
    mockUseNetworkConfig.mockReturnValue({ network: 'sepolia' });
    mockUseTransactions.mockReturnValue({
      transactions: [],
      clearHistory: vi.fn(),
      addTransaction: vi.fn(),
      updateTransactionStatus: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('should not render content when closed', () => {
    render(<TransactionHistoryModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText('Recent Transactions')).not.toBeInTheDocument();
  });

  it('should render empty state and lock body scroll when open', () => {
    render(<TransactionHistoryModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should render transactions with explorer link and allow clearing history', async () => {
    const user = userEvent.setup();
    const clearHistory = vi.fn();

    mockUseTransactions.mockReturnValue({
      transactions: [
        {
          hash: '0xabc123',
          type: 'Swap',
          description: 'Swap TOKEN0 to TOKEN1',
          status: 'success',
          timestamp: new Date('2026-05-25T10:00:00Z').getTime(),
        },
      ],
      clearHistory,
      addTransaction: vi.fn(),
      updateTransactionStatus: vi.fn(),
    });

    render(<TransactionHistoryModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Swap')).toBeInTheDocument();
    expect(screen.getByText('Swap TOKEN0 to TOKEN1')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view on explorer/i })).toHaveAttribute(
      'href',
      'https://sepolia.etherscan.io/tx/0xabc123'
    );

    await user.click(screen.getByRole('button', { name: /clear history/i }));
    expect(clearHistory).toHaveBeenCalledTimes(1);
  });

  it('should close when backdrop is clicked or escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TransactionHistoryModal isOpen onClose={onClose} />);

    const backdrop = document.body.querySelector('.absolute.inset-0.bg-black\\/60.backdrop-blur-sm');
    expect(backdrop).not.toBeNull();

    await user.click(backdrop as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
