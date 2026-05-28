/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAddresses } from "@/tests/test-utils";
import { useYieldFarm } from "@/hooks/useYieldFarm";
import { TransactionProvider } from "@/providers/TransactionProvider";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TransactionProvider>{children}</TransactionProvider>
    </QueryClientProvider>
  );
};

const defaultWriteContract = () => ({
  writeContractAsync: vi.fn().mockResolvedValue('0xTxHash'),
  writeContract: vi.fn().mockResolvedValue('0xTxHash'),
  data: undefined as `0x${string}` | undefined,
  error: null,
  isError: false,
  isPending: false,
  isSuccess: false,
  status: 'idle' as const,
  reset: vi.fn(),
});

const defaultTxReceipt = () => ({
  isLoading: false,
  isSuccess: false,
  isError: false,
  isConfirming: false,
  isConfirmed: false,
  isFetching: false,
  data: undefined,
  error: null,
  status: 'idle' as const,
});

const defaultAccount = () => ({
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as `0x${string}`,
  isConnected: true,
  chainId: 11155111,
  chain: { id: 11155111, name: 'Sepolia' },
});

const stableRefetch = vi.fn();

const stableReadContract = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: stableRefetch,
  isFetching: false,
  isSuccess: true,
  status: 'success',
};

const stableQueryClient = {
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  getQueryData: vi.fn(),
  refetchQueries: vi.fn(),
};

const mockWagmi = {
  writeContract: (impl?: (...args: unknown[]) => unknown) =>
    (vi.mocked(useWriteContract) as unknown as { mockImplementation: (fn: (...args: unknown[]) => unknown) => void }).mockImplementation(impl ?? defaultWriteContract),
  txReceipt: (impl?: (...args: unknown[]) => unknown) =>
    (vi.mocked(useWaitForTransactionReceipt) as unknown as { mockImplementation: (fn: (...args: unknown[]) => unknown) => void }).mockImplementation(impl ?? defaultTxReceipt),
  account: (impl?: (...args: unknown[]) => unknown) =>
    (vi.mocked(useAccount) as unknown as { mockImplementation: (fn: (...args: unknown[]) => unknown) => void }).mockImplementation(impl ?? defaultAccount),
  readContract: (val: unknown) =>
    (vi.mocked(useReadContract) as unknown as { mockReturnValue: (val: unknown) => void }).mockReturnValue(val),
  queryClient: (val: unknown) =>
    (vi.mocked(useQueryClient) as unknown as { mockReturnValue: (val: unknown) => void }).mockReturnValue(val),
};

