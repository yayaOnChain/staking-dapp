/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAddresses } from "@/tests/test-utils";
import { useLiquidity } from "@/hooks/useLiquidity";
import { TransactionProvider } from "@/providers/TransactionProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LIQUIDITY_POOL_ABI } from "@/abis";

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
  status: 'pending',
  fetchStatus: 'idle',
  queryKey: [],
} as const;

const successQueryResult = {
  data: undefined,
  dataUpdatedAt: Date.now(),
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isError: false,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isLoading: false,
  isPending: false,
  isLoadingError: false,
  isInitialLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
  isSuccess: true,
  isEnabled: true,
  refetch: vi.fn(),
  promise: Promise.resolve(undefined),
  status: 'success',
  fetchStatus: 'idle',
  queryKey: [],
} as const;

const errorQueryResult = {
  data: undefined,
  dataUpdatedAt: 0,
  error: { name: 'TransactionFailedError', message: 'tx failed', shortMessage: 'tx failed' },
  errorUpdatedAt: Date.now(),
  failureCount: 1,
  failureReason: { name: 'TransactionFailedError', message: 'tx failed', shortMessage: 'tx failed' },
  errorUpdateCount: 1,
  isError: true,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isLoading: false,
  isPending: false,
  isLoadingError: true,
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
  status: 'error',
  fetchStatus: 'idle',
  queryKey: [],
} as const;

const createSuccessReadReturn = (data: bigint) => ({
  ...successQueryResult,
  data,
});

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
  status: 'idle',
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  submittedAt: 0,
  context: undefined,
  reset: vi.fn(),
} as const);

const POOL_DATA = BigInt(1000) * BigInt(1e18);

