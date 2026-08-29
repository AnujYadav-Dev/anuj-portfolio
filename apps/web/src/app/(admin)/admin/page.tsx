'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import type {
  AdminAnalyticsOverviewDto,
  AnalyticsTimeSeriesPoint,
  ContactSubmissionDto,
  PaginatedResponse,
  PublicStatsDto,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { TimeSeriesChart, Sparkline } from '@/components/admin/ui/SimpleChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

import { Spinner } from '@/components/ui/spinner';
import {
  Eye,
  Users,
  Inbox,
  FolderGit2,
  FileText,
  MessageSquare,
  PlusCircle,
  HardDrive,
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Activity,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminAnalyticsOverviewDto | null>(null);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeSeriesPoint[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<ContactSubmissionDto[]>([]);
  const [stats, setStats] = useState<PublicStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [overviewRes, timeseriesRes, contactRes, statsRes] = await Promise.allSettled([
          apiClient.get<{ data: AdminAnalyticsOverviewDto }>(
            '/analytics/admin/overview?period=30d',
          ),
          apiClient.get<{ data: AnalyticsTimeSeriesPoint[] }>(
            '/analytics/admin/timeseries?period=14d',
          ),
          apiClient.get<PaginatedResponse<ContactSubmissionDto>>(
            '/contact/admin/submissions?pageSize=5',
          ),
          apiClient.get<{ data: PublicStatsDto }>('/stats'),
        ]);

        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data);
        if (timeseriesRes.status === 'fulfilled') setTimeseries(timeseriesRes.value.data || []);
        if (contactRes.status === 'fulfilled') setRecentInquiries(contactRes.value.data || []);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Loading Dashboard Telemetry...
        </span>
      </div>
    );
  }

  const sparklineViews = timeseries.map((t) => t.pageViews);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <AdminPageHeader
        title="Portfolio Control Center"
        description="Real-time telemetry, visitor insights, and rapid content authoring shortcuts."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <span>Full Telemetry</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <Link
              href="/admin/blogs/new"
              className={buttonVariants({ variant: 'primary', size: 'sm' })}
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              <span>New Blog Post</span>
            </Link>
          </div>
        }
      />

      {/* Topline KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Page Views */}
        <Card className="bg-surface border-border p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                Total Views (30D)
              </span>
              <p className="text-2xl font-extrabold text-foreground font-mono">
                {overview?.totalPageViews.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-muted pt-3 border-t border-border/50">
            <span className="flex items-center gap-1 text-accent">
              <TrendingUp className="w-3 h-3" /> Live Activity
            </span>
            <Sparkline data={sparklineViews} width={60} height={18} />
          </div>
        </Card>

        {/* Card 2: Unique Visitors */}
        <Card className="bg-surface border-border p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                Unique Visitors (30D)
              </span>
              <p className="text-2xl font-extrabold text-foreground font-mono">
                {overview?.uniqueVisitors.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-muted text-foreground flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-muted pt-3 border-t border-border/50">
            <span>Avg Duration</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-placeholder" />
              {overview?.avgSessionDurationSeconds || 0}s
            </span>
          </div>
        </Card>

        {/* Card 3: Contact Submissions */}
        <Card className="bg-surface border-border p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                Contact Inbox
              </span>
              <p className="text-2xl font-extrabold text-foreground font-mono">
                {recentInquiries.length.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-muted text-accent flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-muted pt-3 border-t border-border/50">
            <span>Unread Messages</span>
            <Link href="/admin/contact" className="text-accent hover:underline">
              View Inbox →
            </Link>
          </div>
        </Card>

        {/* Card 4: Published Content */}
        <Card className="bg-surface border-border p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                Portfolio Entities
              </span>
              <p className="text-2xl font-extrabold text-foreground font-mono">
                {(stats?.totalProjects || 0) + (stats?.totalBlogPosts || 0)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-muted text-foreground flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-muted pt-3 border-t border-border/50">
            <span>{stats?.totalProjects || 0} Projects</span>
            <span>{stats?.totalBlogPosts || 0} Articles</span>
          </div>
        </Card>
      </div>

      {/* Traffic Trends Chart Section */}
      <Card className="bg-surface border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Traffic & Visitor Trajectory (Last 14 Days)
            </CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Daily trend of page views and unique visitor sessions recorded across all routes.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Detailed Insights →
          </Link>
        </CardHeader>

        <CardContent className="pt-6">
          <TimeSeriesChart data={timeseries} height={260} />
        </CardContent>
      </Card>

      {/* 2-Column Split: Quick Shortcuts & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Action Shortcuts */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Quick Management Shortcuts</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/works/new"
              className="p-4 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-muted transition-all group"
            >
              <FolderGit2 className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-foreground">New Project</h3>
              <p className="text-[11px] text-muted mt-0.5">Publish a case study</p>
            </Link>

            <Link
              href="/admin/blogs/new"
              className="p-4 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-muted transition-all group"
            >
              <FileText className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-foreground">Write Article</h3>
              <p className="text-[11px] text-muted mt-0.5">Compose with live MDX</p>
            </Link>

            <Link
              href="/admin/media"
              className="p-4 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-muted transition-all group"
            >
              <HardDrive className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-foreground">Media Library</h3>
              <p className="text-[11px] text-muted mt-0.5">Upload images & files</p>
            </Link>

            <Link
              href="/admin/homepage"
              className="p-4 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-muted transition-all group"
            >
              <SlidersHorizontal className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-foreground">Homepage Builder</h3>
              <p className="text-[11px] text-muted mt-0.5">Reorder landing sections</p>
            </Link>

            <Link
              href="/admin/contact"
              className="p-4 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-muted transition-all group"
            >
              <Inbox className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-foreground">Messages Inbox</h3>
              <p className="text-[11px] text-muted mt-0.5">View contact inquiries</p>
            </Link>

            <Link
              href="/admin/guestbook"
              className="p-4 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-muted transition-all group"
            >
              <MessageSquare className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-foreground">Guestbook Queue</h3>
              <p className="text-[11px] text-muted mt-0.5">Moderate comments</p>
            </Link>

            <Link
              href="/admin/activity"
              className="p-4 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-muted transition-all group"
            >
              <Activity className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-foreground">Audit Trail</h3>
              <p className="text-[11px] text-muted mt-0.5">System activity logs</p>
            </Link>
          </div>
        </div>

        {/* Right Col: Recent Contact Messages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Recent Inquiries</h2>
            <Link href="/admin/contact" className="text-xs text-accent hover:underline">
              View All
            </Link>
          </div>

          <Card className="bg-surface border-border shadow-sm divide-y divide-border">
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted font-mono">
                No recent contact messages in inbox
              </div>
            ) : (
              recentInquiries.map((inq) => (
                <Link
                  key={inq.id}
                  href="/admin/contact"
                  className="block p-3.5 hover:bg-surface-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-foreground truncate max-w-[140px]">
                      {inq.name}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">{inq.subject || inq.message}</p>
                </Link>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
