import type { Metadata } from 'next';
import { GuestbookClientView } from '@/components/features/guestbook/GuestbookClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Visitor Guestbook',
  description:
    'Leave a note, feedback, or greeting. A digital logbook for friends, collaborators, and visitors.',
  canonicalPath: '/guestbook',
  type: 'website',
});

export default function GuestbookPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Guestbook', path: '/guestbook' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <GuestbookClientView />
    </>
  );
}
