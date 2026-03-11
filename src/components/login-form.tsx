'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { initialAuthState } from '@/lib/auth/validation';

export function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(login, initialAuthState);

  return (
    <form action={formAction} noValidate className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-h2 font-semibold">{t('login')}</h1>
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-body-sm font-medium">
          {t('email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-input rounded-md border border-input bg-background px-3 text-body-sm"
        />
        {state.fieldErrors?.email && (
          <p role="alert" className="text-caption text-destructive">
            {t(state.fieldErrors.email[0])}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-body-sm font-medium">
          {t('password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-input rounded-md border border-input bg-background px-3 text-body-sm"
        />
        {state.fieldErrors?.password && (
          <p role="alert" className="text-caption text-destructive">
            {t(state.fieldErrors.password[0])}
          </p>
        )}
      </div>

      {state.formError && (
        <p role="alert" className="text-body-sm text-destructive">
          {t(state.formError)}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t('loggingIn') : t('loginSubmit')}
      </Button>

      <p className="text-center text-body-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link
          href="/signup"
          className="min-h-11 min-w-11 inline-flex items-center text-primary hover:underline"
        >
          {t('signup')}
        </Link>
      </p>
    </form>
  );
}
