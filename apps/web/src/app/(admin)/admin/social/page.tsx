'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  SocialLinkDto,
  CreateSocialLinkRequest,
  UpdateSocialLinkRequest,
} from '@portfolio/shared';
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
import { Plus, Edit2, Trash2, Share2, ExternalLink, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialLinkDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLinkDto | null>(null);
  const [platform, setPlatform] = useState('');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SocialLinkDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: SocialLinkDto[] }>('/social-links/admin/all');
      setLinks(res.data || []);
    } catch {
      toast.error('Failed to load social links');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openCreateModal = () => {
    setEditingLink(null);
    setPlatform('');
    setLabel('');
    setUrl('');
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (lnk: SocialLinkDto) => {
    setEditingLink(lnk);
    setPlatform(lnk.platform);
    setLabel(lnk.label);
    setUrl(lnk.url);
    setIsEnabled(lnk.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !url) {
      toast.error('Platform and URL are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateSocialLinkRequest | UpdateSocialLinkRequest = {
        platform,
        label: label || platform,
        url,
        isEnabled,
      };

      if (editingLink) {
        await apiClient.put(`/social-links/${editingLink.id}`, payload);
        toast.success('Social link updated successfully');
      } else {
        await apiClient.post('/social-links', {
          ...payload,
          sortOrder: links.length + 1,
        });
        toast.success('Social link added');
      }
      setIsModalOpen(false);
      fetchLinks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save social link';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newLinks: SocialLinkDto[]) => {
    setLinks(newLinks);
    try {
      await apiClient.put('/social-links/reorder', {
        items: newLinks.map((l) => ({ id: l.id, sortOrder: l.sortOrder })),
      });
      toast.success('Social link order updated');
    } catch {
      toast.error('Failed to save order');
      fetchLinks();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/social-links/${deleteTarget.id}`);
      toast.success(`Social link for '${deleteTarget.platform}' deleted.`);
      setDeleteTarget(null);
      fetchLinks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete social link';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Social & Professional Profiles"
        description="Public links displayed in header navigation, footer, and contact touchpoints."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Social Link</span>
          </Button>
        }
      />

      <ReorderableList
        items={links}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs">{item.platform}</span>
                {item.label && <span className="text-muted text-xs font-mono">({item.label})</span>}
                {!item.isEnabled && (
                  <span className="text-[10px] text-destructive font-mono flex items-center gap-0.5">
                    <EyeOff className="w-3 h-3" /> Hidden
                  </span>
                )}
              </div>
              <p className="text-[11px] text-accent font-mono truncate mt-0.5 max-w-md">
                {item.url}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted hover:text-accent"
                title="Visit Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
                <Share2 className="w-4 h-4 text-accent" />
                <span>{editingLink ? `Edit: ${editingLink.platform}` : 'Add Social Link'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Platform Name</label>
                <Input
                  type="text"
                  placeholder="e.g. GitHub, LinkedIn, X / Twitter, Discord"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Display Label</label>
                <Input
                  type="text"
                  placeholder="e.g. github.com/anujyadav"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Target URL</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
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
                    Visible on Public Site
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
                Save Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Social Link"
        description={`Are you sure you want to delete '${deleteTarget?.platform}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
