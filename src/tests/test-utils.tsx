import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Mock QueryClient for tests
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Test providers wrapper
interface TestProvidersProps {
  children: ReactNode;
}

export const TestProviders = ({ children }: TestProvidersProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Custom render function with test providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const Wrapper = options?.wrapper || TestProviders;
  
  return render(ui, {
    wrapper: Wrapper,
    ...options,
  });
};

// Test utilities
export const createMockAddress = (prefix: string = '0x') => {
  return `${prefix}${'0'.repeat(40)}` as `0x${string}`;
};

export const mockAddresses = {
  pool: '0xPoolAddress000000000000000000000000000000001' as `0x${string}`,
  farm: '0xFarmAddress000000000000000000000000000000002' as `0x${string}`,
  tokenA: '0xTokenAAddress000000000000000000000000000000003' as `0x${string}`,
  tokenB: '0xTokenBAddress000000000000000000000000000000004' as `0x${string}`,
  rewardToken: '0xRewardTokenAddress000000000000000000000000000000005' as `0x${string}`,
  user: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as `0x${string}`,
  zero: '0x0000000000000000000000000000000000000000' as `0x${string}`,
};

// Mock data factories
export const createMockTokenData = (overrides?: Partial<{
  balance: bigint;
  allowance: bigint;
  symbol: string;
  decimals: number;
}>) => ({
  balance: BigInt(100 * 1e18),
  allowance: BigInt(0),
  symbol: 'TKN',
  decimals: 18,
  ...overrides,
});

export const createMockPoolData = (overrides?: Partial<{
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
}>) => ({
  reserve0: BigInt(1000 * 1e18),
  reserve1: BigInt(1000 * 1e18),
  totalSupply: BigInt(100 * 1e18),
  ...overrides,
});

export const createMockFarmData = (overrides?: Partial<{
  totalStaked: bigint;
  userInfo: [bigint, bigint];
  pendingReward: bigint;
}>) => ({
  totalStaked: BigInt(500 * 1e18),
  userInfo: [BigInt(10 * 1e18), BigInt(0)] as [bigint, bigint],
  pendingReward: BigInt(5 * 1e18),
  ...overrides,
});

// Event simulation helpers
export const fireEvent = {
  change: (element: HTMLElement, value: string) => {
    const inputEvent = new Event('input', { bubbles: true });
    Object.defineProperty(element, 'value', { value });
    element.dispatchEvent(inputEvent);
  },
  click: (element: HTMLElement) => {
    element.click();
  },
};

// Wait helpers
export const waitForAsync = (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock hook return types
export type MockHookReturn<T> = T & {
  mockReset: () => void;
  mockUpdate: (updates: Partial<T>) => void;
};

// Create mock hook return value
export function createMockHookReturn<T extends Record<string, any>>(
  baseValues: T
): MockHookReturn<T> {
  const mockValues = { ...baseValues };
  
  return {
    ...mockValues,
    mockReset: () => {
      Object.assign(mockValues, baseValues);
    },
    mockUpdate: (updates: Partial<T>) => {
      Object.assign(mockValues, updates);
    },
  } as MockHookReturn<T>;
}

// Console mock helpers
export const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  
  setup: () => {
    vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
    vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
  },
  
  restore: () => {
    vi.restoreAllMocks();
  },
  
  clear: () => {
    mockConsole.error.mockClear();
    mockConsole.warn.mockClear();
    mockConsole.log.mockClear();
  },
};
