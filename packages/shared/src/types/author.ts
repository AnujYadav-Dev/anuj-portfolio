// Author & authentication DTOs.

/** Public author representation (no password hash). */
export interface AuthorDto {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Login request payload. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Authentication response after successful login. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  author: AuthorDto;
}

/** Refresh token request. */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Update author profile request. */
export interface UpdateProfileRequest {
  displayName?: string;
  username?: string;
  email?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

/** Change password request. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
