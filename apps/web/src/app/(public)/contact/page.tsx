import type { Metadata } from 'next';
import { ContactClientView } from '@/components/features/contact/ContactClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Contact & Collaboration',
  description:
    'Whether you have an engineering proposal, consulting inquiry, or just want to say hello, feel free to send a message.',
  canonicalPath: '/contact',
  type: 'website',
});

export default function ContactPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ContactClientView />
    </>
  );
}
