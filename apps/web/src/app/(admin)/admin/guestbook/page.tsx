'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { GuestbookEntryDto, PaginatedResponse } from '@portfolio/shared';
import { ModerationStatus } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminGuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<GuestbookEntryDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: '20' };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await apiClient.get<PaginatedResponse<GuestbookEntryDto>>(
        '/guestbook/admin/all',
        { params },
      );
      setEntries(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load guestbook queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, statusFilter]);

  const handleModerate = async (id: string, status: ModerationStatus) => {
    try {
      await apiClient.put(`/guestbook/admin/${id}/moderate`, {
        status,
      });
      toast.success(`Entry marked as ${status}`);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || 'Moderation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/guestbook/admin/${deleteTarget.id}`);
      toast.success('Guestbook entry deleted.');
      setDeleteTarget(null);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<GuestbookEntryDto>[] = [
    {
      key: 'authorName',
      header: 'Author',
      render: (item) => (
        <span className="font-bold text-foreground truncate block">{item.authorName}</span>
      ),
    },
    {
      key: 'message',
      header: 'Guestbook Message',
      render: (item) => (
        <p className="text-xs text-foreground truncate max-w-lg leading-relaxed">{item.message}</p>
      ),
    },
    {
      key: 'moderationStatus',
      header: 'Status',
      render: (item) => <StatusBadge status={item.moderationStatus} />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (item) => (
        <span className="text-xs text-muted font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Moderation Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {item.moderationStatus !== ModerationStatus.Approved && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-success hover:bg-success/10"
              onClick={() => handleModerate(item.id, ModerationStatus.Approved)}
              title="Approve Entry"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Approve
            </Button>
          )}

          {item.moderationStatus !== ModerationStatus.Rejected && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
              onClick={() => handleModerate(item.id, ModerationStatus.Rejected)}
              title="Reject Entry"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reject
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Delete Permanently"
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
        title="Public Guestbook Moderation"
        description="Review visitor feedback, approve signatures for live display, and purge spam."
      />

      <AdminDataTable
        columns={columns}
        data={entries}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        filterSlot={
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-surface text-foreground font-bold shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        }
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
        title="Delete Guestbook Entry"
        description="Permanently remove this guestbook entry?"
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
