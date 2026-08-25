// Analytics Zod validation schemas.

import { z } from 'zod';
import { ClickTargetType } from '../types/enums';

/** Register visitor session request. */
export const registerSessionSchema = z.object({
  sessionId: z.string().min(1).max(255),
  userAgent: z.string().optional(),
  screenWidth: z.number().int().positive().optional(),
  screenHeight: z.number().int().positive().optional(),
  language: z.string().max(20).optional(),
  timezone: z.string().max(100).optional(),
  referrer: z.string().optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
});

export type RegisterSessionInput = z.infer<typeof registerSessionSchema>;

/** Record page view request. */
export const recordViewSchema = z.object({
  sessionId: z.string().min(1).max(255),
  path: z.string().min(1).max(500),
  title: z.string().max(300).optional(),
  referrer: z.string().optional(),
  durationSeconds: z.number().int().min(0).optional(),
});

export type RecordViewInput = z.infer<typeof recordViewSchema>;

/** Record link click request. */
export const recordClickSchema = z.object({
  sessionId: z.string().max(255).optional(),
  targetType: z.nativeEnum(ClickTargetType),
  targetUrl: z.string().min(1),
  sourcePath: z.string().max(500).optional(),
});

export type RecordClickInput = z.infer<typeof recordClickSchema>;

/** Admin analytics query schema. */
export const analyticsQuerySchema = z.object({
  period: z.enum(['24h', '7d', '30d', '90d', 'all']).default('30d'),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
