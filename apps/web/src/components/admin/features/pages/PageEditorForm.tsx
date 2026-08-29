'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { PageDto, MediaDto, CreatePageRequest, UpdatePageRequest } from '@portfolio/shared';
import { ContentStatus } from '@portfolio/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/admin/ui/MarkdownEditor';
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal';
import { toast } from 'sonner';
import { Save, Sparkles, Image as ImageIcon, Navigation } from 'lucide-react';

interface PageEditorFormProps {
  initialData?: PageDto;
  isNew?: boolean;
}

export function PageEditorForm({ initialData, isNew = false }: PageEditorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOgPickerOpen, setIsOgPickerOpen] = useState(false);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [status, setStatus] = useState<ContentStatus>(
    initialData?.status || ContentStatus.Published,
  );
  const [isNavVisible, setIsNavVisible] = useState<boolean>(initialData?.isNavVisible || false);
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 0);
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0]! : '',
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
  );

  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '');
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.ogImageUrl || '');
  const [ogImageId, setOgImageId] = useState('');

  const handleAutoSlug = () => {
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generated);
  };

  const handleSelectOgImage = (media: MediaDto) => {
    setOgImageUrl(media.url);
    setOgImageId(media.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error('Title and Slug are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePageRequest | UpdatePageRequest = {
        title,
        slug,
        content,
        status,
        isNavVisible,
        sortOrder,
        publishedAt: publishedAt || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        ogImageId: ogImageId || undefined,
      };

      if (isNew) {
        await apiClient.post('/pages', payload);
        toast.success('Page created successfully!');
      } else if (initialData?.id) {
        await apiClient.put(`/pages/${initialData.id}`, payload);
        toast.success('Page updated successfully!');
      }

      router.push('/admin/pages');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save page';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isNew ? 'Create Dynamic Page' : `Edit: ${initialData?.title}`}
          </h2>
          <p className="text-xs text-muted font-mono">
            {status.toUpperCase()} • /{slug || 'no-slug'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/pages')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>Save Page</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Page Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Page Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Privacy Policy or Terms of Service"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Route Slug</label>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="text-[11px] font-mono text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <Input
                  type="text"
                  placeholder="e.g. privacy-policy"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Markdown Content */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Page Content (Markdown)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write page markdown content..."
                minHeight="420px"
              />
            </CardContent>
          </Card>

          {/* SEO & Social Meta Card */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">SEO & Social Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta SEO Title</label>
                <Input
                  type="text"
                  placeholder="Defaults to Page Title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta SEO Description</label>
                <Textarea
                  placeholder="Search engine summary..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={2}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">SEO Keywords</label>
                <Input
                  type="text"
                  placeholder="e.g. policy, terms, privacy"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Open Graph Social Image</label>
                {ogImageUrl ? (
                  <div className="relative aspect-video w-full max-w-sm rounded-lg border border-border overflow-hidden group bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsOgPickerOpen(true)}>
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setOgImageUrl('');
                          setOgImageId('');
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOgPickerOpen(true)}
                    className="w-full max-w-sm aspect-video border-2 border-dashed border-border hover:border-accent rounded-lg flex flex-col items-center justify-center gap-1 text-muted hover:text-foreground transition-colors p-3"
                  >
                    <ImageIcon className="w-5 h-5 text-placeholder" />
                    <span className="text-xs font-semibold">Select Open Graph Image</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Visibility & Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value={ContentStatus.Published}>Published</option>
                  <option value={ContentStatus.Draft}>Draft</option>
                  <option value={ContentStatus.Scheduled}>Scheduled</option>
                  <option value={ContentStatus.Archived}>Archived</option>
                </select>
              </div>

              {/* Navigation Visibility Toggle */}
              <div className="p-3 bg-surface-muted border border-border rounded-lg space-y-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNavVisible}
                    onChange={(e) => setIsNavVisible(e.target.checked)}
                    className="mt-0.5 rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-foreground block text-xs flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-accent" /> Visible in Main Navigation
                    </span>
                    <p className="text-[11px] text-muted leading-tight">
                      Automatically renders a link to this page in header/footer nav.
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              {status === ContentStatus.Scheduled && (
                <div className="space-y-1.5 p-3 bg-surface-muted border border-border rounded-lg">
                  <label className="font-semibold text-foreground block">Scheduled Release Time</label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted">
                    Automated background scheduler will publish this page at the specified time.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Live Public Date</label>
                <Input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isOgPickerOpen}
        onClose={() => setIsOgPickerOpen(false)}
        onSelect={handleSelectOgImage}
        title="Select Open Graph Social Card"
        acceptType="image"
      />
    </form>
  );
}
