import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

// --- Mocks ---

const mockVerifyOtp = vi.fn();
const mockExchangeCodeForSession = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
    },
  }),
}));

const mockRedirect = vi.fn((url: string) => ({ url, type: 'redirect' }));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: string) => mockRedirect(url),
  },
}));

describe('GET /auth/confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies OTP with token_hash and type, redirects to / on success', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    const request = new Request(
      'https://localhost:3000/auth/confirm?token_hash=abc123&type=signup'
    );
    await GET(request);

    expect(mockVerifyOtp).toHaveBeenCalledWith({ type: 'signup', token_hash: 'abc123' });
    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });

  it('redirects to custom next path on OTP success', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    const request = new Request(
      'https://localhost:3000/auth/confirm?token_hash=abc&type=signup&next=/zh/settings'
    );
    await GET(request);

    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/zh/settings');
  });

  it('redirects to / when OTP verification fails', async () => {
    mockVerifyOtp.mockResolvedValue({ error: new Error('invalid') });

    const request = new Request('https://localhost:3000/auth/confirm?token_hash=bad&type=signup');
    await GET(request);

    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });

  it('exchanges code for session (OAuth fallback) and redirects on success', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const request = new Request('https://localhost:3000/auth/confirm?code=oauth-code');
    await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('oauth-code');
    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });

  it('redirects to / when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: new Error('bad code') });

    const request = new Request('https://localhost:3000/auth/confirm?code=bad');
    await GET(request);

    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });

  it('redirects to / when no token_hash and no code provided', async () => {
    const request = new Request('https://localhost:3000/auth/confirm');
    await GET(request);

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });

  it('prefers token_hash over code when both are present', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    const request = new Request(
      'https://localhost:3000/auth/confirm?token_hash=hash&type=signup&code=code'
    );
    await GET(request);

    expect(mockVerifyOtp).toHaveBeenCalledWith({ type: 'signup', token_hash: 'hash' });
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('sanitizes next to / when value is an absolute URL (open redirect)', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    const request = new Request(
      'https://localhost:3000/auth/confirm?token_hash=h&type=signup&next=https://evil.com'
    );
    await GET(request);

    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });

  it('sanitizes next to / when value is protocol-relative (//evil.com)', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    const request = new Request(
      'https://localhost:3000/auth/confirm?token_hash=h&type=signup&next=//evil.com'
    );
    await GET(request);

    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });

  it('sanitizes next to / when value does not start with /', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    const request = new Request(
      'https://localhost:3000/auth/confirm?token_hash=h&type=signup&next=foo'
    );
    await GET(request);

    expect(mockRedirect).toHaveBeenCalledWith('https://localhost:3000/');
  });
});
