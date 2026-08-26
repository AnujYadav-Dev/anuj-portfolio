import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateBody, validateQuery, validateParams } from '@/middleware/validate.middleware';
import { ValidationError } from '@/utils/errors';
import type { Request, Response } from 'express';

describe('ValidateMiddleware (Unit)', () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  });

  it('should pass validation and assign validated data on valid body', () => {
    const middleware = validateBody(schema);
    const req = {
      body: { email: 'test@example.com', age: 25 },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.validatedBody).toEqual({ email: 'test@example.com', age: 25 });
  });

  it('should call next with ValidationError on invalid body', () => {
    const middleware = validateBody(schema);
    const req = {
      body: { email: 'not-an-email', age: 12 },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.statusCode).toBe(422);
    expect(error.details).toHaveProperty('email');
    expect(error.details).toHaveProperty('age');
  });

  it('should validate query parameters and route parameters correctly', () => {
    const querySchema = z.object({ page: z.coerce.number().default(1) });
    const queryMiddleware = validateQuery(querySchema);
    const reqQuery = { query: { page: '3' } } as unknown as Request;
    const nextQuery = vi.fn();

    queryMiddleware(reqQuery, {} as Response, nextQuery);
    expect(nextQuery).toHaveBeenCalledWith();
    expect(reqQuery.validatedQuery).toEqual({ page: 3 });

    const paramSchema = z.object({ id: z.string().uuid() });
    const paramMiddleware = validateParams(paramSchema);
    const reqParam = { params: { id: 'invalid-uuid' } } as unknown as Request;
    const nextParam = vi.fn();

    paramMiddleware(reqParam, {} as Response, nextParam);
    expect(nextParam).toHaveBeenCalledWith(expect.any(ValidationError));
  });
});
