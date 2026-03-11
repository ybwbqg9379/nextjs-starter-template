import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
    expect(button).not.toHaveClass('bg-primary');
  });

  it('applies size lg by default', () => {
    render(<Button>Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-button-lg');
  });

  it('applies custom className', () => {
    render(<Button className="mt-4">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('mt-4');
  });

  it('passes through HTML button props', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
