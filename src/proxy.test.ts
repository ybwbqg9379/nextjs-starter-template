import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

// --- Tests ---

import middleware, { config } from './proxy';

// --- Hoisted mocks ---

const { mockUpdateSession, mockIntlMiddleware, mockRedirect } = vi.hoisted(() => ({
  mockUpdateSession: vi.fn(),
  mockIntlMiddleware: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock('./lib/supabase/middleware', () => ({
  updateSession: mockUpdateSession,
}));

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => mockIntlMiddleware),
}));

vi.mock('./i18n/routing', () => ({
  routing: { locales: ['en', 'zh'], defaultLocale: 'zh' },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: mockRedirect,
  },
}));

// --- Helpers ---

function createMockResponse(cookieEntries: Array<Record<string, unknown>> = []) {
  return {
    cookies: {
      getAll: vi.fn().mockReturnValue(cookieEntries),
      set: vi.fn(),
    },
  };
}

function createMockRequest(pathname: string = '/zh') {
  return {
    url: `https://localhost:3000${pathname}`,
    nextUrl: {
      pathname,
      clone: vi.fn().mockReturnValue({ pathname: '' }),
    },
    cookies: {},
  };
}

describe('proxy middleware', () => {
  let mockRequest: ReturnType<typeof createMockRequest>;
  let supabaseResponse: ReturnType<typeof createMockResponse>;
  let intlResponse: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest();
    supabaseResponse = createMockResponse();
    intlResponse = createMockResponse();
    mockUpdateSession.mockResolvedValue({ response: supabaseResponse, user: null });
    mockIntlMiddleware.mockReturnValue(intlResponse);
  });

  it('calls updateSession then intlMiddleware in order', async () => {
    const callOrder: string[] = [];
    mockUpdateSession.mockImplementation(async () => {
      callOrder.push('supabase');
      return { response: supabaseResponse, user: null };
    });
    mockIntlMiddleware.mockImplementation(() => {
      callOrder.push('intl');
      return intlResponse;
    });

    await middleware(mockRequest as unknown as Parameters<typeof middleware>[0]);

    expect(callOrder).toEqual(['supabase', 'intl']);
  });

  it('passes the same request to both updateSession and intlMiddleware', async () => {
    await middleware(mockRequest as unknown as Parameters<typeof middleware>[0]);

    expect(mockUpdateSession).toHaveBeenCalledWith(mockRequest);
    expect(mockIntlMiddleware).toHaveBeenCalledWith(mockRequest);
  });

  it('forwards Supabase cookies to intl response with full options', async () => {
    supabaseResponse = createMockResponse([
      {
        name: 'sb-access-token',
        value: 'jwt-value',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      },
      {
        name: 'sb-refresh-token',
        value: 'refresh-value',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 86400,
      },
    ]);
    mockUpdateSession.mockResolvedValue({ response: supabaseResponse, user: null });

    await middleware(mockRequest as unknown as Parameters<typeof middleware>[0]);

    expect(intlResponse.cookies.set).toHaveBeenCalledWith('sb-access-token', 'jwt-value', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
    });
    expect(intlResponse.cookies.set).toHaveBeenCalledWith('sb-refresh-token', 'refresh-value', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });
  });

  it('does not set cookies when Supabase has none to forward', async () => {
    supabaseResponse = createMockResponse([]);
    mockUpdateSession.mockResolvedValue({ response: supabaseResponse, user: null });

    await middleware(mockRequest as unknown as Parameters<typeof middleware>[0]);

    expect((intlResponse.cookies.set as Mock).mock.calls).toHaveLength(0);
  });

  it('returns the intl response (not the Supabase response)', async () => {
    const result = await middleware(mockRequest as unknown as Parameters<typeof middleware>[0]);

    expect(result).toBe(intlResponse);
    expect(result).not.toBe(supabaseResponse);
  });

  describe('auth redirect', () => {
    it('redirects authenticated user from /zh/login to /zh with cookies forwarded', async () => {
      const request = createMockRequest('/zh/login');
      const supabaseCookies = [{ name: 'sb-token', value: 'refreshed', httpOnly: true, path: '/' }];
      supabaseResponse = createMockResponse(supabaseCookies);
      mockUpdateSession.mockResolvedValue({
        response: supabaseResponse,
        user: { id: 'u1', email: 'a@b.com' },
      });
      const redirectResponse = createMockResponse();
      mockRedirect.mockReturnValue(redirectResponse);

      const result = await middleware(request as unknown as Parameters<typeof middleware>[0]);

      expect(mockRedirect).toHaveBeenCalled();
      const redirectUrl = mockRedirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe('/zh');
      expect(result).toBe(redirectResponse);
      // Verify cookies were forwarded to redirect response
      expect(redirectResponse.cookies.set).toHaveBeenCalledWith('sb-token', 'refreshed', {
        httpOnly: true,
        path: '/',
      });
    });

    it('redirects authenticated user from /en/signup to /en with cookies forwarded', async () => {
      const request = createMockRequest('/en/signup');
      supabaseResponse = createMockResponse([{ name: 'sb-token', value: 'val', secure: true }]);
      mockUpdateSession.mockResolvedValue({
        response: supabaseResponse,
        user: { id: 'u1', email: 'a@b.com' },
      });
      const redirectResponse = createMockResponse();
      mockRedirect.mockReturnValue(redirectResponse);

      await middleware(request as unknown as Parameters<typeof middleware>[0]);

      const redirectUrl = mockRedirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe('/en');
      expect(redirectResponse.cookies.set).toHaveBeenCalledWith('sb-token', 'val', {
        secure: true,
      });
    });

    it('redirects to / when no locale prefix on auth page', async () => {
      const request = createMockRequest('/login');
      mockUpdateSession.mockResolvedValue({
        response: supabaseResponse,
        user: { id: 'u1', email: 'a@b.com' },
      });
      const redirectResponse = createMockResponse();
      mockRedirect.mockReturnValue(redirectResponse);

      await middleware(request as unknown as Parameters<typeof middleware>[0]);

      const redirectUrl = mockRedirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe('/');
    });

    it('does not redirect unauthenticated user from /login', async () => {
      const request = createMockRequest('/login');
      mockUpdateSession.mockResolvedValue({
        response: supabaseResponse,
        user: null,
      });

      await middleware(request as unknown as Parameters<typeof middleware>[0]);

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockIntlMiddleware).toHaveBeenCalled();
    });

    it('does not redirect authenticated user from non-auth pages', async () => {
      const request = createMockRequest('/zh');
      mockUpdateSession.mockResolvedValue({
        response: supabaseResponse,
        user: { id: 'u1', email: 'a@b.com' },
      });

      await middleware(request as unknown as Parameters<typeof middleware>[0]);

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(mockIntlMiddleware).toHaveBeenCalled();
    });
  });

  it('exports a matcher config excluding api, auth, _next, static files, and monitoring', () => {
    expect(config.matcher).toBeDefined();
    expect(typeof config.matcher).toBe('string');
    expect(config.matcher).toContain('api');
    expect(config.matcher).toContain('auth');
    expect(config.matcher).toContain('_next');
    expect(config.matcher).toContain('_vercel');
    expect(config.matcher).toContain('monitoring');
    expect(config.matcher).toContain('\\.');
  });
});
