import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from '@/components/login-form';

// --- Mocks ---

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/app/actions/auth', () => ({
  login: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

let mockState = {};
const mockFormAction = vi.fn();
let mockIsPending = false;

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: () => [mockState, mockFormAction, mockIsPending],
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    mockState = {};
    mockIsPending = false;
  });

  it('renders email and password fields with labels', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText('email')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: 'loginSubmit' })).toBeInTheDocument();
  });

  it('renders link to signup page', () => {
    render(<LoginForm />);

    const link = screen.getByRole('link', { name: 'signup' });
    expect(link).toHaveAttribute('href', '/signup');
  });

  it('includes hidden locale field', () => {
    const { container } = render(<LoginForm />);

    const hidden = container.querySelector('input[name="locale"]');
    expect(hidden).toHaveAttribute('value', 'en');
  });

  it('displays email field error from state', () => {
    mockState = { fieldErrors: { email: ['invalidEmail'] } };

    render(<LoginForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('invalidEmail');
  });

  it('displays password field error from state', () => {
    mockState = { fieldErrors: { password: ['passwordRequired'] } };

    render(<LoginForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('passwordRequired');
  });

  it('displays form error from state', () => {
    mockState = { formError: 'invalidCredentials' };

    render(<LoginForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('invalidCredentials');
  });

  it('shows pending text when submitting', () => {
    mockIsPending = true;

    render(<LoginForm />);

    expect(screen.getByRole('button')).toHaveTextContent('loggingIn');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders form with noValidate attribute', () => {
    const { container } = render(<LoginForm />);

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('noValidate');
  });

  it('uses correct autocomplete attributes', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText('email')).toHaveAttribute('autoComplete', 'email');
    expect(screen.getByLabelText('password')).toHaveAttribute('autoComplete', 'current-password');
  });

  it('signup link meets 44px touch target minimum', () => {
    render(<LoginForm />);

    const link = screen.getByRole('link', { name: 'signup' });
    expect(link.className).toContain('min-h-11');
    expect(link.className).toContain('min-w-11');
  });
});
