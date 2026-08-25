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
  viewedAt: string;
}

/** Link click DTO. */
export interface LinkClickDto {
  id: string;
  visitorId: string | null;
  targetType: ClickTargetType;
  targetUrl: string;
  sourcePath: string | null;
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
}

/** Record page view request. */
export interface RecordViewRequest {
  sessionId: string;
  path: string;
  title?: string;
  referrer?: string;
  durationSeconds?: number;
}

/** Record link click request. */
export interface RecordClickRequest {
  sessionId?: string;
  targetType: ClickTargetType;
  targetUrl: string;
  sourcePath?: string;
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
}

export interface AdminVisitorLogItem {
  id: string;
  sessionId: string;
  ipAddress: string;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  referrerSource: string | null;
  firstVisitedAt: string;
  lastVisitedAt: string;
  visitCount: number;
  pageViewsCount: number;
  recentPages: Array<{ path: string; viewedAt: string; title: string | null }>;
}

export interface AdminClickItem {
  targetType: ClickTargetType;
  targetUrl: string;
  sourcePath: string | null;
  count: number;
  lastClickedAt: string;
}
