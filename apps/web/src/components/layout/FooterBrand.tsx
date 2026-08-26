'use client';

import * as React from 'react';
import Link from 'next/link';
import type { SocialLinkDto } from '@portfolio/shared';
import {
  GitHubIcon,
  TwitterIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
  DiscordIcon,
  EmailIcon,
} from '@/components/common/Icons';
import { NavIcon } from './NavIcon';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FooterBrandProps {
  portfolioName?: string;
  socials?: SocialLinkDto[];
  className?: string;
}

function resolveSocialIcon(platform: string) {
  const norm = platform.toLowerCase().trim();
  if (norm.includes('github')) return GitHubIcon;
  if (norm.includes('linkedin')) return LinkedInIcon;
  if (norm.includes('twitter') || norm === 'x' || norm.includes('x.com')) return TwitterIcon;
  if (norm.includes('instagram')) return InstagramIcon;
  if (norm.includes('youtube')) return YouTubeIcon;
  if (norm.includes('discord')) return DiscordIcon;
  if (norm.includes('email') || norm.includes('mail')) return EmailIcon;
  return null;
}

export function FooterBrand({ portfolioName = 'Anuj Yadav', socials = [], className }: FooterBrandProps) {
  const currentYear = 2026;

  return (
    <div className={cn('flex flex-col justify-between h-full min-h-[160px] gap-8', className)}>
      {/* Brand Monogram / Title */}
      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center font-mono font-extrabold text-lg tracking-tight text-foreground hover:text-accent transition-colors select-none group"
        >
          <span>ANUJ</span>
          <span className="text-accent group-hover:rotate-12 transition-transform inline-block">.V</span>
        </Link>
        <p className="text-xs text-muted leading-relaxed max-w-xs">
          A collection of things I was curious enough to build.
        </p>
      </div>

      {/* Bottom Area: Copyright & Minimal Social Media Links */}
      <div className="space-y-3 mt-auto pt-6">
        {/* Strictly required format: © 2026 [Portfolio Name]. All rights reserved. */}
        <p className="text-xs text-muted select-none font-mono">
          © {currentYear} {portfolioName}. All rights reserved.
        </p>

        {/* Dynamic Social Media Links (Minimal Unboxed Design) */}
        {socials.length > 0 && (
          <div className="flex items-center flex-wrap gap-4 pt-1">
            {socials.map((social) => {
              const IconComp = resolveSocialIcon(social.platform);

              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label || social.platform}
                  title={social.label || social.platform}
                  className="text-muted hover:text-accent transition-colors duration-fast p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer inline-flex items-center justify-center"
                >
                  {IconComp ? (
                    <IconComp className="w-4 h-4" />
                  ) : social.icon ? (
                    <NavIcon name={social.icon} className="w-4 h-4" />
                  ) : (
                    <Globe className="w-4 h-4 text-muted hover:text-accent transition-colors" />
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
