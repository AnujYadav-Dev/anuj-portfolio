'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  HomepageSectionDto,
  CreateHomepageSectionRequest,
  UpdateHomepageSectionRequest,
  HomepageSectionConfig,
  HeroCtaButtonConfig,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { ReorderableList } from '@/components/admin/ui/ReorderableList';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { MarkdownEditor } from '@/components/admin/ui/MarkdownEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LayoutTemplate,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  SlidersHorizontal,
  Info,
  ExternalLink,
  Zap,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

type SectionCategory = 'hero_header' | 'dynamic_entity' | 'content_narrative' | 'callout_system';

interface SectionPreset {
  key: string;
  category: SectionCategory;
  title: string;
  subtitle: string;
  defaultTag: string;
  description: string;
  sourceDescription: string;
  entityLink?: string;
  entityLinkLabel?: string;
  defaultLimit?: number;
  defaultCtaLabel?: string;
  defaultCtaUrl?: string;
  defaultContent?: string;
}

// Predefined presets with clear category, tag, and entity mappings
const SECTION_PRESETS: SectionPreset[] = [
  {
    key: 'hero',
    category: 'hero_header',
    title: 'Hero Introduction',
    subtitle: 'Main Landing Header',
    defaultTag: 'HERO',
    description: 'Full viewport hero banner with slogan, 3 action links, and edge-to-edge name watermark.',
    sourceDescription: 'Uses site settings for author name, job title, and active resume.',
    entityLink: '/admin/settings',
    entityLinkLabel: 'Edit Site Settings →',
    defaultCtaLabel: 'View Works',
    defaultCtaUrl: '/works',
    defaultContent: 'Precision in detail, vision in design, building things one block at a time.',
  },
  {
    key: 'about',
    category: 'content_narrative',
    title: 'Who am I?',
    subtitle: 'Background & Philosophy',
    defaultTag: 'INTRO',
    description: 'Narrative introduction, technical philosophy, and link to full journey.',
    sourceDescription: 'Renders rich Markdown narrative text directly on the homepage.',
    entityLink: '/admin/about',
    entityLinkLabel: 'Manage Dedicated About Pages →',
    defaultCtaLabel: 'Read Full Journey & Philosophy',
    defaultCtaUrl: '/about',
    defaultContent:
      'I am a full-stack engineer and distributed systems enthusiast dedicated to engineering high-performance web applications, accessible design systems, and robust backend microservices. I bridge the gap between architectural rigor and refined frontend craft.',
  },
  {
    key: 'featured_projects',
    category: 'dynamic_entity',
    title: 'Featured Works',
    subtitle: 'Featured Projects & Architecture Deep-Dives',
    defaultTag: 'WORKS',
    description: 'Minimal interactive stream list showcasing featured projects and architecture.',
    sourceDescription: 'Dynamically fetches projects marked as featured from the database.',
    entityLink: '/admin/works',
    entityLinkLabel: 'Manage Projects in Works Dashboard →',
    defaultLimit: 4,
    defaultCtaLabel: 'All Projects',
    defaultCtaUrl: '/works',
  },
  {
    key: 'skills',
    category: 'dynamic_entity',
    title: 'Technical Arsenal',
    subtitle: 'Languages, Frameworks & Tooling',
    defaultTag: 'SKILLS',
    description: 'Categorized technical arsenal and proficiencies.',
    sourceDescription: 'Dynamically fetches skill categories and technologies from the database.',
    entityLink: '/admin/skills',
    entityLinkLabel: 'Manage Skills & Categories →',
    defaultLimit: 4,
    defaultCtaLabel: 'View Full Skills Matrix & Proficiencies',
    defaultCtaUrl: '/skills',
  },
  {
    key: 'experience',
    category: 'dynamic_entity',
    title: 'Career Journey',
    subtitle: 'Roles & Professional Experience',
    defaultTag: 'JOURNEY',
    description: 'Professional career history highlights prioritizing current roles.',
    sourceDescription: 'Dynamically fetches career positions from the database.',
    entityLink: '/admin/experience',
    entityLinkLabel: 'Manage Roles in Experience Dashboard →',
    defaultLimit: 3,
    defaultCtaLabel: 'Explore Full Career History & Timeline',
    defaultCtaUrl: '/experience',
  },
  {
    key: 'latest_articles',
    category: 'dynamic_entity',
    title: 'Latest Writing & Research',
    subtitle: 'Articles, Whitepapers & Architecture Notes',
    defaultTag: 'WRITINGS',
    description: 'Recent technical blog posts and research publications stream.',
    sourceDescription: 'Dynamically fetches published blog posts and research papers.',
    entityLink: '/admin/blogs',
    entityLinkLabel: 'Manage Blogs & Research Papers →',
    defaultLimit: 5,
    defaultCtaLabel: 'All Articles',
    defaultCtaUrl: '/blogs',
  },
  {
    key: 'contact',
    category: 'callout_system',
    title: 'Get In Touch',
    subtitle: 'Collaboration & Inquiries',
    defaultTag: 'CONNECT',
    description: 'Contact callout card with direct message and copy email actions.',
    sourceDescription: 'Uses site settings for author contact email and renders an interactive CTA card.',
    entityLink: '/admin/settings',
    entityLinkLabel: 'Manage Contact Email in Settings →',
    defaultCtaLabel: 'Send Message',
    defaultCtaUrl: '/contact',
  },
  {
    key: 'custom_markdown',
    category: 'content_narrative',
    title: 'Custom Section Note',
    subtitle: 'Custom Content & Documentation',
    defaultTag: 'NOTE',
    description: 'Arbitrary rich Markdown block with headings, tables, callouts, and code.',
    sourceDescription: 'Renders custom Markdown prose, lists, tables, callouts, and links.',
    defaultCtaLabel: 'Learn More',
    defaultCtaUrl: '/about',
    defaultContent: '### Custom Section Note\n\nWrite your rich markdown content here.',
  },
];

