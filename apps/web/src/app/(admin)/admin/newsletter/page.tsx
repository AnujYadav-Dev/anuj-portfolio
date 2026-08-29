'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Sparkles,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

interface ContentOption {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  readingTimeMinutes?: number | null;
  categoryName?: string | null;
  coverImageUrl?: string | null;
}

function generateContentEmailHtml({
  type,
  title,
  slug,
  excerpt,
  meta,
  coverUrl,
  siteUrl,
}: {
  type: 'blog' | 'project' | 'research';
  title: string;
  slug: string;
  excerpt?: string;
  meta?: string;
  coverUrl?: string;
  siteUrl: string;
}) {
  const itemUrl =
    type === 'blog'
      ? `${siteUrl}/blogs/${slug}`
      : type === 'project'
        ? `${siteUrl}/works/${slug}`
        : `${siteUrl}/research/${slug}`;

  const badgeText =
    type === 'blog' ? 'NEW ESSAY / ARTICLE' : type === 'project' ? 'NEW CASE STUDY' : 'NEW RESEARCH PAPER';

  const ctaText =
    type === 'blog' ? 'Read Full Article &rarr;' : type === 'project' ? 'Explore Project &rarr;' : 'Read Paper &rarr;';

  const coverHtml = coverUrl
    ? `<div style="margin-bottom: 24px; text-align: center;">
        <img src="${coverUrl}" alt="${title}" style="max-width: 100%; border-radius: 8px; border: 1px solid #262626; display: block;" />
      </div>`
    : '';

  const metaHtml = meta
    ? `<p style="margin: 0 0 12px 0; font-size: 11px; font-family: monospace; color: #ff8c42; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
        ${meta}
      </p>`
    : '';

  return `
    ${coverHtml}
    <div style="margin-bottom: 8px;">
      <span style="display: inline-block; background-color: rgba(255, 140, 66, 0.1); border: 1px solid rgba(255, 140, 66, 0.25); color: #ff8c42; font-size: 10px; font-family: monospace; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; font-weight: bold; margin-bottom: 12px;">
        ${badgeText}
      </span>
    </div>
    <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
      ${title}
    </h1>
    ${metaHtml}
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #b4b4b4;">
      ${excerpt || 'A new release has just been published on the portfolio engineering dispatch.'}
    </p>
    <div style="margin: 28px 0 12px 0;">
      <a href="${itemUrl}" style="display: inline-block; background-color: #ff8c42; color: #000000; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 6px; text-align: center;">
        ${ctaText}
      </a>
    </div>
  `;
}

