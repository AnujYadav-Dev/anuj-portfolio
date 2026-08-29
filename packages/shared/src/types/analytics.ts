// Analytics DTOs — visitor sessions, page views, link clicks, and admin telemetry.

import type { ClickTargetType } from './enums';

/** Visitor session DTO. */
export interface VisitorDto {
  id: string;
  sessionId: string;
  ipAddress: string;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
  timezone: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  referrerSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  intentScore: number;
  intentCategory: string | null;
  firstVisitedAt: string;
  lastVisitedAt: string;
  visitCount: number;
}

/** Page view DTO. */
export interface PageViewDto {
  id: string;
  visitorId: string;
  path: string;
  title: string | null;
  referrer: string | null;
  durationSeconds: number | null;
  scrollDepth: number | null;
  loadTimeMs: number | null;
  viewedAt: string;
}

/** Link click DTO. */
export interface LinkClickDto {
  id: string;
  visitorId: string | null;
  targetType: ClickTargetType;
  targetUrl: string;
  sourcePath: string | null;
  label: string | null;
  clickedAt: string;
}

/** Register visitor session request. */
export interface RegisterSessionRequest {
  sessionId: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  timezone?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

/** Record page view request. */
export interface RecordViewRequest {
  sessionId: string;
  path: string;
  title?: string;
  referrer?: string;
  durationSeconds?: number;
  scrollDepth?: number;
  loadTimeMs?: number;
}

/** Record beacon heartbeat / dwell time request. */
export interface RecordBeaconRequest {
  sessionId: string;
  path: string;
  durationSeconds?: number;
  scrollDepth?: number;
  loadTimeMs?: number;
}

/** Record link click request. */
export interface RecordClickRequest {
  sessionId?: string;
  targetType: ClickTargetType;
  targetUrl: string;
  sourcePath?: string;
  label?: string;
}

// ──────────────────────────────────────────────
// Admin Analytics Overview & Reporting DTOs
// ──────────────────────────────────────────────

export type AnalyticsPeriod = '24h' | '7d' | '14d' | '30d' | '90d' | 'all';

export interface BreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

export interface AdminAnalyticsOverviewDto {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgSessionDurationSeconds: number;
  bounceRatePercent: number;
  totalLinkClicks: number;
  topCountries: BreakdownItem[];
  topReferrers: BreakdownItem[];
  deviceBreakdown: BreakdownItem[];
  browserBreakdown: BreakdownItem[];
  osBreakdown: BreakdownItem[];
  intentBreakdown: BreakdownItem[];
}

export interface AnalyticsTimeSeriesPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
}

export interface AdminTopPageItem {
  path: string;
  title: string | null;
  views: number;
  uniqueVisitors: number;
  avgDurationSeconds: number | null;
  avgScrollDepthPercent: number | null;
}

export interface AdminVisitorLogItem {
  id: string;
  sessionId: string;
  ipAddress: string;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
  timezone: string | null;
  referrer: string | null;
  referrerSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  intentScore: number;
  intentCategory: string | null;
  firstVisitedAt: string;
  lastVisitedAt: string;
  visitCount: number;
  pageViewsCount: number;
  linkClicksCount: number;
  recentPages: Array<{ path: string; viewedAt: string; title: string | null; durationSeconds: number | null; scrollDepth: number | null }>;
}

export interface AdminClickItem {
  targetType: ClickTargetType;
  targetUrl: string;
  sourcePath: string | null;
  label: string | null;
  count: number;
  lastClickedAt: string;
}

export interface AdminLivePulseDto {
  activeVisitors: number;
  windowMinutes: number;
  timestamp: string;
}

export interface AdminGeoMapItem {
  countryCode: string;
  countryName: string;
  visitorCount: number;
  percentage: number;
}

export interface JourneyStep {
  type: 'page_view' | 'link_click' | 'contact_submission';
  title: string;
  pathOrUrl: string;
  timestamp: string;
  durationSeconds?: number | null;
  scrollDepth?: number | null;
  meta?: Record<string, unknown>;
}

export interface AdminVisitorJourneyDto {
  visitor: VisitorDto;
  steps: JourneyStep[];
  totalDwellTimeSeconds: number;
}

/** Administrative audit trail & system activity log DTO. */
export interface ActivityLogDto {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
}
