'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { SiteSettingDto } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Save, Globe, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingDto[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: SiteSettingDto[] }>('/site-settings/admin/all');
      setSettings(res.data || []);
      const initial: Record<string, string> = {};
      (res.data || []).forEach((s) => {
        initial[s.key] = s.value;
      });
      setFormValues(initial);
    } catch {
      toast.error('Failed to load site settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = Object.entries(formValues).map(([key, value]) => ({
        key,
        value,
      }));

      await apiClient.put('/site-settings/bulk', { settings: updates });
      toast.success('Site configuration saved successfully!');
      fetchSettings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Loading Site Configuration...
        </span>
      </div>
    );
  }

  const isBooleanSetting = (key: string, val: string) =>
    val === 'true' || val === 'false' || key.includes('enable') || key.includes('active');

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title="Global Platform Settings"
        description="Core configuration flags, telemetry toggles, feature switches, and environment values."
        action={
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            disabled={isSaving}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>Save All Settings</span>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Group 1: General & Identity */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <span>General & Public Identity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {settings
              .filter(
                (s) =>
                  s.group === 'general' ||
                  (!s.key.startsWith('analytics_') && !s.key.startsWith('seo_')),
              )
              .map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">{s.key}</label>
                    <span className="text-[10px] font-mono text-muted">
                      group: {s.group || 'general'}
                    </span>
                  </div>
                  {isBooleanSetting(s.key, formValues[s.key] ?? s.value) ? (
                    <select
                      value={formValues[s.key] ?? s.value}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                    >
                      <option value="true">true (Enabled)</option>
                      <option value="false">false (Disabled)</option>
                    </select>
                  ) : (formValues[s.key] ?? s.value).length > 60 ? (
                    <Textarea
                      value={formValues[s.key] ?? s.value}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      rows={3}
                      className="bg-background text-xs font-mono"
                    />
                  ) : (
                    <Input
                      type="text"
                      value={formValues[s.key] ?? s.value}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Group 2: Analytics & Telemetry */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" />
              <span>Visitor Analytics & Telemetry Config</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {settings
              .filter((s) => s.group === 'analytics' || s.key.startsWith('analytics_'))
              .map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">{s.key}</label>
                    <span className="text-[10px] font-mono text-muted">
                      {s.group || 'analytics'}
                    </span>
                  </div>
                  {isBooleanSetting(s.key, formValues[s.key] ?? s.value) ? (
                    <select
                      value={formValues[s.key] ?? s.value}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                    >
                      <option value="true">true (Active)</option>
                      <option value="false">false (Inactive)</option>
                    </select>
                  ) : (
                    <Input
                      type="text"
                      value={formValues[s.key] ?? s.value}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="bg-background text-xs font-mono"
                    />
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
