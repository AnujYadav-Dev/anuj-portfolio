'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { EducationDto, CreateEducationRequest, UpdateEducationRequest } from '@portfolio/shared';
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
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminEducationPage() {
  const [educations, setEducations] = useState<EducationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<EducationDto | null>(null);
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EducationDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEducation = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: EducationDto[] }>('/education/admin/all');
      setEducations(res.data || []);
    } catch {
      toast.error('Failed to load education records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const openCreateModal = () => {
    setEditingEdu(null);
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setStartDate('');
    setEndDate('');
    setGrade('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (edu: EducationDto) => {
    setEditingEdu(edu);
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setFieldOfStudy(edu.fieldOfStudy || '');
    setStartDate(edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0]! : '');
    setEndDate(edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0]! : '');
    setGrade(edu.grade || '');
    setDescription(edu.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !degree || !startDate) {
      toast.error('Institution, Degree, and Start Date are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateEducationRequest | UpdateEducationRequest = {
        institution,
        degree,
        fieldOfStudy: fieldOfStudy || undefined,
        startDate,
        endDate: endDate || undefined,
        grade: grade || undefined,
        description: description || undefined,
      };



      if (editingEdu) {
        await apiClient.put(`/education/${editingEdu.id}`, payload);
        toast.success('Education updated successfully');
      } else {
        await apiClient.post('/education', {
          ...payload,
          sortOrder: educations.length + 1,
        });
        toast.success('Education added successfully');
      }
      setIsModalOpen(false);
      fetchEducation();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save education');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newEdus: EducationDto[]) => {
    setEducations(newEdus);
    try {
      await apiClient.put('/education/reorder', {
        items: newEdus.map((e) => ({ id: e.id, sortOrder: e.sortOrder })),
      });
      toast.success('Education order updated');
    } catch {
      toast.error('Failed to save order');
      fetchEducation();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/education/${deleteTarget.id}`);
      toast.success(`Education at '${deleteTarget.institution}' deleted.`);
      setDeleteTarget(null);
      fetchEducation();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete education');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Academic History & Education"
        description="Degrees, universities, academic honors, and specialization domains."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Education</span>
          </Button>
        }
      />

      <ReorderableList
        items={educations}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs">{item.degree}</span>
                {item.fieldOfStudy && <span className="text-muted text-xs">in {item.fieldOfStudy}</span>}
                <span className="text-accent text-xs">@ {item.institution}</span>
              </div>
              <p className="text-[11px] text-muted font-mono mt-0.5">
                {new Date(item.startDate).getFullYear()} —{' '}
                {item.endDate ? new Date(item.endDate).getFullYear() : 'Present'}
                {item.grade && ` • GPA/Grade: ${item.grade}`}
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-surface border-border max-h-[85vh] flex flex-col p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>{editingEdu ? `Edit: ${editingEdu.institution}` : 'Add Education Record'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Institution / University</label>
                <Input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Degree</label>
                  <Input
                    type="text"
                    placeholder="e.g. B.Tech / M.S."
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Field of Study</label>
                  <Input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="bg-background text-xs"
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
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Grade / GPA (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. 3.9 / 4.0 or First Class Honors"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Academic Highlights & Activities</label>
                <Textarea
                  placeholder="Key coursework, honors, labs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} disabled={isSaving}>
                Save Education
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Education"
        description={`Are you sure you want to delete '${deleteTarget?.institution}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
