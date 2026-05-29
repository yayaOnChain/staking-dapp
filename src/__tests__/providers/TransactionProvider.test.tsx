/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TransactionProvider } from '@/providers/TransactionProvider';
import { TransactionContext } from '@/providers/TransactionContext';

describe('TransactionProvider SSR', () => {
  it('should initialize with empty transactions when window is undefined', () => {
    function TestConsumer() {
      const ctx = React.useContext(TransactionContext);
      return React.createElement('span', { className: 'count' }, String(ctx?.transactions.length));
    }

    const html = renderToStaticMarkup(
      React.createElement(TransactionProvider, null, React.createElement(TestConsumer))
    );

    expect(html).toBe('<span class="count">0</span>');
  });
});
