'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  CertificateDto,
  CreateCertificateRequest,
  UpdateCertificateRequest,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { ReorderableList } from '@/components/admin/ui/ReorderableList';
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
import { Plus, Edit2, Trash2, Award, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateDto | null>(null);
  const [name, setName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CertificateDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: CertificateDto[] }>('/certificates');
      setCertificates(res.data || []);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const openCreateModal = () => {
    setEditingCert(null);
    setName('');
    setIssuingOrganization('');
    setIssueDate('');
    setExpiryDate('');
    setCredentialId('');
    setCredentialUrl('');
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cert: CertificateDto) => {
    setEditingCert(cert);
    setName(cert.name);
    setIssuingOrganization(cert.issuingOrganization);
    setIssueDate(cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0]! : '');
    setExpiryDate(cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0]! : '');
    setCredentialId(cert.credentialId || '');
    setCredentialUrl(cert.credentialUrl || '');
    setIsEnabled(cert.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !issuingOrganization || !issueDate) {
      toast.error('Name, Issuing Organization, and Issue Date are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateCertificateRequest | UpdateCertificateRequest = {
        name,
        issuingOrganization,
        issueDate: new Date(issueDate).toISOString(),
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        credentialId: credentialId || undefined,
        credentialUrl: credentialUrl || undefined,
        isEnabled,
      };

      if (editingCert) {
        await apiClient.put(`/certificates/${editingCert.id}`, payload);
        toast.success('Certificate updated successfully');
      } else {
        await apiClient.post('/certificates', {
          ...payload,
          sortOrder: certificates.length + 1,
        });
        toast.success('Certificate added successfully');
      }
      setIsModalOpen(false);
      fetchCertificates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save certificate');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newCerts: CertificateDto[]) => {
    setCertificates(newCerts);
    try {
      await apiClient.put('/certificates/reorder', {
        items: newCerts.map((c) => ({ id: c.id, sortOrder: c.sortOrder })),
      });
      toast.success('Certificate order updated');
    } catch {
      toast.error('Failed to save order');
      fetchCertificates();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/certificates/${deleteTarget.id}`);
      toast.success(`Certificate '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      fetchCertificates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete certificate');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Certifications & Accreditations"
        description="Professional certifications, cloud credentials, verified diplomas, and badges."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Certificate</span>
          </Button>
        }
      />

      <ReorderableList
        items={certificates}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs">{item.name}</span>
                <span className="text-muted text-xs">issued by {item.issuingOrganization}</span>
              </div>
              <p className="text-[11px] text-muted font-mono mt-0.5">
                Issued {new Date(item.issueDate).toLocaleDateString()}
                {item.credentialId && ` • ID: ${item.credentialId}`}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {item.credentialUrl && (
                <a
                  href={item.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted hover:text-accent"
                  title="Verify Credential"
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
          </div>
        )}
      />

      {/* Editor Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" />
                <span>{editingCert ? `Edit: ${editingCert.name}` : 'Add Certificate'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Certificate Name</label>
                <Input
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect - Professional"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Issuing Organization</label>
                <Input
                  type="text"
                  placeholder="e.g. Amazon Web Services / CNCF"
                  value={issuingOrganization}
                  onChange={(e) => setIssuingOrganization(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Issue Date</label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Expiry Date (Optional)</label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Credential ID (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. AWS-PSA-123456"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Verification URL</label>
                <Input
                  type="url"
                  placeholder="https://credly.com/..."
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="pt-2">
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
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} disabled={isSaving}>
                Save Certificate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Certificate"
        description={`Are you sure you want to delete '${deleteTarget?.name}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
