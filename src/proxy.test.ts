import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

// --- Tests ---

import middleware, { config } from './proxy';

// --- Hoisted mocks ---

const { mockUpdateSession, mockIntlMiddleware } = vi.hoisted(() => ({
  mockUpdateSession: vi.fn(),
  mockIntlMiddleware: vi.fn(),
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

// --- Helpers ---

function createMockResponse(cookieEntries: Array<Record<string, unknown>> = []) {
  return {
    cookies: {
      getAll: vi.fn().mockReturnValue(cookieEntries),
      set: vi.fn(),
    },
  };
}

describe('proxy middleware', () => {
  let mockRequest: unknown;
  let supabaseResponse: ReturnType<typeof createMockResponse>;
  let intlResponse: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = { url: 'https://localhost:3000/zh', cookies: {} };
    supabaseResponse = createMockResponse();
    intlResponse = createMockResponse();
    mockUpdateSession.mockResolvedValue(supabaseResponse);
    mockIntlMiddleware.mockReturnValue(intlResponse);
  });

  it('calls updateSession then intlMiddleware in order', async () => {
    const callOrder: string[] = [];
    mockUpdateSession.mockImplementation(async () => {
      callOrder.push('supabase');
      return supabaseResponse;
    });
    mockIntlMiddleware.mockImplementation(() => {
      callOrder.push('intl');
      return intlResponse;
    });

    await middleware(mockRequest as Parameters<typeof middleware>[0]);

    expect(callOrder).toEqual(['supabase', 'intl']);
  });

  it('passes the same request to both updateSession and intlMiddleware', async () => {
    await middleware(mockRequest as Parameters<typeof middleware>[0]);

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
    mockUpdateSession.mockResolvedValue(supabaseResponse);

    await middleware(mockRequest as Parameters<typeof middleware>[0]);

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
    mockUpdateSession.mockResolvedValue(supabaseResponse);

    await middleware(mockRequest as Parameters<typeof middleware>[0]);

    expect((intlResponse.cookies.set as Mock).mock.calls).toHaveLength(0);
  });

  it('returns the intl response (not the Supabase response)', async () => {
    const result = await middleware(mockRequest as Parameters<typeof middleware>[0]);

    expect(result).toBe(intlResponse);
    expect(result).not.toBe(supabaseResponse);
  });

  it('exports a matcher config excluding api, _next, static files, and monitoring', () => {
    // Next.js matcher is a path pattern, not a plain regex -- verify shape and exclusions
    expect(config.matcher).toBeDefined();
    expect(typeof config.matcher).toBe('string');
    expect(config.matcher).toContain('api');
    expect(config.matcher).toContain('_next');
    expect(config.matcher).toContain('_vercel');
    expect(config.matcher).toContain('monitoring');
    expect(config.matcher).toContain('\\.');
  });
});
