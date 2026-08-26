import type { Metadata } from 'next';
import { NewsletterClientView } from '@/components/features/newsletter/NewsletterClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Engineering Newsletter & Dispatch',
  description:
    'A periodic newsletter on distributed systems, modern web engineering, architecture decisions, and developer tooling.',
  canonicalPath: '/newsletter',
  type: 'website',
});

export default function NewsletterPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Newsletter', path: '/newsletter' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <NewsletterClientView />
    </>
  );
}
