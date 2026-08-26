import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { DynamicPageRenderer } from '@/components/features/pages/DynamicPageRenderer';

interface GenericDynamicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GenericDynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await serverApi.getPageBySlug(slug);

  if (!page) {
    return constructMetadata({
      title: 'Page Not Found',
      description: 'The requested page could not be located.',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: page.seoTitle || page.title,
    description: page.seoDescription || `View ${page.title} on Anuj Yadav's platform.`,
    canonicalPath: `/${page.slug}`,
    keywords: page.seoKeywords || undefined,
    type: 'website',
  });

}

export default async function GenericDynamicPage({ params }: GenericDynamicPageProps) {
  const { slug } = await params;
  const page = await serverApi.getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: page.title, path: `/${page.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <DynamicPageRenderer page={page} />
    </>
  );
}
