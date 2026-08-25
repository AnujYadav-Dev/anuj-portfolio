'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import type { TimelineEventDto } from '@portfolio/shared';

export interface TimelineListProps {
  events: TimelineEventDto[];
}

export function TimelineList({ events }: TimelineListProps) {
  // Group events by year
  const groupedEvents = React.useMemo(() => {
    const map = new Map<number, TimelineEventDto[]>();
    for (const event of events) {
      const year = new Date(event.date).getFullYear();
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year)!.push(event);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [events]);

  if (groupedEvents.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted font-mono border border-dashed border-border rounded-md">
        No timeline milestones recorded yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-border">
      {groupedEvents.map(([year, yearEvents], idx) => (
        <RevealOnScroll key={year} delayIndex={(idx % 4 + 1) as 1 | 2 | 3 | 4}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 border-b border-border">
            {/* Left: Year Header */}
            <div className="md:col-span-3">
              <span className="text-xl font-bold font-mono text-foreground tracking-tight">
                {year}
              </span>
            </div>

            {/* Right: Year Events List */}
            <div className="md:col-span-9 flex flex-col gap-6">
              {yearEvents.map((event) => (
                <div key={event.id} className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {event.title}
                    </span>
                    <Badge variant="outline" size="sm">
                      {event.eventType.toUpperCase()}
                    </Badge>
                  </div>

                  {event.description && (
                    <p className="text-xs text-muted leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline underline-offset-4 font-mono pt-0.5"
                    >
                      View Reference →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      ))}
    </div>
  );
}
