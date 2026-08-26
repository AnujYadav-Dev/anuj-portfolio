'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  ContentBlockDto,
  CreateContentBlockRequest,
  UpdateContentBlockRequest,
} from '@portfolio/shared';
import { BlockType } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { MarkdownEditor } from '@/components/admin/ui/MarkdownEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Box } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminContentBlocksPage() {
  const [blocks, setBlocks] = useState<ContentBlockDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlockDto | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [blockType, setBlockType] = useState<BlockType>(BlockType.Markdown);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ContentBlockDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlocks = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: ContentBlockDto[] }>('/content-blocks/admin/all');
      setBlocks(res.data || []);
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
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (block: ContentBlockDto) => {
    setEditingBlock(block);
    setTitle(block.title || '');
    setContent(block.content || '');
    setBlockType(block.blockType);
    setIsEnabled(block.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and Content are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingBlock) {
        const payload: UpdateContentBlockRequest = {
          title,
          content,
          blockType,
          isEnabled,
        };
        await apiClient.put(`/content-blocks/${editingBlock.id}`, payload);
        toast.success('Block updated successfully');
      } else {
        const payload: CreateContentBlockRequest = {
          title,
          content,
          blockType,
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
      key: 'content',
      header: 'Preview Content',
      render: (item) => (
        <span className="text-xs text-muted truncate max-w-xs block">{item.content || '—'}</span>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Block Title</label>
                  <Input
                    type="text"
                    placeholder="e.g. Callout Banner / Research Intro"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Block Content</label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Enter block markup or narrative in markdown..."
                  minHeight="220px"
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
