// Content version Zod validation schemas.

import { z } from 'zod';

export const restoreVersionParamsSchema = z.object({
  id: z.string().uuid(),
  version: z.coerce.number().int().min(1),
});

export type RestoreVersionParams = z.infer<typeof restoreVersionParamsSchema>;
