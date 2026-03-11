'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { LoginSchema, SignupSchema, type AuthState } from '@/lib/auth/validation';
import { createClient } from '@/lib/supabase/server';

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

function redirectToLocale(locale: string): never {
  const path = locale ? `/${locale}` : '/';
  redirect(path as Parameters<typeof redirect>[0]);
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { formError: 'invalidCredentials' };
  }

  const locale = String(formData.get('locale') || '');
  revalidatePath('/', 'layout');
  redirectToLocale(locale);
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const origin = await getOrigin();
  const locale = String(formData.get('locale') || '');
  const nextPath = locale ? `/${locale}` : '/';
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    return { formError: 'signupFailed' };
  }

  return { success: true };
}

export async function logout(formData: FormData): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = String(formData.get('locale') || '');
  revalidatePath('/', 'layout');
  redirectToLocale(locale);
}
