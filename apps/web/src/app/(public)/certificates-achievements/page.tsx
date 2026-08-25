'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { CertificatesGallery } from '@/components/features/about/CertificatesGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { useCertificates, useAchievements } from '@/hooks/useProfile';

export default function CertificatesAchievementsPage() {
  const { data: certsData, isLoading: isCertsLoading } = useCertificates();
  const { data: achData, isLoading: isAchLoading } = useAchievements();

  const certificates = certsData?.data || [];
  const achievements = achData?.data || [];
  const isLoading = isCertsLoading || isAchLoading;

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="CREDENTIALS & HONORS"
        title="Certifications & Recognitions"
        description="Formal certifications, hackathon awards, competition honors, and industry recognitions."
      />

      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-48 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <CertificatesGallery certificates={certificates} achievements={achievements} />
          )}
        </div>
      </div>
    </div>
  );
}
