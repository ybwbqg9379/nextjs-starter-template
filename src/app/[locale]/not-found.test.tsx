import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NotFoundPage from '@/app/[locale]/not-found';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n navigation Link as a plain anchor
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders not found title and description', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('notFound')).toBeInTheDocument();
    expect(screen.getByText('notFoundDesc')).toBeInTheDocument();
  });

  it('renders a link to go home', () => {
    render(<NotFoundPage />);
    const link = screen.getByRole('link', { name: 'goHome' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('uses PageCenter layout', () => {
    const { container } = render(<NotFoundPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex-1', 'items-center', 'justify-center');
  });
});
