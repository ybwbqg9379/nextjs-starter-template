import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import GlobalError from '@/app/global-error';

// Mock @sentry/nextjs
const mockCaptureException = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

// Suppress React DOM nesting warning: <html> cannot be a child of <div>.
// RTL wraps rendered output in a <div>, which is unavoidable for global-error
// (it must return <html> as required by Next.js App Router).
beforeAll(() => {
  const originalError = globalThis.console.error;
  vi.spyOn(globalThis.console, 'error').mockImplementation((...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('cannot be a child of')) return;
    originalError.call(globalThis.console, ...args);
  });
});

describe('GlobalError', () => {
  const testError = new Error('Root layout crash');
  const mockReset = vi.fn();

  afterEach(() => {
    mockCaptureException.mockClear();
    mockReset.mockClear();
  });

  it('renders Chinese error title and description', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('\u51fa\u9519\u4e86');
    expect(
      screen.getByText(
        '\u53d1\u751f\u4e86\u610f\u5916\u9519\u8bef\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u91cd\u8bd5\u3002'
      )
    ).toBeInTheDocument();
  });

  it('renders a refresh button with Chinese text', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: '\u5237\u65b0\u9875\u9762' })).toBeInTheDocument();
  });

  it('calls reset when refresh button is clicked', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    fireEvent.click(screen.getByRole('button', { name: '\u5237\u65b0\u9875\u9762' }));
    expect(mockReset).toHaveBeenCalledOnce();
  });

  it('reports error to Sentry', () => {
    render(<GlobalError error={testError} reset={mockReset} />);
    expect(mockCaptureException).toHaveBeenCalledWith(testError);
  });

  it('sets html lang to zh (defaultLocale)', () => {
    // jsdom strips nested <html> elements, so use renderToStaticMarkup for this assertion
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { renderToStaticMarkup } = require('react-dom/server');
    const markup = renderToStaticMarkup(
      <GlobalError error={testError} reset={mockReset} />
    ) as string;
    expect(markup).toContain('<html lang="zh">');
  });
});
