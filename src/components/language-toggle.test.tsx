import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LanguageToggle } from '@/components/language-toggle';

const mockReplace = vi.fn();

vi.mock('next-intl', () => ({
  useLocale: () => 'zh',
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/',
}));

describe('LanguageToggle', () => {
  it('renders the switch label from i18n', () => {
    render(<LanguageToggle />);
    expect(screen.getByText('switchLangLabel')).toBeInTheDocument();
  });

  it('renders a button with aria-label', () => {
    render(<LanguageToggle />);
    const button = screen.getByRole('button', { name: 'switchLang' });
    expect(button).toBeInTheDocument();
  });

  it('switches from zh to en on click', () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/', { locale: 'en' });
  });

  it('switches from en to zh when locale is en', async () => {
    const nextIntl = await import('next-intl');
    vi.spyOn(nextIntl, 'useLocale').mockReturnValue('en');

    render(<LanguageToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockReplace).toHaveBeenCalledWith('/', { locale: 'zh' });
  });
});
