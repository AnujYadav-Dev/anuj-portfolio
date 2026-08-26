import type { Metadata } from 'next';
import { ResumeClientView } from '@/components/features/resume/ResumeClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Online Resume & Qualifications',
  description:
    'Interactive curriculum vitae highlighting professional roles, academic background, and core technical proficiencies.',
  canonicalPath: '/resume',
  type: 'profile',
});

export default function ResumePage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Resume', path: '/resume' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ResumeClientView />
    </>
  );
}
