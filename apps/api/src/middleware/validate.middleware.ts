import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@/utils/errors';

function formatZodErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors;
  const details: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      details[field] = messages;
    }
  }

  return details;
}

function createValidator(
  source: 'body' | 'query' | 'params',
  assignKey: 'validatedBody' | 'validatedQuery' | 'validatedParams',
) {
  return (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        next(new ValidationError('Validation failed', formatZodErrors(result.error)));
        return;
      }

      req[assignKey] = result.data;
      next();
    };
  };
}

/** Validate request body against a Zod schema. */
export const validateBody = createValidator('body', 'validatedBody');

/** Validate query parameters against a Zod schema. */
export const validateQuery = createValidator('query', 'validatedQuery');

/** Validate route params against a Zod schema. */
export const validateParams = createValidator('params', 'validatedParams');
