# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

<!-- TODO: Replace with your project description -->

My App -- a Next.js 16 application with App Router, Turbopack, and production-grade infrastructure.

## Commands

```bash
npm run dev              # Dev server (Turbopack), auto-redirects to /zh
npm run build            # Production build
npm run lint             # ESLint (zero-warning policy: --max-warnings 0)
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier format all files
npm run format:check     # Prettier check (no modification)
npm run typecheck        # tsc --noEmit
npm run validate         # Full gate: format:check + lint + typecheck + test + build
npm run test             # Vitest
npm run test:watch       # Vitest watch mode
npx vitest run src/lib/utils.test.ts   # Run a single test file
```

Pre-commit hooks (husky + lint-staged) auto-run ESLint and Prettier on staged files. Commit messages are validated by commitlint.

## Architecture

### Routing & i18n

- `src/proxy.ts` is the Next.js middleware (renamed from `middleware.ts` for Next.js 16 compatibility). Refreshes the Supabase session first, then handles locale detection/redirect via `next-intl/middleware`, forwarding auth cookies with full options.
- App Router uses `src/app/[locale]/` dynamic segment. Locales: `en`, `zh` (default: `zh`).
- All UI strings come from `messages/en.json` and `messages/zh.json` -- zero hardcoded strings. `eslint-plugin-i18next` enforces this in `mode: all` (catches both JSX text and JS variable assignments). CI enforces 1:1 key parity between the two files.
- i18n utilities in `src/i18n/`: `routing.ts` (locale config), `request.ts` (server-side resolution), `navigation.ts` (type-safe `Link`, `redirect`, `useRouter`, `usePathname`).

### UI & Styling

