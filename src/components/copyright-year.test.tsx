import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CopyrightYear } from '@/components/copyright-year';

describe('CopyrightYear', () => {
  it('renders the current year', () => {
    render(<CopyrightYear />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(currentYear)).toBeInTheDocument();
  });

  it('renders a specific year when Date is mocked', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-06-15'));

    render(<CopyrightYear />);
    expect(screen.getByText('2030')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
