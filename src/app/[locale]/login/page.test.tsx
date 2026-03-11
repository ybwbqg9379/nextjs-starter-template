import { setRequestLocale } from 'next-intl/server';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LoginPage from '@/app/[locale]/login/page';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/login-form', () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
}));

vi.mock('@/components/ui/page-center', () => ({
  PageCenter: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

describe('LoginPage', () => {
  it('calls setRequestLocale with the correct locale', async () => {
    await LoginPage({ params: Promise.resolve({ locale: 'en' }) });
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders LoginForm inside PageCenter', async () => {
    const page = await LoginPage({ params: Promise.resolve({ locale: 'zh' }) });
    render(page);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
