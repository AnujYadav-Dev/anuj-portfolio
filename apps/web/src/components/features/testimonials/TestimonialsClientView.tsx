'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Quote, ExternalLink } from 'lucide-react';
import { useTestimonials } from '@/hooks/useInteractions';

export function TestimonialsClientView() {
  const { data: testData, isLoading } = useTestimonials();
  const testimonials = testData?.data || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="ENDORSEMENTS & COLLABORATION"
        title="Recommendations & Testimonials"
        description="Kind words, recommendations, and feedback from engineering leaders, colleagues, and collaborators."
      />

      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-56 w-full rounded-md" />
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((item, idx) => (
                <RevealOnScroll key={item.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <Card className="bg-surface border-border h-full flex flex-col justify-between p-6">
                    <div className="flex flex-col gap-4">
                      <Quote className="h-6 w-6 text-accent/60 shrink-0" />
                      <p className="text-sm text-foreground/90 leading-relaxed italic">
                        &quot;{item.content}&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border mt-6 pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={item.authorAvatarUrl || undefined}
                          fallbackText={item.authorName}
                          size="md"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">
                            {item.authorName}
                          </span>
                          <span className="text-[11px] text-muted">
                            {item.authorTitle}
                            {item.authorCompany ? ` @ ${item.authorCompany}` : ''}
                          </span>
                        </div>
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-accent transition-colors"
                          aria-label="View Endorsement Source"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
              No recommendations published yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
