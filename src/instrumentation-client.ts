// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Sentry] NEXT_PUBLIC_SENTRY_DSN is not set -- browser error monitoring is disabled. ' +
      'Set both SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN for full coverage.'
  );
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Adjust sampling rate per environment: 20% in production, 100% elsewhere.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // PII (IP, cookies, etc.) is NOT sent by default.
  // Enable only after confirming privacy policy / GDPR compliance.
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
