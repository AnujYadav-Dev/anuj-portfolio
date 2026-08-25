'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { EmailTemplateDto, UpdateEmailTemplateRequest } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Mail, Save, Variable, Eye, Code } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplateDto[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'html' | 'preview' | 'text'>('html');

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: EmailTemplateDto[] }>('/email-templates');
      setTemplates(res.data || []);
      if (res.data && res.data.length > 0) {
        const active = res.data.find((t) => t.templateKey === selectedKey) || res.data[0]!;
        setSelectedKey(active.templateKey);
        setSubject(active.subject);
        setBodyHtml(active.bodyHtml);
        setBodyText(active.bodyText || '');
      }
    } catch {
      toast.error('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const currentTemplate = templates.find((t) => t.templateKey === selectedKey);

  const handleSelectTemplate = (t: EmailTemplateDto) => {
    setSelectedKey(t.templateKey);
    setSubject(t.subject);
    setBodyHtml(t.bodyHtml);
    setBodyText(t.bodyText || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;

    setIsSaving(true);
    try {
      const payload: UpdateEmailTemplateRequest = {
        subject,
        bodyHtml,
        bodyText: bodyText || null,
      };

      await apiClient.put(`/email-templates/${selectedKey}`, payload);
      toast.success('Email template updated successfully!');
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted">Loading Email Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <AdminPageHeader
        title="Transactional Email Templates"
        description="HTML and plain text automated email templates for contact acknowledgments, admin alerts, and newsletters."
      />

      {/* Template Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {templates.map((t) => (
          <button
            key={t.templateKey}
            type="button"
            onClick={() => handleSelectTemplate(t)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
              selectedKey === t.templateKey
                ? 'bg-accent text-black font-bold shadow-sm'
                : 'bg-surface border border-border text-muted hover:text-foreground',
            )}
          >
            {t.templateKey.replace(/_/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {currentTemplate && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Variables Chip Bar */}
          <div className="p-3.5 rounded-lg bg-surface border border-border flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Variable className="w-3.5 h-3.5 text-accent" /> Available Variables:
            </span>
            {currentTemplate.variables?.map((v) => (
              <span
                key={v}
                className="px-2 py-0.5 rounded bg-surface-muted border border-border text-[11px] font-mono text-accent"
              >
                {'{{'}
                {v}
                {'}}'}
              </span>
            ))}
          </div>

          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Email Subject & Body
                </CardTitle>
                <CardDescription className="text-xs text-muted">
                  Supports mustache template variables replacement.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1 bg-surface-muted p-1 rounded border border-border">
                <button
                  type="button"
                  onClick={() => setPreviewMode('html')}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded transition-colors',
                    previewMode === 'html'
                      ? 'bg-surface text-foreground font-semibold shadow-sm'
                      : 'text-muted hover:text-foreground',
                  )}
                >
                  <Code className="w-3.5 h-3.5 inline mr-1" /> HTML
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded transition-colors',
                    previewMode === 'preview'
                      ? 'bg-surface text-foreground font-semibold shadow-sm'
                      : 'text-muted hover:text-foreground',
                  )}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('text')}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded transition-colors',
                    previewMode === 'text'
                      ? 'bg-surface text-foreground font-semibold shadow-sm'
                      : 'text-muted hover:text-foreground',
                  )}
                >
                  Plain Text
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subject Line</label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              {previewMode === 'html' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">HTML Body</label>
                  <Textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    rows={14}
                    required
                    className="bg-background text-xs font-mono"
                  />
                </div>
              )}

              {previewMode === 'preview' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Rendered HTML View
                  </label>
                  <div className="border border-border rounded-lg p-6 bg-white text-black min-h-[300px]">
                    <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                  </div>
                </div>
              )}

              {previewMode === 'text' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Fallback Plain Text Body
                  </label>
                  <Textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={12}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save Email Template</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
