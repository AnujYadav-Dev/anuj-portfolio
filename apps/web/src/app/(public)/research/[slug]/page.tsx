import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import {
  constructMetadata,
  generateScholarlyArticleJsonLd,
  generateBreadcrumbsJsonLd,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { ResearchDetailsClient } from '@/components/features/research/ResearchDetailsClient';

interface SingleResearchPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SingleResearchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = await serverApi.getResearchBySlug(slug);

  if (!paper) {
    return constructMetadata({
      title: 'Paper Not Found',
      description: 'The requested research paper could not be located.',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: paper.seoTitle || paper.title,
    description:
      paper.seoDescription || paper.abstract || `Explore ${paper.title} research publication.`,
    canonicalPath: `/research/${paper.slug}`,
    image: paper.ogImageUrl || undefined,
    keywords: paper.seoKeywords || paper.tags?.join(', '),
    type: 'article',
    publishedTime: paper.publishedAt || paper.publicationDate || paper.createdAt,
    authors: [paper.author?.displayName || 'Anuj Yadav'],
    tags: paper.tags,
  });
}

export default async function SingleResearchPage({ params }: SingleResearchPageProps) {
  const { slug } = await params;
  const paper = await serverApi.getResearchBySlug(slug);

  if (!paper) {
    notFound();
  }

  const scholarlyJsonLd = generateScholarlyArticleJsonLd(paper);
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Research', path: '/research' },
    { name: paper.title, path: `/research/${paper.slug}` },
  ]);

  return (
    <>
      <JsonLd data={scholarlyJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ResearchDetailsClient paper={paper} />
    </>
  );
}
