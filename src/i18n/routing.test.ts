import { describe, expect, it } from 'vitest';

import { routing } from '@/i18n/routing';

describe('routing config', () => {
  it('has correct supported locales', () => {
    expect(routing.locales).toEqual(['en', 'zh']);
  });

  it('has zh as the default locale', () => {
    expect(routing.defaultLocale).toBe('zh');
  });
});
