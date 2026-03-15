import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SettingsContextType {
  slippageTolerance: number;
  setSlippageTolerance: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Default slippage tolerance is 0.5%
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

  return (
    <SettingsContext.Provider value={{ slippageTolerance, setSlippageTolerance }}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
