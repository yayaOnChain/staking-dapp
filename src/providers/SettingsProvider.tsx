import { useState } from "react";
import type { ReactNode } from "react";
import { SettingsContext } from "./SettingsContext";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

  return (
    <SettingsContext.Provider value={{ slippageTolerance, setSlippageTolerance }}>
      {children}
    </SettingsContext.Provider>
  );
};