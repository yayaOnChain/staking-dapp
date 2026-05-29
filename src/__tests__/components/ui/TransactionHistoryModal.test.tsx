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

  it('should not call onClose when Escape is pressed and modal is closed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TransactionHistoryModal isOpen={false} onClose={onClose} />);

    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should close when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TransactionHistoryModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /✕/ }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render failed transaction status', () => {
    mockUseTransactions.mockReturnValue({
      transactions: [
        {
          hash: '0xfail123',
          type: 'Swap',
          description: 'Failed swap',
          status: 'failed',
          timestamp: Date.now(),
        },
      ],
      clearHistory: vi.fn(),
      addTransaction: vi.fn(),
      updateTransactionStatus: vi.fn(),
    });

    render(<TransactionHistoryModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should render pending transaction status with pulse class', () => {
    mockUseTransactions.mockReturnValue({
      transactions: [
        {
          hash: '0xpend123',
          type: 'Swap',
          description: 'Pending swap',
          status: 'pending',
          timestamp: Date.now(),
        },
      ],
      clearHistory: vi.fn(),
      addTransaction: vi.fn(),
      updateTransactionStatus: vi.fn(),
    });

    render(<TransactionHistoryModal isOpen onClose={vi.fn()} />);

    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('animate-pulse');
  });

  it('should release body scroll when closing the modal', () => {
    const { rerender } = render(<TransactionHistoryModal isOpen onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<TransactionHistoryModal isOpen={false} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('should restore body scroll on cleanup', () => {
    const onClose = vi.fn();
    const { unmount } = render(<TransactionHistoryModal isOpen onClose={onClose} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });
});