function AdminNewsletterContent() {
  const searchParams = useSearchParams();
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
  const [broadcastMode, setBroadcastMode] = useState<'custom' | 'content'>('custom');
  const [contentType, setContentType] = useState<'blog' | 'project' | 'research'>('blog');
  const [availableContent, setAvailableContent] = useState<ContentOption[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

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

  // Fetch content options when mode is 'content' or when contentType changes
  useEffect(() => {
    if (broadcastMode !== 'content') return;

    async function loadContent() {
      setIsLoadingContent(true);
      try {
        if (contentType === 'blog') {
          const res = await apiClient.get<PaginatedResponse<{ id: string; title: string; slug: string; excerpt?: string | null; readingTimeMinutes?: number; category?: { name: string } | null; coverImage?: { url: string } | null }>>('/blogs/admin/all', { params: { pageSize: '100' } });
          setAvailableContent(
            (res.data || []).map((b) => ({
              id: b.id,
              title: b.title,
              slug: b.slug,
              excerpt: b.excerpt,
              readingTimeMinutes: b.readingTimeMinutes,
              categoryName: b.category?.name || null,
              coverImageUrl: b.coverImage?.url || null,
            }))
          );
        } else if (contentType === 'project') {
          const res = await apiClient.get<PaginatedResponse<{ id: string; title: string; slug: string; shortDescription: string; category?: { name: string } | null; coverImage?: { url: string } | null }>>('/projects/admin/all', { params: { pageSize: '100' } });
          setAvailableContent(
            (res.data || []).map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.shortDescription,
              categoryName: p.category?.name || null,
              coverImageUrl: p.coverImage?.url || null,
            }))
          );
        } else if (contentType === 'research') {
          const res = await apiClient.get<PaginatedResponse<{ id: string; title: string; slug: string; abstract?: string | null; publicationName?: string | null; ogImage?: { url: string } | null }>>('/research/admin/all', { params: { pageSize: '100' } });
          setAvailableContent(
            (res.data || []).map((r) => ({
              id: r.id,
              title: r.title,
              slug: r.slug,
              excerpt: r.abstract,
              categoryName: r.publicationName || null,
              coverImageUrl: r.ogImage?.url || null,
            }))
          );
        }
      } catch {
        toast.error('Failed to load published content items');
      } finally {
        setIsLoadingContent(false);
      }
    }

    loadContent();
  }, [broadcastMode, contentType]);

  // Deep linking support from query params
  useEffect(() => {
    const action = searchParams.get('action');
    const paramType = searchParams.get('contentType') as 'blog' | 'project' | 'research' | null;
    const paramId = searchParams.get('contentId');

    if (action === 'broadcast') {
      setShowBroadcastModal(true);
      if (paramType && (paramType === 'blog' || paramType === 'project' || paramType === 'research')) {
        setBroadcastMode('content');
        setContentType(paramType);
        if (paramId) {
          setSelectedContentId(paramId);
        }
      }
    }
  }, [searchParams]);

  // Auto-populate when availableContent arrives and selectedContentId is set
  useEffect(() => {
    if (!selectedContentId || availableContent.length === 0) return;
    const item = availableContent.find((c) => c.id === selectedContentId);
    if (!item) return;

    const typePrefix =
      contentType === 'blog'
        ? 'New Article'
        : contentType === 'project'
          ? 'New Case Study'
          : 'New Research Paper';

    setBroadcastSubject(`${typePrefix}: ${item.title}`);
    setBroadcastPreview(item.excerpt || `Read our latest ${contentType} release.`);

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const meta = [
      item.readingTimeMinutes ? `${item.readingTimeMinutes} min read` : '',
      item.categoryName || '',
    ]
      .filter(Boolean)
      .join(' • ');

    const html = generateContentEmailHtml({
      type: contentType,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      meta,
      coverUrl: item.coverImageUrl || undefined,
      siteUrl,
    });

    setBroadcastContent(html.trim());
  }, [availableContent, selectedContentId, contentType]);

  // When selected content item changes via manual dropdown
  const handleSelectContentItem = (itemId: string) => {
    setSelectedContentId(itemId);
    const item = availableContent.find((c) => c.id === itemId);
    if (!item) return;

    toast.success(`Pre-populated fields from '${item.title}'!`);
  };

  const confirmedCount = useMemo(() => {
    return subscribers.filter((s) => s.isConfirmed && !s.unsubscribedAt).length;
  }, [subscribers]);

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }

    const headers = ['Email', 'Name', 'Status', 'Subscribed Date', 'Unsubscribed Date'];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || '',
      s.unsubscribedAt ? 'Unsubscribed' : s.isConfirmed ? 'Confirmed' : 'Pending',
      new Date(s.createdAt).toISOString(),
      s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString() : '',
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

    if (!confirm(`Are you sure you want to broadcast this message to all ${confirmedCount} confirmed subscribers?`)) {
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
      setSelectedContentId('');
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
      render: (item) => {
        if (item.unsubscribedAt) {
          return (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold bg-rose-500/10 text-rose-400 border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Unsubscribed
            </span>
          );
        }
        return (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
              item.isConfirmed
                ? 'bg-accent/10 text-accent border-accent/30'
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
        );
      },
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
              variant="primary"
              size="sm"
              onClick={() => setShowBroadcastModal(true)}
              className="gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
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
            {['all', 'confirmed', 'pending', 'unsubscribed'].map((st) => (
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Broadcast Newsletter</h3>
                  <p className="text-xs text-muted">Dispatch a formatted email blast to your audience.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="text-muted hover:text-foreground text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Confirmed Audience Banner */}
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-between text-xs text-accent">
              <span className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4" />
                Active Confirmed Audience:
              </span>
              <span className="font-mono font-bold text-sm bg-accent/20 px-2.5 py-0.5 rounded-full text-foreground">
                {confirmedCount} recipients
              </span>
            </div>

            {/* Campaign Mode Switcher */}
            <div className="p-3 bg-surface-muted border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Campaign Source</span>
                </span>
                <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setBroadcastMode('custom')}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded transition-colors',
                      broadcastMode === 'custom'
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'text-muted hover:text-foreground'
                    )}
                  >
                    Custom Campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastMode('content')}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1',
                      broadcastMode === 'content'
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'text-muted hover:text-foreground'
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" /> Import Content
                  </button>
                </div>
              </div>

              {/* Content Picker Dropdowns */}
              {broadcastMode === 'content' && (
                <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-muted uppercase">Content Type</label>
                    <select
                      value={contentType}
                      onChange={(e) => {
                        setContentType(e.target.value as 'blog' | 'project' | 'research');
                        setSelectedContentId('');
                      }}
                      className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-accent"
                    >
                      <option value="blog">Blog Post / Article</option>
                      <option value="project">Project / Case Study</option>
                      <option value="research">Research Paper</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-muted uppercase">Select Item</label>
                    <select
                      value={selectedContentId}
                      onChange={(e) => handleSelectContentItem(e.target.value)}
                      disabled={isLoadingContent || availableContent.length === 0}
                      className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-accent disabled:opacity-50"
                    >
                      <option value="">
                        {isLoadingContent ? 'Loading items...' : availableContent.length === 0 ? 'No items found' : 'Choose an item to pre-fill...'}
                      </option>
                      {availableContent.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Campaign Subject Line</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Scaling Distributed Systems in 2026: Architecture Retrospective"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="bg-surface text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Preview Text / Teaser (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Brief summary snippet displayed in inbox previews..."
                  value={broadcastPreview}
                  onChange={(e) => setBroadcastPreview(e.target.value)}
                  className="bg-surface text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Broadcast Content</label>
                  <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setBroadcastTab('edit')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1',
                        broadcastTab === 'edit'
                          ? 'bg-surface-muted text-foreground font-semibold border border-border'
                          : 'text-muted hover:text-foreground',
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
                          ? 'bg-surface-muted text-foreground font-semibold border border-border'
                          : 'text-muted hover:text-foreground',
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
                    className="bg-surface text-xs font-mono leading-relaxed"
                  />
                ) : (
                  <div className="p-6 bg-surface border border-border rounded-xl min-h-[220px] text-foreground text-sm">
                    <h1 className="text-lg font-bold text-foreground mb-4">
                      {broadcastSubject || 'Untitled Broadcast'}
                    </h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          broadcastContent ||
                          '<p class="text-muted italic">No content entered yet...</p>',
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
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

export default function AdminNewsletterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            Loading Newsletter Hub...
          </span>
        </div>
      }
    >
      <AdminNewsletterContent />
    </Suspense>
  );
}
