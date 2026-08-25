'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ResumeViewer } from '@/components/features/resume/ResumeViewer';

export default function ResumePage() {
  return (
    <div className="flex flex-col">
      <div className="print:hidden">
        <PageHeader
          badge="CURRICULUM VITAE"
          title="Online Resume & Qualifications"
          description="Interactive curriculum vitae highlighting professional roles, academic background, and core technical proficiencies."
        />
      </div>

      <div className="py-12">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8">
          <ResumeViewer />
        </div>
      </div>
    </div>
  );
}
