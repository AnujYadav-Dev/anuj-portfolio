'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { ActivityLogDto } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity,
  Search,
  RefreshCw,
  Eye,
  Shield,
  FileEdit,
  Trash2,
  PlusCircle,
  Settings,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [limit, setLimit] = useState<number>(100);

  // Inspector Modal State
  const [selectedLog, setSelectedLog] = useState<ActivityLogDto | null>(null);

  const fetchLogs = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await apiClient.get<{ data: ActivityLogDto[] }>(
        `/analytics/admin/audit-logs?limit=${limit}`,
      );
      setLogs(res.data || []);
      if (showToast) {
        toast.success('Activity logs refreshed');
      }
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (selectedCategory === 'auth' && !log.action.startsWith('admin_') && !log.action.startsWith('auth_') && !log.action.includes('password') && !log.action.includes('profile')) {
        return false;
      }
      if (selectedCategory === 'content' && !log.action.includes('create') && !log.action.includes('update') && !log.action.includes('delete') && !log.action.includes('publish') && !log.action.includes('moderate')) {
        return false;
      }
      if (selectedCategory === 'settings' && !log.action.includes('setting')) {
        return false;
      }
      if (selectedCategory === 'media' && !log.action.includes('media')) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const actionMatch = log.action.toLowerCase().includes(q);
        const entityMatch = (log.entityType || '').toLowerCase().includes(q);
        const authorMatch = (log.authorName || '').toLowerCase().includes(q);
        const detailsMatch = JSON.stringify(log.details || {}).toLowerCase().includes(q);
        const ipMatch = (log.ipAddress || '').toLowerCase().includes(q);
        return actionMatch || entityMatch || authorMatch || detailsMatch || ipMatch;
      }

      return true;
    });
  }, [logs, selectedCategory, searchQuery]);

  // Action badge renderer
  const renderActionBadge = (action: string) => {
    let colorClass = 'bg-muted/10 text-muted border-border';
    let Icon = Activity;

    if (action.includes('create') || action.includes('upload')) {
      colorClass = 'bg-success/10 text-success border-success/30';
      Icon = PlusCircle;
    } else if (action.includes('delete')) {
      colorClass = 'bg-destructive/10 text-destructive border-destructive/30';
      Icon = Trash2;
    } else if (action.includes('update') || action.includes('edit')) {
      colorClass = 'bg-accent/10 text-accent border-accent/30';
      Icon = FileEdit;
    } else if (action.includes('login') || action.includes('auth') || action.includes('password')) {
      colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      Icon = LogIn;
    } else if (action.includes('setting')) {
      colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      Icon = Settings;
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${colorClass}`}
      >
        <Icon className="w-3 h-3" />
        <span>{action.replace(/_/g, ' ')}</span>
      </span>
    );
  };

  const columns: Column<ActivityLogDto>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (item) => {
        const d = new Date(item.createdAt);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-mono font-medium text-foreground">
              {d.toLocaleTimeString()}
            </span>
            <span className="text-[10px] font-mono text-muted">
              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Action Performed',
      render: (item) => renderActionBadge(item.action),
    },
    {
      key: 'entityType',
      header: 'Entity / Target',
      render: (item) => {
        const targetTitle =
          item.details?.title ||
          item.details?.name ||
          item.details?.filename ||
          item.details?.key ||
          item.details?.subject ||
          item.entityId ||
          '—';

        return (
          <div className="flex flex-col min-w-0 max-w-xs">
            <span className="text-xs font-semibold text-foreground truncate">
              {String(targetTitle)}
            </span>
            {item.entityType && (
              <span className="text-[10px] font-mono text-muted uppercase">
                {item.entityType.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actor',
      header: 'Actor / IP',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-medium text-foreground">
            {item.authorName || 'Administrator'}
          </span>
          <span className="text-[10px] font-mono text-muted">{item.ipAddress || '127.0.0.1'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Inspect',
      className: 'text-right',
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(item);
          }}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Administrative Audit Trail"
        description="Comprehensive real-time ledger of all admin logins, content mutations, site setting adjustments, and media operations."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(true)}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-surface flex flex-col gap-1">
          <span className="text-[11px] font-mono text-muted uppercase">Total Logged Events</span>
          <span className="text-2xl font-extrabold text-foreground font-mono">{logs.length}</span>
        </div>
        <div className="p-4 rounded-lg border border-border bg-surface flex flex-col gap-1">
          <span className="text-[11px] font-mono text-muted uppercase">Auth Operations</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono">
            {
              logs.filter(
                (l) =>
                  l.action.includes('login') ||
                  l.action.includes('auth') ||
                  l.action.includes('password'),
              ).length
            }
          </span>
        </div>
        <div className="p-4 rounded-lg border border-border bg-surface flex flex-col gap-1">
          <span className="text-[11px] font-mono text-muted uppercase">Content Mutations</span>
          <span className="text-2xl font-extrabold text-accent font-mono">
            {
              logs.filter(
                (l) =>
                  l.action.includes('create') ||
                  l.action.includes('update') ||
                  l.action.includes('delete'),
              ).length
            }
          </span>
        </div>
        <div className="p-4 rounded-lg border border-border bg-surface flex flex-col gap-1">
          <span className="text-[11px] font-mono text-muted uppercase">Settings & Config</span>
          <span className="text-2xl font-extrabold text-blue-400 font-mono">
            {logs.filter((l) => l.action.includes('setting')).length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg border border-border bg-surface flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            type="text"
            placeholder="Search audit trail by action, entity, actor, IP, or payload keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs focus:outline-none focus:border-accent"
          >
            <option value="all">All Action Categories</option>
            <option value="auth">Auth & Security</option>
            <option value="content">Content CRUD</option>
            <option value="settings">Site Settings</option>
            <option value="media">Media Operations</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs focus:outline-none focus:border-accent"
          >
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
            <option value={500}>Last 500</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <AdminDataTable
        columns={columns}
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={(item) => setSelectedLog(item)}
      />

      {/* Inspector Modal */}
      <Dialog isOpen={Boolean(selectedLog)} onClose={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[85vh] overflow-y-auto">
          {selectedLog && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-border pb-3">
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Audit Record Details</span>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-surface-muted rounded border border-border">
                  <span className="text-muted block text-[10px]">ACTION</span>
                  <span className="text-foreground font-bold">{selectedLog.action}</span>
                </div>
                <div className="p-3 bg-surface-muted rounded border border-border">
                  <span className="text-muted block text-[10px]">ENTITY TYPE</span>
                  <span className="text-foreground font-bold">
                    {selectedLog.entityType || 'GLOBAL'}
                  </span>
                </div>
                <div className="p-3 bg-surface-muted rounded border border-border">
                  <span className="text-muted block text-[10px]">TIMESTAMP</span>
                  <span className="text-foreground font-bold">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-surface-muted rounded border border-border">
                  <span className="text-muted block text-[10px]">ACTOR / IP</span>
                  <span className="text-foreground font-bold">
                    {selectedLog.authorName || 'Administrator'} ({selectedLog.ipAddress || '127.0.0.1'})
                  </span>
                </div>
              </div>

              {selectedLog.entityId && (
                <div className="p-3 bg-surface-muted rounded border border-border text-xs font-mono">
                  <span className="text-muted block text-[10px]">ENTITY ID</span>
                  <span className="text-accent">{selectedLog.entityId}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground">Payload & Context Details</span>
                <pre className="p-4 bg-background border border-border rounded-md text-xs font-mono text-foreground overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>

              <DialogFooter className="pt-3 border-t border-border flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
