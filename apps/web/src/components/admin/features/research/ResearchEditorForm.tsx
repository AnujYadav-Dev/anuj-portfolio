'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type {
  ResearchPaperDto,
  TagDto,
  MediaDto,
  ContentVersionDto,
  CreateResearchPaperRequest,
  UpdateResearchPaperRequest,
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
import { Save, FileText, Sparkles, Star, Image as ImageIcon, History, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ResearchEditorFormProps {
  initialData?: ResearchPaperDto;
  isNew?: boolean;
}

export function ResearchEditorForm({ initialData, isNew = false }: ResearchEditorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfPickerOpen, setIsPdfPickerOpen] = useState(false);
  const [isOgPickerOpen, setIsOgPickerOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);

  // Version history modal state
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState<ContentVersionDto[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersionDto | null>(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [publicationName, setPublicationName] = useState(initialData?.publicationName || '');
  const [publicationUrl, setPublicationUrl] = useState(initialData?.publicationUrl || '');
  const [publicationDate, setPublicationDate] = useState(initialData?.publicationDate || '');
  const [doi, setDoi] = useState(initialData?.doi || '');
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || ContentStatus.Draft);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [notifySubscribers, setNotifySubscribers] = useState<boolean>(true);
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0]! : '',
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
  );
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || '');
  const [pdfId, setPdfId] = useState(initialData?.pdfId || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '');
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.ogImageUrl || '');
  const [ogImageId, setOgImageId] = useState('');

  useEffect(() => {
    async function loadTags() {
      try {
        const res = await apiClient.get<{ data: TagDto[] }>('/tags');
        setAvailableTags(res.data || []);
        if (initialData?.tags && res.data) {
          const matched = res.data
            .filter((t) => initialData.tags.includes(t.name) || initialData.tags.includes(t.id))
            .map((t) => t.id);
          setSelectedTagIds(matched);
        }
      } catch {
        // Ignore
      }
    }
    loadTags();
  }, [initialData]);

  const handleAutoSlug = () => {
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generated);
  };

  const handleSelectPdf = (media: MediaDto) => {
    setPdfUrl(media.url);
    setPdfId(media.id);
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
        `/research/${initialData.id}/versions`,
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
      await apiClient.post(`/research/${initialData.id}/versions/${versionNumber}/restore`);
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
      const payload: CreateResearchPaperRequest | UpdateResearchPaperRequest = {
        title,
        slug,
        abstract: abstract || undefined,
        content: content || undefined,
        publicationName: publicationName || undefined,
        publicationUrl: publicationUrl || undefined,
        publicationDate: publicationDate || undefined,
        doi: doi || undefined,
        status,
        isFeatured,
        notifySubscribers,
        publishedAt: publishedAt || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        pdfId: pdfId || undefined,
        tagIds: selectedTagIds,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        ogImageId: ogImageId || undefined,
      };

      if (isNew) {
        await apiClient.post('/research', payload);
        toast.success('Research paper created successfully!');
      } else if (initialData?.id) {
        await apiClient.put(`/research/${initialData.id}`, payload);
        toast.success('Research paper updated successfully!');
      }

      router.push('/admin/research');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save research paper';
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
            {isNew ? 'New Research Paper' : `Edit: ${initialData?.title}`}
          </h2>
          <p className="text-xs text-muted font-mono">
            {status.toUpperCase()} • /{slug || 'no-slug'}
          </p>
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
            onClick={() => router.push('/admin/research')}
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
            <span>Save Paper</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Paper Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Paper Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Distributed Consensus in Asynchronous High-Throughput Networks"
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
                  placeholder="e.g. distributed-consensus-asynchronous-networks"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Abstract / Summary</label>
                <Textarea
                  placeholder="Abstract summary of the paper..."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  rows={4}
                  className="bg-background text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Markdown Content Notes */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Extended Notes / Full Text (Markdown)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Optional markdown notes, derivations, or summaries..."
                minHeight="360px"
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
                  placeholder="Defaults to Paper Title if empty"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta SEO Description</label>
                <Textarea
                  placeholder="Custom meta description for search engines and social previews..."
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
                  placeholder="e.g. distributed systems, consensus algorithms, p2p networks"
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
              <CardTitle className="text-sm font-bold text-foreground">
                Publication Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value={ContentStatus.Draft}>Draft</option>
                  <option value={ContentStatus.Published}>Published</option>
                  <option value={ContentStatus.Scheduled}>Scheduled</option>
                  <option value={ContentStatus.Archived}>Archived</option>
                </select>
              </div>

              {/* Feature Toggle */}
              <div className="p-3 bg-surface-muted border border-border rounded-lg space-y-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mt-0.5 rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-foreground block text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-accent" /> Featured Paper
                    </span>
                    <p className="text-[11px] text-muted leading-tight">
                      Highlight this paper in the featured research showcase.
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
                    Automated background scheduler will publish this paper at the specified time.
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
                <label className="font-semibold text-foreground">Live Public Date</label>
                <Input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Publication Date (Journal/Conference)</label>
                <Input
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Publication Venue / Journal / Conference
                </label>
                <Input
                  type="text"
                  placeholder="e.g. IEEE Transactions on Distributed Systems"
                  value={publicationName}
                  onChange={(e) => setPublicationName(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Publication / Paper URL</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={publicationUrl}
                  onChange={(e) => setPublicationUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">DOI Identifier</label>
                <Input
                  type="text"
                  placeholder="10.1145/..."
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Research Topic & Taxonomy Tags */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Topics & Tech Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
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
            </CardContent>
          </Card>

          {/* PDF Attachment */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">PDF Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pdfUrl ? (
                <div className="p-3 border border-border rounded-lg bg-surface-muted flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-xs font-mono truncate">{pdfUrl.split('/').pop()}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setPdfUrl('');
                      setPdfId('');
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setIsPdfPickerOpen(true)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-accent" />
                  <span>Choose PDF from Media Library</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isPdfPickerOpen}
        onClose={() => setIsPdfPickerOpen(false)}
        onSelect={handleSelectPdf}
        title="Select Research Paper PDF"
        acceptType="pdf"
      />

      <MediaPickerModal
        isOpen={isOgPickerOpen}
        onClose={() => setIsOgPickerOpen(false)}
        onSelect={handleSelectOgImage}
        title="Select Open Graph Social Card"
        acceptType="image"
      />

      {/* Version History Modal */}
      <Dialog open={isVersionModalOpen} onOpenChange={setIsVersionModalOpen}>
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              <span>Research Paper Version History</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Inspect historical snapshots and roll back changes.
            </DialogDescription>
          </DialogHeader>

          {isLoadingVersions ? (
            <div className="py-12 text-center text-xs font-mono text-muted">Loading snapshots...</div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-muted">
              No historical revisions found. Versions are created on update.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 overflow-hidden pt-2">
              <div className="border border-border rounded-lg overflow-y-auto max-h-[50vh] p-1 space-y-1">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVersion(v)}
                    className={`w-full text-left p-2 rounded text-xs transition-colors ${
                      selectedVersion?.id === v.id
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'hover:bg-surface-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span>v{v.version}</span>
                      <span className="text-[10px] text-muted">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted truncate mt-0.5">
                      {v.changeSummary || 'Snapshot'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="sm:col-span-2 border border-border rounded-lg p-3 bg-background overflow-y-auto max-h-[50vh] flex flex-col justify-between">
                {selectedVersion ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="font-bold text-xs text-foreground">
                        Version {selectedVersion.version} Snapshot
                      </span>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleRestoreVersion(selectedVersion.version)}
                        className="h-7 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Restore This
                      </Button>
                    </div>
                    <pre className="text-[10px] font-mono text-muted whitespace-pre-wrap overflow-x-auto max-h-[35vh]">
                      {JSON.stringify(selectedVersion.snapshot, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center text-xs text-muted m-auto">Select a version</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
}
