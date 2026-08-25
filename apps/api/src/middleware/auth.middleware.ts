import type { NextFunction, Request, Response } from 'express';
import { tokenService } from '@/services/token.service';
import { authorRepository } from '@/repositories/author.repository';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import { mapAuthorToDto } from '@/utils/mappers';

/** Require a valid admin access token on protected routes. */
export async function authenticateAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.slice(7);
    const payload = tokenService.verifyAccessToken(token);

    const author = await authorRepository.findByIdWithAvatar(payload.sub);

    if (!author || !author.isEnabled) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!author.isAdmin) {
      throw new ForbiddenError('Admin access required');
    }

    req.author = mapAuthorToDto(author);
    next();
  } catch (error) {
    next(error);
  }
}
