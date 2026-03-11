'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import * as Sentry from '@sentry/nextjs';

import { Button } from '@/components/ui/button';
import { PageCenter } from '@/components/ui/page-center';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <PageCenter>
      <h1 className="text-h1 font-bold leading-tight text-foreground">{t('title')}</h1>
      <p className="mt-4 text-h3 leading-snug text-muted-foreground">{t('description')}</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-6 max-w-content-sm overflow-auto rounded-lg bg-muted p-4 text-left text-body-sm text-muted-foreground">
          {error.message}
        </pre>
      )}
      <Button onClick={reset} className="mt-8">
        {t('tryAgain')}
      </Button>
    </PageCenter>
  );
}
