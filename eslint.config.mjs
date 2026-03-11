import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import i18next from 'eslint-plugin-i18next';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // i18n zero-leak enforcement: catch hardcoded strings in JSX AND JS expressions
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/**/*.test.*',
      'src/**/*.spec.*',
      'src/test/**',
      'src/env.ts',
      'src/proxy.ts',
      'src/instrumentation.ts',
      'src/instrumentation-client.ts',
      'src/app/global-error.tsx',
      'src/app/actions/**',
      'src/app/auth/**',
      'src/lib/auth/**',
    ],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          mode: 'all',
          'jsx-attributes': {
            exclude: [
              'className',
              'href',
              'type',
              'id',
              'name',
              'key',
              'lang',
              'attribute',
              'defaultTheme',
              'placeholder',
              'autoComplete',
              'variant',
              'size',
            ],
          },
          callees: {
            exclude: [
              't',
              'useTranslations',
              'getTranslations',
              'setRequestLocale',
              'cva',
              'cn',
              'Geist',
              'Geist_Mono',
              'require',
              'import',
            ],
          },
          'object-properties': {
            exclude: ['className', 'variant', 'size', 'defaultVariants', 'variable', 'subsets'],
          },
          words: {
            // TODO: Replace 'My App' with your app name
            exclude: ['My App', '\u00a9', '404', 'use client', 'use server', 'en', 'zh'],
          },
        },
      ],
    },
  },
  // Prevent accidental console statements in production code
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/test/**'],
    rules: {
      'no-console': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated coverage reports:
    'coverage/**',
  ]),
]);

export default eslintConfig;
