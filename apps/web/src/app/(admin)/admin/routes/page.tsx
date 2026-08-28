'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Lock,
  Database,
  CornerDownRight,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  RefreshCw,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRoutesDirectory, type RouteItem, type RouteArea } from '@/hooks/useRoutesDirectory';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

type TabFilter = 'all' | 'public' | 'admin' | 'database' | 'redirect';

export default function AdminRoutesDirectoryPage() {
  const { routes, counts, isLoading, refetch } = useRoutesDirectory();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy URL action helper
  const handleCopyUrl = (item: RouteItem) => {
    const fullUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${item.path}`
        : item.path;

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setCopiedId(item.id);
        toast.success(`Copied '${item.path}' to clipboard`);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy URL to clipboard');
      });
  };

  // Filtered routes calculation
  const filteredRoutes = useMemo(() => {
    return routes.filter((item) => {
      // 1. Tab Area Filter
      if (activeTab !== 'all' && item.area !== activeTab) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active_published') {
          if (item.status !== 'active' && item.status !== 'published') return false;
        } else if (statusFilter === 'inactive_draft') {
          if (item.status !== 'inactive' && item.status !== 'draft' && item.status !== 'archived')
            return false;
        } else if (item.status !== statusFilter) {
          return false;
        }
      }

      // 3. Search Term Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesPath = item.path.toLowerCase().includes(query);
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesSource = item.source.toLowerCase().includes(query);
        const matchesDest = item.destinationUrl?.toLowerCase().includes(query);

        return Boolean(matchesPath || matchesTitle || matchesDesc || matchesSource || matchesDest);
      }

      return true;
    });
  }, [routes, activeTab, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <AdminPageHeader
        title="Routes Directory & URL Explorer"
        description="Centralized catalog of all public pages, admin dashboard URLs, database-defined dynamic pages, and system redirects."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-xs"
            leftIcon={<RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />}
          >
            Refresh Catalog
          </Button>
        }
      />

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          label="Total Tracked URLs"
          value={counts.total}
          icon={Layers}
          isActive={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        />
        <MetricCard
          label="Public Pages"
          value={counts.public}
          icon={Globe}
          isActive={activeTab === 'public'}
          onClick={() => setActiveTab('public')}
        />
        <MetricCard
          label="Admin CMS URLs"
          value={counts.admin}
          icon={Lock}
          isActive={activeTab === 'admin'}
          onClick={() => setActiveTab('admin')}
        />
        <MetricCard
          label="Dynamic DB Pages"
          value={counts.database}
          icon={Database}
          isActive={activeTab === 'database'}
          onClick={() => setActiveTab('database')}
        />
        <MetricCard
          label="System Redirects"
          value={counts.redirects}
          icon={CornerDownRight}
          isActive={activeTab === 'redirect'}
          onClick={() => setActiveTab('redirect')}
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-surface border border-border p-3.5 rounded-lg">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            type="text"
            placeholder="Search path, title, destination, or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-surface-muted text-foreground border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
            aria-label="Filter routes by status"
          >
            <option value="all">All Statuses</option>
            <option value="active_published">Active / Published Only</option>
            <option value="inactive_draft">Inactive / Draft / Archived</option>
            <option value="active">Active</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="permanent_308">308 Permanent Redirect</option>
            <option value="auth_guard">Auth Guard</option>
          </select>
        </div>
      </div>

      {/* 4. Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none pb-px text-xs font-medium">
        <TabButton
          label="All URLs"
          count={counts.total}
          isActive={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        />
        <TabButton
          label="Public URLs"
          count={counts.public}
          isActive={activeTab === 'public'}
          onClick={() => setActiveTab('public')}
        />
        <TabButton
          label="Admin CMS URLs"
          count={counts.admin}
          isActive={activeTab === 'admin'}
          onClick={() => setActiveTab('admin')}
        />
        <TabButton
          label="Dynamic DB Pages"
          count={counts.database}
          isActive={activeTab === 'database'}
          onClick={() => setActiveTab('database')}
        />
        <TabButton
          label="Redirects & Aliases"
          count={counts.redirects}
          isActive={activeTab === 'redirect'}
          onClick={() => setActiveTab('redirect')}
        />
      </div>

      {/* 5. Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-muted bg-surface border border-border rounded-lg animate-pulse text-xs font-mono">
          Loading routes catalog and dynamic database entities...
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-lg space-y-3">
          <Sparkles className="w-8 h-8 text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No routes match your criteria</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Try adjusting your search query or switching the category tab filter.
          </p>
          {(searchTerm || statusFilter !== 'all' || activeTab !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setActiveTab('all');
              }}
              className="text-xs mt-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : activeTab === 'redirect' ? (
        // Dedicated Redirects Flow View
        <div className="grid grid-cols-1 gap-3">
          {filteredRoutes.map((item) => {
            const hasStaticDestination =
              item.destinationUrl && !item.destinationUrl.startsWith('[') && !item.path.includes('[');

            return (
              <div
                key={item.id}
                className="bg-surface border border-border hover:border-accent/40 transition-colors p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-foreground bg-surface-muted px-2 py-0.5 rounded border border-border">
                      {item.path}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      {item.destinationUrl}
                    </span>
                    <StatusPill status={item.status} />
                  </div>
                  <div className="text-xs font-medium text-foreground">{item.title}</div>
                  <p className="text-[11px] text-muted leading-relaxed">{item.description}</p>
                  <div className="text-[10px] font-mono text-placeholder">Source: {item.source}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyUrl(item)}
                    title="Copy Source URL"
                    className="h-8 px-2.5 text-xs text-muted hover:text-foreground"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-success mr-1" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>Copy</span>
                  </Button>
                  {hasStaticDestination && (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Test Redirect
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Standard Routes Table View
        <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-[11px] font-mono text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Route Path / URL</th>
                  <th className="py-3 px-4">Name & Purpose</th>
                  <th className="py-3 px-4">Area / Type</th>
                  <th className="py-3 px-4">Source Origin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRoutes.map((item) => {
                  const isParameterized =
                    item.path.includes('[') || item.category === 'route_pattern';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-muted/30 transition-colors group"
                    >
                      {/* 1. Path */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                        <div className="flex items-center gap-1.5 min-w-[180px]">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded border select-all',
                              isParameterized
                                ? 'bg-surface-muted text-placeholder border-border/80'
                                : 'bg-surface-muted/80 text-foreground border-border group-hover:border-accent/40 group-hover:text-accent',
                            )}
                          >
                            {item.path}
                          </span>
                        </div>
                      </td>

                      {/* 2. Name & Description */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-semibold text-foreground">{item.title}</div>
                        <div className="text-[11px] text-muted line-clamp-1 mt-0.5">
                          {item.description}
                        </div>
                      </td>

                      {/* 3. Area Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <AreaPill
                          area={item.area}
                          category={item.category}
                          isParameterized={isParameterized}
                        />
                      </td>

                      {/* 4. Source Origin */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[10px] text-muted">
                        {item.source}
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill status={item.status} />
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy URL button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(item)}
                            title="Copy URL"
                            className="h-7 w-7 p-0 text-muted hover:text-foreground"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          {/* Direct Admin Edit link for database entities */}
                          {item.adminEditUrl && !item.adminEditUrl.includes('[') && (
                            <Link href={item.adminEditUrl}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted hover:text-accent"
                                title="Edit in Admin CMS"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}

                          {/* Open / Preview Button (Only for concrete, non-parameterized routes) */}
                          {!isParameterized && (
                            <a
                              href={item.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] text-muted hover:text-accent flex items-center gap-1"
                                title="Preview Live Route"
                              >
                                <span>Preview</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Count */}
          <div className="px-4 py-3 bg-surface-muted/30 border-t border-border flex items-center justify-between text-xs text-muted font-mono">
            <span>
              Showing {filteredRoutes.length} of {routes.length} total routes
            </span>
            <span>Portfolio Architecture v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Metric Card Primitive */
function MetricCard({
  label,
  value,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-3.5 rounded-lg border text-left transition-all cursor-pointer select-none flex flex-col justify-between gap-2',
        isActive
          ? 'bg-accent/10 border-accent text-foreground shadow-xs'
          : 'bg-surface border-border hover:border-muted text-muted hover:text-foreground',
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] font-mono uppercase tracking-wider">{label}</span>
        <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-muted')} />
      </div>
      <div className="text-xl font-bold font-mono text-foreground">{value}</div>
    </button>
  );
}

/** Tab Button Primitive */
function TabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3.5 py-2 rounded-t-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none border-b-2',
        isActive
          ? 'border-accent text-accent bg-surface'
          : 'border-transparent text-muted hover:text-foreground hover:bg-surface/50',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'px-1.5 py-0.2 text-[10px] font-mono rounded-full',
          isActive ? 'bg-accent/20 text-accent font-semibold' : 'bg-surface-muted text-muted',
        )}
      >
        {count}
      </span>
    </button>
  );
}

/** Area Pill Component */
function AreaPill({
  area,
  category,
  isParameterized,
}: {
  area: RouteArea;
  category: string;
  isParameterized?: boolean;
}) {
  if (isParameterized || category === 'route_pattern') {
    return (
      <Badge variant="outline" size="sm" className="text-[10px] font-mono text-placeholder">
        Pattern
      </Badge>
    );
  }

  switch (area) {
    case 'public':
      return (
        <Badge variant="outline" size="sm" className="text-[10px] font-mono text-foreground">
          Public
        </Badge>
      );
    case 'admin':
      return (
        <Badge
          variant="default"
          size="sm"
          className="text-[10px] font-mono text-accent border-accent/30 bg-accent/10"
        >
          Admin CMS
        </Badge>
      );
    case 'database':
      return (
        <Badge variant="accent" size="sm" className="text-[10px] font-mono">
          Dynamic DB
        </Badge>
      );
    case 'redirect':
      return (
        <Badge variant="outline" size="sm" className="text-[10px] font-mono text-warning">
          Redirect
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" size="sm">
          {area}
        </Badge>
      );
  }
}

/** Status Pill Component */
function StatusPill({ status }: { status: string }) {
  switch (status) {
    case 'active':
    case 'published':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-success font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span>{status === 'published' ? 'Published' : 'Active'}</span>
        </span>
      );
    case 'draft':
    case 'inactive':
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-placeholder">
          <span className="w-1.5 h-1.5 rounded-full bg-placeholder" />
          <span className="capitalize">{status}</span>
        </span>
      );
    case 'permanent_308':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-success/10 text-success border border-success/30 px-1.5 py-0.5 rounded">
          308 Permanent
        </span>
      );
    case 'temporary_302':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-warning/10 text-warning border border-warning/30 px-1.5 py-0.5 rounded">
          302 Found
        </span>
      );
    case 'auth_guard':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-surface-muted text-muted border border-border px-1.5 py-0.5 rounded">
          Auth Guard
        </span>
      );
    default:
      return <span className="text-[11px] font-mono text-muted">{status}</span>;
  }
}
