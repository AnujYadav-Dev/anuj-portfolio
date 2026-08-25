// Content version DTOs.

import type { EntityType } from './enums';

export interface ContentVersionDto {
  id: string;
  entityType: EntityType;
  entityId: string;
  version: number;
  snapshot: Record<string, unknown>;
  changeSummary: string | null;
  createdAt: string;
  createdByName?: string | null;
}
