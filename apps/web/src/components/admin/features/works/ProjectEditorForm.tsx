'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type {
  ProjectDto,
  ProjectCategoryDto,
  TagDto,
  MediaDto,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@portfolio/shared';
import { ContentStatus, ProjectStatus, ProjectType } from '@portfolio/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/admin/ui/MarkdownEditor';
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal';
import { toast } from 'sonner';
import {
  Save,
  Image as ImageIcon,
  ExternalLink,
  FolderGit2,
  Star,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
} from 'lucide-react';

interface ProjectEditorFormProps {
  initialData?: ProjectDto;
  isNew?: boolean;
}

export function ProjectEditorForm({ initialData, isNew = false }: ProjectEditorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ProjectCategoryDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isOgPickerOpen, setIsOgPickerOpen] = useState(false);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.category?.id || '');
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || ContentStatus.Draft);
  const [notifySubscribers, setNotifySubscribers] = useState<boolean>(true);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(
    (initialData?.projectStatus as ProjectStatus) || ProjectStatus.Completed,
  );
  const [projectType, setProjectType] = useState<ProjectType>(
    (initialData?.projectType as ProjectType) || ProjectType.Personal,
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sortOrder ?? 0);
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || '');
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || '');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [architectureDiagramUrl, setArchitectureDiagramUrl] = useState('');
  const [challengesLearnings, setChallengesLearnings] = useState('');

  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0]! : '',
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
  );

  // Technologies
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies || []);
  const [newTechInput, setNewTechInput] = useState('');

  // Media
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || '');
  const [coverImageId, setCoverImageId] = useState('');
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string; caption?: string }[]>(
    initialData?.images?.map((img) => ({ id: img.mediaId, url: img.url, caption: img.caption || '' })) || [],
  );

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '');
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.ogImageUrl || '');
  const [ogImageId, setOgImageId] = useState('');

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Load categories and tags
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, tagRes] = await Promise.all([
          apiClient.get<{ data: ProjectCategoryDto[] }>('/project-categories'),
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

  // Auto-slug generator
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

  const handleAddGalleryImage = (media: MediaDto) => {
    setGalleryImages((prev) => [...prev, { id: media.id, url: media.url, caption: media.altText || '' }]);
  };

  const handleRemoveGalleryImage = (mediaId: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== mediaId));
  };

  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newTechInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setNewTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error('Title and Slug are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateProjectRequest | UpdateProjectRequest = {
        title,
        slug,
        shortDescription,
        content: content || undefined,
        technologies,
        categoryId: categoryId || undefined,
        status,
        notifySubscribers,
        projectStatus,
        projectType,
        isFeatured,
        sortOrder,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        publishedAt: publishedAt || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        liveUrl: liveUrl || undefined,
        githubUrl: githubUrl || undefined,
        documentationUrl: documentationUrl || undefined,
        architectureDiagramUrl: architectureDiagramUrl || undefined,
        challengesLearnings: challengesLearnings || undefined,
        coverImageId: coverImageId || undefined,
        tagIds: selectedTagIds,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        ogImageId: ogImageId || undefined,
        images: galleryImages.map((img, idx) => ({
          mediaId: img.id,
          caption: img.caption || null,
          sortOrder: idx,
        })),
      };

      if (isNew) {
        await apiClient.post('/projects', payload);
        toast.success('Project created successfully!');
      } else if (initialData?.id) {
        await apiClient.put(`/projects/${initialData.id}`, payload);
        toast.success('Project updated successfully!');
      }

      router.push('/admin/works');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save project';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isNew ? 'Create New Project' : `Edit: ${initialData?.title}`}
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
            onClick={() => router.push('/admin/works')}
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
            <span>Save Project</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Content & MDX Case Study */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Project Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Distributed Analytics Engine"
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
                  placeholder="e.g. distributed-analytics-engine"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Short Summary Description
                </label>
                <Textarea
                  placeholder="Provide a concise 2-3 sentence overview of this project..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={3}
                  required
                  className="bg-background text-xs"
                />
              </div>

              {/* Technologies Array Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Technologies Used (Frameworks, DBs, Cloud)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. Next.js, Rust, Docker, PostgreSQL"
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    className="bg-background text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTech}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 text-[11px] font-mono bg-surface-muted border border-border px-2 py-0.5 rounded"
                      >
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="text-muted hover:text-destructive text-xs ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Long-Form Case Study Markdown Editor */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Detailed Case Study (MDX / Markdown)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write the full architectural case study: problem statement, technical stack decisions, trade-offs, benchmarks, code samples..."
                minHeight="420px"
              />
            </CardContent>
          </Card>

          {/* Extended Engineering Details */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span>Architecture & Engineering Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  <span>Documentation URL</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://docs.myproject.dev"
                  value={documentationUrl}
                  onChange={(e) => setDocumentationUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>Architecture Diagram Image URL</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://.../architecture-diagram.png"
                  value={architectureDiagramUrl}
                  onChange={(e) => setArchitectureDiagramUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Key Challenges & Key Technical Learnings
                </label>
                <Textarea
                  placeholder="Summarize the core technical hurdles overcome during this project's development..."
                  value={challengesLearnings}
                  onChange={(e) => setChallengesLearnings(e.target.value)}
                  rows={3}
                  className="bg-background text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Screenshot Gallery Manager */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" />
                <span>Project Screenshot Gallery</span>
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsGalleryPickerOpen(true)}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Screenshot
              </Button>
            </CardHeader>
            <CardContent>
              {galleryImages.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-lg bg-surface-muted">
                  <p className="text-xs text-muted">No secondary screenshots attached.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative aspect-video rounded border border-border overflow-hidden group bg-surface-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(img.id)}
                        className="absolute top-1 right-1 p-1 rounded bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Metadata Card */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">SEO & Social Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta SEO Title</label>
                <Input
                  type="text"
                  placeholder="Defaults to Project Title if empty"
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
                  placeholder="Custom meta description for search engines and social link previews..."
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
                  placeholder="e.g. distributed systems, nextjs, postgresql, timeseries"
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

        {/* Right Col: Settings, Taxonomy & Cover Asset */}
        <div className="space-y-6">
          {/* Status & Publication */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Publishing & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Content Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value={ContentStatus.Draft}>Draft (Admin Only)</option>
                  <option value={ContentStatus.Published}>Published (Live)</option>
                  <option value={ContentStatus.Scheduled}>Scheduled</option>
                  <option value={ContentStatus.Archived}>Archived</option>
                </select>
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
                    Scheduler service will automatically make this project live at the specified time.
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-accent" /> Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-accent" /> End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

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
                <label className="font-semibold text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Project Stage</label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value={ProjectStatus.Completed}>Completed</option>
                  <option value={ProjectStatus.InProgress}>In Progress</option>
                  <option value={ProjectStatus.OnHold}>On Hold</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value={ProjectType.Personal}>Personal</option>
                  <option value={ProjectType.Professional}>Professional</option>
                  <option value={ProjectType.Freelance}>Freelance</option>
                  <option value={ProjectType.OpenSource}>Open Source</option>
                  <option value={ProjectType.Academic}>Academic</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-accent" /> Featured on Homepage
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Cover Media Asset */}
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
                      onClick={() => setIsCoverPickerOpen(true)}
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
                  onClick={() => setIsCoverPickerOpen(true)}
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
              <CardTitle className="text-sm font-bold text-foreground">
                Taxonomy & Category
              </CardTitle>
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
                <label className="font-semibold text-foreground">Tech Stack Tags</label>
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

          {/* External Links */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-accent" />
                  <span>Live Demo URL</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-accent" />
                  <span>GitHub Repository URL</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cover Media Picker Modal */}
      <MediaPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={handleSelectCover}
        title="Select Project Cover Image"
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

      {/* Gallery Screenshots Picker Modal */}
      <MediaPickerModal
        isOpen={isGalleryPickerOpen}
        onClose={() => setIsGalleryPickerOpen(false)}
        onSelect={handleAddGalleryImage}
        title="Add Screenshot to Project Gallery"
        acceptType="image"
      />
    </form>
  );
}
