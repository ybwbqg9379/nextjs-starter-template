# AGENTS.md

AI agent guidelines for this repository. All agents (Claude Code, Copilot, Cursor, etc.) should follow these conventions.

## Project Structure

```
src/
  app/              # Next.js App Router (pages, layouts, error boundaries)
    [locale]/       # i18n dynamic segment
    globals.css     # Tailwind CSS 4 theme & design tokens
    global-error.tsx
  components/       # Shared React components
    ui/             # shadcn/ui base components (Button, PageCenter)
  i18n/             # Internationalization utilities
  lib/              # Shared utilities (cn, etc.)
  env.ts            # Type-safe environment variables (t3-env + Zod)
  proxy.ts          # Next.js middleware (locale redirect)
  instrumentation.ts          # Sentry server runtime
  instrumentation-client.ts   # Sentry browser runtime
messages/           # i18n JSON files (en.json, zh.json)
scripts/            # Shell scripts (design token checks)
docs/               # Design specs and documentation
```

## Build & Test Commands

```bash
npm run validate     # Full quality gate (format + lint + typecheck + test + build)
npm run test         # Vitest (unit tests)
npm run test:coverage # Vitest with coverage thresholds
npm run lint         # ESLint --max-warnings 0
npm run typecheck    # tsc --noEmit
```

## Coding Style

- TypeScript strict mode, no `any`, no `// @ts-ignore`
- Prettier: semicolons, single quotes, trailing comma `es5`, 100 char width
- All UI text via i18n (`useTranslations`, `getTranslations`) -- zero hardcoded strings
- Lucide icons only, zero emoji in code/comments/docs/UI
- Use design tokens from `globals.css` instead of raw Tailwind values
- `cn()` for className merging (clsx + tailwind-merge)

## Testing Guidelines

- Vitest 4 + React Testing Library + jsdom
- Pre-commit AND CI enforce 100% coverage thresholds via `npm run test:coverage`
- Zero-logic re-export files are excluded from coverage (see `vitest.config.ts`)
- **Test quality rules** (violations will be flagged in review):
  - No mock self-loops (mocking a return value then asserting that same value)
  - No pure render existence checks as sole assertions
  - No CSS class assertions as primary checks
  - Prefer semantic queries: `getByRole`, `getByLabelText` over `querySelector`, `getByTestId`

## Commit & Pull Request Guidelines

### Commit Messages

Conventional Commits (`<type>(<scope>): <subject>`):

- Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`, `style`
- Scopes: `core`, `ui`, `i18n`, `auth`, `api`, `db`, `ci`, `config`, `docs`
- Subject max 72 chars

### Pre-commit Checks (in order)

1. CHANGELOG update enforcement (blocks if source changed without CHANGELOG update)
2. Design token compliance (`scripts/check-design-tokens.sh` on staged TSX)
3. lint-staged (ESLint + Prettier on staged files)
4. `npm run test:coverage` (coverage gate)
5. commitlint (message format validation)

### Documentation Updates Required

- `CHANGELOG.md` -- every feature, fix, or significant change
- `ARCHITECTURE.md` -- tech stack or architecture changes
- `messages/en.json` + `messages/zh.json` -- UI text changes (must stay in sync)
- `docs/ui-design-tokens.md` -- design token changes

## CI Pipeline

GitHub Actions runs on push to `main` and PRs:

**Quality job**: format:check -> lint -> typecheck -> test:coverage -> build
**Docs job**: CHANGELOG enforcement, i18n key parity, design token compliance

## Quick Config Tips

- Path alias: `@/*` -> `./src/*`
- Default locale: `zh`, supported: `['en', 'zh']`
- Theme: `next-themes` with `attribute="class"`, `defaultTheme="system"`
- Env validation: `@t3-oss/env-nextjs` in `src/env.ts`, skip with `SKIP_ENV_VALIDATION=1`
