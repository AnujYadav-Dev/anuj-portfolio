import type { Metadata } from 'next';
import { SearchClientView } from '@/components/features/search/SearchClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Search the Platform',
  description:
    'Instant multi-domain search across engineering projects, essays, research papers, technologies, and custom pages.',
  canonicalPath: '/search',
  type: 'website',
});

export default function GlobalSearchPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <SearchClientView />
    </>
  );
}
