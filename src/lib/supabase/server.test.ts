import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Tests ---

import { createClient } from './server';

// --- Hoisted mocks (available before vi.mock factories run) ---

const { mockCookieStore, mockGetAll, mockSet } = vi.hoisted(() => {
  const mockGetAll = vi.fn();
  const mockSet = vi.fn();
  const mockCookieStore = { getAll: mockGetAll, set: mockSet };
  return { mockCookieStore, mockGetAll, mockSet };
});

// --- Mocks ---

vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key',
  },
}));

interface CookiesAdapter {
  getAll: () => Array<{ name: string; value: string }>;
  setAll: (
    cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>
  ) => void;
}

let capturedCookies: CookiesAdapter | null = null;

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url: string, _key: string, opts: { cookies: CookiesAdapter }) => {
    capturedCookies = opts.cookies;
    return {};
  }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

describe('createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCookies = null;
  });

  it('creates Supabase client with validated env vars', async () => {
    await createClient();

    const { createServerClient } = await import('@supabase/ssr');
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'sb_publishable_test_key',
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });

  it('getAll reads from the Next.js cookie store', async () => {
    mockGetAll.mockReturnValue([{ name: 'session', value: 'abc123' }]);

    await createClient();

    const result = capturedCookies!.getAll();
    expect(result).toEqual([{ name: 'session', value: 'abc123' }]);
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('setAll writes cookies with full options', async () => {
    await createClient();

    capturedCookies!.setAll([
      { name: 'token', value: 'val', options: { httpOnly: true, path: '/' } },
    ]);

    expect(mockSet).toHaveBeenCalledWith('token', 'val', {
      httpOnly: true,
      path: '/',
    });
  });

  it('setAll silently catches errors in Server Component context', async () => {
    mockSet.mockImplementation(() => {
      throw new Error('Cookies can only be modified in a Server Action or Route Handler');
    });

    await createClient();

    // Should not throw -- the catch block silences the error
    expect(() => {
      capturedCookies!.setAll([{ name: 'token', value: 'val', options: {} }]);
    }).not.toThrow();
  });
});
