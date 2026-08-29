import {
  activityLogRepository,
  type CreateActivityLogParams,
} from '@/repositories/activityLog.repository';
import { mapActivityLogToDto } from '@/utils/mappers';
import { logger } from '@/config/logger';
import type { ActivityLogDto } from '@portfolio/shared';

export const activityLogService = {
  async log(params: CreateActivityLogParams): Promise<void> {
    try {
      await activityLogRepository.create(params);
    } catch (err) {
      logger.warn({ err, params }, 'Failed to record activity log');
    }
  },

  async getRecent(limit = 50): Promise<ActivityLogDto[]> {
    const logs = await activityLogRepository.findRecent(limit);
    return logs.map(mapActivityLogToDto);
  },
};
