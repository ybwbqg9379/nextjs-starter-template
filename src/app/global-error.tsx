'use client';

import { useEffect } from 'react';

import * as Sentry from '@sentry/nextjs';

/**
 * Root-level error boundary. Renders when the root layout itself crashes.
 *
 * Constraints:
 * - No locale context (next-intl provider is inside the crashed layout)
 * - CSS/Tailwind may be unavailable -- use inline styles only
 * - Use hardcoded Chinese (defaultLocale = "zh") for user-facing text
 *
 * Design Token mapping (sync when tokens change):
 * - #09090b = --background (dark)
 * - #fafafa = --foreground (dark)
 * - #a1a1aa = --muted-foreground (dark)
 * - 1.5rem  ~ text-h3 token
 * - 1rem    ~ text-body token
 * - 0.875rem ~ text-body-sm token
 * - 0.375rem ~ rounded-md
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Root layout crashed -- no locale context available. Use defaultLocale (zh).
  return (
    <html lang="zh">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#09090b' /* --background */,
          color: '#fafafa' /* --foreground */,
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem' /* ~text-h3 */,
            fontWeight: 700,
            margin: '0 0 0.5rem',
          }}
        >
          {'\u51FA\u9519\u4E86'}
        </h1>
        <p
          style={{
            fontSize: '1rem' /* ~text-body */,
            color: '#a1a1aa' /* --muted-foreground */,
            margin: '0 0 2rem',
          }}
        >
          {
            '\u53D1\u751F\u4E86\u610F\u5916\u9519\u8BEF\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5\u3002'
          }
        </p>
        <button
          onClick={reset}
          style={{
            padding: '0.625rem 2rem',
            fontSize: '0.875rem' /* ~text-body-sm */,
            fontWeight: 500,
            color: '#09090b' /* --background */,
            backgroundColor: '#fafafa' /* --foreground */,
            border: 'none',
            borderRadius: '0.375rem' /* rounded-md */,
            cursor: 'pointer',
          }}
        >
          {'\u5237\u65B0\u9875\u9762'}
        </button>
      </body>
    </html>
  );
}
