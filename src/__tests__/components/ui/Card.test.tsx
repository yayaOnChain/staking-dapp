/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";

describe('Card', () => {
  describe('rendering', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      render(<Card>Test</Card>);
      const card = screen.getByText('Test').parentElement;
      expect(card?.tagName).toBe('DIV');
    });
  });

  describe('variants', () => {
    it('should apply default variant', () => {
      render(<Card>Default</Card>);
      expect(screen.getByText('Default').parentElement).toBeInTheDocument();
    });

    it('should apply outlined variant', () => {
      render(<Card variant="outlined">Outlined</Card>);
      expect(screen.getByText('Outlined').parentElement).toBeInTheDocument();
    });

    it('should apply elevated variant', () => {
      render(<Card variant="elevated">Elevated</Card>);
      expect(screen.getByText('Elevated').parentElement).toBeInTheDocument();
    });
  });

  describe('padding', () => {
    it('should render with padding', () => {
      render(<Card padding="lg">Large</Card>);
      expect(screen.getByText('Large').parentElement).toBeInTheDocument();
    });

    it('should apply different padding sizes', () => {
      const { rerender } = render(<Card padding="sm">Small</Card>);
      expect(screen.getByText('Small')).toBeInTheDocument();

      rerender(<Card padding="md">Medium</Card>);
      expect(screen.getByText('Medium')).toBeInTheDocument();

      rerender(<Card padding="lg">Large</Card>);
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should accept custom className', () => {
      render(<Card className="custom-class">Test</Card>);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('html attributes', () => {
    it('should pass through html div attributes', () => {
      render(<Card data-testid="test-card" id="card-1">Test</Card>);
      const card = screen.getByTestId('test-card');
      expect(card).toHaveAttribute('id', 'card-1');
    });

    it('should support data attributes', () => {
      render(<Card data-testid="test-card">Test</Card>);
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });
  });
});

describe('CardHeader', () => {
  describe('rendering', () => {
    it('should render CardHeader with children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should render CardHeader', () => {
      render(<CardHeader>Header</CardHeader>);
      expect(screen.getByText('Header')).toBeInTheDocument();
    });
  });
});

describe('CardTitle', () => {
  describe('rendering', () => {
    it('should render CardTitle with children', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should render as h2 element', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should apply text styles', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.className).toMatch(/text-xl/);
    });
  });
});

describe('CardContent', () => {
  describe('rendering', () => {
    it('should render CardContent with children', () => {
      render(<CardContent>Content</CardContent>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});

describe('CardFooter', () => {
  describe('rendering', () => {
    it('should render CardFooter with children', () => {
      render(<CardFooter>Footer</CardFooter>);
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should render CardFooter', () => {
      render(<CardFooter>Footer</CardFooter>);
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
