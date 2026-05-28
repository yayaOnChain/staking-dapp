/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { useSettings } from '@/hooks/useSettings';

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  );
};

describe('useSettings', () => {
  it('should provide default slippage tolerance of 0.5', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    expect(result.current.slippageTolerance).toBe(0.5);
  });

  it('should allow setting slippage tolerance', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.setSlippageTolerance(1.0);
    });
    
    expect(result.current.slippageTolerance).toBe(1.0);
  });

  it('should allow setting slippage tolerance to custom value', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.setSlippageTolerance(2.5);
    });
    
    expect(result.current.slippageTolerance).toBe(2.5);
  });

  it('should allow setting slippage tolerance to zero', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.setSlippageTolerance(0);
    });
    
    expect(result.current.slippageTolerance).toBe(0);
  });

  it('should throw error when used outside SettingsProvider', () => {
    expect(() => {
      renderHook(() => useSettings());
    }).toThrow('useSettings must be used within a SettingsProvider');
  });

  it('should allow setting slippage tolerance to negative value', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.setSlippageTolerance(-1);
    });
    
    expect(result.current.slippageTolerance).toBe(-1);
  });

  it('should allow setting slippage tolerance to a large value', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.setSlippageTolerance(100);
    });
    
    expect(result.current.slippageTolerance).toBe(100);
  });

  it('should persist updated value across renders', () => {
    const { result, rerender } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.setSlippageTolerance(1.5);
    });
    
    rerender();
    
    expect(result.current.slippageTolerance).toBe(1.5);
  });
});