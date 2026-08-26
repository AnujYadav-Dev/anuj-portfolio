'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TimelineList } from '@/components/features/about/TimelineList';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimelineEvents } from '@/hooks/useProfile';

export function TimelineClientView() {
  const [selectedType, setSelectedType] = React.useState<string | undefined>();
  const { data: timelineData, isLoading } = useTimelineEvents(selectedType);

  const events = timelineData?.data || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="JOURNEY & CAREER CHRONOLOGY"
        title="Interactive Journey Timeline"
        description="A chronological record of career milestones, education, open-source launches, and major engineering accomplishments."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-8">
          {/* Milestone Type Filter */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
            <Badge
              variant={selectedType === undefined ? 'accent' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(undefined)}
              className="cursor-pointer select-none"
            >
              All Milestones
            </Badge>
            {['career', 'education', 'project', 'personal', 'award'].map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? 'accent' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(selectedType === type ? undefined : type)}
                className="cursor-pointer select-none uppercase"
              >
                {type}
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-24 w-full rounded-sm" />
              ))}
            </div>
          ) : (
            <TimelineList events={events} />
          )}
        </div>
      </div>
    </div>
  );
}
