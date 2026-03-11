import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageCenter } from '@/components/ui/page-center';

describe('PageCenter', () => {
  it('renders children', () => {
    render(
      <PageCenter>
        <span>Content</span>
      </PageCenter>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies centering layout classes', () => {
    const { container } = render(
      <PageCenter>
        <span>Test</span>
      </PageCenter>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex-1', 'items-center', 'justify-center');
  });

  it('merges custom className', () => {
    const { container } = render(
      <PageCenter className="gap-4">
        <span>Test</span>
      </PageCenter>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex-1', 'gap-4');
  });
});
