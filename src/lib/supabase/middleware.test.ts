import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

// --- Tests ---

import { updateSession } from './middleware';

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
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url: string, _key: string, opts: { cookies: CookiesAdapter }) => {
    capturedCookies = opts.cookies;
    return { auth: { getUser: mockGetUser } };
  }),
}));

// Track every response created by NextResponse.next()
interface MockResponseCookies {
  set: Mock;
  getAll: Mock;
}
let responseHistory: MockResponseCookies[] = [];

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => {
      const cookies: MockResponseCookies = {
        set: vi.fn(),
        getAll: vi.fn().mockReturnValue([]),
      };
      responseHistory.push(cookies);
      return { cookies };
    }),
  },
}));

function createMockRequest() {
  return {
    cookies: {
      getAll: vi.fn().mockReturnValue([{ name: 'existing', value: 'cookie-val' }]),
      set: vi.fn(),
    },
  } as unknown as Parameters<typeof updateSession>[0];
}

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCookies = null;
    responseHistory = [];
  });

  it('creates Supabase client with validated env vars and refreshes session', async () => {
    const request = createMockRequest();
    await updateSession(request);

    const { createServerClient } = await import('@supabase/ssr');
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'sb_publishable_test_key',
      expect.objectContaining({ cookies: expect.any(Object) })
    );
    expect(mockGetUser).toHaveBeenCalledOnce();
  });

  it('getAll returns request cookies', async () => {
    const request = createMockRequest();
    await updateSession(request);

    const result = capturedCookies!.getAll();
    expect(result).toEqual([{ name: 'existing', value: 'cookie-val' }]);
  });

  it('setAll updates request cookies and recreates response with full options', async () => {
    const request = createMockRequest();
    await updateSession(request);

    // Initial NextResponse.next() creates the first response
    expect(responseHistory).toHaveLength(1);

    // Simulate Supabase calling setAll after token refresh
    const refreshedCookies = [
      {
        name: 'sb-access-token',
        value: 'new-jwt',
        options: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' },
      },
      {
        name: 'sb-refresh-token',
        value: 'new-refresh',
        options: { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' },
      },
    ];
    capturedCookies!.setAll(refreshedCookies);

    // Request cookies should be updated (name + value only)
    expect(request.cookies.set).toHaveBeenCalledWith('sb-access-token', 'new-jwt');
    expect(request.cookies.set).toHaveBeenCalledWith('sb-refresh-token', 'new-refresh');

    // NextResponse.next() should be called again, recreating the response
    expect(responseHistory).toHaveLength(2);

    // The recreated response should have cookies with FULL options
    const recreatedResponseCookies = responseHistory[1];
    expect(recreatedResponseCookies.set).toHaveBeenCalledWith('sb-access-token', 'new-jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
    expect(recreatedResponseCookies.set).toHaveBeenCalledWith('sb-refresh-token', 'new-refresh', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  });

  it('returns the most recent response (after potential setAll rebuild)', async () => {
    const request = createMockRequest();

    // Make getUser trigger setAll internally (simulating token refresh)
    mockGetUser.mockImplementationOnce(async () => {
      capturedCookies!.setAll([{ name: 'token', value: 'refreshed', options: { httpOnly: true } }]);
      return { data: { user: null }, error: null };
    });

    const result = await updateSession(request);

    // The returned response should be the rebuilt one (second in history)
    expect(responseHistory).toHaveLength(2);
    expect(result.response.cookies).toBe(responseHistory[1]);
  });

  it('returns response and user when authenticated', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

    const request = createMockRequest();
    const result = await updateSession(request);

    expect(result.user).toEqual(mockUser);
    expect(result.response).toBeDefined();
    expect(result.response.cookies).toBe(responseHistory[0]);
  });

  it('returns null user when not authenticated', async () => {
    const request = createMockRequest();
    const result = await updateSession(request);

    expect(result.user).toBeNull();
  });
});