function getSectionPreset(key: string): SectionPreset {
  const matched = SECTION_PRESETS.find((p) => p.key === key);
  if (matched) return matched;
  // Aliases support
  if (key === 'projects') return SECTION_PRESETS.find((p) => p.key === 'featured_projects')!;
  if (key === 'blogs') return SECTION_PRESETS.find((p) => p.key === 'latest_articles')!;

  // Fallback for custom sections
  return {
    key,
    category: 'content_narrative',
    title: 'Custom Section',
    subtitle: 'Custom Content & Narrative',
    defaultTag: key.replace(/_/g, ' ').toUpperCase(),
    description: 'Custom rich Markdown block.',
    sourceDescription: 'Renders custom Markdown content on the homepage.',
    defaultCtaLabel: 'Learn More',
    defaultCtaUrl: '/about',
    defaultContent: '### Custom Section\n\nWrite your rich markdown content here.',
  };
}

function generateCustomSectionKey(): string {
  return 'custom_' + Date.now().toString(36);
}

export default function AdminHomepageLayoutPage() {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<HomepageSectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addPresetKey, setAddPresetKey] = useState('custom_markdown');
  const [addKey, setAddKey] = useState('');
  const [addTitle, setAddTitle] = useState('');
  const [addSubtitle, setAddSubtitle] = useState('');
  const [addLabelTag, setAddLabelTag] = useState('');
  const [addTagSeparator, setAddTagSeparator] = useState('//');
  const [addShowSectionNumber, setAddShowSectionNumber] = useState(true);
  const [addContent, setAddContent] = useState('');
  const [addLimit, setAddLimit] = useState(4);
  const [addIncludeResearch, setAddIncludeResearch] = useState(true);
  const [addHeroCta1, setAddHeroCta1] = useState<HeroCtaButtonConfig>({
    label: 'View Works',
    url: '/works',
    target: '_self',
  });
  const [addHeroCta2, setAddHeroCta2] = useState<HeroCtaButtonConfig>({
    label: 'Download Resume',
    url: '/resume',
    target: '_blank',
  });
  const [addHeroCta3, setAddHeroCta3] = useState<HeroCtaButtonConfig>({
    label: 'Get in Touch',
    url: '/contact',
    target: '_self',
  });
  const [addCtaLabel, setAddCtaLabel] = useState('');
  const [addCtaUrl, setAddCtaUrl] = useState('');
  const [addCtaTarget, setAddCtaTarget] = useState<'_self' | '_blank'>('_self');
  const [addCalloutHeadline, setAddCalloutHeadline] = useState('');
  const [addCalloutDescription, setAddCalloutDescription] = useState('');
  const [addEnableCopyEmail, setAddEnableCopyEmail] = useState(true);
  const [addIsEnabled, setAddIsEnabled] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSec, setEditingSec] = useState<HomepageSectionDto | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editLabelTag, setEditLabelTag] = useState('');
  const [editTagSeparator, setEditTagSeparator] = useState('//');
  const [editShowSectionNumber, setEditShowSectionNumber] = useState(true);
  const [editContent, setEditContent] = useState('');
  const [editLimit, setEditLimit] = useState<number>(4);
  const [editIncludeResearch, setEditIncludeResearch] = useState(true);
  const [editHeroCta1, setEditHeroCta1] = useState<HeroCtaButtonConfig>({
    label: 'View Works',
    url: '/works',
    target: '_self',
  });
  const [editHeroCta2, setEditHeroCta2] = useState<HeroCtaButtonConfig>({
    label: 'Download Resume',
    url: '/resume',
    target: '_blank',
  });
  const [editHeroCta3, setEditHeroCta3] = useState<HeroCtaButtonConfig>({
    label: 'Get in Touch',
    url: '/contact',
    target: '_self',
  });
  const [editCtaLabel, setEditCtaLabel] = useState('');
  const [editCtaUrl, setEditCtaUrl] = useState('');
  const [editCtaTarget, setEditCtaTarget] = useState<'_self' | '_blank'>('_self');
  const [editCalloutHeadline, setEditCalloutHeadline] = useState('');
  const [editCalloutDescription, setEditCalloutDescription] = useState('');
  const [editEnableCopyEmail, setEditEnableCopyEmail] = useState(true);
  const [editIsEnabled, setEditIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<HomepageSectionDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const invalidateClientCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
  }, [queryClient]);

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: HomepageSectionDto[] }>(
        '/homepage-sections/admin/all',
      );
      const list = res.data || [];
      // If hero was previously set to disabled in DB, auto-restore to enabled
      const hero = list.find((s) => s.sectionKey === 'hero');
      if (hero && !hero.isEnabled) {
        await apiClient.put(`/homepage-sections/${hero.id}`, { isEnabled: true });
        hero.isEnabled = true;
        invalidateClientCache();
      }
      setSections(list);
    } catch {
      toast.error('Failed to load homepage sections');
    } finally {
      setIsLoading(false);
    }
  }, [invalidateClientCache]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Open Add Modal with intelligent defaults
  const openAddModal = () => {
    const preset = SECTION_PRESETS.find((p) => p.key === 'custom_markdown')!;
    setAddPresetKey('custom_markdown');
    setAddKey(generateCustomSectionKey());
    setAddTitle(preset.title);
    setAddSubtitle(preset.subtitle);
    setAddLabelTag(preset.defaultTag);
    setAddTagSeparator('//');
    setAddShowSectionNumber(true);
    setAddContent(preset.defaultContent || '');
    setAddLimit(4);
    setAddIncludeResearch(true);
    setAddHeroCta1({ label: 'View Works', url: '/works', target: '_self' });
    setAddHeroCta2({ label: 'Download Resume', url: '/resume', target: '_blank' });
    setAddHeroCta3({ label: 'Get in Touch', url: '/contact', target: '_self' });
    setAddCtaLabel(preset.defaultCtaLabel || '');
    setAddCtaUrl(preset.defaultCtaUrl || '');
    setAddCtaTarget('_self');
    setAddCalloutHeadline('Have an ambitious project or engineering challenge?');
    setAddCalloutDescription(
      'Whether you need senior technical leadership, architectural guidance, or full-stack execution, my inbox is always open.',
    );
    setAddEnableCopyEmail(true);
    setAddIsEnabled(true);
    setIsAddModalOpen(true);
  };

  // Handle Preset selection in Add Modal
  const handlePresetSelect = (presetKey: string) => {
    setAddPresetKey(presetKey);
    const preset = getSectionPreset(presetKey);
    if (presetKey === 'custom_markdown') {
      setAddKey(generateCustomSectionKey());
    } else {
      setAddKey(preset.key);
    }
    setAddTitle(preset.title);
    setAddSubtitle(preset.subtitle);
    setAddLabelTag(preset.defaultTag);
    setAddTagSeparator('//');
    setAddShowSectionNumber(true);
    setAddContent(preset.defaultContent || '');
    setAddLimit(preset.defaultLimit || 4);
    setAddCtaLabel(preset.defaultCtaLabel || '');
    setAddCtaUrl(preset.defaultCtaUrl || '');
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addKey.trim()) {
      toast.error('Section key is required');
      return;
    }

    setIsAdding(true);
    try {
      const config: HomepageSectionConfig = {
        subtitle: addSubtitle || undefined,
        labelTag: addLabelTag !== undefined ? addLabelTag : undefined,
        tagSeparator: addTagSeparator !== undefined ? addTagSeparator : undefined,
        showSectionNumber: addShowSectionNumber,
        content: addContent || undefined,
        limit: Number(addLimit) || undefined,
        includeResearch: addIncludeResearch,
        heroCta1: addPresetKey === 'hero' ? addHeroCta1 : undefined,
        heroCta2: addPresetKey === 'hero' ? addHeroCta2 : undefined,
        heroCta3: addPresetKey === 'hero' ? addHeroCta3 : undefined,
        ctaLabel: addCtaLabel || undefined,
        ctaUrl: addCtaUrl || undefined,
        ctaTarget: addCtaTarget,
        calloutHeadline: addCalloutHeadline || undefined,
        calloutDescription: addCalloutDescription || undefined,
        enableCopyEmail: addEnableCopyEmail,
      };

      const payload: CreateHomepageSectionRequest = {
        sectionKey: addKey.trim().toLowerCase(),
        title: addTitle || null,
        sortOrder: sections.length,
        isEnabled: addIsEnabled,
        config,
      };

      await apiClient.post('/homepage-sections', payload);
      toast.success(`Section '${addTitle || addKey}' created successfully`);
      setIsAddModalOpen(false);
      invalidateClientCache();
      fetchSections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create section';
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  // Open Edit Modal and pre-populate with existing values OR intelligent defaults
  const openEditModal = (sec: HomepageSectionDto) => {
    const preset = getSectionPreset(sec.sectionKey);
    setEditingSec(sec);

    setEditTitle(sec.title || preset.title);
    setEditSubtitle((sec.config?.subtitle as string) || preset.subtitle);
    setEditLabelTag(
      sec.config?.labelTag !== undefined ? (sec.config.labelTag as string) : preset.defaultTag,
    );
    setEditTagSeparator(
      sec.config?.tagSeparator !== undefined ? (sec.config.tagSeparator as string) : '//',
    );
    setEditShowSectionNumber(sec.config?.showSectionNumber !== false);
    setEditContent((sec.config?.content as string) || preset.defaultContent || '');
    setEditLimit((sec.config?.limit as number) || preset.defaultLimit || 4);
    setEditIncludeResearch(sec.config?.includeResearch !== false);

    // Hero 3 CTAs
    setEditHeroCta1(
      (sec.config?.heroCta1 as HeroCtaButtonConfig) || {
        label: 'View Works',
        url: '/works',
        target: '_self',
      },
    );
    setEditHeroCta2(
      (sec.config?.heroCta2 as HeroCtaButtonConfig) || {
        label: 'Download Resume',
        url: '/resume',
        target: '_blank',
      },
    );
    setEditHeroCta3(
      (sec.config?.heroCta3 as HeroCtaButtonConfig) || {
        label: 'Get in Touch',
        url: '/contact',
        target: '_self',
      },
    );

    setEditCtaLabel((sec.config?.ctaLabel as string) || preset.defaultCtaLabel || '');
    setEditCtaUrl((sec.config?.ctaUrl as string) || preset.defaultCtaUrl || '');
    setEditCtaTarget((sec.config?.ctaTarget as '_self' | '_blank') || '_self');
    setEditCalloutHeadline(
      (sec.config?.calloutHeadline as string) ||
        'Have an ambitious project or engineering challenge?',
    );
    setEditCalloutDescription(
      (sec.config?.calloutDescription as string) ||
        'Whether you need senior technical leadership, architectural guidance, or full-stack execution, my inbox is always open.',
    );
    setEditEnableCopyEmail(sec.config?.enableCopyEmail !== false);
    setEditIsEnabled(sec.isEnabled);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSec) return;

    setIsSaving(true);
    try {
      const config: HomepageSectionConfig = {
        ...editingSec.config,
        subtitle: editSubtitle || undefined,
        labelTag: editLabelTag !== undefined ? editLabelTag : undefined,
        tagSeparator: editTagSeparator !== undefined ? editTagSeparator : undefined,
        showSectionNumber: editShowSectionNumber,
        content: editContent || undefined,
        limit: Number(editLimit) || undefined,
        includeResearch: editIncludeResearch,
        heroCta1: editingSec.sectionKey === 'hero' ? editHeroCta1 : undefined,
        heroCta2: editingSec.sectionKey === 'hero' ? editHeroCta2 : undefined,
        heroCta3: editingSec.sectionKey === 'hero' ? editHeroCta3 : undefined,
        ctaLabel: editCtaLabel || undefined,
        ctaUrl: editCtaUrl || undefined,
        ctaTarget: editCtaTarget,
        calloutHeadline: editCalloutHeadline || undefined,
        calloutDescription: editCalloutDescription || undefined,
        enableCopyEmail: editEnableCopyEmail,
      };

      const payload: UpdateHomepageSectionRequest = {
        title: editTitle || null,
        isEnabled: editingSec.sectionKey === 'hero' ? true : editIsEnabled,
        config,
      };

      await apiClient.put(`/homepage-sections/${editingSec.id}`, payload);
      toast.success('Section updated successfully');
      setIsEditModalOpen(false);
      invalidateClientCache();
      fetchSections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update section';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (sec: HomepageSectionDto) => {
    if (sec.sectionKey === 'hero') {
      toast.info('The Hero section is fixed as the homepage masthead.');
      return;
    }
    try {
      await apiClient.put(`/homepage-sections/${sec.id}`, {
        isEnabled: !sec.isEnabled,
      });
      toast.success(`Section '${sec.title || sec.sectionKey}' ${!sec.isEnabled ? 'enabled' : 'hidden'}`);
      invalidateClientCache();
      fetchSections();
    } catch {
      toast.error('Failed to toggle visibility');
    }
  };

  const handleReorder = async (newSections: HomepageSectionDto[]) => {
    setSections(newSections);
    try {
      await apiClient.put('/homepage-sections/reorder', {
        items: newSections.map((s, idx) => ({ id: s.id, sortOrder: idx })),
      });
      toast.success('Homepage section layout saved');
      invalidateClientCache();
    } catch {
      toast.error('Failed to save layout order');
      fetchSections();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.sectionKey === 'hero') {
      toast.error('The primary Hero section cannot be deleted.');
      setDeleteTarget(null);
      return;
    }
    setIsDeleting(true);
    try {
      await apiClient.delete(`/homepage-sections/${deleteTarget.id}`);
      toast.success(`Section '${deleteTarget.title || deleteTarget.sectionKey}' deleted.`);
      setDeleteTarget(null);
      invalidateClientCache();
      fetchSections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete section';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentEditPreset = editingSec ? getSectionPreset(editingSec.sectionKey) : null;
  const currentAddPreset = getSectionPreset(addPresetKey);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage Section Builder & Layout"
        description="Reorder landing page blocks, customize titles, tags, limits, and action links on the live portfolio."
        action={
          <Button variant="primary" size="sm" onClick={openAddModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Homepage Section</span>
          </Button>
        }
      />

      <ReorderableList
        items={sections}
        onReorder={handleReorder}
        isLoading={isLoading}
        isItemPinned={(item) => item.sectionKey === 'hero'}
        renderItem={(item, index) => {
          const isHero = item.sectionKey === 'hero';
          const preset = getSectionPreset(item.sectionKey);
          const showNum = item.config?.showSectionNumber !== false;
          const tag =
            item.config?.labelTag !== undefined
              ? (item.config.labelTag as string)
              : preset.defaultTag;
          const sep =
            item.config?.tagSeparator !== undefined ? (item.config.tagSeparator as string) : '//';
          const numPart = showNum ? (isHero ? '00' : String(index).padStart(2, '0')) : '';
          const displayTag = [numPart, sep.trim(), tag.trim()].filter(Boolean).join(' ');

          return (
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="min-w-0 flex items-center gap-3">
                <div className="p-1.5 rounded-sm bg-surface-muted border border-border text-accent shrink-0">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    {displayTag && (
                      <span className="text-[10px] text-accent font-mono font-bold">
                        {displayTag}
                      </span>
                    )}
                    <span className="font-bold text-foreground text-xs truncate">
                      {item.title || preset.title}
                    </span>
                    <span className="text-[10px] text-muted font-mono bg-surface-muted px-1.5 py-0.2 rounded border border-border">
                      #{item.sectionKey}
                    </span>
                    {isHero && (
                      <span className="text-[10px] text-accent font-mono flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Fixed Masthead
                      </span>
                    )}
                    {!isHero && !item.isEnabled && (
                      <span className="text-[10px] text-destructive font-mono flex items-center gap-0.5">
                        <EyeOff className="w-3 h-3" /> Disabled
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted truncate">
                    {String(item.config?.subtitle || preset.subtitle)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {isHero ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted/70 cursor-default opacity-70 pointer-events-none select-none"
                    title="Hero is permanently visible as the homepage masthead"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1 text-accent" /> Fixed
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted hover:text-foreground"
                    onClick={() => handleToggleVisibility(item)}
                  >
                    {item.isEnabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5 mr-1 text-success" /> Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 mr-1 text-destructive" /> Hidden
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted hover:text-foreground"
                  onClick={() => openEditModal(item)}
                  title="Configure Section Presentation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>

                {isHero ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted/20 cursor-not-allowed pointer-events-none"
                    disabled
                    title="The primary Hero section cannot be deleted"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete Section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        }}
      />

      {/* Add Section Modal */}
      <Dialog isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSection} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Add New Homepage Section</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Section Preset Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SECTION_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handlePresetSelect(preset.key)}
                      className={`p-2 rounded border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        addPresetKey === preset.key
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border bg-background text-muted hover:text-foreground'
                      }`}
                    >
                      <span className="text-xs font-bold truncate">{preset.title}</span>
                      <span className="text-[10px] font-mono opacity-70">#{preset.key}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Info Banner */}
              <div className="p-3 bg-surface-muted border border-border/80 rounded-sm flex items-start gap-2.5 text-xs text-muted">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-foreground">
                    Content Source:{' '}
                    {currentAddPreset.category === 'dynamic_entity'
                      ? 'Dynamic Database Entity'
                      : currentAddPreset.category === 'callout_system'
                        ? 'Site Settings & System CTA'
                        : currentAddPreset.category === 'hero_header'
                          ? 'Site Settings / Slogan'
                          : 'Rich Markdown'}
                  </span>
                  <span>{currentAddPreset.sourceDescription}</span>
                  {currentAddPreset.entityLink && (
                    <Link
                      href={currentAddPreset.entityLink}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-accent hover:underline font-medium mt-0.5"
                    >
                      <span>{currentAddPreset.entityLinkLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Section Key & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Section Key</label>
                  <Input
                    type="text"
                    value={addKey}
                    onChange={(e) => setAddKey(e.target.value)}
                    required
                    placeholder="e.g. hero, featured_projects, or custom_notes"
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Display Title</label>
                  <Input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="e.g. Hero Introduction or Featured Works"
                    className="bg-background text-xs"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Subtitle / Tagline</label>
                <Input
                  type="text"
                  value={addSubtitle}
                  onChange={(e) => setAddSubtitle(e.target.value)}
                  placeholder="e.g. Main Landing Header or Featured Projects & Architecture Deep-Dives"
                  className="bg-background text-xs"
                />
              </div>

              {/* Section Tag Name & Separator Symbol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Section Tag Name (e.g. HERO, WORKS, INTRO, SKILLS)
                  </label>
                  <Input
                    type="text"
                    value={addLabelTag}
                    onChange={(e) => setAddLabelTag(e.target.value)}
                    placeholder="e.g. WORKS"
                    className="bg-background text-xs uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Separator Symbol (e.g. //, →, —, •, ⚡)
                  </label>
                  <Input
                    type="text"
                    value={addTagSeparator}
                    onChange={(e) => setAddTagSeparator(e.target.value)}
                    placeholder="//"
                    className="bg-background text-xs font-mono text-center"
                  />
                </div>
              </div>

              {/* Number Toggle & Live Preview */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addShowSectionNumber}
                    onChange={(e) => setAddShowSectionNumber(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Show Number Prefix (01, 02...)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-muted">Preview:</span>
                  <span className="text-[11px] font-mono font-bold text-accent bg-surface-muted px-2 py-0.5 rounded border border-border">
                    {(() => {
                      const num = addShowSectionNumber ? '01' : '';
                      const sep = addTagSeparator !== undefined ? addTagSeparator.trim() : '';
                      const tag = addLabelTag !== undefined ? addLabelTag.trim() : currentAddPreset.defaultTag;
                      const joined = [num, sep, tag].filter(Boolean).join(' ');
                      return joined || '<No Tag>';
                    })()}
                  </span>
                </div>
              </div>

              {/* Display Limit for Dynamic Entity Sections */}
              {currentAddPreset.category === 'dynamic_entity' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Max Items / Categories to Display
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={addLimit}
                      onChange={(e) => setAddLimit(Number(e.target.value))}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Latest Articles: Research Toggle */}
              {currentAddPreset.key === 'latest_articles' && (
                <div className="p-3 bg-background border border-border rounded-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addIncludeResearch}
                      onChange={(e) => setAddIncludeResearch(e.target.checked)}
                      className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Include Research Papers in Publication Stream
                    </span>
                  </label>
                </div>
              )}

              {/* Hero Section: 3 Configurable Action Buttons */}
              {currentAddPreset.category === 'hero_header' && (
                <div className="p-3 bg-surface-muted/50 border border-border rounded-sm space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-accent" /> Hero 3 Action Buttons
                  </span>
                  {/* Button 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <Input
                      type="text"
                      placeholder="Button 1 Label (e.g. View Works)"
                      value={addHeroCta1.label}
                      onChange={(e) => setAddHeroCta1({ ...addHeroCta1, label: e.target.value })}
                      className="bg-background text-xs"
                    />
                    <Input
                      type="text"
                      placeholder="Button 1 URL (/works)"
                      value={addHeroCta1.url}
                      onChange={(e) => setAddHeroCta1({ ...addHeroCta1, url: e.target.value })}
                      className="bg-background text-xs"
                    />
                    <select
                      value={addHeroCta1.target || '_self'}
                      onChange={(e) =>
                        setAddHeroCta1({ ...addHeroCta1, target: e.target.value as '_self' | '_blank' })
                      }
                      className="h-8 px-2 rounded-xs border border-border bg-background text-xs text-foreground"
                    >
                      <option value="_self">Same Tab (_self)</option>
                      <option value="_blank">New Tab (_blank)</option>
                    </select>
                  </div>
                  {/* Button 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      type="text"
                      placeholder="Button 2 Label (e.g. Resume)"
                      value={addHeroCta2.label}
                      onChange={(e) => setAddHeroCta2({ ...addHeroCta2, label: e.target.value })}
                      className="bg-background text-xs"
                    />
                    <Input
                      type="text"
                      placeholder="Button 2 URL (/resume)"
                      value={addHeroCta2.url}
                      onChange={(e) => setAddHeroCta2({ ...addHeroCta2, url: e.target.value })}
                      className="bg-background text-xs"
                    />
                    <select
                      value={addHeroCta2.target || '_blank'}
                      onChange={(e) =>
                        setAddHeroCta2({ ...addHeroCta2, target: e.target.value as '_self' | '_blank' })
                      }
                      className="h-8 px-2 rounded-xs border border-border bg-background text-xs text-foreground"
                    >
                      <option value="_self">Same Tab (_self)</option>
                      <option value="_blank">New Tab (_blank)</option>
                    </select>
                  </div>
                  {/* Button 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      type="text"
                      placeholder="Button 3 Label (e.g. Get in Touch)"
                      value={addHeroCta3.label}
                      onChange={(e) => setAddHeroCta3({ ...addHeroCta3, label: e.target.value })}
                      className="bg-background text-xs"
                    />
                    <Input
                      type="text"
                      placeholder="Button 3 URL (/contact)"
                      value={addHeroCta3.url}
                      onChange={(e) => setAddHeroCta3({ ...addHeroCta3, url: e.target.value })}
                      className="bg-background text-xs"
                    />
                    <select
                      value={addHeroCta3.target || '_self'}
                      onChange={(e) =>
                        setAddHeroCta3({ ...addHeroCta3, target: e.target.value as '_self' | '_blank' })
                      }
                      className="h-8 px-2 rounded-xs border border-border bg-background text-xs text-foreground"
                    >
                      <option value="_self">Same Tab (_self)</option>
                      <option value="_blank">New Tab (_blank)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Callout Section Options */}
              {currentAddPreset.category === 'callout_system' && (
                <div className="space-y-3 p-3 bg-background border border-border rounded-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Callout Card Headline</label>
                    <Input
                      type="text"
                      value={addCalloutHeadline}
                      onChange={(e) => setAddCalloutHeadline(e.target.value)}
                      placeholder="e.g. Have an ambitious project or engineering challenge?"
                      className="bg-surface text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Callout Description</label>
                    <Input
                      type="text"
                      value={addCalloutDescription}
                      onChange={(e) => setAddCalloutDescription(e.target.value)}
                      placeholder="e.g. Whether you need senior technical leadership..."
                      className="bg-surface text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={addEnableCopyEmail}
                      onChange={(e) => setAddEnableCopyEmail(e.target.checked)}
                      className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Show Copy Email Action Button
                    </span>
                  </label>
                </div>
              )}

              {/* Rich Markdown Content Editor (for narrative sections or hero slogan) */}
              {(currentAddPreset.category === 'content_narrative' ||
                currentAddPreset.category === 'hero_header') && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    {currentAddPreset.category === 'hero_header'
                      ? 'Hero Slogan / Statement'
                      : 'Section Narrative Content (Markdown)'}
                  </label>
                  <MarkdownEditor
                    value={addContent}
                    onChange={setAddContent}
                    placeholder="Enter narrative text or markdown content..."
                    minHeight="140px"
                  />
                </div>
              )}

              {/* Structured CTA Configuration (for non-hero sections) */}
              {currentAddPreset.category !== 'hero_header' && (
                <div className="p-3 bg-surface-muted/50 border border-border rounded-sm space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-accent" /> Section Action CTA Link
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted">CTA Button Label</label>
                      <Input
                        type="text"
                        value={addCtaLabel}
                        onChange={(e) => setAddCtaLabel(e.target.value)}
                        placeholder="e.g. All Projects"
                        className="bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted">CTA URL Path</label>
                      <Input
                        type="text"
                        value={addCtaUrl}
                        onChange={(e) => setAddCtaUrl(e.target.value)}
                        placeholder="e.g. /works"
                        className="bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted">Open In</label>
                      <select
                        value={addCtaTarget}
                        onChange={(e) => setAddCtaTarget(e.target.value as '_self' | '_blank')}
                        className="w-full h-8 px-2 rounded-xs border border-border bg-background text-foreground text-xs"
                      >
                        <option value="_self">Same Tab (_self)</option>
                        <option value="_blank">New Tab (_blank)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addIsEnabled}
                    onChange={(e) => setAddIsEnabled(e.target.checked)}
                    className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Enable Section on Homepage
                  </span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isAdding}
                disabled={isAdding}
              >
                Create Section
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Section Modal */}
      <Dialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <span>Configure Section: #{editingSec?.sectionKey}</span>
              </DialogTitle>
            </DialogHeader>

            {currentEditPreset && (
              <div className="space-y-4">
                {/* Source Info Banner */}
                <div className="p-3 bg-surface-muted border border-border/80 rounded-sm flex items-start gap-2.5 text-xs text-muted">
                  <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-foreground">
                      Content Source:{' '}
                      {currentEditPreset.category === 'dynamic_entity'
                        ? 'Dynamic Database Entity'
                        : currentEditPreset.category === 'callout_system'
                          ? 'Site Settings & System CTA'
                          : currentEditPreset.category === 'hero_header'
                            ? 'Site Settings / Slogan'
                            : 'Rich Markdown'}
                    </span>
                    <span>{currentEditPreset.sourceDescription}</span>
                    {currentEditPreset.entityLink && (
                      <Link
                        href={currentEditPreset.entityLink}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-accent hover:underline font-medium mt-0.5"
                      >
                        <span>{currentEditPreset.entityLinkLabel}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Section Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Section Title</label>
                    <Input
                      type="text"
                      placeholder="e.g. Hero Introduction or Featured Works"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Subtitle / Tagline</label>
                    <Input
                      type="text"
                      placeholder="e.g. Main Landing Header or Featured Projects & Case Studies"
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>

                {/* Tag Name & Separator Symbol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Section Tag Name (e.g. HERO, WORKS, INTRO, SKILLS)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. WORKS"
                      value={editLabelTag}
                      onChange={(e) => setEditLabelTag(e.target.value)}
                      className="bg-background text-xs uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Separator Symbol (e.g. //, →, —, •, ⚡)
                    </label>
                    <Input
                      type="text"
                      placeholder="//"
                      value={editTagSeparator}
                      onChange={(e) => setEditTagSeparator(e.target.value)}
                      className="bg-background text-xs font-mono text-center"
                    />
                  </div>
                </div>

                {/* Number Toggle & Live Preview */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editShowSectionNumber}
                      onChange={(e) => setEditShowSectionNumber(e.target.checked)}
                      className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Show Number Prefix (01, 02...)
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted">Preview:</span>
                    <span className="text-[11px] font-mono font-bold text-accent bg-surface-muted px-2 py-0.5 rounded border border-border">
                      {(() => {
                        const num = editShowSectionNumber ? '01' : '';
                        const sep = editTagSeparator !== undefined ? editTagSeparator.trim() : '';
                        const tag =
                          editLabelTag !== undefined
                            ? editLabelTag.trim()
                            : currentEditPreset?.defaultTag || '';
                        const joined = [num, sep, tag].filter(Boolean).join(' ');
                        return joined || '<No Tag>';
                      })()}
                    </span>
                  </div>
                </div>

                {/* Display Limit for Dynamic Entity Sections */}
                {currentEditPreset.category === 'dynamic_entity' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">
                        Max Items / Categories to Display
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={editLimit}
                        onChange={(e) => setEditLimit(Number(e.target.value))}
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Hero Section: Hero Slogan / Statement */}
                {currentEditPreset.category === 'hero_header' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Hero Slogan / Headline Statement</span>
                      <span className="text-[10px] font-mono text-muted font-normal">
                        Displayed at top-left of landing page
                      </span>
                    </label>
                    <MarkdownEditor
                      value={editContent}
                      onChange={setEditContent}
                      placeholder="e.g. Precision in detail, vision in design, building things one block at a time."
                      minHeight="140px"
                    />
                  </div>
                )}

                {/* Hero Section: 3 Configurable Action Buttons */}
                {currentEditPreset.category === 'hero_header' && (
                  <div className="p-3 bg-surface-muted/50 border border-border rounded-sm space-y-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent" /> Hero 3 Action Buttons
                    </span>
                    {/* Button 1 */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-muted">Button 1 (Primary Action)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          type="text"
                          placeholder="Label (e.g. View Works)"
                          value={editHeroCta1.label}
                          onChange={(e) => setEditHeroCta1({ ...editHeroCta1, label: e.target.value })}
                          className="bg-background text-xs"
                        />
                        <Input
                          type="text"
                          placeholder="URL (/works)"
                          value={editHeroCta1.url}
                          onChange={(e) => setEditHeroCta1({ ...editHeroCta1, url: e.target.value })}
                          className="bg-background text-xs"
                        />
                        <select
                          value={editHeroCta1.target || '_self'}
                          onChange={(e) =>
                            setEditHeroCta1({ ...editHeroCta1, target: e.target.value as '_self' | '_blank' })
                          }
                          className="h-8 px-2 rounded-xs border border-border bg-background text-xs text-foreground"
                        >
                          <option value="_self">Same Tab (_self)</option>
                          <option value="_blank">New Tab (_blank)</option>
                        </select>
                      </div>
                    </div>
                    {/* Button 2 */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-muted">Button 2 (Resume Action)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          type="text"
                          placeholder="Label (e.g. Resume)"
                          value={editHeroCta2.label}
                          onChange={(e) => setEditHeroCta2({ ...editHeroCta2, label: e.target.value })}
                          className="bg-background text-xs"
                        />
                        <Input
                          type="text"
                          placeholder="URL (/resume)"
                          value={editHeroCta2.url}
                          onChange={(e) => setEditHeroCta2({ ...editHeroCta2, url: e.target.value })}
                          className="bg-background text-xs"
                        />
                        <select
                          value={editHeroCta2.target || '_blank'}
                          onChange={(e) =>
                            setEditHeroCta2({ ...editHeroCta2, target: e.target.value as '_self' | '_blank' })
                          }
                          className="h-8 px-2 rounded-xs border border-border bg-background text-xs text-foreground"
                        >
                          <option value="_self">Same Tab (_self)</option>
                          <option value="_blank">New Tab (_blank)</option>
                        </select>
                      </div>
                    </div>
                    {/* Button 3 */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-muted">Button 3 (Contact Action)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          type="text"
                          placeholder="Label (e.g. Get in Touch)"
                          value={editHeroCta3.label}
                          onChange={(e) => setEditHeroCta3({ ...editHeroCta3, label: e.target.value })}
                          className="bg-background text-xs"
                        />
                        <Input
                          type="text"
                          placeholder="URL (/contact)"
                          value={editHeroCta3.url}
                          onChange={(e) => setEditHeroCta3({ ...editHeroCta3, url: e.target.value })}
                          className="bg-background text-xs"
                        />
                        <select
                          value={editHeroCta3.target || '_self'}
                          onChange={(e) =>
                            setEditHeroCta3({ ...editHeroCta3, target: e.target.value as '_self' | '_blank' })
                          }
                          className="h-8 px-2 rounded-xs border border-border bg-background text-xs text-foreground"
                        >
                          <option value="_self">Same Tab (_self)</option>
                          <option value="_blank">New Tab (_blank)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Research Toggle for Articles */}
                {currentEditPreset.key === 'latest_articles' && (
                  <div className="p-3 bg-background border border-border rounded-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editIncludeResearch}
                        onChange={(e) => setEditIncludeResearch(e.target.checked)}
                        className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-foreground">
                        Include Research Papers in Publication Stream
                      </span>
                    </label>
                  </div>
                )}

                {/* Callout Section Settings */}
                {currentEditPreset.category === 'callout_system' && (
                  <div className="space-y-3 p-3 bg-background border border-border rounded-sm">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Callout Card Headline</label>
                      <Input
                        type="text"
                        value={editCalloutHeadline}
                        onChange={(e) => setEditCalloutHeadline(e.target.value)}
                        placeholder="e.g. Have an ambitious project or engineering challenge?"
                        className="bg-surface text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Callout Description</label>
                      <Input
                        type="text"
                        value={editCalloutDescription}
                        onChange={(e) => setEditCalloutDescription(e.target.value)}
                        placeholder="e.g. Whether you need senior technical leadership..."
                        className="bg-surface text-xs"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={editEnableCopyEmail}
                        onChange={(e) => setEditEnableCopyEmail(e.target.checked)}
                        className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-foreground">
                        Show Copy Email Action Button
                      </span>
                    </label>
                  </div>
                )}

                {/* Markdown Editor (Only for content/narrative sections like About / Custom Notes) */}
                {currentEditPreset.category === 'content_narrative' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Section Narrative Content (Markdown)
                    </label>
                    <MarkdownEditor
                      value={editContent}
                      onChange={setEditContent}
                      placeholder="Enter narrative text or markdown content..."
                      minHeight="160px"
                    />
                  </div>
                )}

                {/* Structured CTA Settings (for non-hero sections) */}
                {currentEditPreset.category !== 'hero_header' && (
                  <div className="p-3 bg-surface-muted/50 border border-border rounded-sm space-y-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-accent" /> Section Action CTA Link
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted">CTA Button Label</label>
                        <Input
                          type="text"
                          value={editCtaLabel}
                          onChange={(e) => setEditCtaLabel(e.target.value)}
                          placeholder="e.g. All Projects"
                          className="bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted">CTA URL Path</label>
                        <Input
                          type="text"
                          value={editCtaUrl}
                          onChange={(e) => setEditCtaUrl(e.target.value)}
                          placeholder="e.g. /works"
                          className="bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted">Open In</label>
                        <select
                          value={editCtaTarget}
                          onChange={(e) => setEditCtaTarget(e.target.value as '_self' | '_blank')}
                          className="w-full h-8 px-2 rounded-xs border border-border bg-background text-foreground text-xs"
                        >
                          <option value="_self">Same Tab (_self)</option>
                          <option value="_blank">New Tab (_blank)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editIsEnabled}
                      onChange={(e) => setEditIsEnabled(e.target.checked)}
                      className="rounded border-border bg-background text-accent focus:ring-accent accent-accent w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Enable Section on Homepage
                    </span>
                  </label>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                disabled={isSaving}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Homepage Section"
        description={`Are you sure you want to delete section '${deleteTarget?.title || deleteTarget?.sectionKey}'?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
