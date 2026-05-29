/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TransactionMonitor } from '@/components/web3/TransactionToast';

const mockUseWaitForTransactionReceipt = vi.fn();
const successToast = vi.fn();
const errorToast = vi.fn();
const openMock = vi.fn();

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual,
    useWaitForTransactionReceipt: (args: unknown) => {
      mockUseWaitForTransactionReceipt(args);
      return mockUseWaitForTransactionReceipt.mock.results.at(-1)?.value;
    },
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => successToast(...args),
    error: (...args: unknown[]) => errorToast(...args),
  },
}));

describe('TransactionMonitor', () => {
  beforeEach(() => {
    mockUseWaitForTransactionReceipt.mockReset();
    successToast.mockReset();
    errorToast.mockReset();
    openMock.mockReset();
    vi.stubGlobal('open', openMock);
  });

  it('should monitor the provided transaction hash and show success toast', () => {
    const onSuccess = vi.fn();
    const hash = '0xabcdef1234567890' as `0x${string}`;

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isSuccess: true,
      isError: false,
      error: null,
    });

    render(<TransactionMonitor hash={hash} onSuccess={onSuccess} />);

    expect(mockUseWaitForTransactionReceipt).toHaveBeenCalledWith({ hash });
    expect(successToast).toHaveBeenCalledTimes(1);
    expect(successToast).toHaveBeenCalledWith('Transaction Confirmed!', {
      description: 'Hash: 0xabcd...7890',
      action: expect.objectContaining({
        label: 'Explorer',
      }),
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);

    const successConfig = successToast.mock.calls[0]?.[1] as {
      action: { onClick: () => void };
    };
    successConfig.action.onClick();
    expect(openMock).toHaveBeenCalledWith(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
  });

  it('should show error toast when receipt monitoring fails', () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isSuccess: false,
      isError: true,
      error: new Error('Execution reverted'),
    });

    render(<TransactionMonitor hash={'0xdeadbeef' as `0x${string}`} />);

    expect(errorToast).toHaveBeenCalledWith('Transaction Failed', {
      description: 'Execution reverted',
    });
  });

  it('should fallback to unknown error message when error is null', () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isSuccess: false,
      isError: true,
      error: null,
    });

    render(<TransactionMonitor hash={'0xdeadbeef' as `0x${string}`} />);

    expect(errorToast).toHaveBeenCalledWith('Transaction Failed', {
      description: 'Unknown error occurred',
    });
  });

  it('should handle success without onSuccess callback', () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isSuccess: true,
      isError: false,
      error: null,
    });

    render(<TransactionMonitor hash={'0xdeadbeef' as `0x${string}`} />);

    expect(successToast).toHaveBeenCalledTimes(1);
    expect(errorToast).not.toHaveBeenCalled();
  });
});
