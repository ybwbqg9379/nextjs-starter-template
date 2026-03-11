import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/header';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
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
    expect(screen.getByText('nav.home')).toBeInTheDocument();
    expect(screen.getByText('nav.about')).toBeInTheDocument();
    expect(screen.getByText('nav.settings')).toBeInTheDocument();
  });

  it('renders language and theme toggles', () => {
    render(<Header />);
    expect(screen.getByText('LanguageToggle')).toBeInTheDocument();
    expect(screen.getByText('ThemeToggle')).toBeInTheDocument();
  });
});
