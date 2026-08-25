'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { BlogPostListItemDto, PaginatedResponse } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBlogsListPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPostListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<BlogPostListItemDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<PaginatedResponse<BlogPostListItemDto>>('/blogs/admin/all', {
        params: { page: String(page), pageSize: '15', search },
      });
      setBlogs(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/blogs/${deleteTarget.id}`);
      toast.success(`Post '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete blog post');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<BlogPostListItemDto>[] = [
    {
      key: 'title',
      header: 'Title / Slug',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {item.coverImageUrl ? (
              <img src={item.coverImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Eye className="w-4 h-4 text-placeholder" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground truncate">{item.title}</span>
              {item.isFeatured && (
                <span className="text-[10px] text-accent font-mono bg-surface-muted px-1.5 py-0.2 rounded border border-border">
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
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="text-xs text-muted font-mono">{item.category?.name || '—'}</span>
      ),
    },
    {
      key: 'readingTimeMinutes',
      header: 'Read Time',
      render: (item) => (
        <span className="text-xs text-muted font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" /> {item.readingTimeMinutes || 1} min
        </span>
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
            onClick={() => router.push(`/admin/blogs/${item.id}`)}
            title="Edit Article"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Delete Article"
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
        title="Technical Writings & Blog Management"
        description="Write tutorials, engineering insights, and manage publishing schedules with snapshot versioning."
        action={
          <Link
            href="/admin/blogs/new"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Write New Article</span>
          </Link>
        }
      />

      <AdminDataTable
        columns={columns}
        data={blogs}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Search articles by title, slug, or content..."
        searchTerm={search}
        onSearchChange={setSearch}
        onRowClick={(item) => router.push(`/admin/blogs/${item.id}`)}
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
        title="Delete Blog Post"
        description={`Are you sure you want to permanently delete '${deleteTarget?.title}'? This will remove all associated content versions.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
