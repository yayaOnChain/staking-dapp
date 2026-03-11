import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../config/wagmi";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

// Create a query client for caching blockchain data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch data when window regains focus
      refetchOnWindowFocus: true,
      // Retry failed requests
      retry: 1,
      // Stale time: how long data is considered fresh
      staleTime: 5000, // 5 seconds
      // GC time: how long to keep unused data in cache
      gcTime: 30000, // 30 seconds
    },
  },
});

// Wrap your app with these providers
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
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
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
