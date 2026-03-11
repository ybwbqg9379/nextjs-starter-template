# Changelog

All notable changes to this project will be documented in this file.

<!-- Format: ## [version] - YYYY-MM-DD or ## YYYY-MM-DD for pre-release -->

## Initial Template

- **[2026-03-11]** Migrate to Zod 4 top-level APIs: `z.string().email()` -> `z.pipe(z.string().trim(), z.email())`, `z.string().url()` -> `z.url()`, `error.flatten()` -> `z.flattenError(error)` -- eliminates all deprecation warnings
- **[2026-03-11]** Email + Password authentication with email verification: server actions (login/signup/logout), Zod validation with i18n error keys, email confirmation route with open redirect prevention, login/signup form components (useActionState, 44px touch targets), auth-aware Header with logout, middleware auth redirect for authenticated users on login/signup pages; 66 new tests, 156 total at 100% coverage
- **[2026-03-11]** CI fix: add `SKIP_ENV_VALIDATION=true` to build step so CI doesn't fail on missing Supabase credentials
- **[2026-03-11]** Supabase SSR integration: `@supabase/supabase-js` + `@supabase/ssr`; three client factories (browser/server/middleware); `proxy.ts` session refresh + next-intl composition with full cookie option forwarding; `env.ts` fail-fast validation for `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`; new API key format (`sb_publishable_` / `sb_secret_`); 14 new tests (proxy + middleware + server)
- Next.js 16 with App Router and Turbopack
- TypeScript strict mode with type-safe environment variables (@t3-oss/env-nextjs + Zod)
- Tailwind CSS 4 with oklch design tokens and @utility shorthands
- shadcn/ui (Nova theme) with Button and PageCenter components
- next-intl i18n (zh/en) with ESLint zero-leak enforcement and CI key parity checks
- next-themes dark/light mode with hydration-safe toggle
- Sentry error monitoring across server, edge, and browser runtimes
- Vitest 4 + React Testing Library with 100% coverage threshold
- ESLint 9 flat config with zero-warning policy
- Prettier with import sorting
- husky pre-commit hooks: CHANGELOG + design tokens + lint-staged + coverage gate
- commitlint with Conventional Commits
- GitHub Actions CI: quality checks + documentation checks
- Dependabot with grouped dependency updates
- Design token compliance checker (blocks raw Tailwind values)
- Security headers (HSTS, X-Frame-Options, CSP-adjacent policies)
