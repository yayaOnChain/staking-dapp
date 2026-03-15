/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenSelectButton } from "@/components/ui/TokenSelect";

describe('TokenSelectButton', () => {
  describe('rendering', () => {
    it('should render button with symbol', () => {
      render(<TokenSelectButton symbol="ETH" />);
      expect(screen.getByRole('button', { name: /eth/i })).toBeInTheDocument();
    });

    it('should display the token symbol', () => {
      render(<TokenSelectButton symbol="USDC" />);
      expect(screen.getByText('USDC')).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      render(<TokenSelectButton symbol="DAI" />);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('active state', () => {
    it('should apply active styles when isActive is true', () => {
      render(<TokenSelectButton symbol="ETH" isActive={true} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-600');
      expect(button.className).toContain('text-white');
    });

    it('should apply inactive styles when isActive is false', () => {
      render(<TokenSelectButton symbol="ETH" isActive={false} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-700');
      expect(button.className).toContain('text-gray-300');
    });

    it('should be inactive by default', () => {
      render(<TokenSelectButton symbol="ETH" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-700');
    });

    it('should have hover styles when inactive', () => {
      render(<TokenSelectButton symbol="ETH" isActive={false} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:bg-gray-600');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<TokenSelectButton symbol="ETH" disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have cursor-not-allowed when inactive', () => {
      render(<TokenSelectButton symbol="ETH" isActive={false} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('cursor-not-allowed');
    });
  });

  describe('click handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<TokenSelectButton symbol="ETH" onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<TokenSelectButton symbol="ETH" disabled onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('should merge custom className with base styles', () => {
      render(<TokenSelectButton symbol="ETH" className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
      expect(button.className).toContain('px-3');
    });
  });

  describe('html attributes', () => {
    it('should pass through html button attributes', () => {
      render(<TokenSelectButton symbol="ETH" name="token-select" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('name', 'token-select');
    });

    it('should support aria attributes', () => {
      render(<TokenSelectButton symbol="ETH" aria-label="select-eth-token" />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'select-eth-token');
    });

    it('should support data attributes', () => {
      render(<TokenSelectButton symbol="ETH" data-testid="token-button" />);
      expect(screen.getByTestId('token-button')).toBeInTheDocument();
    });
  });

  describe('symbol display', () => {
    it('should display short symbols', () => {
      render(<TokenSelectButton symbol="A" />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should display long symbols', () => {
      render(<TokenSelectButton symbol="LONGTOKEN" />);
      expect(screen.getByText('LONGTOKEN')).toBeInTheDocument();
    });

    it('should display symbols with numbers', () => {
      render(<TokenSelectButton symbol="BTC2.0" />);
      expect(screen.getByText('BTC2.0')).toBeInTheDocument();
    });

    it('should display symbols with special characters', () => {
      render(<TokenSelectButton symbol="ETH-B" />);
      expect(screen.getByText('ETH-B')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have rounded corners', () => {
      render(<TokenSelectButton symbol="ETH" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-lg');
    });

    it('should have proper padding', () => {
      render(<TokenSelectButton symbol="ETH" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-3');
      expect(button.className).toContain('py-1.5');
    });

    it('should have text-sm class', () => {
      render(<TokenSelectButton symbol="ETH" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-sm');
    });

    it('should have font-medium class', () => {
      render(<TokenSelectButton symbol="ETH" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('font-medium');
    });

    it('should have transition-colors class', () => {
      render(<TokenSelectButton symbol="ETH" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('transition-colors');
    });
  });

  describe('edge cases', () => {
    it('should handle empty symbol', () => {
      render(<TokenSelectButton symbol="" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle lowercase symbols', () => {
      render(<TokenSelectButton symbol="eth" />);
      expect(screen.getByText('eth')).toBeInTheDocument();
    });

    it('should handle symbols with spaces', () => {
      render(<TokenSelectButton symbol="TKN A" />);
      expect(screen.getByText('TKN A')).toBeInTheDocument();
    });
  });
});
