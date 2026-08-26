'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { PageDto } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Button, buttonVariants } from '@/components/ui/button';

import { Plus, Edit2, Trash2 } from 'lucide-react';

import { toast } from 'sonner';

export default function AdminPagesListPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<PageDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: PageDto[] }>('/pages/admin/all');
      setPages(res.data || []);
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/pages/${deleteTarget.id}`);
      toast.success(`Page '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchPages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete page';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }

  };

  const columns: Column<PageDto>[] = [
    {
      key: 'title',
      header: 'Page Title',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-bold text-foreground hover:text-accent truncate transition-colors block">
            {item.title}
          </span>
          <span className="text-[11px] text-muted font-mono">/{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      render: (item) => (
        <span className="text-xs text-muted font-mono">
          {new Date(item.updatedAt).toLocaleDateString()}
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
            onClick={() => router.push(`/admin/pages/${item.id}`)}
            title="Edit Page"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Delete Page"
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
        title="Dynamic Markdown Pages"
        description="Custom standalone pages rendered with dynamic MDX (e.g. Terms, Colophon, Press Kit, Privacy)."
        action={
          <Link
            href="/admin/pages/new"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Create Dynamic Page</span>
          </Link>
        }
      />

      <AdminDataTable
        columns={columns}
        data={pages}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Search pages..."
        searchTerm={search}
        onSearchChange={setSearch}
        onRowClick={(item) => router.push(`/admin/pages/${item.id}`)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Page"
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
