/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../../../components/ui/Input';

describe('Input', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render label as label element', () => {
      render(<Input label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label.tagName).toBe('LABEL');
    });
  });

  describe('input types', () => {
    it('should render text input', () => {
      render(<Input type="text" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should render password input', () => {
      render(<Input type="password" />);
      const input = screen.getByDisplayValue('');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render email input', () => {
      render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('placeholder', () => {
    it('should render placeholder', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Enter text...');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not be disabled when disabled prop is false', () => {
      render(<Input disabled={false} />);
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  describe('error state', () => {
    it('should display error message', () => {
      render(<Input error="This is an error" />);
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });
  });

  describe('rightElement', () => {
    it('should render rightElement', () => {
      render(<Input rightElement={<span>USD</span>} />);
      expect(screen.getByText('USD')).toBeInTheDocument();
    });
  });

  describe('leftElement', () => {
    it('should render leftElement', () => {
      render(<Input leftElement={<span>$</span>} />);
      expect(screen.getByText('$')).toBeInTheDocument();
    });
  });

  describe('both elements', () => {
    it('should render both left and right elements', () => {
      render(<Input leftElement={<span>$</span>} rightElement={<span>USD</span>} />);
      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
    });
  });

  describe('value and onChange', () => {
    it('should display value', () => {
      render(<Input value="Test value" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('Test value');
    });

    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with event', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'test' }),
        })
      );
    });
  });

  describe('custom className', () => {
    it('should merge custom className with base styles', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('custom-input');
    });
  });

  describe('html attributes', () => {
    it('should pass through html input attributes', () => {
      render(<Input name="testInput" required minLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'testInput');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('minlength', '5');
    });

    it('should support aria attributes', () => {
      render(<Input aria-label="test-input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'test-input');
    });

    it('should support data attributes', () => {
      render(<Input data-testid="test-input" />);
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string value', () => {
      render(<Input value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('should handle long text', () => {
      const longText = 'a'.repeat(1000);
      render(<Input value={longText} onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue(longText);
    });
  });
});
