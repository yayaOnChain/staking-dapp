/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBox } from '../../../components/ui/StatBox';

describe('StatBox', () => {
  describe('rendering', () => {
    it('should render StatBox with label and value', () => {
      render(<StatBox label="Test Label" value="123" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should render label with correct text', () => {
      render(<StatBox label="Pool Balance" value="100" />);
      expect(screen.getByText('Pool Balance')).toBeInTheDocument();
    });

    it('should render value with correct text', () => {
      render(<StatBox label="Balance" value="500.50" />);
      expect(screen.getByText('500.50')).toBeInTheDocument();
    });

    it('should render value in monospace font', () => {
      render(<StatBox label="Value" value="123" />);
      const value = screen.getByText('123');
      expect(value.className).toContain('font-mono');
    });
  });

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<StatBox label="Default" value="100" />);
      const container = screen.getByText('Default').parentElement;
      expect(container?.className).toMatch(/bg-gray-900/);
    });

    it('should apply success variant styles', () => {
      render(<StatBox label="Success" value="100" variant="success" />);
      const value = screen.getByText('100');
      expect(value.className).toMatch(/text-green-400/);
    });

    it('should apply warning variant styles', () => {
      render(<StatBox label="Warning" value="100" variant="warning" />);
      const value = screen.getByText('100');
      expect(value.className).toMatch(/text-yellow-400/);
    });

    it('should apply danger variant styles', () => {
      render(<StatBox label="Danger" value="100" variant="danger" />);
      const value = screen.getByText('100');
      expect(value.className).toMatch(/text-red-400/);
    });
  });

  describe('custom className', () => {
    it('should merge custom className with base styles', () => {
      render(<StatBox label="Test" value="100" className="custom-class" />);
      // The className is on the root div which contains both label and value
      const container = screen.getByText('Test').parentElement;
      expect(container?.className).toMatch(/custom-class/);
    });
  });

  describe('value formatting', () => {
    it('should display numeric values', () => {
      render(<StatBox label="Number" value="42" />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display decimal values', () => {
      render(<StatBox label="Decimal" value="3.14159" />);
      expect(screen.getByText('3.14159')).toBeInTheDocument();
    });

    it('should display large numbers', () => {
      render(<StatBox label="Large" value="1000000.50" />);
      expect(screen.getByText('1000000.50')).toBeInTheDocument();
    });

    it('should display zero values', () => {
      render(<StatBox label="Zero" value="0" />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display token amounts', () => {
      render(<StatBox label="Tokens" value="1,234.567" />);
      expect(screen.getByText('1,234.567')).toBeInTheDocument();
    });
  });

  describe('label styling', () => {
    it('should apply label styles', () => {
      render(<StatBox label="Label" value="100" />);
      const label = screen.getByText('Label');
      expect(label.className).toContain('text-xs');
      expect(label.className).toContain('text-gray-400');
    });
  });

  describe('value styling', () => {
    it('should apply value styles', () => {
      render(<StatBox label="Label" value="100" />);
      const value = screen.getByText('100');
      expect(value.className).toContain('text-xl');
      expect(value.className).toContain('font-mono');
    });
  });

  describe('accessibility', () => {
    it('should support data attributes', () => {
      render(<StatBox label="Test" value="100" data-testid="stat-box" />);
      expect(screen.getByTestId('stat-box')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very long labels', () => {
      const longLabel = 'This is a very long label that might wrap';
      render(<StatBox label={longLabel} value="100" />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle special characters in value', () => {
      render(<StatBox label="Special" value="$100.00" />);
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    it('should handle scientific notation', () => {
      render(<StatBox label="Scientific" value="1e+10" />);
      expect(screen.getByText('1e+10')).toBeInTheDocument();
    });
  });
});
