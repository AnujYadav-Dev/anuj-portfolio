import type { Request, Response } from 'express';
import type {
  LoginInput,
  RefreshTokenInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '@portfolio/shared';
import { authService } from '@/services/auth.service';
import { getClientIp, normalizeIpForDb } from '@/utils/ip';
import { ValidationError } from '@/utils/errors';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as LoginInput;
    const result = await authService.login(input, {
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: normalizeIpForDb(getClientIp(req)),
    });
    res.json({ data: result });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as RefreshTokenInput;
    const result = await authService.refresh(input);
    res.json({ data: result });
  },

  async logout(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as RefreshTokenInput;
    await authService.logout(input.refreshToken);
    res.status(204).send();
  },

  async me(req: Request, res: Response): Promise<void> {
    res.json({ data: req.author });
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    if (!req.author) {
      throw new ValidationError('Authentication required');
    }
    const input = req.validatedBody as UpdateProfileInput;
    const result = await authService.updateProfile(req.author.id, input);
    res.json({ data: result });
  },

  async changePassword(req: Request, res: Response): Promise<void> {
    if (!req.author) {
      throw new ValidationError('Authentication required');
    }
    const input = req.validatedBody as ChangePasswordInput;
    await authService.changePassword(req.author.id, input);
    res.status(204).send();
  },
};
