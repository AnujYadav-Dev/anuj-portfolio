'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { HomepageSectionDto, UpdateHomepageSectionRequest } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { ReorderableList } from '@/components/admin/ui/ReorderableList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutTemplate, Edit2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHomepageLayoutPage() {
  const [sections, setSections] = useState<HomepageSectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSec, setEditingSec] = useState<HomepageSectionDto | null>(null);
  const [title, setTitle] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: HomepageSectionDto[] }>('/homepage-sections/admin/all');
      setSections(res.data || []);
    } catch {
      toast.error('Failed to load homepage sections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const openEditModal = (sec: HomepageSectionDto) => {
    setEditingSec(sec);
    setTitle(sec.title || '');
    setIsEnabled(sec.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSec) return;

    setIsSaving(true);
    try {
      const payload: UpdateHomepageSectionRequest = {
        title: title || null,
        isEnabled,
      };

      await apiClient.put(`/homepage-sections/${editingSec.id}`, payload);
      toast.success('Section updated');
      setIsModalOpen(false);
      fetchSections();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (sec: HomepageSectionDto) => {
    try {
      await apiClient.put(`/homepage-sections/${sec.id}`, {
        isEnabled: !sec.isEnabled,
      });
      toast.success(`Section '${sec.sectionKey}' ${!sec.isEnabled ? 'enabled' : 'hidden'}`);
      fetchSections();
    } catch {
      toast.error('Failed to toggle visibility');
    }
  };

  const handleReorder = async (newSections: HomepageSectionDto[]) => {
    setSections(newSections);
    try {
      await apiClient.put('/homepage-sections/reorder', {
        items: newSections.map((s) => ({ id: s.id, sortOrder: s.sortOrder })),
      });
      toast.success('Homepage section layout saved');
    } catch {
      toast.error('Failed to save layout order');
      fetchSections();
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage Section Layout & Ordering"
        description="Reorder landing page blocks, customize section headers, and toggle visibility on the live portfolio."
      />

      <ReorderableList
        items={sections}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-accent" />
                <span className="font-bold text-foreground text-xs">{item.title || item.sectionKey}</span>
                <span className="text-[10px] text-muted font-mono bg-surface-muted px-1.5 py-0.2 rounded border border-border">
                  #{item.sectionKey}
                </span>
                {!item.isEnabled && (
                  <span className="text-[10px] text-destructive font-mono flex items-center gap-0.5">
                    <EyeOff className="w-3 h-3" /> Disabled
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted hover:text-foreground"
                onClick={() => handleToggleVisibility(item)}
              >
                {item.isEnabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 mr-1 text-destructive" /> Hidden
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted hover:text-foreground"
                onClick={() => openEditModal(item)}
                title="Edit Section Headings"
              >
                <Edit2 className="w-3.5 h-3.5" />
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
                <LayoutTemplate className="w-4 h-4 text-accent" />
                <span>Edit Section: #{editingSec?.sectionKey}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Section Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Featured Works & Case Studies"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    Enable Section on Homepage
                  </span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} disabled={isSaving}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
