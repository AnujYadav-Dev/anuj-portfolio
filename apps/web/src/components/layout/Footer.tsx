'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSocialLinks } from '@/hooks/useProfile';
import { useSiteSettings } from '@/hooks/useLayout';
import { useNewsletterMutation } from '@/hooks/useInteractions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Send } from 'lucide-react';

import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = React.useState('');
  const { data: socialData } = useSocialLinks();
  const { data: settingsData } = useSiteSettings();
  const newsletterMutation = useNewsletterMutation();

  const authorName = settingsData?.data?.['author.name'] || 'ANUJ YADAV';
  const isAvailable = settingsData?.data?.['author.available'] !== 'false';
  const availabilityText =
    settingsData?.data?.['author.availabilityText'] ||
    'Available for high-impact software engineering roles & consulting.';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    newsletterMutation.mutate(
      { email },
      {
        onSuccess: () => setEmail(''),
      },
    );
  };

  const defaultSocials = [
    { id: '1', platform: 'GitHub', url: 'https://github.com' },
    { id: '2', platform: 'LinkedIn', url: 'https://linkedin.com' },
    { id: '3', platform: 'Twitter / X', url: 'https://twitter.com' },
    { id: '4', platform: 'Email', url: 'mailto:anuj@example.com' },
  ];

  const socials = socialData?.data && socialData.data.length > 0 ? socialData.data : defaultSocials;

  return (
    <footer
      role="contentinfo"
      className="w-full bg-background border-t border-border mt-auto transition-colors duration-fast"
    >
      {/* Top Footer Section: Newsletter & Availability */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Availability Status */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isAvailable && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${isAvailable ? 'bg-success' : 'bg-muted'}`}
                />
              </span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                {isAvailable ? 'Currently Available' : 'Currently Busy'}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-md">{availabilityText}</p>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
              Stay in the Loop
            </span>
            <p className="text-xs text-muted leading-relaxed">
              Occasional dispatches on systems architecture, full-stack craft, and engineering
              essays.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mt-1">
              <Input
                type="email"
                placeholder="developer@example.com"
                aria-label="Email address for newsletter subscription"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="h-9 shrink-0"
                isLoading={newsletterMutation.isPending}
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Subscribe</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Giant Watermark Display Typography */}
      <div className="border-t border-border overflow-hidden select-none">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
          <p className="text-center font-extrabold tracking-tight text-surface-muted hover:text-border transition-colors uppercase font-mono text-[clamp(2.5rem,7vw,5.5rem)] leading-none truncate">
            {authorName}
          </p>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Links & Theme Toggle */}
      <div className="border-t border-border bg-surface/30">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div>
            © {new Date().getFullYear()} {authorName}. Built with craft & precision.
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            {socials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors underline-offset-4 hover:underline"
              >
                {s.platform}
              </a>
            ))}
            <Link
              href="/guestbook"
              className="hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              Guestbook
            </Link>
            <Link
              href="/rss.xml"
              className="hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              RSS
            </Link>
            <div className="pl-2 border-l border-border flex items-center">
              <ThemeToggle className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

