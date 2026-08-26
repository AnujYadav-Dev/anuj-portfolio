'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  OpensourceContributionDto,
  CreateOpensourceRequest,
  UpdateOpensourceRequest,
} from '@portfolio/shared';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, FolderGit2, Star, GitFork, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOpensourcePage() {
  const [repos, setRepos] = useState<OpensourceContributionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<OpensourceContributionDto | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('Maintainer');
  const [stars, setStars] = useState<number>(0);
  const [forks, setForks] = useState<number>(0);
  const [language, setLanguage] = useState('TypeScript');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<OpensourceContributionDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRepos = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: OpensourceContributionDto[] }>(
        '/opensource/admin/all',
      );
      setRepos(res.data || []);
    } catch {
      toast.error('Failed to load open source contributions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const openCreateModal = () => {
    setEditingRepo(null);
    setName('');
    setUrl('');
    setDescription('');
    setRole('Maintainer');
    setStars(0);
    setForks(0);
    setLanguage('TypeScript');
    setIsFeatured(false);
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (r: OpensourceContributionDto) => {
    setEditingRepo(r);
    setName(r.name);
    setUrl(r.url);
    setDescription(r.description || '');
    setRole(r.role || 'Maintainer');
    setStars(r.stars || 0);
    setForks(r.forks || 0);
    setLanguage(r.language || 'TypeScript');
    setIsFeatured(r.isFeatured);
    setIsEnabled(r.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) {
      toast.error('Repository Name and URL are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateOpensourceRequest | UpdateOpensourceRequest = {
        name,
        url,
        description: description || undefined,
        role: role || undefined,
        stars: Number(stars) || 0,
        forks: Number(forks) || 0,
        language: language || undefined,
        isFeatured,
        isEnabled,
      };

      if (editingRepo) {
        await apiClient.put(`/opensource/${editingRepo.id}`, payload);
        toast.success('Repository updated successfully');
      } else {
        await apiClient.post('/opensource', {
          ...payload,
          sortOrder: repos.length + 1,
        });
        toast.success('Repository added');
      }
      setIsModalOpen(false);
      fetchRepos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save repository';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/opensource/${deleteTarget.id}`);
      toast.success(`Repository '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      fetchRepos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete repository';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<OpensourceContributionDto>[] = [
    {
      key: 'name',
      header: 'Repository',
      render: (item) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-accent shrink-0" />
            <span className="font-bold text-foreground truncate">{item.name}</span>
            {item.isFeatured && (
              <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.2 rounded border border-accent/30 font-semibold">
                Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted font-mono mt-0.5">
            <span>{item.role || 'Contributor'}</span>
            {item.language && <span>• {item.language}</span>}
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-placeholder" /> {item.stars || 0}
            </span>
            <span className="flex items-center gap-0.5">
              <GitFork className="w-3 h-3 text-placeholder" /> {item.forks || 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <p className="text-xs text-muted truncate max-w-sm">{item.description || '—'}</p>
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
          {item.isEnabled ? 'Visible' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-muted hover:text-accent"
            title="GitHub URL"
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Open Source & Community Work"
        description="Public repositories, maintainer roles, GitHub star counts, and ecosystem contributions."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Repository</span>
          </Button>
        }
      />

      <AdminDataTable
        columns={columns}
        data={repos}
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
                <FolderGit2 className="w-4 h-4 text-accent" />
                <span>{editingRepo ? `Edit: ${editingRepo.name}` : 'Add Open Source Project'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Repository Name</label>
                <Input
                  type="text"
                  placeholder="e.g. facebook/react or anuj/mesh-protocol"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">GitHub URL</label>
                <Input
                  type="url"
                  placeholder="https://github.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Role</label>
                  <Input
                    type="text"
                    placeholder="Creator / Core Contributor"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Language</label>
                  <Input
                    type="text"
                    placeholder="TypeScript / Rust / Go"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  placeholder="Summary of this project's purpose and impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Stars Count</label>
                  <Input
                    type="number"
                    min={0}
                    value={stars}
                    onChange={(e) => setStars(Number(e.target.value))}
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Forks Count</label>
                  <Input
                    type="number"
                    min={0}
                    value={forks}
                    onChange={(e) => setForks(Number(e.target.value))}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">Featured Project</span>
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
                Save Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Open Source Entry"
        description={`Are you sure you want to remove '${deleteTarget?.name}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
