import { prisma } from '@/config/prisma';
import type { EntityType, Prisma } from '@prisma/client';
import { logger } from '@/config/logger';

/** Save a JSON snapshot of a content entity to content_versions table. */
export async function saveContentVersion(
  entityType: EntityType,
  entityId: string,
  snapshot: Record<string, unknown>,
  createdById?: string | null,
  changeSummary?: string | null,
): Promise<void> {
  try {
    const latest = await prisma.contentVersion.findFirst({
      where: { entityType, entityId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = (latest?.version ?? 0) + 1;

    await prisma.contentVersion.create({
      data: {
        entityType,
        entityId,
        version: nextVersion,
        snapshot: snapshot as Prisma.InputJsonValue,
        changeSummary: changeSummary ?? null,
        createdById: createdById ?? null,
      },
    });
  } catch (error) {
    logger.warn({ error, entityType, entityId }, 'Failed to save content version snapshot');
  }
}
