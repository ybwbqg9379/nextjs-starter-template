'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageToggle() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === 'zh' ? 'en' : 'zh';

  function handleSwitch() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      aria-label={t('switchLang')}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {t('switchLangLabel')}
    </button>
  );
}
