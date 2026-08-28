'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Sparkles } from 'lucide-react';

import { SplitSection } from '@/components/common/SplitSection';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { useSiteSettings } from '@/hooks/useLayout';
import { toast } from 'sonner';
import { formatSectionTag, type DynamicSectionProps } from './types';

export function ContactCTA({ section, index }: DynamicSectionProps) {
  const { data: settingsData } = useSiteSettings();
  const email =
    settingsData?.data?.['author_email'] ||
    settingsData?.data?.['author.email'] ||
    'anujyadav9449@gmail.com';

  const sectionTitle = section?.title || 'Get In Touch';
  const sectionSubtitle =
    (section?.config?.subtitle as string) || 'Collaboration & Inquiries';

  const labelNumber = formatSectionTag({
    index,
    showSectionNumber: section?.config?.showSectionNumber !== false,
    labelTag: (section?.config?.labelTag as string) || 'CONNECT',
    tagSeparator: (section?.config?.tagSeparator as string) ?? '//',
    customLabelNumber: section?.config?.labelNumber as string,
  });

  const calloutHeadline =
    (section?.config?.calloutHeadline as string) ||
    'Have an ambitious project or engineering challenge?';
  const calloutDescription =
    (section?.config?.calloutDescription as string) ||
    'Whether you need senior technical leadership, architectural guidance, or full-stack execution, my inbox is always open.';

  const ctaLabel = (section?.config?.ctaLabel as string) || 'Send Message';
  const ctaUrl = (section?.config?.ctaUrl as string) || '/contact';
  const ctaTarget = (section?.config?.ctaTarget as string) || '_self';
  const enableCopyEmail = section?.config?.enableCopyEmail !== false;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success('Email copied to clipboard');
    } catch {
      toast.error('Failed to copy email');
    }
  };

  return (
    <SplitSection
      labelNumber={labelNumber}
      labelTitle={sectionTitle}
      labelSubtitle={sectionSubtitle}
      id="contact"
    >
      <RevealOnScroll>
        <div className="flex flex-col gap-6 max-w-2xl bg-surface border border-border rounded-lg p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Start a Conversation
            </span>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {calloutHeadline}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {calloutDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={ctaUrl}
              target={ctaTarget === '_blank' ? '_blank' : undefined}
              rel={ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
            >
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                {ctaLabel}
              </Button>
            </Link>

            {enableCopyEmail && (
              <Button
                variant="outline"
                size="md"
                onClick={handleCopyEmail}
                leftIcon={<Copy className="h-3.5 w-3.5" />}
              >
                <span>{email}</span>
              </Button>
            )}
          </div>
        </div>
      </RevealOnScroll>
    </SplitSection>
  );
}
