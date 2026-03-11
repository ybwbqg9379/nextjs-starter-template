# Next.js Starter Template

Production-ready Next.js 16 starter with App Router, i18n, design tokens, Sentry, and full test coverage.

## What's Included

- **Next.js 16** -- App Router, Turbopack, typed routes
- **TypeScript** -- Strict mode, type-safe env vars (@t3-oss/env-nextjs + Zod)
- **Tailwind CSS 4** -- oklch design tokens, @utility shorthands, mobile-first responsive
- **shadcn/ui** -- Nova theme, Radix primitives (Button, PageCenter)
- **i18n** -- next-intl (zh/en), ESLint zero-leak enforcement, CI key parity
- **Dark Mode** -- next-themes with hydration-safe toggle
- **Sentry** -- Error monitoring across server, edge, and browser runtimes
- **Testing** -- Vitest 4 + React Testing Library, 100% coverage threshold
- **Linting** -- ESLint 9 flat config, zero-warning policy, Prettier
- **Git Hooks** -- husky pre-commit (CHANGELOG + design tokens + lint + coverage + commitlint)
- **CI/CD** -- GitHub Actions (quality + documentation checks), Dependabot

## Quick Start

```bash
# 1. Use this template on GitHub (or clone)
gh repo create my-app --template your-username/nextjs-starter-template

# 2. Install dependencies
cd my-app
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Start development
npm run dev
```

## Customization Checklist

After creating a project from this template:

1. **package.json** -- Update `name`
2. **next.config.ts** -- Update Sentry `org` and `project`
3. **eslint.config.mjs** -- Update `words.exclude` with your app name
4. **commitlint.config.js** -- Add domain-specific scopes
5. **messages/en.json + zh.json** -- Replace placeholder text
6. **.github/dependabot.yml** -- Add your GitHub username as reviewer
7. **CLAUDE.md** -- Update project overview
8. **ARCHITECTURE.md** -- Update project description
9. **CHANGELOG.md** -- Clear template entries, start fresh

## Scripts

| Command                 | Description            |
| ----------------------- | ---------------------- |
| `npm run dev`           | Dev server (Turbopack) |
| `npm run build`         | Production build       |
| `npm run lint`          | ESLint (zero-warning)  |
| `npm run format`        | Prettier format        |
| `npm run typecheck`     | TypeScript check       |
| `npm run test`          | Run tests              |
| `npm run test:coverage` | Tests with coverage    |
| `npm run validate`      | Full quality gate      |

## Commit Convention

Conventional Commits enforced by commitlint:

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`, `style`

## Pre-commit Checks

1. CHANGELOG update enforcement
2. Design token compliance (no raw Tailwind values in TSX)
3. lint-staged (ESLint + Prettier)
4. Coverage gate (100% threshold)
5. commitlint (message format)

## CI Pipeline

GitHub Actions on push/PR to `main`:

- **Quality**: format -> lint -> typecheck -> test:coverage -> build
- **Docs**: CHANGELOG enforcement, i18n key parity, design token compliance

## License

<!-- TODO: Choose your license -->

Private
