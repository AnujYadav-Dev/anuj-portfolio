import type { Metadata } from 'next';
import { BlogsClientView } from '@/components/features/blogs/BlogsClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Technical Essays & Architecture Notes',
  description:
    'Deep dives on distributed systems, modern React paradigms, TypeScript abstractions, and backend engineering.',
  canonicalPath: '/blogs',
  type: 'website',
});

export default function BlogsPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <BlogsClientView />
    </>
  );
}
