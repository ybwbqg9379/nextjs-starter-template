import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { initialAuthState, LoginSchema, SignupSchema } from './validation';

describe('LoginSchema', () => {
  it('accepts valid email and password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from email and password', () => {
    const result = LoginSchema.safeParse({ email: '  user@example.com  ', password: '  secret  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.password).toBe('secret');
    }
  });

  it('rejects invalid email', () => {
    const result = LoginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      expect(errors.email).toContain('invalidEmail');
    }
  });

  it('rejects empty password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      expect(errors.password).toBeDefined();
    }
  });

  it('rejects whitespace-only password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: '   ' });
    expect(result.success).toBe(false);
  });
});

describe('SignupSchema', () => {
  it('accepts valid signup data', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      expect(errors.password).toContain('passwordMin');
    }
  });

  it('rejects mismatched passwords', () => {
    const result = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'different456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      expect(errors.confirmPassword).toContain('passwordMismatch');
    }
  });

  it('rejects invalid email', () => {
    const result = SignupSchema.safeParse({
      email: 'bad',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      expect(errors.email).toContain('invalidEmail');
    }
  });

  it('trims email and password', () => {
    const result = SignupSchema.safeParse({
      email: '  user@example.com  ',
      password: '  password123  ',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.password).toBe('password123');
    }
  });
});

describe('initialAuthState', () => {
  it('is an empty object', () => {
    expect(initialAuthState).toEqual({});
  });
});
