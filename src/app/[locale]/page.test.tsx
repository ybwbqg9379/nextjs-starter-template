import { setRequestLocale } from 'next-intl/server';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HomePage from '@/app/[locale]/page';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock HomeContent -- renders a semantic <main> matching the real component structure
vi.mock('@/components/home-content', () => ({
  HomeContent: () => (
    <main>
      <h1>home.title</h1>
    </main>
  ),
}));

describe('HomePage', () => {
  it('calls setRequestLocale with the correct locale', async () => {
    await HomePage({ params: Promise.resolve({ locale: 'en' }) });
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders HomeContent with a semantic main landmark', async () => {
    const page = await HomePage({ params: Promise.resolve({ locale: 'zh' }) });
    render(page);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('home.title');
  });
});
