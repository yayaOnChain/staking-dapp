import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock viem functions
vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    parseEther: vi.fn((value) => BigInt(Math.floor(parseFloat(value) * 1e18))),
    formatEther: vi.fn((value) => {
      if (typeof value === 'bigint') {
        return (Number(value) / 1e18).toString();
      }
      return '0';
    }),
    parseUnits: vi.fn((value, decimals) => BigInt(Math.floor(parseFloat(value) * Math.pow(10, decimals)))),
    formatUnits: vi.fn((value, decimals) => {
      if (typeof value === 'bigint') {
        return (Number(value) / Math.pow(10, decimals)).toString();
      }
      return '0';
    }),
    zeroAddress: '0x0000000000000000000000000000000000000000',
  };
});

// Mock wagmi hooks
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAccount: vi.fn(() => ({
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      isConnected: true,
      chainId: 11155111,
      chain: { id: 11155111, name: 'Sepolia' },
    })),
    useReadContract: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      isSuccess: true,
      status: 'success',
    })),
    useWriteContract: vi.fn(() => ({
      writeContract: vi.fn().mockResolvedValue('0xTxHash'),
      writeContractAsync: vi.fn().mockResolvedValue('0xTxHash'),
      data: undefined,
      error: null,
      isError: false,
      isPending: false,
      isSuccess: false,
      status: 'idle',
      reset: vi.fn(),
    })),
    useWaitForTransactionReceipt: vi.fn(() => ({
      isLoading: false,
      isSuccess: false,
      isError: false,
      isConfirming: false,
      isConfirmed: false,
      isFetching: false,
      data: undefined,
      error: null,
      status: 'idle',
    })),
    useBalance: vi.fn(() => ({
      data: { value: BigInt(1e18), decimals: 18, symbol: 'ETH' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })),
    useConnect: vi.fn(() => ({
      connect: vi.fn(),
      connectors: [],
      error: null,
      isPending: false,
    })),
    useDisconnect: vi.fn(() => ({
      disconnect: vi.fn(),
      isPending: false,
    })),
    useChainId: vi.fn(() => 11155111),
    useBlockNumber: vi.fn(() => ({ data: BigInt(12345678) })),
  };
});

// Mock Rainbow Kit
vi.mock('@rainbow-me/rainbowkit', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ConnectButton: vi.fn(function ConnectButton({ onClick }) {
      return <button onClick={onClick}>Connect Wallet</button>;
    }),
  };
});

// Mock sonner toast
vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Toaster: vi.fn(() => <div data-testid="toaster" />),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(() => 'loading-id'),
      dismiss: vi.fn(),
      promise: vi.fn(),
    },
  };
});

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
      setQueryData: vi.fn(),
      getQueryData: vi.fn(),
      refetchQueries: vi.fn(),
    })),
  };
});

// Mock AppProviders
vi.mock('./providers/AppProviders', () => ({
  AppProviders: ({ children }) => <div data-testid="app-providers">{children}</div>,
}));

// Mock ErrorBoundary
vi.mock('./components/ui/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock Navbar
vi.mock('./components/layout/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

// Mock Footer
vi.mock('./components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));
