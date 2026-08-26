import type { Metadata } from 'next';
import { ResearchClientView } from '@/components/features/research/ResearchClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Research Papers & Publications',
  description:
    'Formal publications, conference proceedings, preprints, and research inquiries into distributed architectures and computing.',
  canonicalPath: '/research',
  type: 'website',
});

export default function ResearchPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Research', path: '/research' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ResearchClientView />
    </>
  );
}
