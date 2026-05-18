import { createContext } from "react";

export type TransactionStatus = "pending" | "success" | "failed";
export type TransactionType = "Swap" | "Add Liquidity" | "Remove Liquidity" | "Stake" | "Unstake" | "Harvest";

export interface Transaction {
  hash: string;
  type: TransactionType;
  description: string;
  status: TransactionStatus;
  timestamp: number;
}

export interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransactionStatus: (hash: string, status: TransactionStatus) => void;
  clearHistory: () => void;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);