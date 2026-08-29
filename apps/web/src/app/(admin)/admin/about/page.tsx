'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  AboutSectionDto,
  MediaDto,
  CreateAboutSectionRequest,
  UpdateAboutSectionRequest,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { ReorderableList } from '@/components/admin/ui/ReorderableList';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, BookOpen, EyeOff, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAboutPage() {
  const [sections, setSections] = useState<AboutSectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOgPickerOpen, setIsOgPickerOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSectionDto | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [content, setContent] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [ogImageId, setOgImageId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<AboutSectionDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: AboutSectionDto[] }>('/about-sections');
      setSections(res.data || []);
    } catch {
      toast.error('Failed to load about page sections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const openCreateModal = () => {
    setEditingSection(null);
    setSlug('');
    setTitle('');
    setIcon('');
    setContent('');
    setIsEnabled(true);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setOgImageUrl('');
    setOgImageId('');
    setIsModalOpen(true);
  };

  const openEditModal = (sec: AboutSectionDto) => {
    setEditingSection(sec);
    setSlug(sec.slug);
    setTitle(sec.title);
    setIcon(sec.icon || '');
    setContent(sec.content || '');
    setIsEnabled(sec.isEnabled);
    setSeoTitle(sec.seoTitle || '');
    setSeoDescription(sec.seoDescription || '');
    setSeoKeywords(sec.seoKeywords || '');
    setOgImageUrl(sec.ogImageUrl || '');
    setOgImageId('');
    setIsModalOpen(true);
  };

  const handleSelectOg = (media: MediaDto) => {
    setOgImageUrl(media.url);
    setOgImageId(media.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !title || !content) {
      toast.error('Slug, Title, and Content are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSection) {
        const payload: UpdateAboutSectionRequest = {
          title,
          slug,
          icon: icon || undefined,
          content,
          isEnabled,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          seoKeywords: seoKeywords || undefined,
          ogImageId: ogImageId || undefined,
        };
        await apiClient.put(`/about-sections/${editingSection.id}`, payload);
        toast.success('Section updated successfully');
      } else {
        const payload: CreateAboutSectionRequest = {
          slug,
          title,
          icon: icon || undefined,
          content,
          isEnabled,
          sortOrder: sections.length + 1,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          seoKeywords: seoKeywords || undefined,
          ogImageId: ogImageId || undefined,
        };
        await apiClient.post('/about-sections', payload);
        toast.success('Section created successfully');
      }
      setIsModalOpen(false);
      fetchSections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save section';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newSections: AboutSectionDto[]) => {
    setSections(newSections);
    try {
      await apiClient.put('/about-sections/reorder', {
        items: newSections.map((s) => ({ id: s.id, sortOrder: s.sortOrder })),
      });
      toast.success('Sections reordered successfully');
    } catch {
      toast.error('Failed to save section order');
      fetchSections();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/about-sections/${deleteTarget.id}`);
      toast.success(`Section '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchSections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete section';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="About Page Sections"
        description="Organize, order, and edit the structured story modules displayed on the public About page."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add About Section</span>
          </Button>
        }
      />

      <ReorderableList
        items={sections}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs">{item.title}</span>
                <span className="text-[10px] text-muted font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-border">
                  /about/{item.slug}
                </span>
                {!item.isEnabled && (
                  <span className="text-[10px] text-destructive font-mono flex items-center gap-0.5">
                    <EyeOff className="w-3 h-3" /> Hidden
                  </span>
                )}
              </div>
              <p className="text-xs text-muted truncate mt-0.5 max-w-xl">
                {(item.content || '').substring(0, 100)}...
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

      {/* Section Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>
                  {editingSection ? `Edit: ${editingSection.title}` : 'Add About Section'}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Section Title</label>
                  <Input
                    type="text"
                    placeholder="e.g. My Philosophy"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Slug</label>
                  <Input
                    type="text"
                    placeholder="e.g. philosophy"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Icon (Lucide name)</label>
                  <Input
                    type="text"
                    placeholder="e.g. Brain, Code, Rocket"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Markdown Content</label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write the narrative text for this section in GitHub Flavored Markdown..."
                  minHeight="220px"
                />
              </div>

              {/* SEO Sub-section */}
              <div className="p-3 bg-surface-muted border border-border rounded-lg space-y-3 text-xs">
                <h4 className="font-bold text-foreground">Section SEO & Open Graph</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Meta Title</label>
                    <Input
                      type="text"
                      placeholder="Defaults to Section Title"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">SEO Keywords</label>
                    <Input
                      type="text"
                      placeholder="e.g. research, background, biography"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Meta Description</label>
                  <Textarea
                    placeholder="Brief description for SEO search results..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Open Graph Image</label>
                  <div className="flex items-center gap-2">
                    {ogImageUrl ? (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ogImageUrl} alt="OG" className="w-12 h-12 object-cover rounded border border-border" />
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsOgPickerOpen(true)} className="text-xs h-7">
                          Change
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setOgImageUrl(''); setOgImageId(''); }} className="text-xs h-7 text-destructive">
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsOgPickerOpen(true)} className="text-xs h-7">
                        <ImageIcon className="w-3 h-3 mr-1" /> Choose OG Image
                      </Button>
                    )}
                  </div>
                </div>
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
                    Visible on Public About Page
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
                Save Section
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MediaPickerModal
        isOpen={isOgPickerOpen}
        onClose={() => setIsOgPickerOpen(false)}
        onSelect={handleSelectOg}
        title="Select About Section OG Image"
        acceptType="image"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete About Section"
        description={`Are you sure you want to permanently delete '${deleteTarget?.title}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
