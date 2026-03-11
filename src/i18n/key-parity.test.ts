import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

/**
 * Flatten a nested object into dot-notation keys.
 * e.g. { a: { b: 'v' } } => ['a.b']
 */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const messagesDir = resolve(__dirname, '../../messages');
const en = JSON.parse(readFileSync(resolve(messagesDir, 'en.json'), 'utf-8'));
const zh = JSON.parse(readFileSync(resolve(messagesDir, 'zh.json'), 'utf-8'));

const enKeys = flattenKeys(en);
const zhKeys = flattenKeys(zh);

describe('i18n key parity', () => {
  it('en.json and zh.json have the same number of keys', () => {
    expect(enKeys.length).toBe(zhKeys.length);
  });

  it('en.json keys all exist in zh.json', () => {
    const missingInZh = enKeys.filter((k) => !zhKeys.includes(k));
    expect(missingInZh).toEqual([]);
  });

  it('zh.json keys all exist in en.json', () => {
    const missingInEn = zhKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });

  it('neither file is empty', () => {
    expect(enKeys.length).toBeGreaterThan(0);
    expect(zhKeys.length).toBeGreaterThan(0);
  });
});
