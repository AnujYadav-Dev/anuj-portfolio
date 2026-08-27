'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { ProjectListItemDto, PaginatedResponse } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Button, buttonVariants } from '@/components/ui/button';

import { Plus, Edit2, Trash2, Star, Radio } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<ProjectListItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<PaginatedResponse<ProjectListItemDto>>(
        '/projects/admin/all',
        {
          params: {
            page: String(page),
            pageSize: '20',
            ...(search ? { search } : {}),
          },
        },
      );
      setProjects(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/projects/${deleteTarget.id}`);
      toast.success(`Project '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ProjectListItemDto>[] = [
    {
      key: 'title',
      header: 'Title / Slug',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground truncate">{item.title}</span>
              {item.isFeatured && (
                <span className="text-[10px] text-accent font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-border flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-accent" />
                  FEATURED
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted font-mono truncate">/{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'projectType',
      header: 'Type',
      render: (item) => (
        <span className="text-xs text-muted font-mono capitalize">
          {item.projectType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="text-xs text-muted font-mono">{item.category?.name || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'publishedAt',
      header: 'Published Date',
      render: (item) => (
        <span className="text-xs text-muted font-mono">
          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '—'}
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
            className="h-7 w-7 p-0 text-accent hover:bg-accent/10"
            onClick={() => router.push(`/admin/newsletter?action=broadcast&contentType=project&contentId=${item.id}`)}
            title="Broadcast to Newsletter"
          >
            <Radio className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted hover:text-foreground"
            onClick={() => router.push(`/admin/works/${item.id}`)}
            title="Edit Project"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Delete Project"
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
        title="Works & Project Management"
        description="Catalog of all portfolio case studies, live demos, and technical architecture writeups."
        action={
          <Link
            href="/admin/works/new"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Create New Project</span>
          </Link>
        }
      />

      <AdminDataTable
        columns={columns}
        data={projects}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Search projects by title, slug, or tech stack..."
        searchTerm={search}
        onSearchChange={setSearch}
        onRowClick={(item) => router.push(`/admin/works/${item.id}`)}
        pagination={{
          page,
          pageSize: 20,
          totalItems,
          totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Confirm Deletion Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Project"
        description={`Are you sure you want to permanently delete '${deleteTarget?.title}'? This will remove all associated case study notes and media attachments.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
