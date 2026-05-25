/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';

const mockUseAccount = vi.fn();

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
  };
});

describe('useNetworkConfig', () => {
  beforeEach(() => {
    mockUseAccount.mockReset();
  });

  it('should resolve sepolia network when connected to sepolia', () => {
    mockUseAccount.mockReturnValue({ chainId: 11155111 });

    const { result } = renderHook(() => useNetworkConfig());

    expect(result.current.network).toBe('sepolia');
    expect(result.current.chainId).toBe(11155111);
    expect(result.current.contracts).toHaveProperty('POOL');
    expect(result.current.contracts).toHaveProperty('FARM');
  });

  it('should resolve mainnet network when connected to mainnet', () => {
    mockUseAccount.mockReturnValue({ chainId: 1 });

    const { result } = renderHook(() => useNetworkConfig());

    expect(result.current.network).toBe('mainnet');
    expect(result.current.chainId).toBe(1);
  });

  it('should resolve hardhat network when connected to hardhat', () => {
    mockUseAccount.mockReturnValue({ chainId: 31337 });

    const { result } = renderHook(() => useNetworkConfig());

    expect(result.current.network).toBe('hardhat');
    expect(result.current.chainId).toBe(31337);
  });

  it('should fall back to default network for unsupported chains', () => {
    mockUseAccount.mockReturnValue({ chainId: 137 });

    const { result } = renderHook(() => useNetworkConfig());

    expect(result.current.network).toBe('sepolia');
    expect(result.current.chainId).toBe(137);
  });

  it('should fall back to default network when disconnected', () => {
    mockUseAccount.mockReturnValue({ chainId: undefined });

    const { result } = renderHook(() => useNetworkConfig());

    expect(result.current.network).toBe('sepolia');
    expect(result.current.chainId).toBeUndefined();
  });
});
