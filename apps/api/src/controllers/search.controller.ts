import type { Request, Response } from 'express';
import { searchService } from '@/services/search.service';
import type { SearchQuery } from '@portfolio/shared';

export const searchController = {
  async search(req: Request, res: Response): Promise<void> {
    const query = req.validatedQuery as SearchQuery;
    const results = await searchService.search(query);
    res.json({ data: results });
  },
};
