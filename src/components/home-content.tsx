'use client';

import { useTranslations } from 'next-intl';

import { Globe, Layers, Shield } from 'lucide-react';

import { FeatureCard } from '@/components/feature-card';
import { Button } from '@/components/ui/button';

export function HomeContent() {
  const t = useTranslations();

  return (
    <>
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 lg:px-6 py-12 lg:py-20">
        <div className="w-full max-w-content text-center">
          <h1 className="text-display font-bold leading-tight tracking-tight">{t('home.title')}</h1>
          <p className="mt-4 text-h3 leading-snug text-muted-foreground">{t('home.subtitle')}</p>

          <Button className="mt-10 w-full sm:w-auto">{t('home.getStarted')}</Button>
        </div>

        {/* Feature Cards */}
        <div className="mt-10 lg:mt-20 grid w-full max-w-content-lg grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Shield className="size-icon-lg text-primary" />}
            title={t('home.features.typeSafety')}
            description={t('home.features.typeSafetyDesc')}
          />
          <FeatureCard
            icon={<Globe className="size-icon-lg text-primary" />}
            title={t('home.features.i18n')}
            description={t('home.features.i18nDesc')}
          />
          <FeatureCard
            icon={<Layers className="size-icon-lg text-primary" />}
            title={t('home.features.designSystem')}
            description={t('home.features.designSystemDesc')}
          />
        </div>
      </main>
    </>
  );
}
