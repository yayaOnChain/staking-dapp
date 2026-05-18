/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TransactionProvider } from '@/providers/TransactionProvider';
import { useTransactions } from '@/hooks/useTransactions';
import type { Transaction, TransactionStatus } from '@/providers/TransactionContext';

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <TransactionProvider>{children}</TransactionProvider>
  );
};

const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  type: 'Swap',
  description: 'Test transaction',
  status: 'pending' as TransactionStatus,
  timestamp: Date.now(),
  ...overrides,
});

describe('useTransactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with empty transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    expect(result.current.transactions).toEqual([]);
  });

  it('should add a transaction', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    const tx = createMockTransaction();

    act(() => {
      result.current.addTransaction(tx);
    });

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].hash).toBe(tx.hash);
  });

  it('should not add duplicate transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    const tx = createMockTransaction();

    act(() => {
      result.current.addTransaction(tx);
      result.current.addTransaction(tx);
    });

    expect(result.current.transactions).toHaveLength(1);
  });

  it('should update transaction status', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    const tx = createMockTransaction();

    act(() => {
      result.current.addTransaction(tx);
    });

    act(() => {
      result.current.updateTransactionStatus(tx.hash, 'success');
    });

    expect(result.current.transactions[0].status).toBe('success');
  });

  it('should clear all transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    
    act(() => {
      result.current.addTransaction(createMockTransaction({ hash: '0x111' }));
      result.current.addTransaction(createMockTransaction({ hash: '0x222' }));
    });

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.transactions).toEqual([]);
  });

  it('should keep only last 50 transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addTransaction(createMockTransaction({ hash: `0x${i.toString(16).padStart(64, '0')}` }));
      }
    });

    expect(result.current.transactions).toHaveLength(50);
  });

  it('should add new transactions at the beginning', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    const tx1 = createMockTransaction({ hash: '0x111', timestamp: 1000 });
    const tx2 = createMockTransaction({ hash: '0x222', timestamp: 2000 });

    act(() => {
      result.current.addTransaction(tx1);
      result.current.addTransaction(tx2);
    });

    expect(result.current.transactions[0].hash).toBe('0x222');
  });
});