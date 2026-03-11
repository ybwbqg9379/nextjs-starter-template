import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button';
import { PageCenter } from '@/components/ui/page-center';
import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('error');

  return (
    <PageCenter>
      <h1 className="text-display font-bold leading-tight text-foreground">404</h1>
      <p className="mt-4 text-h2 font-semibold leading-snug text-foreground">{t('notFound')}</p>
      <p className="mt-2 text-body text-muted-foreground">{t('notFoundDesc')}</p>
      <Link
        href="/"
        className={buttonVariants({ variant: 'primary', size: 'lg', className: 'mt-8' })}
      >
        {t('goHome')}
      </Link>
    </PageCenter>
  );
}
