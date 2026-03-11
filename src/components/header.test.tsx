import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/header';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh',
}));

vi.mock('@/app/actions/auth', () => ({
  logout: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/language-toggle', () => ({
  LanguageToggle: () => <button type="button">LanguageToggle</button>,
}));

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">ThemeToggle</button>,
}));

describe('Header', () => {
  it('renders the app name', () => {
    render(<Header />);
    expect(screen.getByText('common.appName')).toBeInTheDocument();
  });

  it('renders a banner landmark', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders a navigation landmark', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(<Header />);
    const homeLink = screen.getByRole('link', { name: 'nav.home' });
    expect(homeLink).toHaveAttribute('href', '/');
    expect(screen.getByText('nav.about')).toBeInTheDocument();
    expect(screen.getByText('nav.settings')).toBeInTheDocument();
  });

  it('renders language and theme toggles', () => {
    render(<Header />);
    expect(screen.getByText('LanguageToggle')).toBeInTheDocument();
    expect(screen.getByText('ThemeToggle')).toBeInTheDocument();
  });

  it('shows login link when no user is provided', () => {
    render(<Header />);
    const loginLink = screen.getByRole('link', { name: 'auth.login' });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows login link when userEmail is null', () => {
    render(<Header userEmail={null} />);
    expect(screen.getByRole('link', { name: 'auth.login' })).toBeInTheDocument();
  });

  it('shows email and logout button when user is authenticated', () => {
    render(<Header userEmail="test@example.com" />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.logout' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'auth.login' })).not.toBeInTheDocument();
  });

  it('includes hidden locale field in logout form', () => {
    const { container } = render(<Header userEmail="test@example.com" />);
    const hidden = container.querySelector('input[name="locale"]');
    expect(hidden).toHaveAttribute('value', 'zh');
  });

  it('login link meets 44px touch target minimum', () => {
    render(<Header />);
    const loginLink = screen.getByRole('link', { name: 'auth.login' });
    expect(loginLink.className).toContain('min-h-11');
    expect(loginLink.className).toContain('min-w-11');
  });

  it('logout button meets 44px touch target minimum', () => {
    render(<Header userEmail="test@example.com" />);
    const logoutBtn = screen.getByRole('button', { name: 'auth.logout' });
    expect(logoutBtn.className).toContain('min-h-11');
  });
});
