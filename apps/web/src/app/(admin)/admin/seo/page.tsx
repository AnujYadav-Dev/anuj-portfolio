'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { SiteSettingDto, MediaDto } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Globe, Save, Sparkles, Image as ImageIcon, Search, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<SiteSettingDto[]>([]);
  const [title, setTitle] = useState('Anuj Yadav — Distributed Systems Engineer');
  const [description, setDescription] = useState(
    'Personal portfolio, technical research, and production system architecture by Anuj Yadav.',
  );
  const [keywords, setKeywords] = useState('distributed systems, nextjs, backend, postgresql');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('@anujyadav');
  const [siteUrl, setSiteUrl] = useState('https://anujyadav.dev');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: SiteSettingDto[] }>('/site-settings/admin/all');
      setSettings(res.data || []);
      const map: Record<string, string> = {};
      (res.data || []).forEach((s) => {
        map[s.key] = s.value;
      });
      if (map.site_name) setTitle(map.site_name);
      if (map.site_description) setDescription(map.site_description);
      if (map.seo_keywords) setKeywords(map.seo_keywords);
      if (map.seo_og_image) setOgImageUrl(map.seo_og_image);
      if (map.twitter_handle) setTwitterHandle(map.twitter_handle);
      if (map.site_url) setSiteUrl(map.site_url);
    } catch {
      toast.error('Failed to load SEO settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSelectOg = (media: MediaDto) => {
    setOgImageUrl(media.url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = [
        { key: 'site_name', value: title },
        { key: 'site_description', value: description },
        { key: 'seo_keywords', value: keywords },
        { key: 'seo_og_image', value: ogImageUrl },
        { key: 'twitter_handle', value: twitterHandle },
        { key: 'site_url', value: siteUrl },
      ];

      await apiClient.put('/site-settings/bulk', { settings: updates });
      toast.success('SEO defaults saved successfully!');
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save SEO defaults');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner className="w-8 h-8 text-accent" />
        <span className="text-xs font-mono text-muted">Loading SEO Engine...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      <AdminPageHeader
        title="Search Engine & Social Metadata (SEO)"
        description="Global metadata fallbacks, OpenGraph image cards, and live Google / Twitter SERP previews."
        action={
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            disabled={isSaving}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>Save SEO Configuration</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: SEO Form Inputs */}
        <div className="space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                <span>Default Meta Fields</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Default Site Title</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Production Canonical URL
                </label>
                <Input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  required
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Default Meta Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-background text-xs"
                />
                <span className="text-[10px] text-muted font-mono">
                  {description.length} / 160 chars
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Keywords (Comma-separated)
                </label>
                <Input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Twitter / X Handle</label>
                <Input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Default Social Share Image (OG Image)
                </label>
                {ogImageUrl ? (
                  <div className="relative aspect-video w-full rounded border border-border overflow-hidden bg-surface-muted">
                    <img src={ogImageUrl} alt="OG Card" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 text-xs"
                      onClick={() => setIsMediaPickerOpen(true)}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-accent" />
                    <span>Select OpenGraph Image from Library</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Live SERP & Social Previews */}
        <div className="space-y-6">
          {/* Google Search Card Preview */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-accent" />
                <span>Google Search Engine Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="p-4 rounded-lg bg-background border border-border space-y-1 font-sans">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">
                    A
                  </span>
                  <span className="font-mono text-[11px] truncate">{siteUrl}</span>
                </div>
                <h3 className="text-base text-[#8ab4f8] hover:underline cursor-pointer font-medium line-clamp-1">
                  {title}
                </h3>
                <p className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                  {description || 'No description set'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social OpenGraph Card Preview */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4 text-accent" />
                <span>Twitter / LinkedIn Social Card Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="rounded-xl border border-border overflow-hidden bg-background">
                <div className="aspect-video w-full bg-surface-muted flex items-center justify-center overflow-hidden">
                  {ogImageUrl ? (
                    <img src={ogImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-6 text-center text-muted text-xs font-mono">
                      <ImageIcon className="w-8 h-8 text-placeholder mx-auto mb-2" />
                      1200 × 630 OpenGraph Preview
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border space-y-1">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                    {siteUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">{title}</h4>
                  <p className="text-[11px] text-muted line-clamp-2">{description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectOg}
        title="Select OpenGraph Social Preview Image"
        acceptType="image"
      />
    </form>
  );
}
