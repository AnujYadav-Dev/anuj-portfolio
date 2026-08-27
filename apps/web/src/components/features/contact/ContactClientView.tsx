'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ContactForm } from '@/components/features/contact/ContactForm';
import { useSocialLinks } from '@/hooks/useProfile';
import { useSiteSettings } from '@/hooks/useLayout';
import { Mail, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ContactClientView() {
  const { data: socialData } = useSocialLinks();
  const { data: settingsData } = useSiteSettings();

  const authorEmail =
    settingsData?.data?.['author_email'] ||
    settingsData?.data?.['author.email'] ||
    'anujyadav9449@gmail.com';
  const authorLocation =
    settingsData?.data?.['author_location'] ||
    settingsData?.data?.['author.location'] ||
    'Bengaluru, India';
  const socials = socialData?.data || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="GET IN TOUCH"
        title="Contact & Collaboration"
        description="Whether you have an engineering proposal, consulting inquiry, or just want to say hello, feel free to send a message."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Right: Direct Information & Channels */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="bg-surface border-border p-6 flex flex-col gap-4">
                <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
                  Direct Inquiries
                </span>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-muted shrink-0" />
                    <a
                      href={`mailto:${authorEmail}`}
                      className="text-foreground hover:text-accent font-mono transition-colors"
                    >
                      {authorEmail}
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-muted shrink-0" />
                    <span className="text-muted">{authorLocation}</span>
                  </div>
                </div>
              </Card>

              {/* Social Channels */}
              {socials.length > 0 && (
                <Card className="bg-surface border-border p-6 flex flex-col gap-3">
                  <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
                    Online Presence
                  </span>
                  <div className="flex flex-col gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted hover:text-accent font-mono transition-colors flex items-center justify-between py-1 border-b border-border/40 last:border-0"
                      >
                        <span>{s.platform}</span>
                        <span className="text-[11px] text-placeholder">↗</span>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
