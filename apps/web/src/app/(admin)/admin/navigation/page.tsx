'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { NavItemDto, CreateNavItemRequest, UpdateNavItemRequest } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { ReorderableList } from '@/components/admin/ui/ReorderableList';
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
import { Plus, Edit2, Trash2, Menu, ExternalLink, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItemDto | null>(null);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('/');
  const [isExternal, setIsExternal] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<NavItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNav = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: NavItemDto[] }>('/nav-items/admin/all');
      setItems(res.data || []);
    } catch {
      toast.error('Failed to load navigation tree');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNav();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setLabel('');
    setUrl('/');
    setIsExternal(false);
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: NavItemDto) => {
    setEditingItem(item);
    setLabel(item.label);
    setUrl(item.url);
    setIsExternal(item.isExternal);
    setIsEnabled(item.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !url) {
      toast.error('Label and URL are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateNavItemRequest | UpdateNavItemRequest = {
        label,
        url,
        isExternal,
        isEnabled,
      };

      if (editingItem) {
        await apiClient.put(`/nav-items/${editingItem.id}`, payload);
        toast.success('Nav link updated');
      } else {
        await apiClient.post('/nav-items', {
          ...payload,
          sortOrder: items.length + 1,
        });
        toast.success('Nav link added');
      }
      setIsModalOpen(false);
      fetchNav();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save navigation link';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newItems: NavItemDto[]) => {
    setItems(newItems);
    try {
      await apiClient.put('/nav-items/reorder', {
        items: newItems.map((n) => ({ id: n.id, sortOrder: n.sortOrder })),
      });
      toast.success('Navigation order saved');
    } catch {
      toast.error('Failed to save order');
      fetchNav();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/nav-items/${deleteTarget.id}`);
      toast.success(`Nav item '${deleteTarget.label}' deleted.`);
      setDeleteTarget(null);
      fetchNav();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete nav item';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Header & Navigation Menus"
        description="Configure public navigation bar links, external redirects, dropdown sub-items, and order."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Nav Link</span>
          </Button>
        }
      />

      <ReorderableList
        items={items}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Menu className="w-3.5 h-3.5 text-accent" />
                <span className="font-bold text-foreground text-xs">{item.label}</span>
                {item.isExternal && (
                  <span className="text-[10px] text-muted font-mono bg-surface-muted px-1.5 py-0.2 rounded border border-border flex items-center gap-0.5">
                    <ExternalLink className="w-2.5 h-2.5" /> External
                  </span>
                )}
                {!item.isEnabled && (
                  <span className="text-[10px] text-destructive font-mono flex items-center gap-0.5">
                    <EyeOff className="w-3 h-3" /> Hidden
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted font-mono truncate mt-0.5 max-w-md">
                {item.url}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
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
          </div>
        )}
      />

      {/* Editor Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Menu className="w-4 h-4 text-accent" />
                <span>{editingItem ? `Edit: ${editingItem.label}` : 'New Nav Item'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Menu Label</label>
                <Input
                  type="text"
                  placeholder="e.g. Works, Research, Blog, About"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Destination URL</label>
                <Input
                  type="text"
                  placeholder="e.g. /works or https://github.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isExternal}
                    onChange={(e) => setIsExternal(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Open in New Tab (External Target)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Visible in Header Navigation
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
                Save Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Navigation Item"
        description={`Are you sure you want to delete '${deleteTarget?.label}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
