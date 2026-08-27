'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { apiClient, ApiClientError } from '@/lib/api';
import type {
  NewsletterBroadcastRequest,
  NewsletterSubscriberDto,
  PaginatedResponse,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Radio,
  Send,
  Eye,
  Code,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriberDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastPreview, setBroadcastPreview] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastTab, setBroadcastTab] = useState<'edit' | 'preview'>('edit');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchSubscribers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        pageSize: '25',
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await apiClient.get<PaginatedResponse<NewsletterSubscriberDto>>(
        '/newsletter/admin/subscribers',
        { params },
      );
      setSubscribers(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const confirmedCount = useMemo(() => {
    return subscribers.filter((s) => s.isConfirmed).length;
  }, [subscribers]);

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }

    const headers = ['Email', 'Name', 'Confirmed', 'Subscribed Date'];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || '',
      s.isConfirmed ? 'Yes' : 'No',
      new Date(s.createdAt).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscriber CSV exported successfully!');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/newsletter/admin/subscribers/${deleteTarget.id}`);
      toast.success('Subscriber removed.');
      setDeleteTarget(null);
      fetchSubscribers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete subscriber';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      toast.error('Please enter both a subject line and broadcast content.');
      return;
    }

    if (!confirm(`Are you sure you want to broadcast this message to all confirmed subscribers?`)) {
      return;
    }

    setIsBroadcasting(true);
    try {
      const payload: NewsletterBroadcastRequest = {
        subject: broadcastSubject.trim(),
        previewText: broadcastPreview.trim() || undefined,
        contentHtml: broadcastContent.trim(),
      };

      const res = await apiClient.post<{ message: string; sent: number; failed: number }>(
        '/newsletter/admin/broadcast',
        payload,
      );

      toast.success(res.message || `Broadcast completed successfully!`);
      setShowBroadcastModal(false);
      setBroadcastSubject('');
      setBroadcastPreview('');
      setBroadcastContent('');
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to send broadcast';
      toast.error(msg);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const columns: Column<NewsletterSubscriberDto>[] = [
    {
      key: 'email',
      header: 'Subscriber Email',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-accent" />
          <div>
            <span className="font-bold text-foreground font-mono text-xs">{item.email}</span>
            {item.name && <p className="text-[11px] text-muted">{item.name}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'isConfirmed',
      header: 'Confirmation Status',
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
            item.isConfirmed
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {item.isConfirmed ? (
            <>
              <CheckCircle2 className="w-3 h-3" /> Confirmed
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" /> Pending (Double Opt-In)
            </>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Subscribed Date',
      render: (item) => (
        <span className="text-xs text-muted font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Unsubscribe & Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email Newsletter & Dispatch"
        description="Subscriber audience, verification tracking, CSV exporting, and multi-cast newsletter broadcasts."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBroadcastModal(true)}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Broadcast Campaign</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5 text-accent" />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      <AdminDataTable
        columns={columns}
        data={subscribers}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Search subscribers by email or name..."
        searchTerm={search}
        onSearchChange={setSearch}
        filterSlot={
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
            {['all', 'confirmed', 'pending'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-surface text-foreground font-bold shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        }
        pagination={{
          page,
          pageSize: 25,
          totalItems,
          totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Broadcast Campaign Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Broadcast Newsletter</h3>
                  <p className="text-xs text-zinc-400">Dispatch an email blast to your audience.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-400">
              <span className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4" />
                Active Confirmed Audience:
              </span>
              <span className="font-mono font-bold text-sm bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {confirmedCount} recipients
              </span>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Campaign Subject Line</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Scaling Distributed Systems in 2026: Architecture Retrospective"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="bg-zinc-950 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Preview Text / Teaser (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Brief summary snippet displayed in inbox previews..."
                  value={broadcastPreview}
                  onChange={(e) => setBroadcastPreview(e.target.value)}
                  className="bg-zinc-950 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Broadcast Content</label>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setBroadcastTab('edit')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1',
                        broadcastTab === 'edit'
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200',
                      )}
                    >
                      <Code className="w-3.5 h-3.5" /> HTML Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastTab('preview')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1',
                        broadcastTab === 'preview'
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200',
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                {broadcastTab === 'edit' ? (
                  <Textarea
                    required
                    rows={10}
                    placeholder="<h2>New Article Published</h2><p>Here is what we engineered this month...</p>"
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    className="bg-zinc-950 text-xs font-mono leading-relaxed"
                  />
                ) : (
                  <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl min-h-[220px] text-zinc-200 text-sm">
                    <h1 className="text-lg font-bold text-zinc-100 mb-4">
                      {broadcastSubject || 'Untitled Broadcast'}
                    </h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          broadcastContent ||
                          '<p class="text-zinc-500 italic">No content entered yet...</p>',
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isBroadcasting}
                  disabled={isBroadcasting || confirmedCount === 0}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Broadcast to {confirmedCount} Subscribers
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove Subscriber"
        description={`Are you sure you want to remove '${deleteTarget?.email}' from your subscriber list?`}
        confirmLabel="Remove Subscriber"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
