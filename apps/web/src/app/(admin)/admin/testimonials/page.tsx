'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  TestimonialDto,
  MediaDto,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
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
import { Plus, Edit2, Trash2, Quote, Star, ExternalLink, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialDto | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [authorCompany, setAuthorCompany] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState('');
  const [authorAvatarId, setAuthorAvatarId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TestimonialDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: TestimonialDto[] }>('/testimonials/admin/all');
      setTestimonials(res.data || []);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setAuthorName('');
    setAuthorTitle('');
    setAuthorCompany('');
    setContent('');
    setUrl('');
    setIsFeatured(false);
    setIsEnabled(true);
    setAuthorAvatarUrl('');
    setAuthorAvatarId('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: TestimonialDto) => {
    setEditingTestimonial(t);
    setAuthorName(t.authorName);
    setAuthorTitle(t.authorTitle || '');
    setAuthorCompany(t.authorCompany || '');
    setContent(t.content);
    setUrl(t.url || '');
    setIsFeatured(t.isFeatured);
    setIsEnabled(t.isEnabled);
    setAuthorAvatarUrl(t.authorAvatarUrl || '');
    setAuthorAvatarId('');
    setIsModalOpen(true);
  };

  const handleSelectAvatar = (media: MediaDto) => {
    setAuthorAvatarUrl(media.url);
    setAuthorAvatarId(media.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !content) {
      toast.error('Author Name and Content are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateTestimonialRequest | UpdateTestimonialRequest = {
        authorName,
        authorTitle: authorTitle || undefined,
        authorCompany: authorCompany || undefined,
        content,
        url: url || undefined,
        isFeatured,
        isEnabled,
        authorAvatarId: authorAvatarId || undefined,
      };

      if (editingTestimonial) {
        await apiClient.put(`/testimonials/${editingTestimonial.id}`, payload);
        toast.success('Testimonial updated successfully');
      } else {
        await apiClient.post('/testimonials', {
          ...payload,
          sortOrder: testimonials.length + 1,
        });
        toast.success('Testimonial added');
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save testimonial';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/testimonials/${deleteTarget.id}`);
      toast.success(`Testimonial by '${deleteTarget.authorName}' deleted.`);
      setDeleteTarget(null);
      fetchTestimonials();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete testimonial';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<TestimonialDto>[] = [
    {
      key: 'author',
      header: 'Author / Affiliation',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-muted border border-border flex items-center justify-center shrink-0 overflow-hidden font-bold text-xs text-accent">
            {item.authorAvatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              item.authorName.charAt(0)
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground truncate">{item.authorName}</span>
              {item.isFeatured && <Star className="w-3 h-3 text-accent fill-accent shrink-0" />}
            </div>
            <p className="text-[11px] text-muted font-mono truncate">
              {item.authorTitle} {item.authorCompany ? `@ ${item.authorCompany}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Testimonial Quote',
      render: (item) => (
        <p className="text-xs text-foreground truncate max-w-md leading-relaxed italic">
          &ldquo;{item.content}&rdquo;
        </p>
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
          {item.isEnabled ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-muted hover:text-accent"
              title="View Profile"
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Testimonials & Peer Recommendations"
        description="Endorsements, recommendations, and quotes from managers, colleagues, and collaborators."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Testimonial</span>
          </Button>
        }
      />

      <AdminDataTable
        columns={columns}
        data={testimonials}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={openEditModal}
      />

      {/* Editor Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Quote className="w-4 h-4 text-accent" />
                <span>
                  {editingTestimonial
                    ? `Edit: ${editingTestimonial.authorName}`
                    : 'New Testimonial'}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Author Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Role / Title</label>
                  <Input
                    type="text"
                    placeholder="e.g. Principal Architect"
                    value={authorTitle}
                    onChange={(e) => setAuthorTitle(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Company</label>
                  <Input
                    type="text"
                    placeholder="e.g. Meta / Google"
                    value={authorCompany}
                    onChange={(e) => setAuthorCompany(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Profile / Reference URL
                </label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Testimonial Quote</label>
                <Textarea
                  placeholder="Write recommendation quote..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Author Avatar</label>
                {authorAvatarUrl ? (
                  <div className="flex items-center gap-3 p-2 border border-border rounded-lg bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={authorAvatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setIsAvatarPickerOpen(true)}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setIsAvatarPickerOpen(true)}
                  >
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-accent" />
                    <span>Select Photo from Media Library</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-accent" /> Featured
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
                Save Testimonial
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MediaPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelect={handleSelectAvatar}
        title="Select Author Avatar Photo"
        acceptType="image"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Testimonial"
        description={`Are you sure you want to delete testimonial by '${deleteTarget?.authorName}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
