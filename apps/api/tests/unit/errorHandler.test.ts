import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '@/middleware/errorHandler';
import { AppError } from '@/utils/errors';
import type { Request, Response, NextFunction } from 'express';

describe('ErrorHandler Middleware (Unit)', () => {
  const createMockRes = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  it('handles AppError and returns matching status and code', () => {
    const res = createMockRes();
    const err = new AppError('CUSTOM_CODE', 'Custom message', 400);

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CUSTOM_CODE',
        message: 'Custom message',
      },
    });
  });

  it('maps Prisma P2002 unique constraint violation to 409 CONFLICT', () => {
    const res = createMockRes();
    const prismaError = Object.assign(new Error('Unique constraint failed'), {
      code: 'P2002',
      meta: { target: ['slug'] },
    });

    errorHandler(prismaError, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: expect.stringContaining('slug'),
      },
    });
  });

  it('maps Prisma P2025 record not found to 404 NOT_FOUND', () => {
    const res = createMockRes();
    const prismaError = Object.assign(new Error('Record to update not found'), {
      code: 'P2025',
    });

    errorHandler(prismaError, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: expect.stringContaining('not found'),
      },
    });
  });
});
