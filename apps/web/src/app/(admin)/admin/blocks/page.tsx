'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  ContentBlockDto,
  CreateContentBlockRequest,
  UpdateContentBlockRequest,
  PageDto,
  HomepageSectionDto,
  MediaDto,
} from '@portfolio/shared';
import { BlockType } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { MarkdownEditor } from '@/components/admin/ui/MarkdownEditor';
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Box, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminContentBlocksPage() {
  const [blocks, setBlocks] = useState<ContentBlockDto[]>([]);
  const [pages, setPages] = useState<PageDto[]>([]);
  const [sections, setSections] = useState<HomepageSectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlockDto | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [blockType, setBlockType] = useState<BlockType>(BlockType.Markdown);
  const [pageId, setPageId] = useState<string>('');
  const [homepageSectionId, setHomepageSectionId] = useState<string>('');
  const [mediaId, setMediaId] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [ctaLabel, setCtaLabel] = useState<string>('');
  const [ctaUrl, setCtaUrl] = useState<string>('');
  const [isExternal, setIsExternal] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ContentBlockDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlocks = async () => {
    setIsLoading(true);
    try {
      const [blocksRes, pagesRes, sectionsRes] = await Promise.all([
        apiClient.get<{ data: ContentBlockDto[] }>('/content-blocks/admin/all'),
        apiClient.get<{ data: PageDto[] }>('/pages/admin/all'),
        apiClient.get<{ data: HomepageSectionDto[] }>('/homepage-sections/admin/all').catch(() => ({ data: [] })),
      ]);
      setBlocks(blocksRes.data || []);
      setPages(pagesRes.data || []);
      setSections(sectionsRes.data || []);
    } catch {
      toast.error('Failed to load content blocks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const openCreateModal = () => {
    setEditingBlock(null);
    setTitle('');
    setContent('');
    setBlockType(BlockType.Markdown);
    setPageId('');
    setHomepageSectionId('');
    setMediaId('');
    setMediaUrl('');
    setCtaLabel('');
    setCtaUrl('');
    setIsExternal(false);
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (block: ContentBlockDto) => {
    setEditingBlock(block);
    setTitle(block.title || '');
    setContent(block.content || '');
    setBlockType(block.blockType);
    setPageId(block.pageId || '');
    setHomepageSectionId(block.homepageSectionId || '');
    setMediaUrl(block.mediaUrl || '');
    const cfg = (block.config as Record<string, unknown>) || {};
    setCtaLabel(typeof cfg.ctaLabel === 'string' ? cfg.ctaLabel : '');
    setCtaUrl(typeof cfg.ctaUrl === 'string' ? cfg.ctaUrl : '');
    setIsExternal(Boolean(cfg.isExternal));
    setIsEnabled(block.isEnabled);
    setIsModalOpen(true);
  };

  const handleSelectMedia = (media: MediaDto) => {
    setMediaId(media.id);
    setMediaUrl(media.url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title && blockType !== BlockType.Image) {
      toast.error('Title is required');
      return;
    }

    const config: Record<string, unknown> = {};
    if (blockType === BlockType.Cta) {
      config.ctaLabel = ctaLabel;
      config.ctaUrl = ctaUrl;
      config.isExternal = isExternal;
    }

    setIsSaving(true);
    try {
      if (editingBlock) {
        const payload: UpdateContentBlockRequest = {
          title,
          content,
          blockType,
          pageId: pageId || null,
          homepageSectionId: homepageSectionId || null,
          mediaId: mediaId || undefined,
          config,
          isEnabled,
        };
        await apiClient.put(`/content-blocks/${editingBlock.id}`, payload);
        toast.success('Block updated successfully');
      } else {
        const payload: CreateContentBlockRequest = {
          title,
          content,
          blockType,
          pageId: pageId || null,
          homepageSectionId: homepageSectionId || null,
          mediaId: mediaId || undefined,
          config,
          isEnabled,
          sortOrder: blocks.length + 1,
        };
        await apiClient.post('/content-blocks', payload);
        toast.success('Block created successfully');
      }
      setIsModalOpen(false);
      fetchBlocks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save content block';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/content-blocks/${deleteTarget.id}`);
      toast.success(`Block '${deleteTarget.title || 'Untitled'}' deleted.`);
      setDeleteTarget(null);
      fetchBlocks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete block';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ContentBlockDto>[] = [
    {
      key: 'title',
      header: 'Block Title',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-bold text-foreground block">{item.title || 'Untitled Block'}</span>
        </div>
      ),
    },
    {
      key: 'blockType',
      header: 'Type',
      render: (item) => (
        <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-surface-muted border border-border rounded text-muted">
          {item.blockType}
        </span>
      ),
    },
    {
      key: 'assignment',
      header: 'Assigned Target',
      render: (item) => {
        if (item.pageId) {
          const matched = pages.find((p) => p.id === item.pageId);
          return (
            <span className="text-xs font-mono text-accent">
              Page: /{matched?.slug || item.pageId.slice(0, 8)}
            </span>
          );
        }
        if (item.homepageSectionId) {
          const matched = sections.find((s) => s.id === item.homepageSectionId);
          return (
            <span className="text-xs font-mono text-info">
              Homepage: {matched?.title || item.homepageSectionId.slice(0, 8)}
            </span>
          );
        }
        return <span className="text-xs font-mono text-muted">Standalone / Global</span>;
      },
    },
    {
      key: 'content',
      header: 'Preview / Config',
      render: (item) => (
        <span className="text-xs text-muted truncate max-w-xs block">
          {item.mediaUrl ? `Image: ${item.mediaUrl}` : item.content || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
            item.isEnabled
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-muted/10 text-muted border-border'
          }`}
        >
          {item.isEnabled ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted hover:text-foreground"
            onClick={() => openEditModal(item)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
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
        title="Reusable Content Blocks"
        description="Global modular content snippets, callout banners, FAQ accordion blocks, and rich media embeds."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Create Content Block</span>
          </Button>
        }
      />

      <AdminDataTable
        columns={columns}
        data={blocks}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={openEditModal}
      />

      {/* Editor Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Box className="w-4 h-4 text-accent" />
                <span>{editingBlock ? `Edit: ${editingBlock.title}` : 'New Content Block'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Block Title</label>
                  <Input
                    type="text"
                    placeholder="e.g. Callout Banner / Research Intro"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={blockType !== BlockType.Image}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Block Type</label>
                  <select
                    value={blockType}
                    onChange={(e) => setBlockType(e.target.value as BlockType)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs focus:outline-none focus:border-accent"
                  >
                    {Object.values(BlockType).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Page / Homepage Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-muted border border-border rounded-md">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Attach to Dynamic Page (Optional)
                  </label>
                  <select
                    value={pageId}
                    onChange={(e) => {
                      setPageId(e.target.value);
                      if (e.target.value) setHomepageSectionId('');
                    }}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="">-- None (Standalone) --</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        /{p.slug} — {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Attach to Homepage Section (Optional)
                  </label>
                  <select
                    value={homepageSectionId}
                    onChange={(e) => {
                      setHomepageSectionId(e.target.value);
                      if (e.target.value) setPageId('');
                    }}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-foreground text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="">-- None (Standalone) --</option>
                    {sections
                      .filter((s) => s.sectionKey !== 'hero')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title || s.sectionKey} ({s.sectionKey})
                        </option>
                      ))}
                  </select>
                  <span className="text-[10px] text-muted block">
                    Hero is a fixed masthead and cannot have attached content blocks.
                  </span>
                </div>
              </div>

              {/* Image Block: Media Picker */}
              {blockType === BlockType.Image && (
                <div className="space-y-2 p-3 bg-surface-muted border border-border rounded-md">
                  <label className="text-xs font-semibold text-foreground block">Block Image</label>
                  {mediaUrl ? (
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl}
                        alt="Selected block media"
                        className="h-16 w-24 object-cover rounded border border-border bg-background"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMediaPickerOpen(true)}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMediaPickerOpen(true)}
                    >
                      <ImageIcon className="w-4 h-4 mr-1.5" />
                      Select Image from Media Library
                    </Button>
                  )}
                </div>
              )}

              {/* CTA Block: Button Configuration */}
              {blockType === BlockType.Cta && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-muted border border-border rounded-md">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Button Text</label>
                    <Input
                      type="text"
                      placeholder="e.g. Schedule a Call"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Button URL</label>
                    <Input
                      type="text"
                      placeholder="e.g. https://cal.com/anujyadav"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isExternal}
                        onChange={(e) => setIsExternal(e.target.checked)}
                        className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        Open Button Link in New Tab
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {blockType === BlockType.Image ? 'Image Caption / Description' : 'Block Content'}
                </label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Enter block markup or narrative in markdown..."
                  minHeight="180px"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Active & Available for Embedding
                  </span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                disabled={isSaving}
              >
                Save Block
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Content Block"
        description={`Are you sure you want to delete '${deleteTarget?.title}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
