// Analytics Zod validation schemas.

import { z } from 'zod';
import { ClickTargetType } from '../types/enums';

/** Register visitor session request. */
export const registerSessionSchema = z.object({
  sessionId: z.string().min(1).max(255),
  userAgent: z.string().nullish(),
  screenWidth: z.number().int().positive().nullish(),
  screenHeight: z.number().int().positive().nullish(),
  language: z.string().max(50).nullish(),
  timezone: z.string().max(100).nullish(),
  referrer: z.string().nullish(),
  utmSource: z.string().max(200).nullish(),
  utmMedium: z.string().max(200).nullish(),
  utmCampaign: z.string().max(200).nullish(),
});

export type RegisterSessionInput = z.infer<typeof registerSessionSchema>;

/** Record page view request. */
export const recordViewSchema = z.object({
  sessionId: z.string().min(1).max(255),
  path: z.string().min(1).max(500),
  title: z.string().max(300).nullish(),
  referrer: z.string().nullish(),
  durationSeconds: z.number().int().min(0).nullish(),
});

export type RecordViewInput = z.infer<typeof recordViewSchema>;

/** Record link click request. */
export const recordClickSchema = z.object({
  sessionId: z.string().max(255).nullish(),
  targetType: z.nativeEnum(ClickTargetType).or(z.string()),
  targetUrl: z.string().min(1),
  sourcePath: z.string().max(500).nullish(),
  label: z.string().max(200).nullish(),
});


export type RecordClickInput = z.infer<typeof recordClickSchema>;

/** Admin analytics query schema. */
export const analyticsQuerySchema = z.object({
  period: z.enum(['24h', '7d', '14d', '30d', '90d', 'all']).default('30d'),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
