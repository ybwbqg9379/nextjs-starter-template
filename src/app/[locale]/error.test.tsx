import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from '@/app/[locale]/error';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock @sentry/nextjs
const mockCaptureException = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

describe('ErrorPage', () => {
  const mockReset = vi.fn();
  const testError = new Error('Test error message');

  beforeEach(() => {
    mockCaptureException.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders error title and description', () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('title');
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('renders the try again button', () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: 'tryAgain' })).toBeInTheDocument();
  });

  it('calls reset when try again button is clicked', () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    fireEvent.click(screen.getByRole('button', { name: 'tryAgain' }));
    expect(mockReset).toHaveBeenCalledOnce();
  });

  it('reports error to Sentry', () => {
    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(mockCaptureException).toHaveBeenCalledWith(testError);
  });

  it('shows error message in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(<ErrorPage error={testError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    vi.unstubAllEnvs();
  });
});
