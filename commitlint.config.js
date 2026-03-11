module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvement
        'test', // Adding or updating tests
        'docs', // Documentation only changes
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'style', // Code style (formatting, missing semi-colons, etc.)
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'core', // Core framework / config
        'ui', // UI components / design system
        'i18n', // Internationalization
        'auth', // Authentication
        'api', // API routes
        'db', // Database / ORM
        'ci', // CI/CD pipeline
        'config', // Project configuration files
        'docs', // Documentation
        // TODO: Add your domain-specific scopes here
      ],
    ],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
  },
};
