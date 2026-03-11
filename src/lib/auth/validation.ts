import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.pipe(z.string().trim(), z.email('invalidEmail')),
  password: z.string().trim().min(1, 'passwordRequired'),
});

export const SignupSchema = z
  .object({
    email: z.pipe(z.string().trim(), z.email('invalidEmail')),
    password: z.string().trim().min(8, 'passwordMin'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

export type AuthState = {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
  success?: boolean;
};

export const initialAuthState: AuthState = {};
