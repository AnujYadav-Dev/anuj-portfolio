'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  AdminAnalyticsOverviewDto,
  AnalyticsTimeSeriesPoint,
  AdminTopPageItem,
  AdminVisitorLogItem,
  AdminClickItem,
  PaginatedResponse,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { TimeSeriesChart, DistributionBarList } from '@/components/admin/ui/SimpleChart';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  Globe,
  Compass,
  Monitor,
  MousePointerClick,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export default function AdminAnalyticsDashboardPage() {
  const [period, setPeriod] = useState<string>('30d');
  const [overview, setOverview] = useState<AdminAnalyticsOverviewDto | null>(null);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeSeriesPoint[]>([]);
  const [topPages, setTopPages] = useState<AdminTopPageItem[]>([]);
  const [clickStats, setClickStats] = useState<AdminClickItem[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<AdminVisitorLogItem[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logTotalItems, setLogTotalItems] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, timeseriesRes, topPagesRes, clicksRes, logsRes] =
        await Promise.allSettled([
          apiClient.get<{ data: AdminAnalyticsOverviewDto }>(
            `/analytics/admin/overview?period=${period}`,
          ),
          apiClient.get<{ data: AnalyticsTimeSeriesPoint[] }>(
            `/analytics/admin/timeseries?period=${period}`,
          ),
          apiClient.get<{ data: AdminTopPageItem[] }>(
            `/analytics/admin/top-pages?period=${period}`,
          ),
          apiClient.get<{ data: AdminClickItem[] }>(`/analytics/admin/clicks?period=${period}`),
          apiClient.get<PaginatedResponse<AdminVisitorLogItem>>(
            `/analytics/admin/visitors?page=${logPage}&pageSize=15`,
          ),
        ]);

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data);
      if (timeseriesRes.status === 'fulfilled') setTimeseries(timeseriesRes.value.data || []);
      if (topPagesRes.status === 'fulfilled') setTopPages(topPagesRes.value.data || []);
      if (clicksRes.status === 'fulfilled') setClickStats(clicksRes.value.data || []);
      if (logsRes.status === 'fulfilled') {
        setVisitorLogs(logsRes.value.data || []);
        setLogTotalPages(logsRes.value.pagination.totalPages || 1);
        setLogTotalItems(logsRes.value.pagination.totalItems || 0);
      }
    } catch {
      toast.error('Failed to load telemetry analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period, logPage]);

  const topPageColumns: Column<AdminTopPageItem>[] = [
    {
      key: 'path',
      header: 'Page Route / Title',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-bold text-foreground font-mono block">{item.path}</span>
          <span className="text-[11px] text-muted truncate">{item.title || '(No Title)'}</span>
        </div>
      ),
    },
    {
      key: 'views',
      header: 'Page Views',
      render: (item) => (
        <span className="font-mono text-xs text-foreground font-semibold">
          {item.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'uniqueVisitors',
      header: 'Unique Visitors',
      render: (item) => (
        <span className="font-mono text-xs text-muted">{item.uniqueVisitors.toLocaleString()}</span>
      ),
    },
    {
      key: 'avgDurationSeconds',
      header: 'Avg Time on Page',
      render: (item) => (
        <span className="font-mono text-xs text-muted">{item.avgDurationSeconds}s</span>
      ),
    },
  ];

  const clickColumns: Column<AdminClickItem>[] = [
    {
      key: 'targetUrl',
      header: 'Link Target URL',
      render: (item) => (
        <div className="min-w-0 max-w-sm">
          <span className="font-mono text-xs text-foreground truncate block">{item.targetUrl}</span>
          <span className="text-[10px] text-accent font-mono uppercase">{item.targetType}</span>
        </div>
      ),
    },
    {
      key: 'sourcePath',
      header: 'Clicked On (Route)',
      render: (item) => <span className="font-mono text-xs text-muted">{item.sourcePath}</span>,
    },
    {
      key: 'count',
      header: 'Click Count',
      render: (item) => (
        <span className="font-mono text-xs text-foreground font-bold">
          {item.count.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'lastClickedAt',
      header: 'Last Clicked',
      render: (item) => (
        <span className="font-mono text-xs text-muted">
          {new Date(item.lastClickedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const visitorLogColumns: Column<AdminVisitorLogItem>[] = [
    {
      key: 'location',
      header: 'Location / IP',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-bold text-foreground text-xs block">
            {item.city ? `${item.city}, ${item.country}` : item.country || 'Global Visitor'}
          </span>
          <span className="text-[10px] text-muted font-mono">
            {item.ipAddress || item.sessionId.substring(0, 12)}
          </span>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device & OS',
      render: (item) => (
        <div className="text-xs font-mono text-muted">
          <span>{item.deviceType || 'Desktop'}</span>
          <span className="opacity-80">
            {' '}
            • {item.browser || 'Browser'} on {item.os || 'OS'}
          </span>
        </div>
      ),
    },
    {
      key: 'referrer',
      header: 'Referrer',
      render: (item) => (
        <span className="text-xs font-mono text-accent truncate block max-w-[150px]">
          {item.referrerSource || 'Direct / Bookmark'}
        </span>
      ),
    },
    {
      key: 'pageViewsCount',
      header: 'Views',
      render: (item) => (
        <span className="font-mono text-xs text-foreground">{item.pageViewsCount} pages</span>
      ),
    },
    {
      key: 'lastVisitedAt',
      header: 'Visited At',
      render: (item) => (
        <span className="font-mono text-xs text-muted">
          {new Date(item.lastVisitedAt).toLocaleDateString()}{' '}
          {new Date(item.lastVisitedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Aggregating Telemetry & Traffic Data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Timeframe Switcher */}
      <AdminPageHeader
        title="Visitor Telemetry & Analytics Dashboard"
        description="Self-hosted, privacy-first platform analytics without third-party tracking scripts."
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
              {['24h', '7d', '30d', '90d', 'all'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors',
                    period === p
                      ? 'bg-surface text-foreground font-bold shadow-sm'
                      : 'text-muted hover:text-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadAnalytics}
              disabled={isRefreshing}
              title="Refresh Telemetry"
            >
              <RefreshCw
                className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-accent')}
              />
            </Button>
          </div>
        }
      />

      {/* Topline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Page Views
            </span>
            <Eye className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {overview?.totalPageViews.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="bg-surface border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Unique Visitors
            </span>
            <Users className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {overview?.uniqueVisitors.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="bg-surface border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Total Sessions
            </span>
            <Compass className="w-4 h-4 text-muted" />
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {overview?.totalSessions.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="bg-surface border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Avg Session Time
            </span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {overview?.avgSessionDurationSeconds || 0}s
          </p>
        </Card>
      </div>

      {/* Traffic Trajectory Chart */}
      <Card className="bg-surface border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-bold text-foreground">
            Traffic Trajectory Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <TimeSeriesChart data={timeseries} height={280} />
        </CardContent>
      </Card>

      {/* 4-Card Breakdown Distribution Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Countries */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent" /> Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DistributionBarList items={overview?.topCountries || []} />
          </CardContent>
        </Card>

        {/* Card 2: Referrers */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-accent" /> Referrer Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DistributionBarList items={overview?.topReferrers || []} />
          </CardContent>
        </Card>

        {/* Card 3: Devices */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-accent" /> Device Types
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DistributionBarList items={overview?.deviceBreakdown || []} />
          </CardContent>
        </Card>

        {/* Card 4: Browsers */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent" /> Top Browsers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DistributionBarList items={overview?.browserBreakdown || []} />
          </CardContent>
        </Card>
      </div>

      {/* Top Pages Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Top Visited Pages</h2>
        <AdminDataTable
          columns={topPageColumns}
          data={topPages}
          keyExtractor={(item) => item.path}
        />
      </div>

      {/* Outbound Link Clicks */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-accent" />
          <span>Outbound Link & CTA Click Telemetry</span>
        </h2>
        <AdminDataTable
          columns={clickColumns}
          data={clickStats}
          keyExtractor={(item) => `${item.targetUrl}-${item.sourcePath}`}
        />
      </div>

      {/* Live Visitor Stream Logs */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Live Visitor Session Logs</h2>
        <AdminDataTable
          columns={visitorLogColumns}
          data={visitorLogs}
          keyExtractor={(item) => item.id}
          pagination={{
            page: logPage,
            pageSize: 15,
            totalItems: logTotalItems,
            totalPages: logTotalPages,
            onPageChange: setLogPage,
          }}
        />
      </div>
    </div>
  );
}
