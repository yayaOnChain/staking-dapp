/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAddresses } from "@/tests/test-utils";
import { useLiquidity } from "@/hooks/useLiquidity";
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

describe('useLiquidity', () => {
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
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('mode');
      expect(result.current).toHaveProperty('setMode');
      expect(result.current).toHaveProperty('amount0');
      expect(result.current).toHaveProperty('amount1');
      expect(result.current).toHaveProperty('expectedLP');
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

    it('should reset state when resetState is called', () => {
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
  });

  describe('actions', () => {
    it('should have addLiquidity function', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.addLiquidity).toBe('function');
    });

    it('should have removeLiquidity function', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.removeLiquidity).toBe('function');
    });

    it('should have approve function', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current.approve).toBe('function');
    });
  });

  describe('pool data', () => {
    it('should return pool data object', () => {
      const { result } = renderHook(() => useLiquidity(defaultProps), {
        wrapper: createWrapper(),
      });
      // Just verify the hook returns an object with expected properties
      expect(result.current).toHaveProperty('reserve0');
      expect(result.current).toHaveProperty('reserve1');
      expect(result.current).toHaveProperty('totalSupply');
    });
  });
});
