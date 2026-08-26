'use client';

import React, { useEffect, useState, useCallback } from 'react';

import { apiClient } from '@/lib/api';
import type {
  SkillCategoryDto,
  SkillDto,
  CreateSkillRequest,
  UpdateSkillRequest,
  CreateSkillCategoryRequest,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable, type Column } from '@/components/admin/ui/AdminDataTable';
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
import { Plus, Edit2, Trash2, Code2, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSkillsPage() {
  const [categories, setCategories] = useState<SkillCategoryDto[]>([]);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Skill Editor Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDto | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillSlug, setSkillSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [proficiency, setProficiency] = useState<number>(85);
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  // Category Editor Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<SkillDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, skillRes] = await Promise.all([
        apiClient.get<{ data: SkillCategoryDto[] }>('/skill-categories'),
        apiClient.get<{ data: SkillDto[] }>('/skills/admin/all'),
      ]);
      setCategories(catRes.data || []);
      setSkills(skillRes.data || []);
      if (catRes.data && catRes.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data[0]!.id);
      }
    } catch {
      toast.error('Failed to load skills matrix');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateSkill = () => {
    setEditingSkill(null);
    setSkillName('');
    setSkillSlug('');
    setProficiency(85);
    if (categories.length > 0) setCategoryId(categories[0]!.id);
    setIsSkillModalOpen(true);
  };

  const openEditSkill = (skill: SkillDto) => {
    setEditingSkill(skill);
    setSkillName(skill.name);
    setSkillSlug(skill.slug);
    setProficiency(skill.proficiency ?? 80);
    setCategoryId(skill.categoryId || (categories[0]?.id ?? ''));
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName || !categoryId) {
      toast.error('Name and Category are required');
      return;
    }

    const generatedSlug =
      skillSlug ||
      skillName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

    setIsSavingSkill(true);
    try {
      if (editingSkill) {
        const payload: UpdateSkillRequest = {
          name: skillName,
          slug: generatedSlug,
          proficiency,
          categoryId,
        };
        await apiClient.put(`/skills/${editingSkill.id}`, payload);
        toast.success('Skill updated successfully');
      } else {
        const payload: CreateSkillRequest = {
          name: skillName,
          slug: generatedSlug,
          proficiency,
          categoryId,
        };
        await apiClient.post('/skills', payload);
        toast.success('Skill added successfully');
      }
      setIsSkillModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save skill';
      toast.error(msg);
    } finally {
      setIsSavingSkill(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) {
      toast.error('Category Name and Slug are required');
      return;
    }

    setIsSavingCat(true);
    try {
      const payload: CreateSkillCategoryRequest = {
        name: catName,
        slug: catSlug,
      };

      await apiClient.post('/skill-categories', payload);
      toast.success('Skill category created');
      setIsCatModalOpen(false);
      setCatName('');
      setCatSlug('');
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category';
      toast.error(msg);
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/skills/${deleteTarget.id}`);
      toast.success(`Skill '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete skill';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };


  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const columns: Column<SkillDto>[] = [
    {
      key: 'name',
      header: 'Skill Name',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{item.name}</span>
          <span className="text-[10px] text-muted font-mono">{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => {
        const cat = categories.find((c) => c.id === item.categoryId);
        return <span className="text-xs font-mono text-muted">{cat?.name || '—'}</span>;
      },
    },
    {
      key: 'proficiency',
      header: 'Proficiency',
      render: (item) => (
        <div className="flex items-center gap-2 w-32">
          <div className="h-1.5 flex-1 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${item.proficiency || 0}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-muted">{item.proficiency || 0}%</span>
        </div>
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
            onClick={() => openEditSkill(item)}
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Technical Skills & Proficiencies Matrix"
        description="Core language competencies, distributed systems architecture, and tooling."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCatModalOpen(true)}>
              <FolderPlus className="w-3.5 h-3.5 mr-1.5 text-accent" />
              <span>New Category</span>
            </Button>
            <Button variant="primary" size="sm" onClick={openCreateSkill}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Add Skill</span>
            </Button>
          </div>
        }
      />

      <AdminDataTable
        columns={columns}
        data={filteredSkills}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchPlaceholder="Filter skills..."
        searchTerm={search}
        onSearchChange={setSearch}
        filterSlot={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-accent"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      {/* Skill Editor Modal */}
      <Dialog isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleSaveSkill} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Code2 className="w-4 h-4 text-accent" />
                <span>{editingSkill ? `Edit: ${editingSkill.name}` : 'Add New Skill'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Skill Name</label>
                <Input
                  type="text"
                  placeholder="e.g. TypeScript / Distributed Systems"
                  value={skillName}
                  onChange={(e) => {
                    setSkillName(e.target.value);
                    if (!skillSlug) {
                      setSkillSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Slug</label>
                <Input
                  type="text"
                  placeholder="e.g. typescript"
                  value={skillSlug}
                  onChange={(e) => setSkillSlug(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Skill Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-xs focus:outline-none focus:border-accent"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Proficiency ({proficiency}%)
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={proficiency}
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSkillModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingSkill}
                disabled={isSavingSkill}
              >
                Save Skill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Editor Modal */}
      <Dialog isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-accent" />
                <span>Create Skill Category</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Backend Architecture, Cloud & DevOps"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!catSlug) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category Slug</label>
                <Input
                  type="text"
                  placeholder="e.g. backend-architecture"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCatModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingCat}
                disabled={isSavingCat}
              >
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Skill"
        description={`Are you sure you want to delete '${deleteTarget?.name}' from your skills matrix?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
