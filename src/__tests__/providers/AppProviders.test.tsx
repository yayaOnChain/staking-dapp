/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProviders } from '@/providers/AppProviders';
import { initializeQueryClient } from '@/providers/queryClient';

const wagmiProviderMock = vi.fn();
const queryClientProviderMock = vi.fn();
const rainbowKitProviderMock = vi.fn();
const darkThemeMock = vi.fn((options: unknown) => {
  void options;
  return { theme: 'dark' };
});
const settingsProviderMock = vi.fn();
const transactionProviderMock = vi.fn();

const { queryClientOptions } = vi.hoisted(() => ({
  queryClientOptions: [] as unknown[],
}));

vi.mock('@/config/wagmi', () => ({
  config: { chains: ['sepolia'] },
}));

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children, config }: { children: React.ReactNode; config: unknown }) => {
    wagmiProviderMock(config);
    return <div data-testid="wagmi-provider">{children}</div>;
  },
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClient: function QueryClient(this: unknown, options: unknown) {
    queryClientOptions.push(options);
    Object.assign(this as object, { options });
  },
  QueryClientProvider: ({ children, client }: { children: React.ReactNode; client: unknown }) => {
    queryClientProviderMock(client);
    return <div data-testid="query-client-provider">{children}</div>;
  },
}));

vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({
    children,
    theme,
    modalSize,
    showRecentTransactions,
    coolMode,
    appInfo,
  }: {
    children: React.ReactNode;
    theme: unknown;
    modalSize: string;
    showRecentTransactions: boolean;
    coolMode: boolean;
    appInfo: { appName: string };
  }) => {
    rainbowKitProviderMock({ theme, modalSize, showRecentTransactions, coolMode, appInfo });
    return <div data-testid="rainbowkit-provider">{children}</div>;
  },
  darkTheme: (options: unknown) => {
    darkThemeMock(options);
    return { theme: 'dark' };
  },
}));

vi.mock('@/providers/SettingsProvider', () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => {
    settingsProviderMock();
    return <div data-testid="settings-provider">{children}</div>;
  },
}));

vi.mock('@/providers/TransactionProvider', () => ({
  TransactionProvider: ({ children }: { children: React.ReactNode }) => {
    transactionProviderMock();
    return <div data-testid="transaction-provider">{children}</div>;
  },
}));

describe('AppProviders', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should wrap children with the expected provider stack', () => {
    render(
      <AppProviders>
        <div>Provider content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('wagmi-provider')).toBeInTheDocument();
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
    expect(screen.getByTestId('rainbowkit-provider')).toBeInTheDocument();
    expect(screen.getByTestId('settings-provider')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-provider')).toBeInTheDocument();
    expect(screen.getByText('Provider content')).toBeInTheDocument();
  });

  it('should configure wagmi and rainbowkit with the expected app settings', () => {
    render(
      <AppProviders>
        <div>Provider content</div>
      </AppProviders>
    );

    expect(wagmiProviderMock).toHaveBeenCalledWith({ chains: ['sepolia'] });
    expect(darkThemeMock).toHaveBeenCalledWith({
      accentColor: '#7b3fe4',
      accentColorForeground: 'white',
      borderRadius: 'medium',
      fontStack: 'system',
      overlayBlur: 'small',
    });
    expect(rainbowKitProviderMock).toHaveBeenCalledWith({
      theme: { theme: 'dark' },
      modalSize: 'compact',
      showRecentTransactions: true,
      coolMode: true,
      appInfo: { appName: 'Staking DApp' },
    });
  });

  it('should create QueryClient with Web3-optimized default options', () => {
    render(
      <AppProviders>
        <div>Test</div>
      </AppProviders>
    );

    expect(queryClientOptions).toHaveLength(1);
    expect(queryClientOptions[0]).toEqual({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: true,
          retry: 1,
          staleTime: 10000,
          gcTime: 60000,
          throwOnError: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  it('should reuse the same QueryClient instance on re-render (singleton)', () => {
    const { rerender } = render(
      <AppProviders>
        <div>First render</div>
      </AppProviders>
    );

    const firstClient = queryClientProviderMock.mock.calls[0][0];

    rerender(
      <AppProviders>
        <div>Second render</div>
      </AppProviders>
    );

    const secondClient = queryClientProviderMock.mock.calls[1][0];
    expect(firstClient).toBe(secondClient);
    expect(queryClientOptions).toHaveLength(1);
  });

  it('should create a new QueryClient per request in SSR environment', async () => {
    const initialCount = queryClientOptions.length;

    vi.resetModules();
    vi.stubGlobal('window', undefined);

    const { AppProviders: SSRProviders } = await import('@/providers/AppProviders');

    expect(queryClientOptions).toHaveLength(initialCount + 1);

    vi.unstubAllGlobals();

    render(
      <SSRProviders>
        <div>SSR content</div>
      </SSRProviders>
    );

    expect(screen.getByTestId('wagmi-provider')).toBeInTheDocument();
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
    expect(screen.getByText('SSR content')).toBeInTheDocument();
  });

  it('should skip re-initialization when queryClient already exists (HMR scenario)', () => {
    const countBefore = queryClientOptions.length;

    initializeQueryClient();

    expect(queryClientOptions).toHaveLength(countBefore);
  });
});
