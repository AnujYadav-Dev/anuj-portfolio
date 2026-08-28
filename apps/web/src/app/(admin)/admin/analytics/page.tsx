'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  AdminAnalyticsOverviewDto,
  AnalyticsTimeSeriesPoint,
  AdminTopPageItem,
  AdminVisitorLogItem,
  AdminClickItem,
  AdminLivePulseDto,
  AdminGeoMapItem,
  PaginatedResponse,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { TimeSeriesChart, DistributionBarList } from '@/components/admin/ui/SimpleChart';
import { GeoWorldMap } from '@/components/admin/ui/GeoWorldMap';
import { VisitorJourneyModal } from '@/components/admin/ui/VisitorJourneyModal';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Users,
  Eye,
  Clock,
  Globe,
  Compass,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Download,
  Activity,
  Sparkles,
  Footprints,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export default function AdminAnalyticsDashboardPage() {
  const [period, setPeriod] = useState<string>('30d');
  const [overview, setOverview] = useState<AdminAnalyticsOverviewDto | null>(null);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeSeriesPoint[]>([]);
  const [topPages, setTopPages] = useState<AdminTopPageItem[]>([]);
  const [clickStats, setClickStats] = useState<AdminClickItem[]>([]);
  const [geoMap, setGeoMap] = useState<AdminGeoMapItem[]>([]);
  const [livePulse, setLivePulse] = useState<AdminLivePulseDto | null>(null);

  const [visitorLogs, setVisitorLogs] = useState<AdminVisitorLogItem[]>([]);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logTotalItems, setLogTotalItems] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Poll live pulse every 15s
  useEffect(() => {
    const fetchPulse = () => {
      apiClient
        .get<{ data: AdminLivePulseDto }>('/analytics/admin/live-pulse')
        .then((res) => setLivePulse(res.data))
        .catch(() => {});
    };

    fetchPulse();
    const interval = setInterval(fetchPulse, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, timeseriesRes, topPagesRes, clicksRes, geoRes, logsRes] =
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
          apiClient.get<{ data: AdminGeoMapItem[] }>(`/analytics/admin/geo-map?period=${period}`),
          apiClient.get<PaginatedResponse<AdminVisitorLogItem>>(
            `/analytics/admin/visitors?page=${logPage}&pageSize=15`,
          ),
        ]);

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data);
      if (timeseriesRes.status === 'fulfilled') setTimeseries(timeseriesRes.value.data || []);
      if (topPagesRes.status === 'fulfilled') setTopPages(topPagesRes.value.data || []);
      if (clicksRes.status === 'fulfilled') setClickStats(clicksRes.value.data || []);
      if (geoRes.status === 'fulfilled') setGeoMap(geoRes.value.data || []);
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
  }, [period, logPage]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExport = async (type: 'visitors' | 'pages' | 'clicks' | 'all') => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/analytics/admin/export?type=${type}&period=${period}&format=csv`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        },
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-telemetry-${type}-${period}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported ${type} telemetry CSV successfully`);
    } catch {
      toast.error('Failed to export telemetry data');
    } finally {
      setIsExporting(false);
    }
  };

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
      header: 'Total Views',
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
        <span className="font-mono text-xs text-accent font-semibold">{item.uniqueVisitors.toLocaleString()}</span>
      ),
    },
    {
      key: 'avgDurationSeconds',
      header: 'Avg Dwell Time',
      render: (item) => (
        <span className="font-mono text-xs text-muted">{item.avgDurationSeconds ? `${item.avgDurationSeconds}s` : '—'}</span>
      ),
    },
    {
      key: 'avgScrollDepthPercent',
      header: 'Avg Scroll Read',
      render: (item) => (
        <span className="font-mono text-xs text-info">{item.avgScrollDepthPercent ? `${item.avgScrollDepthPercent}%` : '—'}</span>
      ),
    },
  ];

  const clickColumns: Column<AdminClickItem>[] = [
    {
      key: 'targetUrl',
      header: 'Action / Target URL',
      render: (item) => (
        <div className="min-w-0 max-w-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-accent font-mono uppercase bg-surface-muted px-1.5 py-0.5 rounded-xs border border-border">
              {item.targetType}
            </span>
            {item.label && <span className="font-bold text-foreground text-xs truncate">{item.label}</span>}
          </div>
          <span className="font-mono text-[11px] text-muted truncate block mt-0.5">{item.targetUrl}</span>
        </div>
      ),
    },
    {
      key: 'sourcePath',
      header: 'Trigger Route',
      render: (item) => <span className="font-mono text-xs text-muted">{item.sourcePath || 'Direct'}</span>,
    },
    {
      key: 'count',
      header: 'Clicks / Copies',
      render: (item) => (
        <span className="font-mono text-xs text-foreground font-bold">
          {item.count.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'lastClickedAt',
      header: 'Last Triggered',
      render: (item) => (
        <span className="font-mono text-xs text-muted">
          {new Date(item.lastClickedAt).toLocaleDateString()} {new Date(item.lastClickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
  ];

  const visitorLogColumns: Column<AdminVisitorLogItem>[] = [
    {
      key: 'intent',
      header: 'Visitor Intent',
      render: (item) => {
        const cat = item.intentCategory;
        const score = item.intentScore ?? 0;
        switch (cat) {
          case 'recruiter':
            return <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">💼 Recruiter ({score})</span>;
          case 'lead':
            return <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">📬 Lead ({score})</span>;
          case 'tech_evaluator':
            return <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">🛠️ Tech Lead ({score})</span>;
          case 'reader':
            return <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-info/15 text-info border border-info/30">📖 Reader ({score})</span>;
          default:
            return <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-surface-muted text-muted border border-border">🌐 Casual ({score})</span>;
        }
      },
    },
    {
      key: 'location',
      header: 'Location & IP',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-bold text-foreground text-xs block">
            {item.city ? `${item.city}, ${item.country}` : item.country || 'Global Visitor'}
          </span>
          <span className="text-[10px] text-muted font-mono">
            {item.ipAddress}
          </span>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device & Specs',
      render: (item) => (
        <div className="text-xs font-mono text-muted">
          <span>{item.deviceType || 'Desktop'}</span>
          <span className="opacity-80"> • {item.browser || 'Browser'} on {item.os || 'OS'}</span>
        </div>
      ),
    },
    {
      key: 'referrer',
      header: 'Source & Campaign',
      render: (item) => (
        <div className="min-w-0">
          <span className="text-xs font-mono text-accent truncate block max-w-[140px]">
            {item.referrerSource || 'Direct'}
          </span>
          {item.utmCampaign && (
            <span className="text-[10px] text-muted font-mono block truncate">
              🏷️ {item.utmCampaign}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'pageViewsCount',
      header: 'Views & Clicks',
      render: (item) => (
        <span className="font-mono text-xs text-foreground">
          {item.pageViewsCount} views • {item.linkClicksCount} clicks
        </span>
      ),
    },
    {
      key: 'lastVisitedAt',
      header: 'Last Active',
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
    {
      key: 'actions',
      header: 'Footprint',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedVisitorId(item.id)}
          className="text-xs font-mono gap-1 h-7 px-2 border-border/80 hover:border-accent"
        >
          <Footprints className="h-3 w-3 text-accent" />
          <span>Journey</span>
        </Button>
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
      {/* Header with Live Pulse & Timeframe Switcher */}
      <AdminPageHeader
        title="Visitor Telemetry & Analytics Dashboard"
        description="Self-hosted, privacy-first platform analytics without third-party tracking scripts."
        action={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Real-time Live Pulse Badge */}
            <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border font-mono text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-foreground font-semibold">
                {livePulse?.activeVisitors || 0} online now
              </span>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
              {['24h', '7d', '14d', '30d', '90d', 'all'].map((p) => (
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

            {/* Export CSV Button */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('all')}
                disabled={isExporting}
                className="font-mono text-xs gap-1.5"
                title="Export Telemetry CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>

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
          </div>
        }
      />

      {/* Topline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-surface border-border p-4 shadow-sm">
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

        <Card className="bg-surface border-border p-4 shadow-sm">
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

        <Card className="bg-surface border-border p-4 shadow-sm">
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

        <Card className="bg-surface border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Avg Dwell Time
            </span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {overview?.avgSessionDurationSeconds || 0}s
          </p>
        </Card>

        <Card className="bg-surface border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Bounce Rate
            </span>
            <Activity className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {overview?.bounceRatePercent || 0}%
          </p>
        </Card>

        <Card className="bg-surface border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Clicks & Copies
            </span>
            <MousePointerClick className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono mt-2">
            {overview?.totalLinkClicks.toLocaleString() || 0}
          </p>
        </Card>
      </div>

      {/* Traffic Trajectory Chart */}
      <Card className="bg-surface border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground">
            Traffic Trajectory Over Time ({period === '24h' ? 'Hourly View' : 'Daily View'})
          </CardTitle>
          <span className="text-xs font-mono text-muted">Real-Time Aggregation</span>
        </CardHeader>
        <CardContent className="pt-6">
          <TimeSeriesChart data={timeseries} height={280} />
        </CardContent>
      </Card>

      {/* Dark-Mode SVG World Map */}
      <GeoWorldMap data={geoMap} />

      {/* Breakdown Distribution Grid (Referrers, Devices, Browsers, Intents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Referrers */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-accent" /> Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DistributionBarList items={overview?.topReferrers || []} />
          </CardContent>
        </Card>

        {/* Card 2: Visitor Intents */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Visitor Intent Profiling
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DistributionBarList items={overview?.intentBreakdown || []} />
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
              <Globe className="w-3.5 h-3.5 text-accent" /> Browsers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DistributionBarList items={overview?.browserBreakdown || []} />
          </CardContent>
        </Card>
      </div>

      {/* Top Pages Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Top Visited Pages & Content Readership</h2>
          <Button variant="ghost" size="sm" onClick={() => handleExport('pages')} className="text-xs font-mono gap-1 text-muted hover:text-foreground">
            <Download className="w-3 h-3" /> Export Pages
          </Button>
        </div>
        <AdminDataTable
          columns={topPageColumns}
          data={topPages}
          keyExtractor={(item, index) => `${item.path}-${index}`}
        />
      </div>

      {/* Outbound Link Clicks & Code Copies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-accent" />
            <span>Outbound Link & Code Copy Telemetry</span>
          </h2>
          <Button variant="ghost" size="sm" onClick={() => handleExport('clicks')} className="text-xs font-mono gap-1 text-muted hover:text-foreground">
            <Download className="w-3 h-3" /> Export Clicks
          </Button>
        </div>
        <AdminDataTable
          columns={clickColumns}
          data={clickStats}
          keyExtractor={(item, index) =>
            `${item.targetUrl}-${item.sourcePath || 'direct'}-${index}`
          }
        />
      </div>

      {/* Live Visitor Stream Logs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Live Visitor Session Logs & Intent Scoring</h2>
          <Button variant="ghost" size="sm" onClick={() => handleExport('visitors')} className="text-xs font-mono gap-1 text-muted hover:text-foreground">
            <Download className="w-3 h-3" /> Export Logs
          </Button>
        </div>
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

      {/* Interactive Visitor Journey Drawer */}
      <VisitorJourneyModal
        visitorId={selectedVisitorId}
        onClose={() => setSelectedVisitorId(null)}
      />
    </div>
  );
}