describe('useYieldFarm', () => {
  const defaultProps = {
    farmAddress: mockAddresses.farm,
    lpTokenAddress: mockAddresses.pool,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWagmi.writeContract();
    mockWagmi.txReceipt();
    mockWagmi.account();
    mockWagmi.readContract(stableReadContract);
    mockWagmi.queryClient(stableQueryClient);
    (vi.mocked(toast.loading) as unknown as { mockImplementation: (fn: (...args: unknown[]) => unknown) => void }).mockImplementation(() => 'loading-id');
  });

  describe('initialization', () => {
    it('should initialize with correct shape', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('amount');
      expect(result.current).toHaveProperty('setAmount');
      expect(result.current).toHaveProperty('totalStaked');
      expect(result.current).toHaveProperty('lpBalance');
      expect(result.current).toHaveProperty('stakedAmount');
      expect(result.current).toHaveProperty('pendingRewards');
      expect(result.current).toHaveProperty('deposit');
      expect(result.current).toHaveProperty('withdraw');
      expect(result.current).toHaveProperty('harvest');
      expect(result.current).toHaveProperty('approve');
      expect(result.current).toHaveProperty('resetState');
    });

    it('should start with default state values', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.amount).toBe('');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.hash).toBeUndefined();
      expect(result.current.isConfirming).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('state management', () => {
    it('should update amount when setAmount is called', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount('100');
      });

      expect(result.current.amount).toBe('100');
    });

    it('should reset state when resetState is called', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setAmount('100');
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.amount).toBe('');
    });
  });

  describe('actions', () => {
    it('should have deposit function', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.deposit).toBe('function');
    });

    it('should have withdraw function', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.withdraw).toBe('function');
    });

    it('should have harvest function', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.harvest).toBe('function');
    });

    it('should have approve function', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.approve).toBe('function');
    });
  });

  describe('deposit', () => {
    it('should return early when amount is empty', async () => {
      const mockWrite = vi.fn();
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deposit();
      });

      expect(mockWrite).not.toHaveBeenCalled();
    });

    it('should submit deposit transaction successfully', async () => {
      const txHash = '0xSuccessTxHash';
      const mockWrite = vi.fn().mockResolvedValue(txHash);
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('10'); });

      await act(async () => {
        await result.current.deposit();
      });

      expect(mockWrite).toHaveBeenCalledWith({
        address: mockAddresses.farm,
        abi: expect.anything(),
        functionName: 'deposit',
        args: [expect.any(BigInt)],
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle deposit error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockWrite = vi.fn().mockRejectedValue(new Error('tx failed'));
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('10'); });

      await act(async () => {
        await result.current.deposit().catch(() => {});
      });

      expect(consoleSpy).toHaveBeenCalledWith('Deposit error:', expect.any(Error));
      expect(result.current.isSubmitting).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should handle deposit when toast loading throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (vi.mocked(toast.loading) as unknown as { mockImplementation: (fn: (...args: unknown[]) => unknown) => void }).mockImplementation(() => {
        throw new Error('toast failed');
      });

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('10'); });

      await act(async () => {
        await result.current.deposit().catch(() => {});
      });

      expect(result.current.isSubmitting).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('withdraw', () => {
    it('should return early when amount is empty', async () => {
      const mockWrite = vi.fn();
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.withdraw();
      });

      expect(mockWrite).not.toHaveBeenCalled();
    });

    it('should submit withdraw transaction successfully', async () => {
      const txHash = '0xWithdrawTxHash';
      const mockWrite = vi.fn().mockResolvedValue(txHash);
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('5'); });

      await act(async () => {
        await result.current.withdraw();
      });

      expect(mockWrite).toHaveBeenCalledWith({
        address: mockAddresses.farm,
        abi: expect.anything(),
        functionName: 'withdraw',
        args: [expect.any(BigInt)],
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle withdraw error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockWrite = vi.fn().mockRejectedValue(new Error('withdraw failed'));
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('5'); });

      await act(async () => {
        await result.current.withdraw().catch(() => {});
      });

      expect(consoleSpy).toHaveBeenCalledWith('Withdraw error:', expect.any(Error));
      expect(result.current.isSubmitting).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should handle withdraw when toast loading throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (vi.mocked(toast.loading) as unknown as { mockImplementation: (fn: (...args: unknown[]) => unknown) => void }).mockImplementation(() => {
        throw new Error('toast failed');
      });

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('5'); });

      await act(async () => {
        await result.current.withdraw().catch(() => {});
      });

      expect(result.current.isSubmitting).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('harvest', () => {
    it('should submit harvest transaction successfully', async () => {
      const txHash = '0xHarvestTxHash';
      const mockWrite = vi.fn().mockResolvedValue(txHash);
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.harvest();
      });

      expect(mockWrite).toHaveBeenCalledWith({
        address: mockAddresses.farm,
        abi: expect.anything(),
        functionName: 'withdraw',
        args: [0n],
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle harvest error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockWrite = vi.fn().mockRejectedValue(new Error('harvest failed'));
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: mockWrite }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.harvest().catch(() => {});
      });

      expect(consoleSpy).toHaveBeenCalledWith('Harvest error:', expect.any(Error));
      expect(result.current.isSubmitting).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should handle harvest when toast loading throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (vi.mocked(toast.loading) as unknown as { mockImplementation: (fn: (...args: unknown[]) => unknown) => void }).mockImplementation(() => {
        throw new Error('toast failed');
      });

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.harvest().catch(() => {});
      });

      expect(result.current.isSubmitting).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('resetState', () => {
    it('should clear all state including hash and isSubmitting', async () => {
      const txHash = '0xResetTxHash';
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: vi.fn().mockResolvedValue(txHash) }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('10'); });
      await act(async () => { await result.current.deposit(); });

      expect(result.current.hash).toBe(txHash);

      act(() => { result.current.resetState(); });

      expect(result.current.amount).toBe('');
      expect(result.current.hash).toBeUndefined();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should dismiss toast on resetState when toastIdRef is set', async () => {
      const txHash = '0xToastReset';
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: vi.fn().mockResolvedValue(txHash) }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('10'); });
      await act(async () => { await result.current.deposit(); });

      act(() => { result.current.resetState(); });

      expect(toast.dismiss).toHaveBeenCalled();
    });
  });

  describe('transaction confirmation', () => {
    it('should reflect isConfirming state', () => {
      mockWagmi.txReceipt(() => ({ ...defaultTxReceipt(), isLoading: true }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isConfirming).toBe(true);
    });

    it('should reflect isSuccess state', () => {
      mockWagmi.txReceipt(() => ({ ...defaultTxReceipt(), isSuccess: true }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSuccess).toBe(true);
    });

    it('should refetch farm data and invalidate queries on success', async () => {
      let capturedPredicate: ((query: { queryKey: unknown }) => boolean) | null = null;
      const mockInvalidateQueries = vi.fn().mockImplementation(
        ({ predicate }: { predicate: (query: { queryKey: unknown }) => boolean }) => {
          capturedPredicate = predicate;
        },
      );
      mockWagmi.queryClient({
        invalidateQueries: mockInvalidateQueries,
        setQueryData: vi.fn(),
        getQueryData: vi.fn(),
        refetchQueries: vi.fn(),
      });

      mockWagmi.txReceipt(() => ({ ...defaultTxReceipt(), isSuccess: true }));

      const txHash = '0xRefetchTx';
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: vi.fn().mockResolvedValue(txHash) }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('10'); });

      await act(async () => {
        await result.current.deposit();
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        predicate: expect.any(Function),
      });

      expect(capturedPredicate).toBeDefined();
      expect(capturedPredicate!({ queryKey: ['foo', { address: mockAddresses.farm }] })).toBe(true);
      expect(capturedPredicate!({ queryKey: ['bar'] })).toBe(false);
      expect(capturedPredicate!({ queryKey: ['baz', null] })).toBe(false);
      expect(capturedPredicate!({ queryKey: ['qux', { address: '0xOther' as const }] })).toBe(false);
      expect(capturedPredicate!({ queryKey: [123, { address: mockAddresses.pool }] })).toBe(true);
    });

    it('should update transaction status on error', async () => {
      mockWagmi.txReceipt(() => ({ ...defaultTxReceipt(), isError: true }));

      const txHash = '0xErrorStatusTx';
      mockWagmi.writeContract(() => ({ ...defaultWriteContract(), writeContractAsync: vi.fn().mockResolvedValue(txHash) }));

      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });

      act(() => { result.current.setAmount('10'); });

      await act(async () => {
        await result.current.deposit();
      });
    });
  });

  describe('hardhat network', () => {
    it('should poll pending rewards on block changes', () => {
      mockWagmi.account(() => ({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as `0x${string}`,
        isConnected: true,
        chainId: hardhat.id,
        chain: { id: hardhat.id, name: 'Hardhat', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['http://localhost:8545'] } } },
      }));

      renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });
    });
  });

  describe('farm data', () => {
    it('should return farm data object', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current).toHaveProperty('totalStaked');
      expect(result.current).toHaveProperty('lpBalance');
      expect(result.current).toHaveProperty('stakedAmount');
      expect(result.current).toHaveProperty('pendingRewards');
    });
  });
});
