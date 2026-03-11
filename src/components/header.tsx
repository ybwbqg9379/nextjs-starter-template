'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Layers } from 'lucide-react';

import { logout } from '@/app/actions/auth';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export function Header({ userEmail }: { userEmail?: string | null }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <header className="flex items-center justify-between border-b border-border px-4 lg:px-6 py-4">
      <div className="flex items-center gap-2">
        <Layers className="size-icon-lg text-primary" />
        <span className="hidden sm:inline text-h3 font-semibold">{t('common.appName')}</span>
      </div>
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-3 md:gap-6 text-body-sm text-muted-foreground mr-2 md:mr-4">
          <Link href="/" className="text-foreground font-medium hover:underline">
            {t('nav.home')}
          </Link>
          <span className="cursor-pointer hover:text-foreground transition-colors">
            {t('nav.about')}
          </span>
          <span className="cursor-pointer hover:text-foreground transition-colors">
            {t('nav.settings')}
          </span>
        </nav>
        {userEmail ? (
          <form action={logout} className="flex items-center gap-2">
            <input type="hidden" name="locale" value={locale} />
            <span className="text-caption text-muted-foreground hidden sm:inline">{userEmail}</span>
            <Button type="submit" variant="ghost" size="sm" className="min-h-11 min-w-11">
              {t('auth.logout')}
            </Button>
          </form>
        ) : (
          <Link
            href="/login"
            className="min-h-11 min-w-11 inline-flex items-center text-body-sm font-medium text-primary hover:underline mr-1"
          >
            {t('auth.login')}
          </Link>
        )}
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
