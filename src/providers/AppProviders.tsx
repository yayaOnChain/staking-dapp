import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/wagmi";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { SettingsProvider } from "./SettingsProvider";
import { TransactionProvider } from "./TransactionProvider";
import { getQueryClient } from "./queryClient";

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
      <QueryClientProvider client={getQueryClient()}>
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
          <SettingsProvider>
            <TransactionProvider>
              {children}
            </TransactionProvider>
          </SettingsProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
