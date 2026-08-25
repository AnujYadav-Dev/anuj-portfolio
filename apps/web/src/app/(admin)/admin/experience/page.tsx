'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  ExperienceDto,
  CreateExperienceRequest,
  UpdateExperienceRequest,
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Briefcase, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceDto | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ExperienceDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: ExperienceDto[] }>('/experiences');
      setExperiences(res.data || []);
    } catch {
      toast.error('Failed to load experiences');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const openCreateModal = () => {
    setEditingExp(null);
    setCompanyName('');
    setRole('');
    setLocation('');
    setCompanyUrl('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setTechnologiesText('');
    setIsEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (exp: ExperienceDto) => {
    setEditingExp(exp);
    setCompanyName(exp.companyName);
    setRole(exp.role);
    setLocation(exp.location || '');
    setCompanyUrl(exp.companyUrl || '');
    setStartDate(exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0]! : '');
    setEndDate(exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0]! : '');
    setIsCurrent(exp.isCurrent);
    setDescription(exp.description || '');
    setTechnologiesText(exp.technologies ? exp.technologies.join(', ') : '');
    setIsEnabled(exp.isEnabled);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !role || !startDate) {
      toast.error('Company Name, Role, and Start Date are required');
      return;
    }

    setIsSaving(true);
    try {
      const technologies = technologiesText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: CreateExperienceRequest | UpdateExperienceRequest = {
        companyName,
        role,
        location: location || undefined,
        companyUrl: companyUrl || undefined,
        startDate,
        endDate: isCurrent || !endDate ? undefined : endDate,
        isCurrent,
        description: description || undefined,
        technologies,
        isEnabled,
      };


      if (editingExp) {
        await apiClient.put(`/experiences/${editingExp.id}`, payload);
        toast.success('Experience updated successfully');
      } else {
        await apiClient.post('/experiences', {
          ...payload,
          sortOrder: experiences.length + 1,
        });
        toast.success('Experience added successfully');
      }
      setIsModalOpen(false);
      fetchExperiences();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save experience');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newExps: ExperienceDto[]) => {
    setExperiences(newExps);
    try {
      await apiClient.put('/experiences/reorder', {
        items: newExps.map((e) => ({ id: e.id, sortOrder: e.sortOrder })),
      });
      toast.success('Experience order saved');
    } catch {
      toast.error('Failed to reorder');
      fetchExperiences();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/experiences/${deleteTarget.id}`);
      toast.success(`Experience at '${deleteTarget.companyName}' deleted.`);
      setDeleteTarget(null);
      fetchExperiences();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete experience');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Work Experience & Positions"
        description="Career history, engineering roles, timeline dates, and key accomplishments."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Experience</span>
          </Button>
        }
      />

      <ReorderableList
        items={experiences}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs">{item.role}</span>
                <span className="text-muted text-xs">@ {item.companyName}</span>
                {item.isCurrent && (
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.2 rounded border border-accent/30">
                    Present
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted font-mono mt-0.5">
                {new Date(item.startDate).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                —{' '}
                {item.isCurrent
                  ? 'Present'
                  : item.endDate
                  ? new Date(item.endDate).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Present'}
                {item.location && ` • ${item.location}`}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
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
        <DialogContent className="max-w-xl bg-surface border-border p-6 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent" />
                <span>{editingExp ? `Edit: ${editingExp.role} @ ${editingExp.companyName}` : 'Add Work Experience'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Role / Position Title</label>
                  <Input
                    type="text"
                    placeholder="e.g. Senior Distributed Systems Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Company Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Stripe / Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Location</label>
                  <Input
                    type="text"
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Company Website</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCurrent}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">I currently work in this role</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Technologies (comma-separated)</label>
                <Input
                  type="text"
                  placeholder="e.g. Go, Rust, Kubernetes, Kafka, gRPC"
                  value={technologiesText}
                  onChange={(e) => setTechnologiesText(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description & Accomplishments</label>
                <Textarea
                  placeholder="Describe your responsibilities, team scale, and major achievements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-background text-xs"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">Visible on Public Site</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} disabled={isSaving}>
                Save Experience
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Experience"
        description={`Are you sure you want to delete experience at '${deleteTarget?.companyName}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
