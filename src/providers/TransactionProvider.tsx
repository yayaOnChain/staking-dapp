import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TransactionStatus = "pending" | "success" | "failed";
export type TransactionType = "Swap" | "Add Liquidity" | "Remove Liquidity" | "Stake" | "Unstake" | "Harvest";

export interface Transaction {
  hash: string;
  type: TransactionType;
  description: string;
  status: TransactionStatus;
  timestamp: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransactionStatus: (hash: string, status: TransactionStatus) => void;
  clearHistory: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "staking_dapp_transactions";

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Hydrate from localStorage on initial load
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse transaction history", e);
        }
      }
    }
    return [];
  });

  // Sync to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => {
      // Avoid duplicate hashes
      if (prev.some((p) => p.hash === tx.hash)) return prev;
      return [tx, ...prev].slice(0, 50); // Keep last 50 transactions max
    });
  };

  const updateTransactionStatus = (hash: string, status: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
    );
  };

  const clearHistory = () => {
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, updateTransactionStatus, clearHistory }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};
