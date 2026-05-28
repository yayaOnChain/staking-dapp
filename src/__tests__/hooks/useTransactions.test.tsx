/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    vi.restoreAllMocks();
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

  it('should hydrate transactions from localStorage on initialization', () => {
    const savedTransactions = [
      createMockTransaction({
        hash: '0x999',
        status: 'success',
      }),
    ];
    localStorage.setItem('staking_dapp_transactions', JSON.stringify(savedTransactions));

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0]).toMatchObject({
      hash: '0x999',
      status: 'success',
    });
  });

  it('should fall back to empty state when localStorage contains invalid JSON', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('staking_dapp_transactions', '{invalid json');

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    expect(result.current.transactions).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to parse transaction history',
      expect.any(SyntaxError)
    );
  });

  it('should persist transactions to localStorage when state changes', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    const tx = createMockTransaction({ hash: '0xpersist' });

    act(() => {
      result.current.addTransaction(tx);
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      'staking_dapp_transactions',
      expect.stringContaining('0xpersist')
    );
  });

  it('should keep existing transactions unchanged when updating an unknown hash', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
    const tx = createMockTransaction({ hash: '0xknown', status: 'pending' });

    act(() => {
      result.current.addTransaction(tx);
      result.current.updateTransactionStatus('0xmissing', 'failed');
    });

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0]).toMatchObject({
      hash: '0xknown',
      status: 'pending',
    });
  });

  it('should throw an error when used outside TransactionProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useTransactions())).toThrow(
      'useTransactions must be used within a TransactionProvider'
    );

    consoleErrorSpy.mockRestore();
  });

});
