import type { Metadata } from 'next';
import { AboutClientView } from '@/components/features/about/AboutClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'About & Biography',
  description:
    'A deeper look into my engineering philosophy, architectural background, and technical journey.',
  canonicalPath: '/about',
  type: 'profile',
});

export default function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <AboutClientView />
    </>
  );
}
