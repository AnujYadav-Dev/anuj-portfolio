'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { TagDto, CreateTagRequest, UpdateTagRequest } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Tag as TagIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagDto | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TagDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: TagDto[] }>('/tags');
      setTags(res.data || []);
    } catch {
      toast.error('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setTagName('');
    setTagSlug('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: TagDto) => {
    setEditingTag(t);
    setTagName(t.name);
    setTagSlug(t.slug);
    setIsModalOpen(true);
  };

  const handleAutoSlug = () => {
    setTagSlug(tagName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName || !tagSlug) {
      toast.error('Tag Name and Slug are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTag) {
        const payload: UpdateTagRequest = {
          name: tagName,
          slug: tagSlug,
        };
        await apiClient.put(`/tags/${editingTag.id}`, payload);
        toast.success('Tag updated successfully');
      } else {
        const payload: CreateTagRequest = {
          name: tagName,
          slug: tagSlug,
        };
        await apiClient.post('/tags', payload);
        toast.success('Tag created successfully');
      }
      setIsModalOpen(false);
      fetchTags();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save tag';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/tags/${deleteTarget.id}`);
      toast.success(`Tag '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      fetchTags();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete tag';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };


  const columns: Column<TagDto>[] = [
    {
      key: 'name',
      header: 'Tag Name',
      render: (item) => (
        <div className="flex items-center gap-2">
          <TagIcon className="w-3.5 h-3.5 text-accent" />
          <span className="font-bold text-foreground">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'URL Slug',
      render: (item) => <span className="font-mono text-xs text-muted">#{item.slug}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => (
        <span className="font-mono text-xs text-muted">
          {new Date(item.createdAt).toLocaleDateString()}
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
        title="Taxonomy & Tag Classification"
        description="Global tech stack and topic tags used across projects, blog posts, and research papers."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Create Tag</span>
          </Button>
        }
      />

      <AdminDataTable
        columns={columns}
        data={tags}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Search tags..."
        searchTerm={search}
        onSearchChange={setSearch}
        onRowClick={openEditModal}
      />

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm bg-surface border-border p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-accent" />
                <span>{editingTag ? `Edit: ${editingTag.name}` : 'New Taxonomy Tag'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Tag Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Distributed Systems"
                  value={tagName}
                  onChange={(e) => {
                    setTagName(e.target.value);
                    if (!editingTag) {
                      setTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Slug</label>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="text-[11px] font-mono text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto
                  </button>
                </div>
                <Input
                  type="text"
                  placeholder="distributed-systems"
                  value={tagSlug}
                  onChange={(e) => setTagSlug(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
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
                Save Tag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Tag"
        description={`Are you sure you want to delete tag '#${deleteTarget?.name}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
