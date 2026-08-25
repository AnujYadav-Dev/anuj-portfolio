'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  AchievementDto,
  CreateAchievementRequest,
  UpdateAchievementRequest,
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Trophy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<AchievementDto | null>(null);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AchievementDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: AchievementDto[] }>('/achievements');
      setAchievements(res.data || []);
    } catch {
      toast.error('Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const openCreateModal = () => {
    setEditingAch(null);
    setTitle('');
    setIssuer('');
    setDate('');
    setDescription('');
    setUrl('');
    setIsFeatured(false);
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (ach: AchievementDto) => {
    setEditingAch(ach);
    setTitle(ach.title);
    setIssuer(ach.issuer || '');
    setDate(ach.date ? new Date(ach.date).toISOString().split('T')[0]! : '');
    setDescription(ach.description || '');
    setUrl(ach.url || '');
    setIsFeatured(ach.isFeatured);
    setIsEnabled(ach.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateAchievementRequest | UpdateAchievementRequest = {
        title,
        issuer: issuer || undefined,
        date: date ? new Date(date).toISOString() : undefined,
        description: description || undefined,
        url: url || undefined,
        isFeatured,
        isEnabled,
      };

      if (editingAch) {
        await apiClient.put(`/achievements/${editingAch.id}`, payload);
        toast.success('Achievement updated successfully');
      } else {
        await apiClient.post('/achievements', {
          ...payload,
          sortOrder: achievements.length + 1,
        });
        toast.success('Achievement added successfully');
      }
      setIsModalOpen(false);
      fetchAchievements();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save achievement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newAchs: AchievementDto[]) => {
    setAchievements(newAchs);
    try {
      await apiClient.put('/achievements/reorder', {
        items: newAchs.map((a) => ({ id: a.id, sortOrder: a.sortOrder })),
      });
      toast.success('Achievements order updated');
    } catch {
      toast.error('Failed to save order');
      fetchAchievements();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/achievements/${deleteTarget.id}`);
      toast.success(`Achievement '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchAchievements();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete achievement');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Awards & Honors"
        description="Hackathon victories, academic honors, public recognitions, and competitive achievements."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Achievement</span>
          </Button>
        }
      />

      <ReorderableList
        items={achievements}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs">{item.title}</span>
                {item.issuer && <span className="text-muted text-xs">by {item.issuer}</span>}
              </div>
              <p className="text-[11px] text-muted font-mono mt-0.5">
                {item.date ? new Date(item.date).toLocaleDateString() : 'Awarded'}
                {item.description && ` • ${item.description}`}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted hover:text-accent"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
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
                <Trophy className="w-4 h-4 text-accent" />
                <span>{editingAch ? `Edit: ${editingAch.title}` : 'Add Achievement'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Award Title</label>
                <Input
                  type="text"
                  placeholder="e.g. 1st Place - Global Web3 Hackathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Issuer / Organization</label>
                  <Input
                    type="text"
                    placeholder="e.g. ETHGlobal / MIT"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Date Awarded</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Proof / Certificate URL</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Short Description</label>
                <Textarea
                  placeholder="Built decentralized indexing protocol in 36 hours..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="bg-background text-xs"
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
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} disabled={isSaving}>
                Save Achievement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Achievement"
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
