import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loading from '@/app/[locale]/loading';

describe('Loading', () => {
  it('renders a spinner with status role', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('uses PageCenter layout', () => {
    const { container } = render(<Loading />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex-1', 'items-center', 'justify-center');
  });
});
