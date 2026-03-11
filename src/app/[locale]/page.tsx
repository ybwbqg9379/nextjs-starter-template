import { setRequestLocale } from 'next-intl/server';

import { HomeContent } from '@/components/home-content';

type Params = Promise<{ locale: string }>;

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}
