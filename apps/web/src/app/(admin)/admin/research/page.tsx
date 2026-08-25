'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { ResearchPaperListItemDto, PaginatedResponse } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Button, buttonVariants } from '@/components/ui/button';

import { Plus, Edit2, Trash2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminResearchListPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<ResearchPaperListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<ResearchPaperListItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<PaginatedResponse<ResearchPaperListItemDto>>('/research/admin/all', {
        params: { page, pageSize: 20, search },
      });
      setPapers(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load research papers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/research/${deleteTarget.id}`);
      toast.success(`Research paper '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchPapers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete paper');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ResearchPaperListItemDto>[] = [
    {
      key: 'title',
      header: 'Paper Title',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-bold text-foreground hover:text-accent truncate transition-colors block">
            {item.title}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-muted font-mono mt-0.5">
            <span>/{item.slug}</span>
            {item.publicationName && <span>• {item.publicationName}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'publication',
      header: 'Publication Venue',
      render: (item) => (
        <span className="text-xs text-muted font-mono">{item.publicationName || '—'}</span>
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
            className="h-7 w-7 p-0 text-muted hover:text-foreground"
            onClick={() => router.push(`/admin/research/${item.id}`)}
            title="Edit Paper"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Delete Paper"
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
        title="Research & Academic Publications"
        description="Manage technical papers, DOI publications, conferences, and downloadable research PDFs."
        action={
          <Link
            href="/admin/research/new"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Research Paper</span>
          </Link>
        }

      />

      <AdminDataTable
        columns={columns}
        data={papers}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Search research papers by title or conference..."
        searchTerm={search}
        onSearchChange={setSearch}
        onRowClick={(item) => router.push(`/admin/research/${item.id}`)}
        pagination={{
          page,
          pageSize: 20,
          totalItems,
          totalPages,
          onPageChange: setPage,
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Research Paper"
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
