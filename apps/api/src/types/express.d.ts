import type { AuthorDto } from '@portfolio/shared';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      author?: AuthorDto;
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};
