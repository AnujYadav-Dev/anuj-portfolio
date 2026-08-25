'use client';

import * as React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { GuestbookEntryDto } from '@portfolio/shared';

export interface GuestbookListProps {
  entries: GuestbookEntryDto[];
}

export function GuestbookList({ entries }: GuestbookListProps) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
        No guestbook entries yet. Be the first to leave a greeting!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry, idx) => {
        const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <RevealOnScroll key={entry.id} delayIndex={(idx % 4 + 1) as 1 | 2 | 3 | 4}>
            <Card className="bg-surface border-border p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar fallbackText={entry.authorName} size="sm" />
                  <span className="font-semibold text-xs text-foreground">
                    {entry.authorName}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted">{date}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed pl-8">
                {entry.message}
              </p>
            </Card>
          </RevealOnScroll>
        );
      })}
    </div>
  );
}
