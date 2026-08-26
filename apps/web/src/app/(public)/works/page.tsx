import type { Metadata } from 'next';
import { WorksClientView } from '@/components/features/works/WorksClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Works & Engineering Projects',
  description:
    'Systems architecture, web platforms, open-source utilities, and developer tooling built for performance and scalability.',
  canonicalPath: '/works',
  type: 'website',
});

export default function WorksPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Works', path: '/works' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <WorksClientView />
    </>
  );
}
