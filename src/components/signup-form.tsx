'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { signup } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { initialAuthState } from '@/lib/auth/validation';

export function SignupForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(signup, initialAuthState);

  if (state.success) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <h1 className="text-h2 font-semibold">{t('signup')}</h1>
        <p className="text-body-sm text-muted-foreground">{t('checkEmail')}</p>
        <Link
          href="/login"
          className="min-h-11 min-w-11 inline-flex items-center text-primary hover:underline text-body-sm"
        >
          {t('login')}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-h2 font-semibold">{t('signup')}</h1>
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
          autoComplete="new-password"
          required
          className="h-input rounded-md border border-input bg-background px-3 text-body-sm"
        />
        {state.fieldErrors?.password && (
          <p role="alert" className="text-caption text-destructive">
            {t(state.fieldErrors.password[0])}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-body-sm font-medium">
          {t('confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="h-input rounded-md border border-input bg-background px-3 text-body-sm"
        />
        {state.fieldErrors?.confirmPassword && (
          <p role="alert" className="text-caption text-destructive">
            {t(state.fieldErrors.confirmPassword[0])}
          </p>
        )}
      </div>

      {state.formError && (
        <p role="alert" className="text-body-sm text-destructive">
          {t(state.formError)}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t('signingUp') : t('signupSubmit')}
      </Button>

      <p className="text-center text-body-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link
          href="/login"
          className="min-h-11 min-w-11 inline-flex items-center text-primary hover:underline"
        >
          {t('login')}
        </Link>
      </p>
    </form>
  );
}
