/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAddresses } from "@/tests/test-utils";
import { useSwap } from "@/hooks/useSwap";
import { TransactionProvider } from "@/providers/TransactionProvider";

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

describe('useSwap', () => {
  const defaultProps = {
    poolAddress: mockAddresses.pool,
    token0Address: mockAddresses.tokenA,
    token1Address: mockAddresses.tokenB,
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should reset state when resetState is called', () => {
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
  });

  describe('output calculation', () => {
    it('should return 0 when amountIn is empty', () => {
      const { result } = renderHook(() => useSwap(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.estimatedOutput).toBe('0');
    });
  });
});
