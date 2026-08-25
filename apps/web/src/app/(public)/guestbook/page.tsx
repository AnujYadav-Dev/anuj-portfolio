'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { GuestbookForm } from '@/components/features/guestbook/GuestbookForm';
import { GuestbookList } from '@/components/features/guestbook/GuestbookList';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuestbook } from '@/hooks/useInteractions';

export default function GuestbookPage() {
  const { data: guestbookData, isLoading } = useGuestbook(1, 50);
  const entries = guestbookData?.data || [];

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="COMMUNITY & VISITORS"
        title="Visitor Guestbook"
        description="Leave a note, feedback, or greeting. A digital logbook for friends, collaborators, and visitors."
      />

      <div className="py-12">
        <div className="max-w-[800px] mx-auto px-4 md:px-8 flex flex-col gap-12">
          {/* Submission Form */}
          <GuestbookForm />

          {/* Entries Feed */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted border-b border-border pb-2">
              Recent Greetings ({guestbookData?.pagination?.totalItems ?? 0})
            </h3>

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-24 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <GuestbookList entries={entries} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