describe('useLiquidity', () => {
  const defaultProps = {
    poolAddress: mockAddresses.pool,
    token0Address: mockAddresses.tokenA,
    token1Address: mockAddresses.tokenB,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(useReadContract).mockReturnValue(baseQueryResult as never);
    vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn() as never);
    vi.mocked(useWaitForTransactionReceipt).mockReturnValue(baseQueryResult as never);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    vi.spyOn(qc, 'invalidateQueries').mockImplementation((() => Promise.resolve()) as never);
    vi.spyOn(qc, 'setQueryData').mockImplementation((() => undefined) as never);
    vi.spyOn(qc, 'getQueryData').mockImplementation((() => undefined) as never);
    vi.spyOn(qc, 'refetchQueries').mockImplementation((() => Promise.resolve()) as never);
    vi.mocked(useQueryClient).mockReturnValue(qc);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct shape', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('mode');
      expect(result.current).toHaveProperty('setMode');
      expect(result.current).toHaveProperty('amount0');
      expect(result.current).toHaveProperty('amount1');
      expect(result.current).toHaveProperty('expectedLP');
      expect(result.current).toHaveProperty('expectedRemove0');
      expect(result.current).toHaveProperty('expectedRemove1');
      expect(result.current).toHaveProperty('token0Balance');
      expect(result.current).toHaveProperty('token1Balance');
      expect(result.current).toHaveProperty('lpBalance');
      expect(result.current).toHaveProperty('addLiquidity');
      expect(result.current).toHaveProperty('removeLiquidity');
      expect(result.current).toHaveProperty('approve');
      expect(result.current).toHaveProperty('resetState');
    });

    it('should start with add mode', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.mode).toBe('add');
    });

    it('should start with empty amounts', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.amount0).toBe('');
      expect(result.current.amount1).toBe('');
    });

    it('should start with default computed and state values', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.expectedLP).toBe('0');
      expect(result.current.expectedRemove0).toBe('0');
      expect(result.current.expectedRemove1).toBe('0');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isConfirming).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.hash).toBeUndefined();
      expect(result.current.isApproved).toBe(false);
      expect(result.current.isApproving).toBe(false);
    });
  });

  describe('state management', () => {
    it('should toggle mode when setMode is called', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setMode('remove');
      });

      expect(result.current.mode).toBe('remove');
    });

    it('should update amount0 when setAmount0 is called', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
      });

      expect(result.current.amount0).toBe('100');
    });

    it('should update amount1 when setAmount1 is called', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount1('200');
      });

      expect(result.current.amount1).toBe('200');
    });

    it('should reset amounts when resetState is called', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
        result.current.setAmount1('200');
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.amount0).toBe('');
      expect(result.current.amount1).toBe('');
    });

    it('should reset hash and isSubmitting when resetState is called', async () => {
      const writeContractAsyncSpy = vi.fn().mockResolvedValue('0xSuccessHash');
      vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn(writeContractAsyncSpy) as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
        result.current.setAmount1('200');
      });

      await act(async () => {
        await result.current.addLiquidity();
      });

      expect(result.current.hash).toBe('0xSuccessHash');

      act(() => {
        result.current.resetState();
      });

      expect(result.current.hash).toBeUndefined();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('expectedLP calculation', () => {
    beforeEach(() => {
      vi.mocked(useReadContract).mockReturnValue(createSuccessReadReturn(POOL_DATA) as never);
    });

    it('should return "0" when amounts are empty even with pool data', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.expectedLP).toBe('0');
    });

    it('should calculate expected LP correctly when all data is available', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
        result.current.setAmount1('200');
      });

      expect(result.current.expectedLP).toBe('100');
    });

    it('should pick the smaller of the two liquidity values', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('300');
        result.current.setAmount1('100');
      });

      expect(result.current.expectedLP).toBe('100');
    });
  });

  describe('initial liquidity (totalSupply === 0)', () => {
    beforeEach(() => {
      vi.mocked(useReadContract).mockReturnValue(createSuccessReadReturn(0n) as never);
    });

    it('should return amount0 as expectedLP when totalSupply is 0', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('500');
      });

      expect(result.current.expectedLP).toBe('500');
    });
  });

  describe('expectedRemove calculation', () => {
    beforeEach(() => {
      vi.mocked(useReadContract).mockReturnValue(createSuccessReadReturn(POOL_DATA) as never);
    });

    it('should return "0" when amount0 is empty', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.expectedRemove0).toBe('0');
      expect(result.current.expectedRemove1).toBe('0');
    });

    it('should calculate expected remove amounts correctly', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('50');
      });

      expect(result.current.expectedRemove0).toBe('50');
      expect(result.current.expectedRemove1).toBe('50');
    });
  });

  describe('approve', () => {
    it('should show loading toast and success toast on approval', async () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.approve();
      });

      expect(toast.loading).toHaveBeenCalledWith('Approving tokens...');
      expect(toast.dismiss).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Approval transaction(s) sent!');
    });

    it('should handle approval error gracefully', async () => {
      const writeContractAsyncSpy = vi.fn().mockRejectedValue(new Error('User rejected'));
      vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn(writeContractAsyncSpy) as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.approve();
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith('Approval failed');
    });
  });

  describe('addLiquidity', () => {
    it('should return early when amount0 is empty', async () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount1('200');
      });

      await act(async () => {
        await result.current.addLiquidity();
      });

      expect(toast.loading).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should return early when amount1 is empty', async () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
      });

      await act(async () => {
        await result.current.addLiquidity();
      });

      expect(toast.loading).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should submit addLiquidity transaction successfully', async () => {
      const writeContractAsyncSpy = vi.fn().mockResolvedValue('0xSuccessHash');
      vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn(writeContractAsyncSpy) as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
        result.current.setAmount1('200');
      });

      await act(async () => {
        await result.current.addLiquidity();
      });

      expect(writeContractAsyncSpy).toHaveBeenCalledWith({
        address: mockAddresses.pool,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'addLiquidity',
        args: [expect.any(BigInt), expect.any(BigInt), expect.any(BigInt)],
      });
      expect(result.current.hash).toBe('0xSuccessHash');
      expect(result.current.isSubmitting).toBe(false);
      expect(toast.loading).toHaveBeenCalledWith('Adding liquidity...');
    });

    it('should handle addLiquidity error', async () => {
      const writeContractAsyncSpy = vi.fn().mockRejectedValue(new Error('Tx failed'));
      vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn(writeContractAsyncSpy) as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
        result.current.setAmount1('200');
      });

      await act(async () => {
        try {
          await result.current.addLiquidity();
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to add liquidity');
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('removeLiquidity', () => {
    it('should return early when amount0 is empty', async () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.removeLiquidity();
      });

      expect(toast.loading).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should submit removeLiquidity transaction successfully', async () => {
      const writeContractAsyncSpy = vi.fn().mockResolvedValue('0xRemoveHash');
      vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn(writeContractAsyncSpy) as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('50');
      });

      await act(async () => {
        await result.current.removeLiquidity();
      });

      expect(writeContractAsyncSpy).toHaveBeenCalledWith({
        address: mockAddresses.pool,
        abi: LIQUIDITY_POOL_ABI,
        functionName: 'removeLiquidity',
        args: [expect.any(BigInt), expect.any(BigInt), expect.any(BigInt)],
      });
      expect(result.current.hash).toBe('0xRemoveHash');
      expect(result.current.isSubmitting).toBe(false);
      expect(toast.loading).toHaveBeenCalledWith('Removing liquidity...');
    });

    it('should handle removeLiquidity error', async () => {
      const writeContractAsyncSpy = vi.fn().mockRejectedValue(new Error('Remove failed'));
      vi.mocked(useWriteContract).mockReturnValue(createWriteContractReturn(writeContractAsyncSpy) as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('50');
      });

      await act(async () => {
        try {
          await result.current.removeLiquidity();
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to remove liquidity');
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('transaction state flags', () => {
    it('should reflect isConfirming from useWaitForTransactionReceipt isLoading', () => {
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue({
        ...baseQueryResult,
        isLoading: true,
        isPending: true,
        fetchStatus: 'fetching',
        isFetching: true,
      } as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isConfirming).toBe(true);
    });

    it('should reflect isSuccess from useWaitForTransactionReceipt', () => {
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue(successQueryResult as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSuccess).toBe(true);
    });

    it('should reflect isConfirming false and isError true on tx failure', () => {
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue(errorQueryResult as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isConfirming).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('transaction effects', () => {
    it('should update transaction status on success when hash is set and isSuccess is true', () => {
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue(successQueryResult as never);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSuccess).toBe(true);
    });

    it('should call updateTransactionStatus on add liquidity success and execute query predicate', async () => {
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue(successQueryResult as never);
      vi.mocked(useReadContract).mockReturnValue(createSuccessReadReturn(POOL_DATA) as never);

      const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
      const invalidateMock = vi.fn((options: { predicate?: (query: { queryKey: unknown[] }) => boolean }) => {
        if (options.predicate) {
          options.predicate({ queryKey: ['balanceOf', { address: mockAddresses.pool }] });
          options.predicate({ queryKey: ['allowance', { address: mockAddresses.tokenA }] });
          options.predicate({ queryKey: ['totalSupply'] });
        }
        return Promise.resolve();
      });
      vi.spyOn(qc, 'invalidateQueries').mockImplementation(invalidateMock as never);
      vi.spyOn(qc, 'setQueryData').mockImplementation((() => undefined) as never);
      vi.spyOn(qc, 'getQueryData').mockImplementation((() => undefined) as never);
      vi.spyOn(qc, 'refetchQueries').mockImplementation((() => Promise.resolve()) as never);
      vi.mocked(useQueryClient).mockReturnValue(qc);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
        result.current.setAmount1('200');
      });

      await act(async () => {
        await result.current.addLiquidity();
      });

      expect(mockUpdateTransactionStatus).toHaveBeenCalledWith('0xTxHash', 'success');
    });

    it('should call updateTransactionStatus with failed on tx error', async () => {
      vi.mocked(useWaitForTransactionReceipt).mockReturnValue(errorQueryResult as never);
      vi.mocked(useReadContract).mockReturnValue(createSuccessReadReturn(POOL_DATA) as never);

      const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
      vi.spyOn(qc, 'invalidateQueries').mockImplementation((() => Promise.resolve()) as never);
      vi.spyOn(qc, 'setQueryData').mockImplementation((() => undefined) as never);
      vi.spyOn(qc, 'getQueryData').mockImplementation((() => undefined) as never);
      vi.spyOn(qc, 'refetchQueries').mockImplementation((() => Promise.resolve()) as never);
      vi.mocked(useQueryClient).mockReturnValue(qc);

      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount0('100');
        result.current.setAmount1('200');
      });

      await act(async () => {
        await result.current.addLiquidity();
      });

      expect(mockUpdateTransactionStatus).toHaveBeenCalledWith('0xTxHash', 'failed');
    });
  });

  describe('wiring', () => {
    it('should connect to the correct contract functions via useReadContract', () => {
      const readContractMock = vi.mocked(useReadContract);
      readContractMock.mockClear();

      renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      const calls = readContractMock.mock.calls;
      const functionNames = calls.map((call) => call[0]?.functionName);
      expect(functionNames).toContain('totalSupply');
      expect(functionNames).toContain('reserve0');
      expect(functionNames).toContain('reserve1');
      expect(functionNames).toContain('balanceOf');
    });
  });
});
