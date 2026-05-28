/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReadContract, useWriteContract } from 'wagmi';
import { mockAddresses } from "@/tests/test-utils";
import { useApproval } from "@/hooks/useApproval";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockRefetch = vi.fn();

const createMockReadContractReturn = (data: bigint | undefined) => ({
  data,
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
  refetch: mockRefetch,
  promise: Promise.resolve(undefined),
  status: 'success' as const,
  fetchStatus: 'idle' as const,
  queryKey: [],
} as const);

const createMockWriteContractReturn = (
  writeContractAsyncImpl = vi.fn().mockResolvedValue('0xTxHash' as const),
) => ({
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

describe('useApproval', () => {
  const defaultProps = {
    tokenAddress: mockAddresses.tokenA,
    spenderAddress: mockAddresses.pool,
    userAddress: mockAddresses.user,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReadContract).mockReturnValue(
      createMockReadContractReturn(undefined),
    );
    vi.mocked(useWriteContract).mockReturnValue(
      createMockWriteContractReturn(),
    );
  });

  describe('initialization', () => {
    it('should initialize and return correct shape', () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('allowance');
      expect(result.current).toHaveProperty('isApproved');
      expect(result.current).toHaveProperty('isApproving');
      expect(result.current).toHaveProperty('approve');
      expect(result.current).toHaveProperty('resetApproval');
      expect(result.current).toHaveProperty('refetchAllowance');
    });

    it('should return isApproved false when allowance is undefined', () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isApproved).toBe(false);
    });

    it('should return isApproved false when allowance is 0', () => {
      vi.mocked(useReadContract).mockReturnValue(
        createMockReadContractReturn(0n),
      );

      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isApproved).toBe(false);
    });

    it('should return isApproved true when allowance is > 0', () => {
      vi.mocked(useReadContract).mockReturnValue(
        createMockReadContractReturn(100n),
      );

      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isApproved).toBe(true);
    });

    it('should return allowance value from useReadContract', () => {
      vi.mocked(useReadContract).mockReturnValue(
        createMockReadContractReturn(500n),
      );

      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.allowance).toBe(500n);
    });
  });

  describe('approve', () => {
    it('should have approve function that is callable', async () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.approve).toBe('function');

      await act(async () => {
        await expect(result.current.approve()).resolves.not.toThrow(TypeError);
      });
    });

    it('should call writeContractAsync with max uint256 by default', async () => {
      const mockWriteContractAsync = vi.fn().mockResolvedValue('0xTxHash');
      vi.mocked(useWriteContract).mockReturnValue(
        createMockWriteContractReturn(mockWriteContractAsync),
      );

      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.approve();
      });

      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        address: mockAddresses.tokenA,
        abi: expect.any(Array),
        functionName: 'approve',
        args: [mockAddresses.pool, (2n ** 256n) - 1n],
      });
    });

    it('should call writeContractAsync with custom amount', async () => {
      const mockWriteContractAsync = vi.fn().mockResolvedValue('0xTxHash');
      vi.mocked(useWriteContract).mockReturnValue(
        createMockWriteContractReturn(mockWriteContractAsync),
      );

      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.approve(1000n);
      });

      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        address: mockAddresses.tokenA,
        abi: expect.any(Array),
        functionName: 'approve',
        args: [mockAddresses.pool, 1000n],
      });
    });

    it('should not call writeContractAsync when userAddress is undefined', async () => {
      const mockWriteContractAsync = vi.fn();
      vi.mocked(useWriteContract).mockReturnValue(
        createMockWriteContractReturn(mockWriteContractAsync),
      );

      const { result } = renderHook(() => useApproval({
        ...defaultProps,
        userAddress: undefined,
      }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.approve();
      });

      expect(mockWriteContractAsync).not.toHaveBeenCalled();
      expect(result.current.isApproving).toBe(false);
    });
  });

  describe('approve error handling', () => {
    it('should handle errors, log them, and re-throw', async () => {
      const mockError = new Error('User rejected');
      const mockWriteContractAsync = vi.fn().mockRejectedValue(mockError);
      vi.mocked(useWriteContract).mockReturnValue(
        createMockWriteContractReturn(mockWriteContractAsync),
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await expect(result.current.approve()).rejects.toThrow('User rejected');
      });

      expect(result.current.isApproving).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Approval error:', mockError);

      consoleSpy.mockRestore();
    });
  });

  describe('auto-stop approving', () => {
    it('should set isApproving back to false when allowance becomes > 0', async () => {
      vi.mocked(useReadContract).mockReturnValue(
        createMockReadContractReturn(0n),
      );

      vi.mocked(useWriteContract).mockReturnValue(
        createMockWriteContractReturn(),
      );

      const { result, rerender } = renderHook(
        (props) => useApproval(props ?? defaultProps),
        {
          wrapper: createWrapper(),
          initialProps: defaultProps,
        },
      );

      await act(async () => {
        await result.current.approve();
      });

      expect(result.current.isApproving).toBe(true);

      vi.mocked(useReadContract).mockReturnValue(
        createMockReadContractReturn(100n),
      );

      rerender(defaultProps);

      expect(result.current.isApproving).toBe(false);
    });
  });

  describe('resetApproval and refetchAllowance', () => {
    it('should call refetch on resetApproval', () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      result.current.resetApproval();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should call refetch on refetchAllowance', () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      result.current.refetchAllowance();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
});
