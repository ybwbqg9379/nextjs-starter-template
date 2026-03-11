import { setRequestLocale } from 'next-intl/server';

import { SignupForm } from '@/components/signup-form';
import { PageCenter } from '@/components/ui/page-center';

type Params = Promise<{ locale: string }>;

export default async function SignupPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageCenter>
      <SignupForm />
    </PageCenter>
  );
}
