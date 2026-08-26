import type { Metadata } from 'next';
import { AuthorWorksClientView } from '@/components/features/works/AuthorWorksClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

interface AuthorWorksPageProps {
  params: Promise<{ author: string }>;
}

export async function generateMetadata({ params }: AuthorWorksPageProps): Promise<Metadata> {
  const { author } = await params;
  return constructMetadata({
    title: `Works by ${author}`,
    description: `Showcase of software engineering projects and technical contributions by ${author}.`,
    canonicalPath: `/works/by/${author}`,
    type: 'website',
  });
}

export default async function AuthorWorksPage({ params }: AuthorWorksPageProps) {
  const { author } = await params;

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Works', path: '/works' },
    { name: `@${author}`, path: `/works/by/${author}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <AuthorWorksClientView author={author} />
    </>
  );
}
