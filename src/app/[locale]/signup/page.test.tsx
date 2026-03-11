import { setRequestLocale } from 'next-intl/server';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SignupPage from '@/app/[locale]/signup/page';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/signup-form', () => ({
  SignupForm: () => <div data-testid="signup-form">SignupForm</div>,
}));

vi.mock('@/components/ui/page-center', () => ({
  PageCenter: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

describe('SignupPage', () => {
  it('calls setRequestLocale with the correct locale', async () => {
    await SignupPage({ params: Promise.resolve({ locale: 'en' }) });
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders SignupForm inside PageCenter', async () => {
    const page = await SignupPage({ params: Promise.resolve({ locale: 'zh' }) });
    render(page);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });
});