- shadcn/ui (Nova theme, Radix primitives) -- components are copied into `src/components/ui/` (code ownership model, not a package dependency).
- `Button` component (`src/components/ui/button.tsx`) uses `class-variance-authority` (CVA) for variant/size-driven styling. Use it instead of raw `<button>` elements.
- `PageCenter` layout wrapper (`src/components/ui/page-center.tsx`) for centered content pages (error, not-found, loading).
- Shared `Header` and `Footer` components rendered at the `layout.tsx` level -- all sub-pages inherit navigation, language/theme toggles, and footer automatically.
- `next-themes` for dark/light mode switching (`attribute="class"`, `defaultTheme="system"`). `ThemeToggle` uses `useSyncExternalStore` for hydration safety.
- Tailwind CSS 4 with `@theme` CSS variables in oklch color space, defined in `src/app/globals.css`. Light and dark mode tokens.
- Utility: `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge).
- Lucide Icons only -- zero emoji anywhere in the project (UI, code, comments, docs, logs, scripts). Use plain text markers instead: `[PASS]`/`[FAIL]`, `[Yes]`/`[No]`, `NOTE:`, etc.
- **Design Tokens**: typography (`text-display`, `text-h1` ... `text-caption`), line-height (`leading-tight/snug/normal/relaxed`), component sizes (`size-icon-lg`, `h-button-lg`, `h-input`, `size-spinner`), container widths (`max-w-content`, `max-w-content-lg`). All defined as `@utility` shorthands in `globals.css`. Full spec: `docs/ui-design-tokens.md`.
- **Touch targets**: All interactive elements must meet 44px minimum (Apple HIG). Use `min-h-11 min-w-11` on buttons/toggles.
- **Prohibited**: hardcoded colors (`text-[#333]`), non-standard spacing (`p-[13px]`), raw Tailwind font sizes (`text-4xl`) -- use design tokens instead.
- **Responsive**: Mobile-first. Default styles target mobile, add `md:` / `lg:` for larger screens. Brand text hidden below `sm`, nav always visible.

### Environment & Config

- `src/env.ts` uses `@t3-oss/env-nextjs` + Zod for type-safe env validation. Server/client variable separation enforced.
- `.env.example` has the template. `SKIP_ENV_VALIDATION=1` bypasses validation for CI/Docker builds.
- `next.config.ts` wraps `next-intl` plugin and sets security headers (HSTS, X-Frame-Options, etc.). `typedRoutes: true` is enabled.
- Path alias: `@/*` maps to `./src/*`.

### Testing

- Vitest 4 + React Testing Library + jsdom. Config in `vitest.config.ts`.
- Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`).
- Test pattern: `src/**/*.{test,spec}.{ts,tsx}`.
- Coverage threshold: currently 100% (statements, branches, functions, lines). When codebase grows significantly, lowering to 90% or 85% is acceptable -- update `vitest.config.ts` thresholds, README, and ARCHITECTURE.md together.
- Pre-commit runs `npm run test:coverage` (with coverage thresholds), matching CI exactly. Coverage failures block commit locally.
- CI and pre-commit also run `scripts/check-design-tokens.sh` to block raw Tailwind font sizes, hardcoded colors, and arbitrary spacing in TSX.
- Zero-logic re-export files (`navigation.ts`, `theme-provider.tsx`) are excluded from coverage via `vitest.config.ts` -- do not write fake tests for them.
- **Test quality rules**: Every test must verify real behavior. Prohibited patterns:
  - Mock self-loops (mock a return value then assert that same value)
  - Rendering-only checks (`toBeInTheDocument()` on trivially rendered elements without behavioral assertions)
  - CSS class assertions as primary checks -- use semantic queries (`getByRole`, `getByLabelText`) instead
  - Prefer `getByRole`/`getByLabelText` over `querySelector`/`getByTestId` for accessibility-first testing

### Backend (Supabase)

- Supabase full-stack platform: Postgres 17 + Auth + Storage + Realtime.
- New API key format: `sb_publishable_` (client) / `sb_secret_` (server). Legacy JWT keys NOT used.
- SSR clients: `src/lib/supabase/{client,server,middleware}.ts` via `@supabase/ssr`.
- `proxy.ts` refreshes Supabase session before next-intl routing, forwards auth cookies with full options. Authenticated users on `/login` or `/signup` are redirected to the locale root.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### Authentication

- Email + Password with email verification (PKCE flow) via Supabase Auth.
- Server Actions: `src/app/actions/auth.ts` -- `login`, `signup`, `logout` with locale-aware redirects.
- Validation: `src/lib/auth/validation.ts` -- Zod schemas (`LoginSchema`, `SignupSchema`) with i18n error keys.
- Email confirmation: `src/app/auth/confirm/route.ts` -- OTP verification + OAuth code exchange with open redirect prevention (`sanitizeNext`).
- Form components: `src/components/login-form.tsx`, `src/components/signup-form.tsx` -- `useActionState` for progressive enhancement, hidden locale fields, 44px touch targets.
- Pages: `src/app/[locale]/login/page.tsx`, `src/app/[locale]/signup/page.tsx`.
- Header: auth-aware UI (email + logout when authenticated, login link when not).
- Layout: `src/app/[locale]/layout.tsx` fetches user via `createClient()` and passes `userEmail` to Header.
- Pending: OAuth / Magic Link / SSO, Storage (file storage with RLS), Realtime (subscriptions).

### Error Monitoring

- Sentry (`@sentry/nextjs`) integrated across all three runtimes (server, edge, browser).
- DSN configured via `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` environment variables.
- `src/instrumentation.ts` and `src/instrumentation-client.ts` handle runtime initialization.
- `global-error.tsx` catches root layout crashes and reports to Sentry.

## Conventions

### Commit Messages

Conventional Commits enforced by commitlint:

```
<type>(<scope>): <subject>
```

- **Types**: feat, fix, refactor, perf, test, docs, chore, ci, style
- **Scopes**: core, ui, i18n, auth, api, db, ci, config, docs
- Subject max 72 chars, body line max 100

### Code Style

- TypeScript strict mode. Avoid `any` and type ignores.
- Prettier: semicolons, single quotes, trailing comma `es5`, print width 100, tab width 2.
- ESLint flat config (`eslint.config.mjs`): extends `next/core-web-vitals` and `next/typescript`.
- Async params in Next.js 16 layouts/pages: `params` is `Promise<{ locale: string }>`, must be awaited.

### Documentation Governance

When making changes, update the corresponding docs:

- `CHANGELOG.md` -- every feature, fix, or significant change (with timestamp)
- `ARCHITECTURE.md` -- tech stack changes, new modules, architecture decisions
- `docs/ui-design-tokens.md` -- design token, spacing, or responsive strategy changes
- `messages/en.json` + `messages/zh.json` -- any UI text changes (must stay in sync)
