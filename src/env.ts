import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables schema.
   * These are NOT exposed to the client.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN must be set together for full
    // three-runtime coverage. Runtime warnings fire if either is missing.
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
    // TODO: Add your server-side env vars here
    // DATABASE_URL: z.string().url(),
    // API_KEY: z.string().min(1),
  },

  /**
   * Client-side environment variables schema.
   * Must be prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    // NEXT_PUBLIC_APP_URL: z.string().url(),
  },

  /**
   * Explicit destructure from process.env for edge/client bundling.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // DATABASE_URL: process.env.DATABASE_URL,
    // API_KEY: process.env.API_KEY,
    // NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Skip validation in certain environments (e.g., Docker builds).
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined.
   */
  emptyStringAsUndefined: true,
});
