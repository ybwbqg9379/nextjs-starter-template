# Architecture

<!-- TODO: Replace "My App" with your project name and description -->

## Overview

My App is a Next.js 16 application built on App Router with production-grade infrastructure including i18n, design tokens, error monitoring, and full test coverage.

## Current Stack

| Layer            | Technology                                      | Purpose                                    |
| ---------------- | ----------------------------------------------- | ------------------------------------------ |
| Framework        | Next.js 16 (App Router, Turbopack)              | Full-stack React framework                 |
| Language         | TypeScript (strict mode)                        | Type safety                                |
| Styling          | Tailwind CSS 4, shadcn/ui (Nova)                | Design system                              |
| i18n             | next-intl                                       | Internationalization (zh/en)               |
| Theme            | next-themes                                     | Dark/light mode                            |
| Env              | @t3-oss/env-nextjs + Zod                        | Type-safe environment variables            |
| Monitoring       | @sentry/nextjs                                  | Error tracking (server/edge/browser)       |
| Testing          | Vitest 4, React Testing Library                 | Unit tests with 100% coverage              |
| Backend Platform | Supabase (Postgres + Auth + Storage + Realtime) | Database / Auth / Storage / Realtime       |
| Database         | Supabase Postgres 17.x                          | RLS row-level security, new API key format |
| Auth             | Supabase Auth                                   | Email + Password with email verification   |
| Storage          | Supabase Storage (pending)                      | File storage with RLS                      |
| Realtime         | Supabase Realtime (pending)                     | Real-time subscriptions                    |

## Engineering Quality

| Tool                   | Purpose                       | Enforcement                                              |
| ---------------------- | ----------------------------- | -------------------------------------------------------- |
| ESLint 9 (flat config) | Code quality + i18n zero-leak | `--max-warnings 0`                                       |
| Prettier               | Code formatting               | Pre-commit + CI                                          |
| Vitest                 | Testing + coverage            | 100% threshold, pre-commit + CI                          |
| husky                  | Pre-commit hooks              | CHANGELOG + design tokens + lint + coverage + commitlint |
| commitlint             | Commit message format         | Conventional Commits                                     |
| GitHub Actions         | CI pipeline                   | Quality + documentation checks                           |
| Dependabot             | Dependency updates            | Weekly, grouped by ecosystem                             |
| Design token checker   | Tailwind compliance           | Blocks raw font sizes, hardcoded colors                  |

## Project Structure

```
src/
  app/
    globals.css              # Tailwind CSS 4 theme (oklch tokens, @utility shorthands)
    global-error.tsx         # Root error boundary (inline styles, Sentry)
    favicon.ico
    actions/
      auth.ts                # Server Actions: login, signup, logout
    auth/
      confirm/
        route.ts             # Email confirmation callback (OTP + code exchange)
    [locale]/
      layout.tsx             # Root locale layout (fonts, providers, header/footer, user fetch)
      page.tsx               # Home page (server component shell)
      login/
        page.tsx             # Login page
      signup/
        page.tsx             # Signup page
      error.tsx              # Error boundary (i18n, Sentry)
      loading.tsx            # Loading spinner
      not-found.tsx          # 404 page
  components/
    header.tsx               # App header (nav, auth UI, toggles)
    footer.tsx               # Copyright footer
    login-form.tsx           # Login form (useActionState, i18n errors)
    signup-form.tsx          # Signup form (useActionState, email confirmation)
    home-content.tsx         # Home page content (hero, features)
    feature-card.tsx         # Reusable feature card
    copyright-year.tsx       # Dynamic year (client component)
    language-toggle.tsx      # zh/en language switch
    theme-toggle.tsx         # Dark/light theme toggle
    theme-provider.tsx       # next-themes wrapper
    ui/
      button.tsx             # CVA button (5 variants, 4 sizes)
      page-center.tsx        # Centered layout container
  i18n/
    routing.ts               # Locale config
    request.ts               # Server-side locale resolution
    navigation.ts            # Type-safe navigation exports
  lib/
    utils.ts                 # cn() utility
    auth/
      validation.ts          # Zod schemas (LoginSchema, SignupSchema) + AuthState type
    supabase/
      client.ts              # Browser Supabase client (Client Components)
      server.ts              # Server Supabase client (Server Components / Route Handlers)
      middleware.ts           # Middleware session refresh (cookie forwarding)
  env.ts                     # Environment variable validation
  proxy.ts                   # Next.js middleware (Supabase session refresh + locale redirect)
  instrumentation.ts         # Sentry server init
  instrumentation-client.ts  # Sentry browser init
  test/
    setup.ts                 # Vitest global setup
messages/
  en.json                    # English translations
  zh.json                    # Chinese translations
scripts/
  check-design-tokens.sh     # TSX design token compliance checker
docs/
  ui-design-tokens.md        # Design token specification
```

## Key Design Decisions

### i18n Strategy

- Default locale: `zh` (Chinese), secondary: `en` (English)
- ESLint `i18next/no-literal-string` in `mode: all` catches hardcoded strings in both JSX and JS
- CI verifies 1:1 key parity between en.json and zh.json
- `global-error.tsx` uses hardcoded Chinese (no i18n provider available when root layout crashes)

### Design Token System

- All colors in oklch color space for perceptual uniformity
- Typography scale via `@utility` shorthands (`text-display`, `text-h1`, etc.)
- `check-design-tokens.sh` blocks raw Tailwind font sizes, hardcoded hex/rgb/hsl colors, and arbitrary spacing
- Full specification in `docs/ui-design-tokens.md`

### Testing Philosophy

- 100% coverage threshold enforced in both pre-commit and CI
- Zero-logic re-export files excluded from coverage (no fake tests)
- Semantic queries preferred (`getByRole`, `getByLabelText`)
- Prohibited: mock self-loops, pure render checks, CSS class assertions

### Error Monitoring

- Sentry integrated across server, edge, and browser runtimes
- DSN pair validation (server + client must both be set)
- `tunnelRoute: '/monitoring'` to bypass ad-blockers
- `global-error.tsx` reports root layout crashes with inline styles (CSS may be unavailable)

### Backend: Supabase SSR

- **Architecture**: Supabase full-stack platform (Postgres + Auth + Storage + Realtime)
- **API Keys**: New format (`sb_publishable_` / `sb_secret_`), not legacy JWT
- **SSR Integration**: `@supabase/ssr` with three client factories (`client.ts`, `server.ts`, `middleware.ts`)
- **Middleware**: `proxy.ts` refreshes Supabase session first, then runs next-intl, forwards cookies with full options. Authenticated users on auth pages (`/login`, `/signup`) are redirected to locale root.
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (client) + `SUPABASE_SERVICE_ROLE_KEY` (server)
- **Pending**: Storage, Realtime

### Authentication

- **Flow**: Email + Password with email verification (PKCE flow)
- **Server Actions**: `login`, `signup`, `logout` in `src/app/actions/auth.ts` with locale-aware redirects
- **Validation**: Zod schemas with i18n error keys (`src/lib/auth/validation.ts`)
- **Email Confirmation**: `src/app/auth/confirm/route.ts` handles OTP verification and OAuth code exchange
- **Security**: `sanitizeNext()` prevents open redirect attacks on the confirmation callback
- **Form Components**: `useActionState` for progressive enhancement, hidden locale fields for i18n-aware redirects
- **Header Integration**: Auth-aware UI shows email + logout (authenticated) or login link (guest), 44px touch targets

### Security Headers

- HSTS with preload, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff
- Strict referrer policy, restrictive permissions policy
- Configured in `next.config.ts`
