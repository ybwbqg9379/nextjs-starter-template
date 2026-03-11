import { describe, expect, it, vi } from 'vitest';

// The default export IS the config function (because our mock returns it directly)
import getRequestConfig from '@/i18n/request';

// Mock next-intl and next-intl/server
vi.mock('next-intl', () => ({
  hasLocale: (locales: string[], locale: string) => locales.includes(locale),
}));

vi.mock('next-intl/server', () => ({
  // getRequestConfig receives a callback and returns it as-is
  getRequestConfig: (fn: unknown) => fn,
}));

// Mock messages
vi.mock('../../messages/en.json', () => ({ default: { common: { appName: 'My App' } } }));
vi.mock('../../messages/zh.json', () => ({ default: { common: { appName: 'My App' } } }));

const configFn = getRequestConfig as unknown as (args: {
  requestLocale: Promise<string>;
}) => Promise<{ locale: string; messages: Record<string, unknown> }>;

describe('i18n request config', () => {
  it('returns the requested locale when valid', async () => {
    const config = await configFn({ requestLocale: Promise.resolve('en') });
    expect(config.locale).toBe('en');
  });

  it('falls back to default locale (zh) for invalid locale', async () => {
    const config = await configFn({ requestLocale: Promise.resolve('fr') });
    expect(config.locale).toBe('zh');
  });

  it('loads messages for the resolved locale', async () => {
    const config = await configFn({ requestLocale: Promise.resolve('en') });
    expect(config.messages).toBeDefined();
    expect(config.messages.common).toEqual({ appName: 'My App' });
  });

  it('loads zh messages for default locale fallback', async () => {
    const config = await configFn({ requestLocale: Promise.resolve('invalid') });
    expect(config.messages).toBeDefined();
    expect(config.messages.common).toEqual({ appName: 'My App' });
  });
});
