import type { Metadata } from 'next';
import { GalleryClientView } from '@/components/features/gallery/GalleryClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Showcase & Visual Gallery',
  description:
    'Curated visual gallery of system architecture diagrams, engineering workflows, product designs, workspace setups, and photos.',
  canonicalPath: '/gallery',
  type: 'website',
});

export default function GalleryPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Visual Gallery', path: '/gallery' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <GalleryClientView />
    </>
  );
}
