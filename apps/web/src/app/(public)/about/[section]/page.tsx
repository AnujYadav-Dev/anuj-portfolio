import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { AboutSectionClient } from '@/components/features/about/AboutSectionClient';

interface SingleAboutSectionPageProps {
  params: Promise<{ section: string }>;
}

export async function generateMetadata({ params }: SingleAboutSectionPageProps): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const section = await serverApi.getAboutSectionBySlug(sectionSlug);

  if (!section) {
    return constructMetadata({
      title: 'Section Not Found',
      description: 'The requested about section could not be located.',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: section.seoTitle || `${section.title} — About`,
    description: section.seoDescription || `Learn more about Anuj Yadav — ${section.title}.`,
    canonicalPath: `/about/${section.slug}`,
    type: 'profile',
  });
}

export default async function SingleAboutSectionPage({ params }: SingleAboutSectionPageProps) {
  const { section: sectionSlug } = await params;
  const section = await serverApi.getAboutSectionBySlug(sectionSlug);

  if (!section) {
    notFound();
  }

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: section.title, path: `/about/${section.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <AboutSectionClient section={section} />
    </>
  );
}
