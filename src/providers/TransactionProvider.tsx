import { useCallback, useEffect, useState, type ReactNode } from "react";
import { TransactionContext, type Transaction, type TransactionStatus } from "./TransactionContext";

const LOCAL_STORAGE_KEY = "staking_dapp_transactions";

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => {
      if (prev.some((p) => p.hash === tx.hash)) return prev;
      return [tx, ...prev].slice(0, 50);
    });
  }, []);

  const updateTransactionStatus = useCallback((hash: string, status: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
    );
  }, []);

  const clearHistory = useCallback(() => {
    setTransactions([]);
  }, []);

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, updateTransactionStatus, clearHistory }}
    >
      {children}
    </TransactionContext.Provider>
  );
};