import type { Metadata } from 'next';
import { CertificatesClientView } from '@/components/features/about/CertificatesClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Certifications & Recognitions',
  description:
    'Formal certifications, hackathon awards, competition honors, and industry recognitions.',
  canonicalPath: '/certificates-achievements',
  type: 'profile',
});

export default function CertificatesAchievementsPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Certificates & Achievements', path: '/certificates-achievements' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <CertificatesClientView />
    </>
  );
}
