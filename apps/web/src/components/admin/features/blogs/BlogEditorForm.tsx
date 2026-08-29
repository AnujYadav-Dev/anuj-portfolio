'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type {
  BlogPostDto,
  BlogCategoryDto,
  TagDto,
  MediaDto,
  ContentVersionDto,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from '@portfolio/shared';
import { ContentStatus } from '@portfolio/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/admin/ui/MarkdownEditor';
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Save, Image as ImageIcon, Sparkles, History, Clock, RotateCcw } from 'lucide-react';

interface BlogEditorFormProps {
  initialData?: BlogPostDto;
  isNew?: boolean;
}

export function BlogEditorForm({ initialData, isNew = false }: BlogEditorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isOgPickerOpen, setIsOgPickerOpen] = useState(false);

  // Version history modal state
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState<ContentVersionDto[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersionDto | null>(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // Form fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.category?.id || '');
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || ContentStatus.Draft);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [notifySubscribers, setNotifySubscribers] = useState<boolean>(true);
  const [publishedAt, setPublishedAt] = useState<string>(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0]! : '',
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || '');
  const [coverImageId, setCoverImageId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '');
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.ogImageUrl || '');
  const [ogImageId, setOgImageId] = useState('');

  // Estimated reading time
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, tagRes] = await Promise.all([
          apiClient.get<{ data: BlogCategoryDto[] }>('/blog-categories'),
          apiClient.get<{ data: TagDto[] }>('/tags'),
        ]);
        setCategories(catRes.data || []);
        setAvailableTags(tagRes.data || []);
        if (isNew && catRes.data && catRes.data.length > 0 && !categoryId) {
          setCategoryId(catRes.data[0]!.id);
        }
        if (initialData?.tags && tagRes.data) {
          const matched = tagRes.data
            .filter((t) => initialData.tags.includes(t.name) || initialData.tags.includes(t.id))
            .map((t) => t.id);
          setSelectedTagIds(matched);
        }
      } catch {
        // Ignore
      }
    }
    loadMeta();
  }, [isNew, categoryId, initialData]);

  const handleAutoSlug = () => {
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generated);
  };

  const handleSelectCover = (media: MediaDto) => {
    setCoverImageUrl(media.url);
    setCoverImageId(media.id);
  };

  const handleSelectOgImage = (media: MediaDto) => {
    setOgImageUrl(media.url);
    setOgImageId(media.id);
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const fetchVersions = async () => {
    if (!initialData?.id) return;
    setIsLoadingVersions(true);
    setIsVersionModalOpen(true);
    try {
      const res = await apiClient.get<{ data: ContentVersionDto[] }>(
        `/blogs/${initialData.id}/versions`,
      );
      setVersions(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedVersion(res.data[0]!);
      }
    } catch {
      toast.error('Failed to load version history');
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!initialData?.id) return;
    try {
      await apiClient.post(`/blogs/${initialData.id}/versions/${versionNumber}/restore`);
      toast.success(`Successfully rolled back to version ${versionNumber}`);
      setIsVersionModalOpen(false);
      router.refresh();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rollback failed';
      toast.error(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error('Title and Slug are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBlogPostRequest | UpdateBlogPostRequest = {
        title,
        slug,
        excerpt: excerpt || undefined,
        content,
        categoryId: categoryId || undefined,
        status,
        isFeatured,
        notifySubscribers,
        publishedAt: publishedAt || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        coverImageId: coverImageId || undefined,
        tagIds: selectedTagIds,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        ogImageId: ogImageId || undefined,
      };

      if (isNew) {
        await apiClient.post('/blogs', payload);
        toast.success('Blog post created successfully!');
      } else if (initialData?.id) {
        await apiClient.put(`/blogs/${initialData.id}`, payload);
        toast.success('Blog post updated successfully!');
      }

      router.push('/admin/blogs');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save blog post';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isNew ? 'Compose New Blog Post' : `Edit: ${initialData?.title}`}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted font-mono mt-0.5">
            <span>{status.toUpperCase()}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-accent" /> ~{readingTimeMinutes} min read ({wordCount}{' '}
              words)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && initialData?.id && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchVersions}
              title="View past version snapshots"
            >
              <History className="w-3.5 h-3.5 mr-1.5 text-accent" />
              <span>Version History</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/blogs')}
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
            <span>Save Article</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Article Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Post Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Building High-Performance Reactive Systems in Node.js"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">URL Slug</label>
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
                  placeholder="e.g. building-high-performance-reactive-systems-nodejs"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Lead Excerpt / Summary
                </label>
                <Textarea
                  placeholder="A concise overview or hook that appears in article listing cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="bg-background text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Long-Form Markdown Editor */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Full Article Markdown Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your technical article, tutorial, or architectural thoughts here..."
                minHeight="480px"
              />
            </CardContent>
          </Card>

          {/* SEO Metadata */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">SEO & Social Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta SEO Title</label>
                <Input
                  type="text"
                  placeholder="Defaults to Post Title if empty"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Meta SEO Description
                </label>
                <Textarea
                  placeholder="Custom meta description for search engines and Twitter/OG card preview..."
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
                  placeholder="e.g. nodejs, distributed-systems, backend-architecture"
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
                    <img src={ogImageUrl} alt="OG preview" className="w-full h-full object-cover" />
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

        {/* Right Col: Metadata & Taxonomies */}
        <div className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Publication & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Publishing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value={ContentStatus.Draft}>Draft (Unpublished)</option>
                  <option value={ContentStatus.Published}>Published (Public)</option>
                  <option value={ContentStatus.Scheduled}>Scheduled</option>
                  <option value={ContentStatus.Archived}>Archived</option>
                </select>
              </div>

              {/* Feature Post Toggle */}
              <div className="p-3 bg-surface-muted border border-border rounded-lg space-y-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mt-0.5 rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-foreground block text-xs">Featured Article</span>
                    <p className="text-[11px] text-muted leading-tight">
                      Highlight this article across featured carousels and stream lists.
                    </p>
                  </div>
                </label>
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
                    Automated background scheduler will publish this post at the specified time.
                  </p>
                </div>
              )}

              {status === ContentStatus.Published && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg space-y-1.5">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifySubscribers}
                      onChange={(e) => setNotifySubscribers(e.target.checked)}
                      className="mt-0.5 rounded border-border text-accent focus:ring-accent accent-[#ff8c42]"
                    />
                    <div>
                      <span className="font-bold text-foreground block text-xs">Notify Newsletter Subscribers</span>
                      <p className="text-[11px] text-muted leading-tight">
                        Send an automated email broadcast to verified subscribers when published.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Publish Date</label>
                <Input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coverImageUrl ? (
                <div className="relative aspect-video w-full rounded-lg border border-border overflow-hidden group bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMediaPickerOpen(true)}
                    >
                      Change Cover
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCoverImageUrl('');
                        setCoverImageId('');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="w-full aspect-video border-2 border-dashed border-border hover:border-accent rounded-lg flex flex-col items-center justify-center gap-2 text-muted hover:text-foreground transition-colors p-4"
                >
                  <ImageIcon className="w-6 h-6 text-placeholder" />
                  <span className="text-xs font-semibold">Choose Cover from Media Library</span>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Taxonomy & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs focus:outline-none focus:border-accent"
                >
                  <option value="">None / Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Assigned Tags</label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-background">
                  {availableTags.map((t) => {
                    const isSelected = selectedTagIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleToggleTag(t.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                          isSelected
                            ? 'bg-accent text-black font-bold border-accent shadow-sm'
                            : 'bg-surface-muted text-muted border-border hover:text-foreground'
                        }`}
                      >
                        #{t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectCover}
        title="Select Blog Post Cover Image"
        acceptType="image"
      />

      {/* Content Version History & Rollback Modal */}
      <Dialog open={isVersionModalOpen} onOpenChange={setIsVersionModalOpen}>
        <DialogContent className="max-w-3xl bg-surface border-border max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              <span>Content Version History & Rollback</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Snapshot versions automatically created upon each save. Select any version to preview
              and rollback.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 py-3">
            {/* Version List */}
            <div className="border border-border rounded-lg bg-background overflow-y-auto divide-y divide-border max-h-96">
              {isLoadingVersions ? (
                <p className="p-4 text-xs text-muted text-center italic">Loading versions...</p>
              ) : versions.length === 0 ? (
                <p className="p-4 text-xs text-muted text-center italic">
                  No prior versions recorded
                </p>
              ) : (
                versions.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => setSelectedVersion(v)}
                    className={`w-full text-left p-3 transition-colors ${
                      selectedVersion?.id === v.id
                        ? 'bg-accent/10 text-accent font-semibold border-l-2 border-accent'
                        : 'hover:bg-surface-muted text-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-mono">v{v.version}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted truncate">
                      {v.changeSummary || 'Snapshot update'}
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Version Snapshot Preview */}
            <div className="md:col-span-2 border border-border rounded-lg bg-background p-4 overflow-y-auto max-h-96 text-xs font-mono space-y-3">
              {selectedVersion ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-bold text-foreground">
                      Version {selectedVersion.version} Preview
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleRestoreVersion(selectedVersion.version)}
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Restore Version {selectedVersion.version}
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-[11px] text-muted overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedVersion.snapshot, null, 2)}
                  </pre>
                </>
              ) : (
                <p className="text-muted italic text-center py-16">
                  Select a version to inspect snapshot data
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Image Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectCover}
        title="Select Blog Cover Image"
        acceptType="image"
      />

      {/* OG Social Card Picker Modal */}
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
