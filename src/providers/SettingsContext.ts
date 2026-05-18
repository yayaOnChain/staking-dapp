import { createContext } from "react";

export interface SettingsContextType {
  slippageTolerance: number;
  setSlippageTolerance: (value: number) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);