import type { Metadata } from 'next';
import { TimelineClientView } from '@/components/features/about/TimelineClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Interactive Journey Timeline',
  description:
    'A chronological record of career milestones, education, open-source launches, and major engineering accomplishments.',
  canonicalPath: '/my-timeline',
  type: 'profile',
});

export default function TimelinePage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Timeline', path: '/my-timeline' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <TimelineClientView />
    </>
  );
}
