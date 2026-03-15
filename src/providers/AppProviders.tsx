import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/wagmi";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { SettingsProvider } from "./SettingsProvider";

/**
 * Create a query client for caching blockchain data
 * Configured with optimal settings for Web3 applications
 */
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Refetch data when window regains focus
        refetchOnWindowFocus: true,
        // Retry failed requests once
        retry: 1,
        // Stale time: how long data is considered fresh
        staleTime: 10000, // 10 seconds
        // GC time: how long to keep unused data in cache
        gcTime: 60000, // 60 seconds
        // Prevent errors from propagating
        throwOnError: false,
      },
      mutations: {
        // Don't retry mutations by default
        retry: false,
      },
    },
  });
};

// Singleton query client (prevents recreation on hot reloads in dev)
let queryClient: QueryClient | null = null;

if (typeof window === "undefined") {
  // SSR: create a new query client for each request
  queryClient = createQueryClient();
} else {
  // Client: reuse query client
  if (!queryClient) {
    queryClient = createQueryClient();
  }
}

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Application providers wrapper
 * Wraps the app with all necessary context providers
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#7b3fe4",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
          showRecentTransactions={true}
          coolMode
          // App info for better wallet connection UX
          appInfo={{
            appName: "Staking DApp",
          }}
        >
          <SettingsProvider>{children}</SettingsProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
