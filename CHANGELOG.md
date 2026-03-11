# Changelog

All notable changes to this project will be documented in this file.

<!-- Format: ## [version] - YYYY-MM-DD or ## YYYY-MM-DD for pre-release -->

## Initial Template

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
