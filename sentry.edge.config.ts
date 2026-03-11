// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust sampling rate per environment: 20% in production, 100% elsewhere.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // PII (IP, cookies, etc.) is NOT sent by default.
  // Enable only after confirming privacy policy / GDPR compliance.
  sendDefaultPii: false,
});
