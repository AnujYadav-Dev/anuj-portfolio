import type { Metadata } from 'next';
import { AuthorBlogsClientView } from '@/components/features/blogs/AuthorBlogsClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

interface AuthorBlogsPageProps {
  params: Promise<{ author: string }>;
}

export async function generateMetadata({ params }: AuthorBlogsPageProps): Promise<Metadata> {
  const { author } = await params;
  return constructMetadata({
    title: `Articles by ${author}`,
    description: `Technical essays, tutorials, and architectural thoughts authored by ${author}.`,
    canonicalPath: `/blogs/by/${author}`,
    type: 'website',
  });
}

export default async function AuthorBlogsPage({ params }: AuthorBlogsPageProps) {
  const { author } = await params;

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
    { name: `@${author}`, path: `/blogs/by/${author}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <AuthorBlogsClientView author={author} />
    </>
  );
}
