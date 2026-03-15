/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAddresses } from "@/tests/test-utils";
import { useYieldFarm } from "@/hooks/useYieldFarm";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useYieldFarm', () => {
  const defaultProps = {
    farmAddress: mockAddresses.farm,
    lpTokenAddress: mockAddresses.pool,
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should start with empty amount', () => {
      const { result } = renderHook(() => useYieldFarm(defaultProps), {
        wrapper: createWrapper(),
      });
      expect(result.current.amount).toBe('');
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
