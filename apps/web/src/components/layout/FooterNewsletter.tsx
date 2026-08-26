'use client';

import * as React from 'react';
import { useNewsletterMutation } from '@/hooks/useInteractions';
import { useSiteSettings } from '@/hooks/useLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FooterNewsletterProps {
  className?: string;
}

export function FooterNewsletter({ className }: FooterNewsletterProps) {
  const [email, setEmail] = React.useState('');
  const { data: settingsData } = useSiteSettings();
  const newsletterMutation = useNewsletterMutation();

  const isAvailable = settingsData?.data?.['availability_status'] !== 'unavailable';
  const availabilityText =
    settingsData?.data?.['availability_text'] ||
    settingsData?.data?.['availability.text'] ||
    'Open for high-impact engineering roles, architecture consulting, and technical advisory.';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    newsletterMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          setEmail('');
        },
      },
    );
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-10 border-b border-border/70',
        className,
      )}
    >
      {/* Left: Availability Status */}
      <div className="md:col-span-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isAvailable && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isAvailable ? 'bg-success' : 'bg-muted'
              }`}
            />
          </span>
          <span className="text-xs font-mono font-semibold capitalize text-foreground">
            {isAvailable ? 'Currently Available' : 'Currently Busy'}
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed max-w-md">{availabilityText}</p>
      </div>

      {/* Right: Stay in the Loop (Newsletter Box) */}
      <div className="md:col-span-6 flex flex-col gap-2">
        <span className="text-xs font-mono font-semibold capitalize text-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Stay in the Loop</span>
        </span>
        <p className="text-xs text-muted leading-relaxed">
          Occasional dispatches on systems architecture, full-stack craft, and engineering essays.
        </p>

        <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-md mt-1">
          <Input
            type="email"
            placeholder="developer@example.com"
            aria-label="Email address for newsletter subscription"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-xs bg-surface"
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={newsletterMutation.isPending}
            className="h-9 px-4 shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>Join</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
