'use client';

import { useTranslations } from 'next-intl';

import { Layers } from 'lucide-react';

import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const t = useTranslations();

  return (
    <header className="flex items-center justify-between border-b border-border px-4 lg:px-6 py-4">
      <div className="flex items-center gap-2">
        <Layers className="size-icon-lg text-primary" />
        <span className="hidden sm:inline text-h3 font-semibold">{t('common.appName')}</span>
      </div>
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-3 md:gap-6 text-body-sm text-muted-foreground mr-2 md:mr-4">
          <span className="text-foreground font-medium">{t('nav.home')}</span>
          <span className="cursor-pointer hover:text-foreground transition-colors">
            {t('nav.about')}
          </span>
          <span className="cursor-pointer hover:text-foreground transition-colors">
            {t('nav.settings')}
          </span>
        </nav>
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
