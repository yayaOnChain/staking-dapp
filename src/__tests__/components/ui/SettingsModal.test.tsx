/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SettingsModal', () => {
  it('should render with default 0.5% preset active', () => {
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText('Transaction Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '0.5%' })).toHaveClass('bg-blue-600');
  });

  it('should keep the modal open when a preset is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '0.1%' }));

    expect(screen.getByText('Transaction Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '0.1%' })).toHaveClass('bg-blue-600');
  });

  it('should reset to default 0.5% preset when custom input becomes empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '2.5');
    await user.clear(input);

    expect(input).toHaveValue('');
    expect(screen.getByRole('button', { name: '0.5%' })).toHaveClass('bg-blue-600');
  });

  it('should activate matching preset when typing exact preset values', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, '0.1');
    expect(screen.getByRole('button', { name: '0.1%' })).toHaveClass('bg-blue-600');

    await user.clear(input);
    await user.type(input, '0.5');
    expect(screen.getByRole('button', { name: '0.5%' })).toHaveClass('bg-blue-600');

    await user.clear(input);
    await user.type(input, '1');
    expect(screen.getByRole('button', { name: '1%' })).toHaveClass('bg-blue-600');
  });

  it('should not activate any preset while the custom input is an incomplete decimal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '0.');

    expect(input).toHaveValue('0.');
    expect(screen.getByRole('button', { name: '0.1%' })).not.toHaveClass('bg-blue-600');
    expect(screen.getByRole('button', { name: '0.5%' })).not.toHaveClass('bg-blue-600');
    expect(screen.getByRole('button', { name: '1%' })).not.toHaveClass('bg-blue-600');
  });

  it('should open the tooltip only from the info button and close it on tooltip click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByText('Slippage tolerance'));
    expect(
      screen.queryByText(/Your transaction will revert if the price changes/i)
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Explain slippage tolerance' }));
    const tooltip = screen.getByText(/Your transaction will revert if the price changes/i);
    expect(tooltip).toBeInTheDocument();

    await user.click(tooltip);
    await waitFor(() => {
      expect(
        screen.queryByText(/Your transaction will revert if the price changes/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should call onClose when backdrop or close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container, rerender } = renderWithProviders(
      <SettingsModal isOpen onClose={onClose} />
    );

    const backdrop = container.querySelector('[role="dialog"]');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<SettingsModal isOpen onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close settings' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('should close modal when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<SettingsModal isOpen onClose={onClose} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('should ignore non-numeric input in custom slippage field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'abc');

    expect(input).toHaveValue('');
  });

  it('should close tooltip when the overlay backdrop is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Explain slippage tolerance' }));
    expect(
      screen.getByText(/Your transaction will revert if the price changes/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close slippage explanation' }));
    await waitFor(() => {
      expect(
        screen.queryByText(/Your transaction will revert if the price changes/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should show frontrun warning when slippage exceeds 5%', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsModal isOpen onClose={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), '6');

    expect(screen.getByText(/Your transaction may be frontrun/i)).toBeInTheDocument();
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = renderWithProviders(
      <SettingsModal isOpen={false} onClose={vi.fn()} />
    );

    expect(container.innerHTML).toBe('');
  });
});
