// Authentication & profile Zod schemas.

import { z } from 'zod';

/** Login request validation. */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Refresh token request validation. */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/** Update profile schema. */
export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username format')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().max(2000).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Change password schema. */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
