import { setRequestLocale } from 'next-intl/server';

import { LoginForm } from '@/components/login-form';
import { PageCenter } from '@/components/ui/page-center';

type Params = Promise<{ locale: string }>;

export default async function LoginPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageCenter>
      <LoginForm />
    </PageCenter>
  );
}
