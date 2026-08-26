'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { ContactSubmissionDto, PaginatedResponse } from '@portfolio/shared';
import { ContactStatus } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';

import { Mail, Trash2, CheckCircle2, Reply, Archive } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminContactInboxPage() {
  const [messages, setMessages] = useState<ContactSubmissionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Inspector modal
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmissionDto | null>(null);

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmissionDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: '20' };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await apiClient.get<PaginatedResponse<ContactSubmissionDto>>(
        '/contact/admin/submissions',
        { params },
      );
      setMessages(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load contact submissions');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleOpenMessage = async (msg: ContactSubmissionDto) => {
    setSelectedMessage(msg);
    if (msg.status === ContactStatus.Unread) {
      try {
        await apiClient.put(`/contact/admin/submissions/${msg.id}/status`, {
          status: ContactStatus.Read,
        });
        fetchMessages();
      } catch {
        // Ignore
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ContactStatus) => {
    try {
      await apiClient.put(`/contact/admin/submissions/${id}/status`, {
        status: newStatus,
      });
      toast.success(`Message marked as ${newStatus}`);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
      fetchMessages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/contact/admin/submissions/${deleteTarget.id}`);
      toast.success('Message deleted.');
      setDeleteTarget(null);
      if (selectedMessage?.id === deleteTarget.id) setSelectedMessage(null);
      fetchMessages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete message';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ContactSubmissionDto>[] = [
    {
      key: 'name',
      header: 'Sender / Email',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-bold text-foreground block truncate">{item.name}</span>
          <span className="text-[11px] text-accent font-mono truncate">{item.email}</span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject / Preview',
      render: (item) => (
        <div className="min-w-0 max-w-md">
          <span className="font-semibold text-foreground truncate block">
            {item.subject || '(No Subject)'}
          </span>
          <p className="text-[11px] text-muted truncate">{item.message}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Received',
      render: (item) => (
        <span className="text-xs text-muted font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
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
            onClick={() => handleOpenMessage(item)}
            title="Read Message"
          >
            <Mail className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Delete"
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
        title="Contact Inquiries & Messages"
        description="Incoming contact form submissions, recruiter inquiries, client proposals, and direct email responses."
      />

      <AdminDataTable
        columns={columns}
        data={messages}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={handleOpenMessage}
        filterSlot={
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
            {['all', 'unread', 'read', 'replied', 'archived'].map((st) => (
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

      {/* Message Reader Modal */}
      <Dialog
        open={Boolean(selectedMessage)}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[85vh] flex flex-col">
          {selectedMessage && (
            <div className="space-y-4 flex-1 flex flex-col">
              <DialogHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {selectedMessage.subject || 'Direct Contact Submission'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted font-mono mt-0.5">
                    From: {selectedMessage.name} &lt;{selectedMessage.email}&gt; •{' '}
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </DialogDescription>
                </div>

                <StatusBadge status={selectedMessage.status} />
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-background border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMessage.message}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleUpdateStatus(selectedMessage.id, ContactStatus.Replied)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-accent" /> Mark Replied
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleUpdateStatus(selectedMessage.id, ContactStatus.Archived)}
                  >
                    <Archive className="w-3.5 h-3.5 mr-1" /> Archive
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject || 'Portfolio Inquiry',
                    )}`}
                    className={buttonVariants({ variant: 'primary', size: 'sm' })}
                  >
                    <Reply className="w-3.5 h-3.5 mr-1.5" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Contact Message"
        description="Permanently delete this inquiry from database?"
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
