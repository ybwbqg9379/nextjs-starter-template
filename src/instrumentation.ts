import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (!process.env.SENTRY_DSN) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Sentry] SENTRY_DSN is not set -- server runtime error monitoring is disabled. ' +
          'Set both SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN for full coverage.'
      );
    }
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    if (!process.env.SENTRY_DSN) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Sentry] SENTRY_DSN is not set -- edge runtime error monitoring is disabled. ' +
          'Set both SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN for full coverage.'
      );
    }
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
