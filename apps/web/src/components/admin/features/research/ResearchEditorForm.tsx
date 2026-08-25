'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type {
  ResearchPaperDto,
  MediaDto,
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
import { toast } from 'sonner';
import { Save, FileText, Sparkles, ExternalLink } from 'lucide-react';

interface ResearchEditorFormProps {
  initialData?: ResearchPaperDto;
  isNew?: boolean;
}

export function ResearchEditorForm({ initialData, isNew = false }: ResearchEditorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfPickerOpen, setIsPdfPickerOpen] = useState(false);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [publicationName, setPublicationName] = useState(initialData?.publicationName || '');
  const [publicationUrl, setPublicationUrl] = useState(initialData?.publicationUrl || '');
  const [doi, setDoi] = useState(initialData?.doi || '');
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || ContentStatus.Draft);
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0]! : '',
  );
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || '');
  const [pdfId, setPdfId] = useState('');

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
        doi: doi || undefined,
        status,
        pdfId: pdfId || undefined,
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to save research paper');
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
          <p className="text-xs text-muted font-mono">{status.toUpperCase()} • /{slug || 'no-slug'}</p>
        </div>

        <div className="flex items-center gap-2">
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
              <CardTitle className="text-sm font-bold text-foreground">Extended Notes / Full Text (Markdown)</CardTitle>
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
        </div>

        <div className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Publication Metadata</CardTitle>
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
                  <option value={ContentStatus.Archived}>Archived</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Publish Date</label>
                <Input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Publication Venue / Journal / Conference</label>
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
    </form>
  );
}
