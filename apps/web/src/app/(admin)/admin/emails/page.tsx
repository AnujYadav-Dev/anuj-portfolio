'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient, ApiClientError } from '@/lib/api';
import type {
  CreateEmailTemplateRequest,
  EmailTemplateDto,
  SendTestEmailRequest,
  UpdateEmailTemplateRequest,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import {
  Save,
  Variable,
  Eye,
  Code,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Mail,
  ShieldCheck,
  Globe,
  MessageSquare,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

interface CategoryTab {
  id: string;
  name: string;
  icon: React.ElementType;
  purposes: string[];
}

const CATEGORIES: CategoryTab[] = [
  {
    id: 'all',
    name: 'All Workflows',
    icon: Layers,
    purposes: [],
  },
  {
    id: 'contact',
    name: 'Contact & Inquiries',
    icon: Mail,
    purposes: ['contact_auto_reply', 'contact_admin_notification'],
  },
  {
    id: 'newsletter',
    name: 'Newsletter & Broadcast',
    icon: Radio,
    purposes: [
      'newsletter_confirmation',
      'newsletter_welcome',
      'newsletter_admin_notification',
      'newsletter_broadcast',
    ],
  },
  {
    id: 'guestbook',
    name: 'Guestbook',
    icon: MessageSquare,
    purposes: ['guestbook_admin_notification', 'guestbook_approved'],
  },
  {
    id: 'telemetry_security',
    name: 'Telemetry & Security',
    icon: ShieldCheck,
    purposes: [
      'resume_download_admin',
      'content_published_admin',
      'visit_admin_notification',
      'admin_login_security',
      'security_profile_updated',
    ],
  },
];

const PURPOSE_META: Record<
  string,
  { label: string; description: string; defaultVariables: string[] }
> = {
  contact_auto_reply: {
    label: 'Contact Auto-Reply (Visitor)',
    description: 'Sent automatically to visitors acknowledging their contact message submission.',
    defaultVariables: ['name', 'email', 'subject', 'message', 'siteUrl'],
  },
  contact_admin_notification: {
    label: 'Contact Inquiry Alert (Admin)',
    description: 'Instant notification dispatched to administrator upon a new contact form inquiry.',
    defaultVariables: ['name', 'email', 'subject', 'message', 'ipAddress', 'submittedAt', 'siteUrl'],
  },
  newsletter_confirmation: {
    label: 'Newsletter Double Opt-In Verification',
    description: 'Sent to new newsletter subscribers with their unique verification link.',
    defaultVariables: ['name', 'email', 'confirmationUrl', 'siteUrl'],
  },
  newsletter_welcome: {
    label: 'Newsletter Welcome Email',
    description: 'Sent to subscribers immediately upon confirming their subscription.',
    defaultVariables: ['name', 'email', 'unsubscribeUrl', 'siteUrl'],
  },
  newsletter_admin_notification: {
    label: 'New Subscriber Alert (Admin)',
    description: 'Alert sent to administrator whenever a new reader joins the subscriber list.',
    defaultVariables: ['email', 'name', 'isConfirmed', 'subscribedAt', 'siteUrl'],
  },
  newsletter_broadcast: {
    label: 'Newsletter Campaign / Broadcast',
    description: 'Default template for broadcasting new blog posts and articles to all subscribers.',
    defaultVariables: ['name', 'email', 'subject', 'previewText', 'contentHtml', 'unsubscribeUrl', 'siteUrl'],
  },
  resume_download_admin: {
    label: 'Recruiter Resume Download Alert (Admin)',
    description: 'Dispatched when a visitor or recruiter downloads your resume PDF.',
    defaultVariables: ['resumeTitle', 'ipAddress', 'country', 'city', 'referrerSource', 'downloadedAt', 'siteUrl'],
  },
  content_published_admin: {
    label: 'Scheduled Content Published (Admin)',
    description: 'Summary report sent when scheduled blog posts or projects go live automatically.',
    defaultVariables: ['itemCount', 'publishedItemsSummary', 'publishedAt', 'siteUrl'],
  },
  guestbook_admin_notification: {
    label: 'New Guestbook Entry (Admin)',
    description: 'Dispatched when a new guestbook note is submitted and awaiting review.',
    defaultVariables: ['authorName', 'authorEmail', 'message', 'adminUrl', 'submittedAt', 'siteUrl'],
  },
  guestbook_approved: {
    label: 'Guestbook Entry Approved (Visitor)',
    description: 'Sent to guestbook author when their message has been approved by the admin.',
    defaultVariables: ['authorName', 'message', 'guestbookUrl', 'siteUrl'],
  },
  visit_admin_notification: {
    label: 'Visitor Telemetry Alert (Admin)',
    description: 'Real-time alert on unique visitor sessions (subject to cooldown rate-limiting).',
    defaultVariables: ['ipAddress', 'country', 'city', 'deviceType', 'browser', 'os', 'referrerSource', 'visitedAt', 'siteUrl'],
  },
  admin_login_security: {
    label: 'New Device Login Security Alert (Admin)',
    description: 'Security notification dispatched upon administrator login.',
    defaultVariables: ['adminName', 'adminEmail', 'ipAddress', 'deviceType', 'browser', 'os', 'location', 'loginTime', 'siteUrl'],
  },
  security_profile_updated: {
    label: 'Security Profile Audit Notice (Admin)',
    description: 'Audit notice sent when admin credentials or profile information are updated.',
    defaultVariables: ['adminName', 'adminEmail', 'actionType', 'ipAddress', 'updatedAt', 'siteUrl'],
  },
};

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplateDto[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('contact_auto_reply');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'html' | 'preview' | 'text'>('html');

  // Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // New Variation Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newVariationName, setNewVariationName] = useState('');
  const [newVariationDesc, setNewVariationDesc] = useState('');
  const [isCreatingVariation, setIsCreatingVariation] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: EmailTemplateDto[] }>('/email-templates');
      const allTemplates = res.data || [];
      setTemplates(allTemplates);

      if (allTemplates.length > 0) {
        // Find template to select
        const current = allTemplates.find((t) => t.id === selectedTemplateId) ||
          allTemplates.find((t) => t.purpose === selectedPurpose && t.isActive) ||
          allTemplates[0]!;

        setSelectedPurpose(current.purpose);
        setSelectedTemplateId(current.id);
        setName(current.name);
        setDescription(current.description || '');
        setSubject(current.subject);
        setBodyHtml(current.bodyHtml);
        setBodyText(current.bodyText || '');
        setIsEnabled(current.isEnabled);
      }
    } catch {
      toast.error('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTemplateId, selectedPurpose]);

  useEffect(() => {
    fetchTemplates();
  }, []); // Run once on mount

  const filteredPurposes = useMemo(() => {
    const allPurposes = Object.keys(PURPOSE_META);
    if (activeCategory === 'all') return allPurposes;
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    return cat ? cat.purposes : allPurposes;
  }, [activeCategory]);

  const purposeVariations = useMemo(() => {
    return templates.filter((t) => t.purpose === selectedPurpose);
  }, [templates, selectedPurpose]);

  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || purposeVariations[0] || null;
  }, [templates, selectedTemplateId, purposeVariations]);

  const handleSelectPurpose = (purpose: string) => {
    setSelectedPurpose(purpose);
    const variations = templates.filter((t) => t.purpose === purpose);
    const activeVar = variations.find((v) => v.isActive) || variations[0];
    if (activeVar) {
      setSelectedTemplateId(activeVar.id);
      setName(activeVar.name);
      setDescription(activeVar.description || '');
      setSubject(activeVar.subject);
      setBodyHtml(activeVar.bodyHtml);
      setBodyText(activeVar.bodyText || '');
      setIsEnabled(activeVar.isEnabled);
    }
  };

  const handleSelectVariation = (t: EmailTemplateDto) => {
    setSelectedTemplateId(t.id);
    setName(t.name);
    setDescription(t.description || '');
    setSubject(t.subject);
    setBodyHtml(t.bodyHtml);
    setBodyText(t.bodyText || '');
    setIsEnabled(t.isEnabled);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    setIsSaving(true);
    try {
      const payload: UpdateEmailTemplateRequest = {
        name,
        description: description || null,
        subject,
        bodyHtml,
        bodyText: bodyText || null,
        isEnabled,
      };

      await apiClient.put(`/email-templates/${currentTemplate.id}`, payload);
      toast.success('Email template variation updated successfully!');
      await fetchTemplates();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to save template';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = async () => {
    if (!currentTemplate) return;
    setIsActivating(true);
    try {
      await apiClient.post(`/email-templates/${currentTemplate.id}/activate`);
      toast.success(`"${currentTemplate.name}" is now the active template for this workflow!`);
      await fetchTemplates();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to activate template';
      toast.error(msg);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTemplate) return;
    if (purposeVariations.length <= 1) {
      toast.error('Cannot delete the only variation for this purpose.');
      return;
    }

    if (!confirm(`Are you sure you want to delete variation "${currentTemplate.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/email-templates/${currentTemplate.id}`);
      toast.success('Template variation deleted.');
      setSelectedTemplateId('');
      await fetchTemplates();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to delete template';
      toast.error(msg);
    }
  };

  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariationName.trim() || !currentTemplate) return;

    setIsCreatingVariation(true);
    try {
      const payload: CreateEmailTemplateRequest = {
        purpose: selectedPurpose,
        name: newVariationName.trim(),
        description: newVariationDesc.trim() || null,
        subject: currentTemplate.subject,
        bodyHtml: currentTemplate.bodyHtml,
        bodyText: currentTemplate.bodyText || null,
        variables: currentTemplate.variables,
        isActive: false,
        isEnabled: true,
      };

      const res = await apiClient.post<{ data: EmailTemplateDto }>('/email-templates', payload);
      toast.success(`Variation "${newVariationName}" created!`);
      setShowNewModal(false);
      setNewVariationName('');
      setNewVariationDesc('');
      setSelectedTemplateId(res.data.id);
      await fetchTemplates();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to create variation';
      toast.error(msg);
    } finally {
      setIsCreatingVariation(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) return;

    setIsSendingTest(true);
    try {
      const payload: SendTestEmailRequest = {
        to: testRecipient.trim(),
        templateId: currentTemplate?.id,
        purpose: selectedPurpose,
      };

      const res = await apiClient.post<{ message: string }>('/email-templates/test', payload);
      toast.success(res.message || `Test email dispatched to ${testRecipient}`);
      setShowTestModal(false);
      setTestRecipient('');
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to send test email';
      toast.error(msg);
    } finally {
      setIsSendingTest(false);
    }
  };

  const insertVariable = (varName: string) => {
    const token = `{{${varName}}}`;
    setBodyHtml((prev) => prev + token);
    toast.info(`Inserted ${token} into HTML editor`);
  };

  if (isLoading && templates.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted">Loading Email Engine & Workflows...</span>
      </div>
    );
  }

  const meta = PURPOSE_META[selectedPurpose] || {
    label: selectedPurpose,
    description: 'Dynamic automated email template',
    defaultVariables: ['siteUrl'],
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <AdminPageHeader
          title="Transactional Email Engine"
          description="Multi-template database-driven email engine with 1-click active variation switching, live HTML rendering, and test sending."
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTestModal(true)}
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Email</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowNewModal(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Variation</span>
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2.5 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                const nextPurposes =
                  cat.id === 'all' ? Object.keys(PURPOSE_META) : cat.purposes;
                if (!nextPurposes.includes(selectedPurpose) && nextPurposes.length > 0) {
                  handleSelectPurpose(nextPurposes[0]!);
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                isSelected
                  ? 'bg-accent text-black font-semibold shadow-sm'
                  : 'bg-surface border border-border text-muted hover:text-foreground',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Purpose & Variation Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs font-mono uppercase text-muted tracking-wider">
                Workflow Purpose
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {filteredPurposes.map((pKey) => {
                const isSelected = selectedPurpose === pKey;
                const pMeta = PURPOSE_META[pKey];
                const count = templates.filter((t) => t.purpose === pKey).length;

                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => handleSelectPurpose(pKey)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all flex items-center justify-between gap-2',
                      isSelected
                        ? 'bg-surface-muted border border-accent/40 shadow-sm'
                        : 'hover:bg-surface-muted/50 border border-transparent text-muted hover:text-foreground',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          'text-xs font-semibold truncate',
                          isSelected ? 'text-accent' : 'text-foreground',
                        )}
                      >
                        {pMeta?.label || pKey}
                      </div>
                      <div className="text-[11px] text-muted truncate mt-0.5 font-mono">
                        {pKey}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-mono text-muted">
                      {count} var
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Variations Cards for Selected Purpose */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-mono uppercase text-muted tracking-wider">
                  Template Variations
                </CardTitle>
                <CardDescription className="text-[11px] text-muted mt-0.5">
                  1 active variation per workflow
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewModal(true)}
                className="h-7 text-xs px-2 text-accent"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {purposeVariations.map((v) => {
                const isCurrent = currentTemplate?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVariation(v)}
                    className={cn(
                      'p-3 rounded-lg border transition-all cursor-pointer space-y-2',
                      isCurrent
                        ? 'bg-surface-muted/80 border-accent/60 ring-1 ring-accent/30'
                        : 'bg-background/50 border-border hover:border-zinc-700',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {v.name}
                      </span>
                      {v.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-muted truncate">
                      Subject: <span className="text-zinc-300">{v.subject}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted font-mono">
                      <span>Updated {new Date(v.updatedAt).toLocaleDateString()}</span>
                      {!v.isActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplateId(v.id);
                            apiClient
                              .post(`/email-templates/${v.id}/activate`)
                              .then(() => {
                                toast.success(`Activated "${v.name}"!`);
                                fetchTemplates();
                              })
                              .catch((err) => toast.error(err.message));
                          }}
                          className="text-emerald-400 hover:underline font-semibold"
                        >
                          Make Active
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Template Editor & Live Preview (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentTemplate ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Active Switcher & Header Controls */}
              <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{meta.label}</h3>
                    {currentTemplate.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-bold">
                        ACTIVE IN PRODUCTION
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
                        STANDBY VARIATION
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{meta.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!currentTemplate.isActive && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSetActive}
                      disabled={isActivating}
                      isLoading={isActivating}
                      className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Make Active
                    </Button>
                  )}
                  {purposeVariations.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-rose-400 hover:bg-rose-500/10 text-xs h-8 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Variables Chips Bar */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Variable className="w-3.5 h-3.5 text-accent" /> Available Template Variables:
                  </span>
                  <span className="text-[11px] text-muted">Click chip to insert into HTML</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(currentTemplate.variables && currentTemplate.variables.length > 0
                    ? currentTemplate.variables
                    : meta.defaultVariables
                  ).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2.5 py-1 rounded-md bg-surface-muted hover:bg-zinc-800 border border-border text-xs font-mono text-accent hover:text-accent/90 transition-colors flex items-center gap-1"
                    >
                      <span>{'{{'}</span>
                      <span>{v}</span>
                      <span>{'}}'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Card className="bg-surface border-border">
                <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Template Content & Code
                    </CardTitle>
                    <CardDescription className="text-xs text-muted">
                      Configure template parameters and responsive HTML markup.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('html')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1',
                        previewMode === 'html'
                          ? 'bg-surface text-foreground font-semibold shadow-sm'
                          : 'text-muted hover:text-foreground',
                      )}
                    >
                      <Code className="w-3.5 h-3.5" /> HTML Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('preview')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1',
                        previewMode === 'preview'
                          ? 'bg-surface text-foreground font-semibold shadow-sm'
                          : 'text-muted hover:text-foreground',
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" /> Live Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('text')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1',
                        previewMode === 'text'
                          ? 'bg-surface text-foreground font-semibold shadow-sm'
                          : 'text-muted hover:text-foreground',
                      )}
                    >
                      <FileText className="w-3.5 h-3.5" /> Plain Text
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Variation Name</label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Description / Note (Optional)
                      </label>
                      <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Modern dark theme receipt"
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Subject Line</label>
                    <Input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="bg-background text-xs font-mono"
                    />
                  </div>

                  {previewMode === 'html' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        HTML Body (Responsive Email Markup)
                      </label>
                      <Textarea
                        value={bodyHtml}
                        onChange={(e) => setBodyHtml(e.target.value)}
                        rows={16}
                        required
                        className="bg-background text-xs font-mono leading-relaxed"
                      />
                    </div>
                  )}

                  {previewMode === 'preview' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">
                          Rendered HTML Preview
                        </label>
                        <span className="text-[11px] text-muted">
                          Subject: <strong className="text-zinc-200">{subject}</strong>
                        </span>
                      </div>
                      <div className="border border-border rounded-xl p-8 bg-[#090b0e] text-zinc-100 min-h-[350px] shadow-inner overflow-x-auto flex justify-center">
                        <div
                          className="w-full max-w-[620px]"
                          dangerouslySetInnerHTML={{
                            __html: bodyHtml
                              .replace(/\{\{name\}\}/g, 'Alex Chen')
                              .replace(/\{\{email\}\}/g, 'alex.chen@example.com')
                              .replace(/\{\{subject\}\}/g, 'Distributed Systems Inquiry')
                              .replace(
                                /\{\{message\}\}/g,
                                'Hello Anuj, I came across your portfolio and wanted to discuss software architecture and potential consulting opportunities.',
                              )
                              .replace(/\{\{ipAddress\}\}/g, '198.51.100.42')
                              .replace(/\{\{country\}\}/g, 'United States')
                              .replace(/\{\{city\}\}/g, 'San Francisco')
                              .replace(/\{\{deviceType\}\}/g, 'Desktop')
                              .replace(/\{\{browser\}\}/g, 'Chrome 128')
                              .replace(/\{\{os\}\}/g, 'macOS')
                              .replace(/\{\{referrerSource\}\}/g, 'GitHub / Search')
                              .replace(/\{\{submittedAt\}\}/g, new Date().toLocaleString())
                              .replace(/\{\{visitedAt\}\}/g, new Date().toLocaleString())
                              .replace(/\{\{downloadedAt\}\}/g, new Date().toLocaleString())
                              .replace(/\{\{loginTime\}\}/g, new Date().toLocaleString())
                              .replace(/\{\{updatedAt\}\}/g, new Date().toLocaleString())
                              .replace(/\{\{authorName\}\}/g, 'Morgan Reed')
                              .replace(/\{\{resumeTitle\}\}/g, 'Full-Stack Software Engineer')
                              .replace(/\{\{itemCount\}\}/g, '3')
                              .replace(
                                /\{\{publishedItemsSummary\}\}/g,
                                '• Scalable Microservices Architecture (Blog Post)\n• Dynamic Portfolio & CMS (Project)',
                              )
                              .replace(/\{\{actionType\}\}/g, 'Password Changed')
                              .replace(/\{\{confirmationUrl\}\}/g, 'http://localhost:3000/newsletter/confirm?token=demo')
                              .replace(/\{\{unsubscribeUrl\}\}/g, 'http://localhost:3000/newsletter/unsubscribe?token=demo')
                              .replace(/\{\{guestbookUrl\}\}/g, 'http://localhost:3000/guestbook')
                              .replace(/\{\{adminUrl\}\}/g, 'http://localhost:3000/admin')
                              .replace(/\{\{siteUrl\}\}/g, 'http://localhost:3000'),
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {previewMode === 'text' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Plain Text Fallback Body
                      </label>
                      <Textarea
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        rows={14}
                        className="bg-background text-xs font-mono"
                        placeholder="Plain text version for non-HTML email clients..."
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                        className="rounded border-zinc-700 bg-background text-accent focus:ring-accent"
                      />
                      <span>Template Enabled for Automated Delivery</span>
                    </label>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSaving}
                      disabled={isSaving}
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          ) : (
            <Card className="bg-surface border-border p-12 text-center">
              <p className="text-sm text-muted">No template selected. Choose a workflow on the left.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Send Test Email
              </h3>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Send a test rendering of{' '}
              <strong className="text-zinc-200">{currentTemplate?.name || meta.label}</strong> to any
              inbox with sample data populated.
            </p>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Recipient Email</label>
                <Input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="bg-zinc-950 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTestModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSendingTest}
                  disabled={isSendingTest}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Dispatch Test
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Variation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" />
                New Template Variation
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Create an alternative design variation for workflow:{' '}
              <strong className="text-accent">{meta.label}</strong>.
            </p>

            <form onSubmit={handleCreateVariation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Variation Name</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Minimalist Clean White, Festive Edition"
                  value={newVariationName}
                  onChange={(e) => setNewVariationName(e.target.value)}
                  className="bg-zinc-950 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Description / Purpose Note
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Light mode version with condensed layout"
                  value={newVariationDesc}
                  onChange={(e) => setNewVariationDesc(e.target.value)}
                  className="bg-zinc-950 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isCreatingVariation}
                  disabled={isCreatingVariation}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create Variation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
