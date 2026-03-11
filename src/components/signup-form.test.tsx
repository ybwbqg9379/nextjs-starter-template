import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignupForm } from '@/components/signup-form';

// --- Mocks ---

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh',
}));

vi.mock('@/app/actions/auth', () => ({
  signup: vi.fn(),
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

describe('SignupForm', () => {
  beforeEach(() => {
    mockState = {};
    mockIsPending = false;
  });

  it('renders email, password, and confirmPassword fields', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText('email')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
    expect(screen.getByLabelText('confirmPassword')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<SignupForm />);

    expect(screen.getByRole('button', { name: 'signupSubmit' })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<SignupForm />);

    const link = screen.getByRole('link', { name: 'login' });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('includes hidden locale field', () => {
    const { container } = render(<SignupForm />);

    const hidden = container.querySelector('input[name="locale"]');
    expect(hidden).toHaveAttribute('value', 'zh');
  });

  it('displays email field error', () => {
    mockState = { fieldErrors: { email: ['invalidEmail'] } };

    render(<SignupForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('invalidEmail');
  });

  it('displays password field error', () => {
    mockState = { fieldErrors: { password: ['passwordMin'] } };

    render(<SignupForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('passwordMin');
  });

  it('displays confirmPassword field error', () => {
    mockState = { fieldErrors: { confirmPassword: ['passwordMismatch'] } };

    render(<SignupForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('passwordMismatch');
  });

  it('displays form error from state', () => {
    mockState = { formError: 'signupFailed' };

    render(<SignupForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('signupFailed');
  });

  it('shows pending text when submitting', () => {
    mockIsPending = true;

    render(<SignupForm />);

    expect(screen.getByRole('button')).toHaveTextContent('signingUp');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows success message when state.success is true', () => {
    mockState = { success: true };

    render(<SignupForm />);

    expect(screen.getByText('checkEmail')).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('shows link to login on success', () => {
    mockState = { success: true };

    render(<SignupForm />);

    const link = screen.getByRole('link', { name: 'login' });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('login link meets 44px touch target minimum', () => {
    render(<SignupForm />);

    const link = screen.getByRole('link', { name: 'login' });
    expect(link.className).toContain('min-h-11');
    expect(link.className).toContain('min-w-11');
  });

  it('login link on success state meets 44px touch target minimum', () => {
    mockState = { success: true };

    render(<SignupForm />);

    const link = screen.getByRole('link', { name: 'login' });
    expect(link.className).toContain('min-h-11');
    expect(link.className).toContain('min-w-11');
  });

  it('uses correct autocomplete attributes', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText('email')).toHaveAttribute('autoComplete', 'email');
    expect(screen.getByLabelText('password')).toHaveAttribute('autoComplete', 'new-password');
    expect(screen.getByLabelText('confirmPassword')).toHaveAttribute(
      'autoComplete',
      'new-password'
    );
  });
});
