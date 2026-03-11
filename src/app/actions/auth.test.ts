import { beforeEach, describe, expect, it, vi } from 'vitest';

import { login, logout, signup } from './auth';

// --- Mocks ---

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  }),
}));

const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const mockHeaders = vi.fn().mockResolvedValue({
  get: (name: string) => {
    if (name === 'host') return 'localhost:3000';
    if (name === 'x-forwarded-proto') return 'http';
    return null;
  },
});
vi.mock('next/headers', () => ({
  headers: (...args: unknown[]) => mockHeaders(...args),
}));

const REDIRECT_SENTINEL = 'NEXT_REDIRECT';
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`${REDIRECT_SENTINEL}:${url}`);
  }),
}));

// --- Helpers ---

function createFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fieldErrors for invalid email', async () => {
    const result = await login(
      {},
      createFormData({ email: 'bad', password: 'secret', locale: 'zh' })
    );

    expect(result.fieldErrors?.email).toBeDefined();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('returns fieldErrors for empty password', async () => {
    const result = await login(
      {},
      createFormData({ email: 'user@example.com', password: '', locale: 'zh' })
    );

    expect(result.fieldErrors?.password).toBeDefined();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('returns formError when credentials are invalid', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: new Error('Invalid login credentials'),
    });

    const result = await login(
      {},
      createFormData({ email: 'user@example.com', password: 'wrongpass', locale: 'zh' })
    );

    expect(result.formError).toBe('invalidCredentials');
  });

  it('calls signInWithPassword and redirects to locale on success', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    await expect(
      login(
        {},
        createFormData({ email: 'user@example.com', password: 'correctpass', locale: 'en' })
      )
    ).rejects.toThrow(`${REDIRECT_SENTINEL}:/en`);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'correctpass',
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('redirects to / when locale is empty', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    await expect(
      login({}, createFormData({ email: 'user@example.com', password: 'pass', locale: '' }))
    ).rejects.toThrow(`${REDIRECT_SENTINEL}:/`);
  });

  it('redirects to / when locale is missing from formData', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    await expect(
      login({}, createFormData({ email: 'user@example.com', password: 'pass' }))
    ).rejects.toThrow(`${REDIRECT_SENTINEL}:/`);
  });
});

describe('signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fieldErrors for invalid email', async () => {
    const result = await signup(
      {},
      createFormData({ email: 'bad', password: 'password123', confirmPassword: 'password123' })
    );

    expect(result.fieldErrors?.email).toBeDefined();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns fieldErrors for short password', async () => {
    const result = await signup(
      {},
      createFormData({ email: 'user@example.com', password: 'short', confirmPassword: 'short' })
    );

    expect(result.fieldErrors?.password).toBeDefined();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns fieldErrors for mismatched passwords', async () => {
    const result = await signup(
      {},
      createFormData({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'different456',
      })
    );

    expect(result.fieldErrors?.confirmPassword).toBeDefined();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns formError when signup fails', async () => {
    mockSignUp.mockResolvedValue({ error: new Error('User already exists') });

    const result = await signup(
      {},
      createFormData({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    );

    expect(result.formError).toBe('signupFailed');
  });

  it('calls signUp with emailRedirectTo including locale and returns success', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    const result = await signup(
      {},
      createFormData({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        locale: 'en',
      })
    );

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/confirm?next=%2Fen',
      },
    });
    expect(result.success).toBe(true);
  });

  it('uses / as next path when locale is missing', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    await signup(
      {},
      createFormData({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    );

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/confirm?next=%2F',
        },
      })
    );
  });

  it('uses fallback origin when headers are missing', async () => {
    mockHeaders.mockResolvedValueOnce({
      get: () => null,
    });
    mockSignUp.mockResolvedValue({ error: null });

    await signup(
      {},
      createFormData({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        locale: 'zh',
      })
    );

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/confirm?next=%2Fzh',
        },
      })
    );
  });
});

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs out and redirects to locale', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await expect(logout(createFormData({ locale: 'en' }))).rejects.toThrow(
      `${REDIRECT_SENTINEL}:/en`
    );

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('redirects to / when locale is empty', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await expect(logout(createFormData({ locale: '' }))).rejects.toThrow(`${REDIRECT_SENTINEL}:/`);
  });

  it('redirects to / when locale is missing from formData', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await expect(logout(createFormData({}))).rejects.toThrow(`${REDIRECT_SENTINEL}:/`);
  });
});
