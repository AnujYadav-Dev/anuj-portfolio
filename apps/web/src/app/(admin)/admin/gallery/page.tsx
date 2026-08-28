'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  GalleryItemDto,
  MediaDto,
  CreateGalleryItemRequest,
  UpdateGalleryItemRequest,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Image as ImageIcon, UploadCloud, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemDto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('work');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<GalleryItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: GalleryItemDto[] }>('/gallery/admin/all');
      setItems(res.data || []);
    } catch {
      toast.error('Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setCategory('work');
    setMediaUrl('');
    setMediaId('');
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItemDto) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setCategory(item.category || 'work');
    setMediaUrl(item.mediaUrl || '');
    setMediaId('');
    setIsEnabled(item.isEnabled);
    setIsModalOpen(true);
  };

  const handleSelectMedia = (media: MediaDto) => {
    setMediaUrl(media.url);
    setMediaId(media.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaId && !mediaUrl) {
      toast.error('Please select an image asset');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateGalleryItemRequest | UpdateGalleryItemRequest = {
        mediaId: mediaId || undefined,
        title: title || null,
        description: description || null,
        category: category || null,
        isEnabled,
      };

      if (editingItem) {
        await apiClient.put(`/gallery/${editingItem.id}`, payload);
        toast.success('Gallery item updated');
      } else {
        await apiClient.post('/gallery', {
          ...payload,
          sortOrder: items.length + 1,
        });
        toast.success('Added to gallery');
      }
      setIsModalOpen(false);
      fetchGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save item';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/gallery/${deleteTarget.id}`);
      toast.success('Item deleted from gallery');
      setDeleteTarget(null);
      fetchGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Visual Showcase & Media Gallery"
        description="Curated visual showcase of architecture diagrams, workspace setups, product screenshots, and photos."
        action={
          <div className="flex items-center gap-2">
            <Link href="/gallery" target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span>View Public Gallery</span>
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Add Gallery Item</span>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner className="w-8 h-8 text-accent" />
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            Loading Gallery...
          </span>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-sm font-semibold text-foreground">No gallery media uploaded yet</p>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Upload architecture blueprints, project screenshots, or setup photography.
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-4">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg overflow-hidden border border-border bg-surface flex flex-col shadow-sm hover:border-accent transition-all"
            >
              <div className="aspect-square w-full bg-surface-muted overflow-hidden relative">
                {item.mediaUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.mediaUrl}
                    alt={item.title || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-placeholder m-auto" />
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 bg-surface/80"
                    onClick={() => openEditModal(item)}
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="p-2.5">
                <p className="font-bold text-xs text-foreground truncate">
                  {item.title || 'Untitled'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted font-mono mt-0.5">
                  <span className="uppercase">{item.category || 'general'}</span>
                  <span>{item.isEnabled ? 'Visible' : 'Hidden'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent" />
                <span>{editingItem ? 'Edit Gallery Item' : 'New Gallery Item'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Media Asset</label>
                {mediaUrl ? (
                  <div className="relative aspect-video w-full rounded border border-border overflow-hidden bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 text-xs"
                      onClick={() => setIsMediaPickerOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-accent" />
                    <span>Select Media from Library</span>
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Title (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. Distributed DB Architecture Diagram"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category Tag</label>
                <Input
                  type="text"
                  placeholder="work, setup, architecture, conference"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Caption / Description
                </label>
                <Textarea
                  placeholder="Additional context about this visual asset..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="bg-background text-xs"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Visible in Public Gallery
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
                Save Gallery Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        title="Select Media for Gallery"
        acceptType="all"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Gallery Item"
        description="Are you sure you want to remove this item from the gallery?"
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
