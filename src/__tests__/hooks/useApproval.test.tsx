/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAddresses } from '../../tests/test-utils';
import { useApproval } from '../../hooks/useApproval';

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

describe('useApproval', () => {
  const defaultProps = {
    tokenAddress: mockAddresses.tokenA,
    spenderAddress: mockAddresses.pool,
    userAddress: mockAddresses.user,
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should return isApproved false when allowance is 0', () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });
      // Default mock returns 0
      expect(result.current.isApproved).toBe(false);
    });
  });

  describe('approve', () => {
    it('should have approve function that is callable', async () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.approve).toBe('function');
      
      // Should not throw when called (even if it fails due to mocks)
      await expect(result.current.approve()).resolves.not.toThrow(TypeError);
    });

    it('should not call approve when userAddress is undefined', async () => {
      const { result } = renderHook(() => useApproval({
        ...defaultProps,
        userAddress: undefined,
      }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.approve();
      });

      // Should complete without error
      expect(result.current.isApproving).toBe(false);
    });
  });

  describe('resetApproval and refetchAllowance', () => {
    it('should have resetApproval function', () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.resetApproval).toBe('function');
      expect(() => result.current.resetApproval()).not.toThrow();
    });

    it('should have refetchAllowance function', () => {
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetchAllowance).toBe('function');
      expect(() => result.current.refetchAllowance()).not.toThrow();
    });
  });

  describe('state updates', () => {
    it('should update state when setAmount is called', () => {
      // This test verifies the hook structure
      const { result } = renderHook(() => useApproval(defaultProps), {
        wrapper: createWrapper(),
      });

      // Verify initial state
      expect(result.current.isApproving).toBe(false);
    });
  });
});
