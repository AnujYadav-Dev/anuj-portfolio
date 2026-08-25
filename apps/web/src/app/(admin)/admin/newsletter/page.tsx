'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { NewsletterSubscriberDto, PaginatedResponse } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Mail, Download, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriberDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<PaginatedResponse<NewsletterSubscriberDto>>(
        '/newsletter/admin/subscribers',
        { params: { page: String(page), pageSize: '25', search: search || undefined } },
      );
      setSubscribers(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, search]);

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }

    const headers = ['Email', 'Name', 'Confirmed', 'Subscribed Date'];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || '',
      s.isConfirmed ? 'Yes' : 'No',
      new Date(s.createdAt).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscriber CSV exported successfully!');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/newsletter/admin/subscribers/${deleteTarget.id}`);
      toast.success('Subscriber removed.');
      setDeleteTarget(null);
      fetchSubscribers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete subscriber');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<NewsletterSubscriberDto>[] = [
    {
      key: 'email',
      header: 'Subscriber Email',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-accent" />
          <div>
            <span className="font-bold text-foreground font-mono text-xs">{item.email}</span>
            {item.name && <p className="text-[11px] text-muted">{item.name}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'isConfirmed',
      header: 'Confirmation Status',
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
            item.isConfirmed
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-accent/10 text-accent border-accent/30'
          }`}
        >
          {item.isConfirmed ? (
            <>
              <CheckCircle2 className="w-3 h-3" /> Confirmed
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" /> Pending
            </>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Subscribed Date',
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
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(item)}
            title="Unsubscribe & Remove"
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
        title="Email Newsletter Subscribers"
        description="Audience mailing list, double opt-in verification statuses, and exportable contact database."
        action={
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-1.5 text-accent" />
            <span>Export CSV</span>
          </Button>
        }
      />

      <AdminDataTable
        columns={columns}
        data={subscribers}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Search subscribers..."
        searchTerm={search}
        onSearchChange={setSearch}
        pagination={{
          page,
          pageSize: 25,
          totalItems,
          totalPages,
          onPageChange: setPage,
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Remove Subscriber"
        description={`Are you sure you want to remove '${deleteTarget?.email}' from your subscriber list?`}
        confirmLabel="Remove Subscriber"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
