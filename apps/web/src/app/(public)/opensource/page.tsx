import type { Metadata } from 'next';
import { OpenSourceClientView } from '@/components/features/opensource/OpenSourceClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Open Source Contributions & Libraries',
  description:
    'Public repositories, developer packages, tools, and upstream contributions to the global open-source ecosystem.',
  canonicalPath: '/opensource',
  type: 'website',
});

export default function OpenSourcePage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Open Source', path: '/opensource' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <OpenSourceClientView />
    </>
  );
}
