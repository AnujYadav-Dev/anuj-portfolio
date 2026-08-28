'use client';

import * as React from 'react';
import { ClickTargetType } from '@portfolio/shared';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';

export function TelemetryTracker() {
  const { trackClick } = useAnalyticsTracker();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // 1. Check for interactive link clicks (anchors)
      const anchor = target.closest('a');
      if (anchor && anchor.href) {
        const href = anchor.href;
        const currentHost = window.location.host;
        const explicitType = anchor.getAttribute('data-track-type') as ClickTargetType | null;
        const explicitLabel = anchor.getAttribute('data-track-label') || anchor.innerText.trim() || anchor.getAttribute('aria-label') || undefined;

        if (explicitType) {
          trackClick(href, explicitType, explicitLabel);
          return;
        }

        // Determine click target type automatically
        if (href.toLowerCase().includes('resume') || href.toLowerCase().endsWith('.pdf') || anchor.hasAttribute('download')) {
          trackClick(href, ClickTargetType.ResumeDownload, explicitLabel || 'Resume Download');
          return;
        }

        if (href.includes('github.com')) {
          trackClick(href, ClickTargetType.Github, explicitLabel || 'GitHub Repository');
          return;
        }

        if (
          href.includes('twitter.com') ||
          href.includes('x.com') ||
          href.includes('linkedin.com') ||
          href.includes('youtube.com') ||
          href.includes('instagram.com')
        ) {
          trackClick(href, ClickTargetType.SocialLink, explicitLabel || 'Social Profile');
          return;
        }

        if (href.startsWith('mailto:') || href.includes('/contact')) {
          trackClick(href, ClickTargetType.Contact, explicitLabel || 'Contact Trigger');
          return;
        }

        // External outbound link
        if (href.startsWith('http') && !href.includes(currentHost)) {
          const isDemo = href.includes('vercel.app') || href.includes('netlify.app') || anchor.getAttribute('rel')?.includes('noopener');
          trackClick(href, isDemo ? ClickTargetType.LiveDemo : ClickTargetType.External, explicitLabel || anchor.hostname);
          return;
        }
      }

      // 2. Check for Code Block Copy or Action button clicks
      const button = target.closest('button');
      if (button) {
        const isCodeCopy =
          button.getAttribute('data-action') === 'copy-code' ||
          button.classList.contains('copy-button') ||
          button.getAttribute('aria-label')?.toLowerCase().includes('copy') ||
          button.closest('pre');

        if (isCodeCopy) {
          const codeLanguage = button.closest('pre')?.querySelector('code')?.className || 'Code Snippet';
          trackClick(window.location.pathname, ClickTargetType.CodeCopy, `Copy: ${codeLanguage}`);
          return;
        }

        const explicitType = button.getAttribute('data-track-type') as ClickTargetType | null;
        if (explicitType) {
          const label = button.getAttribute('data-track-label') || button.innerText.trim() || undefined;
          trackClick(window.location.pathname, explicitType, label);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [trackClick]);

  return null;
}
