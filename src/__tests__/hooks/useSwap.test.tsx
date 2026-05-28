/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, type UseWaitForTransactionReceiptReturnType } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { mockAddresses } from "@/tests/test-utils";
import { useSwap } from "@/hooks/useSwap";
import { TransactionProvider } from "@/providers/TransactionProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { toast } from 'sonner';

const { mockUpdateTransactionStatus } = vi.hoisted(() => ({
  mockUpdateTransactionStatus: vi.fn(),
}));

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: vi.fn(() => ({
    addTransaction: vi.fn(),
    updateTransactionStatus: mockUpdateTransactionStatus,
    transactions: [],
    clearTransactions: vi.fn(),
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <TransactionProvider>{children}</TransactionProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

const RESERVE_AMOUNT = 1000000000000000000000n;

const baseQueryResult = {
  data: undefined,
  dataUpdatedAt: 0,
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isError: false,
  isFetched: false,
  isFetchedAfterMount: false,
  isFetching: false,
  isLoading: false,
  isPending: true,
  isLoadingError: false,
  isInitialLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
  isSuccess: false,
  isEnabled: true,
  refetch: vi.fn(),
  promise: Promise.resolve(undefined),
  status: 'pending' as const,
  fetchStatus: 'idle' as const,
  queryKey: [],
} as const;

const successQueryResult = {
  ...baseQueryResult,
  dataUpdatedAt: Date.now(),
  isFetched: true,
  isFetchedAfterMount: true,
  isPending: false,
  isSuccess: true,
  status: 'success' as const,
} as const;

const createReadReturn = (data: bigint | undefined) => ({
  ...successQueryResult,
  data,
} as const);

const createWriteContractReturn = (writeContractAsyncImpl = vi.fn().mockResolvedValue('0xTxHash')) => ({
  writeContract: vi.fn(),
  writeContractAsync: writeContractAsyncImpl,
  data: undefined,
  variables: undefined,
  error: null,
  isError: false,
  isIdle: true,
  isPending: false,
  isSuccess: false,
  status: 'idle' as const,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  submittedAt: 0,
  context: undefined,
  reset: vi.fn(),
} as const);

describe('useSwap', () => {
  const defaultProps = {
    poolAddress: mockAddresses.pool,
    token0Address: mockAddresses.tokenA,
    token1Address: mockAddresses.tokenB,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReadContract).mockReturnValue(baseQueryResult);
    vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn());
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue(baseQueryResult);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    vi.spyOn(qc, 'invalidateQueries').mockImplementation(((options: unknown) => {
      const opts = options as { predicate?: (q: { queryKey: unknown }) => boolean } | undefined;
      if (opts?.predicate) {
        opts.predicate({ queryKey: ['x', { address: mockAddresses.pool }] });
        opts.predicate({ queryKey: ['x', { address: mockAddresses.tokenA }] });
        opts.predicate({ queryKey: ['x', { address: mockAddresses.tokenB }] });
        opts.predicate({ queryKey: ['x', { notAddress: 1 }] });
        opts.predicate({ queryKey: ['x', 'string'] });
        opts.predicate({ queryKey: ['x', null] });
        opts.predicate({ queryKey: 'not-array' });
      }
      return Promise.resolve();
    }));
    vi.spyOn(qc, 'setQueryData').mockImplementation((() => undefined));
    vi.spyOn(qc, 'getQueryData').mockImplementation((() => undefined));
    vi.spyOn(qc, 'refetchQueries').mockImplementation((() => Promise.resolve()));
    vi.mocked(useQueryClient).mockReturnValue(qc);
  });

  describe('initialization', () => {
    it('should initialize with correct shape', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('amountIn');
      expect(result.current).toHaveProperty('setAmountIn');
      expect(result.current).toHaveProperty('tokenIn');
      expect(result.current).toHaveProperty('setTokenIn');
      expect(result.current).toHaveProperty('estimatedOutput');
      expect(result.current).toHaveProperty('hasLiquidity');
      expect(result.current).toHaveProperty('approve');
      expect(result.current).toHaveProperty('swap');
      expect(result.current).toHaveProperty('resetState');
    });

    it('should start with empty amountIn', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.amountIn).toBe('');
    });

    it('should start with token0 as default tokenIn', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.tokenIn).toBe('token0');
    });

    it('should have initial falsy values for all state properties', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.balance).toBeUndefined();
      expect(result.current.hasLiquidity).toBe(false);
      expect(result.current.isApproved).toBe(false);
      expect(result.current.isApproving).toBe(false);
      expect(result.current.isConfirming).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.hash).toBeUndefined();
    });
  });

  describe('state management', () => {
    it('should update amountIn when setAmountIn is called', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      expect(result.current.amountIn).toBe('100');
    });

    it('should toggle tokenIn when setTokenIn is called', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setTokenIn('token1');
      });

      expect(result.current.tokenIn).toBe('token1');
    });

    it('should reset amountIn when resetState is called', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.amountIn).toBe('');
    });

    it('should reset hash, isSubmitting and dismiss toast on resetState', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.hash).toBeUndefined();
      expect(result.current.isSubmitting).toBe(false);
      expect(toast.dismiss).toHaveBeenCalledWith('swap');
    });
  });

  describe('approve', () => {
    it('should have approve function', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.approve).toBe('function');
    });
  });

  describe('swap', () => {
    it('should have swap function', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.swap).toBe('function');
    });

    it('should not execute when amountIn is empty', async () => {
      const writeMock = createWriteContractReturn();
      vi.mocked(useWriteContract).mockReturnValue(writeMock);

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.swap();
      });

      expect(writeMock.writeContractAsync).not.toHaveBeenCalled();
    });

    it('should show error when pool has no liquidity', async () => {
      const writeMock = createWriteContractReturn();
      vi.mocked(useWriteContract).mockReturnValue(writeMock);

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      await act(async () => {
        await result.current.swap();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Pool has no liquidity! Add liquidity first.'
      );
      expect(writeMock.writeContractAsync).not.toHaveBeenCalled();
    });

    it('should execute swap and refetch data on success', async () => {
      const mockRefetch = vi.fn();
      const writeAsyncImpl = vi.fn().mockResolvedValue('0xTxHash');
      vi.mocked(useReadContract).mockReturnValue({
        ...createReadReturn(RESERVE_AMOUNT),
        refetch: mockRefetch,
      });
      vi.mocked(useWriteContract).mockReturnValue(
        createWriteContractReturn(writeAsyncImpl)
      );
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
        ...successQueryResult,
        isLoading: false,
      });

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      await act(async () => {
        await result.current.swap();
      });

      expect(toast.loading).toHaveBeenCalledWith('Swapping tokens...', { id: 'swap' });
      expect(writeAsyncImpl).toHaveBeenCalled();
      expect(result.current.hash).toBe('0xTxHash');
      expect(result.current.isSubmitting).toBe(false);

      expect(mockUpdateTransactionStatus).toHaveBeenCalledWith('0xTxHash', 'success');
      expect(mockRefetch).toHaveBeenCalledTimes(4);
    });

    it('should execute swap with token1 as tokenIn', async () => {
      const writeAsyncImpl = vi.fn().mockResolvedValue('0xTxHash2');

      vi.mocked(useReadContract).mockReturnValue(createReadReturn(RESERVE_AMOUNT));
      vi.mocked(useWriteContract).mockReturnValue(
        createWriteContractReturn(writeAsyncImpl)
      );
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
        ...successQueryResult,
        isLoading: false,
      });

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setTokenIn('token1');
        result.current.setAmountIn('50');
      });

      await act(async () => {
        await result.current.swap();
      });

      expect(writeAsyncImpl).toHaveBeenCalled();
      expect(result.current.hash).toBe('0xTxHash2');
    });

    it('should handle swap error with error message', async () => {
      const errorMessage = 'User rejected transaction';
      const writeAsyncImpl = vi.fn().mockRejectedValue(new Error(errorMessage));

      vi.mocked(useReadContract).mockReturnValue(createReadReturn(RESERVE_AMOUNT));
      vi.mocked(useWriteContract).mockReturnValue(
        createWriteContractReturn(writeAsyncImpl)
      );

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      await act(async () => {
        try {
          await result.current.swap();
        } catch {
          // expected
        }
      });

      expect(toast.dismiss).toHaveBeenCalledWith('swap');
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle swap error with gas limit message', async () => {
      const writeAsyncImpl = vi.fn().mockRejectedValue(new Error('gas limit exceeded'));

      vi.mocked(useReadContract).mockReturnValue(createReadReturn(RESERVE_AMOUNT));
      vi.mocked(useWriteContract).mockReturnValue(
        createWriteContractReturn(writeAsyncImpl)
      );

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      await act(async () => {
        try {
          await result.current.swap();
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith('Gas limit too high. Pool may have no liquidity.');
    });

    it('should handle swap error without error message', async () => {
      const writeAsyncImpl = vi.fn().mockRejectedValue('string error');

      vi.mocked(useReadContract).mockReturnValue(createReadReturn(RESERVE_AMOUNT));
      vi.mocked(useWriteContract).mockReturnValue(
        createWriteContractReturn(writeAsyncImpl)
      );

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      await act(async () => {
        try {
          await result.current.swap();
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith('Swap failed');
    });
  });

  describe('output calculation', () => {
    it('should return 0 when amountIn is empty', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.estimatedOutput).toBe('0');
    });

    it('should calculate non-zero output when amountIn and reserves are provided', () => {
      vi.mocked(useReadContract).mockReturnValue(createReadReturn(RESERVE_AMOUNT));

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      expect(result.current.estimatedOutput).not.toBe('0');
      expect(result.current.hasLiquidity).toBe(true);
    });

    it('should reflect hasLiquidity false when reserves are zero', () => {
      vi.mocked(useReadContract).mockReturnValue(createReadReturn(0n));

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasLiquidity).toBe(false);
    });

    it('should calculate output for token1 direction', () => {
      vi.mocked(useReadContract).mockReturnValue(createReadReturn(RESERVE_AMOUNT));

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
        result.current.setTokenIn('token1');
      });

      expect(result.current.estimatedOutput).not.toBe('0');
      expect(result.current.hasLiquidity).toBe(true);
    });

    it('should handle zero denominator defensive check', () => {
      vi.mocked(useReadContract).mockReturnValue(createReadReturn(997n));

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('-9.99999999999999e-16');
      });

      expect(result.current.estimatedOutput).toBe('0');
    });
  });

  describe('transaction confirmation', () => {
    it('should update transaction status to failed when tx errors', async () => {
      const writeAsyncImpl = vi.fn().mockResolvedValue('0xTxHash');

      vi.mocked(useReadContract).mockReturnValue(createReadReturn(RESERVE_AMOUNT));
      vi.mocked(useWriteContract).mockReturnValue(
        createWriteContractReturn(writeAsyncImpl)
      );
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
        ...baseQueryResult,
        isLoading: false,
        isSuccess: false,
        isError: true,
        isPending: false,
        isLoadingError: true,
        status: 'error',
        error: new Error('tx failed'),
        failureCount: 1,
        failureReason: new Error('tx failed'),
        errorUpdateCount: 1,
      } as unknown as UseWaitForTransactionReceiptReturnType);

      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmountIn('100');
      });

      await act(async () => {
        await result.current.swap();
      });

      expect(mockUpdateTransactionStatus).toHaveBeenCalledWith('0xTxHash', 'failed');
    });
  });
});
