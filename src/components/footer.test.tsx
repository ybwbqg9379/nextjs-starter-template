import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Footer } from '@/components/footer';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('Footer', () => {
  it('renders the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/common\.copyright/)).toBeInTheDocument();
  });

  it('renders the current year from CopyrightYear', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });
});
