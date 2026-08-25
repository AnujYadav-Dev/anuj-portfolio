'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  ResumeDto,
  MediaDto,
  CreateResumeRequest,
  UpdateResumeRequest,
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
import { Plus, Edit2, Trash2, FileText, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminResumePage() {
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<ResumeDto | null>(null);
  const [title, setTitle] = useState('');
  const [versionLabel, setVersionLabel] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileId, setFileId] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPdfPickerOpen, setIsPdfPickerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ResumeDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: ResumeDto[] }>('/resumes/admin/all');
      setResumes(res.data || []);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const openCreateModal = () => {
    setEditingResume(null);
    setTitle('Software Engineering Resume');
    setVersionLabel('2026.1');
    setFileUrl('');
    setFileId('');
    setIsActive(resumes.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (res: ResumeDto) => {
    setEditingResume(res);
    setTitle(res.title);
    setVersionLabel(res.versionLabel || '');
    setFileUrl(res.fileUrl || '');
    setFileId('');
    setIsActive(res.isActive);
    setIsModalOpen(true);
  };

  const handleSelectPdf = (media: MediaDto) => {
    setFileUrl(media.url);
    setFileId(media.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!fileId && !fileUrl)) {
      toast.error('Title and PDF file are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateResumeRequest | UpdateResumeRequest = {
        title,
        versionLabel: versionLabel || undefined,
        fileId: fileId || undefined,
        isActive,
      };

      if (editingResume) {
        await apiClient.put(`/resumes/${editingResume.id}`, payload);
        toast.success('Resume updated successfully');
      } else {
        await apiClient.post('/resumes', payload);
        toast.success('Resume uploaded successfully');
      }
      setIsModalOpen(false);
      fetchResumes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resumes/${deleteTarget.id}`);
      toast.success(`Resume '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchResumes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resume');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ResumeDto>[] = [
    {
      key: 'title',
      header: 'Resume Label / Version',
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">{item.title}</span>
              {item.isActive && (
                <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.2 rounded border border-accent/30 font-semibold">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted font-mono">v{item.versionLabel || '1.0'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Uploaded Date',
      render: (item) => (
        <span className="text-xs text-muted font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'pdf',
      header: 'File',
      render: (item) =>
        item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> View PDF
          </a>
        ) : (
          '—'
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
        title="Resume & CV Versions"
        description="Manage downloadable CV versions and set primary active resume on public site."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Upload New Resume</span>
          </Button>
        }
      />

      <AdminDataTable
        columns={columns}
        data={resumes}
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
                <FileText className="w-4 h-4 text-accent" />
                <span>{editingResume ? `Edit: ${editingResume.title}` : 'New Resume Version'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Resume Label</label>
                <Input
                  type="text"
                  placeholder="e.g. Software Engineering Resume (2026)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Version Tag</label>
                <Input
                  type="text"
                  placeholder="e.g. 2026.1"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">PDF Document</label>
                {fileUrl ? (
                  <div className="p-3 border border-border rounded-lg bg-surface-muted flex items-center justify-between">
                    <span className="text-xs font-mono truncate">{fileUrl.split('/').pop()}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPdfPickerOpen(true)}
                    >
                      Change PDF
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setIsPdfPickerOpen(true)}
                  >
                    Select PDF from Media Library
                  </Button>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Set as Active Resume
                    (Linked on Public Site)
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
                Save Resume
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MediaPickerModal
        isOpen={isPdfPickerOpen}
        onClose={() => setIsPdfPickerOpen(false)}
        onSelect={handleSelectPdf}
        title="Select Resume PDF"
        acceptType="pdf"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Resume"
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
