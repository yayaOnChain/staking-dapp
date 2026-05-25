/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const ThrowError = ({ message = 'Boom' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  const reloadMock = vi.fn();

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        reload: reloadMock,
      },
    });
    reloadMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <div>Healthy content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy content')).toBeInTheDocument();
  });

  it('should render default fallback with error message and reload action', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowError message="Crash detected" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Crash detected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reload page/i }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
