'use client';

import { useTranslations } from 'next-intl';

import { CopyrightYear } from '@/components/copyright-year';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border px-4 lg:px-6 py-6 text-center text-body-sm text-muted-foreground">
      {t('common.copyright')} <CopyrightYear />
    </footer>
  );
}
