import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import { constructMetadata, generateProjectJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProjectCaseStudy } from '@/components/features/works/ProjectCaseStudy';

interface SingleProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SingleProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await serverApi.getProjectBySlug(slug);

  if (!project) {
    return constructMetadata({
      title: 'Project Not Found',
      description: 'The requested project case study could not be located.',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: project.seoTitle || `${project.title} — Case Study`,
    description:
      project.seoDescription ||
      project.shortDescription ||
      `Explore ${project.title} architecture case study.`,
    canonicalPath: `/works/${project.slug}`,
    image: project.ogImageUrl || project.coverImageUrl || undefined,
    keywords: project.seoKeywords || project.technologies?.join(', '),
    type: 'website',
  });
}

export default async function SingleProjectPage({ params }: SingleProjectPageProps) {
  const { slug } = await params;
  const project = await serverApi.getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const projectJsonLd = generateProjectJsonLd(project);
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Works', path: '/works' },
    { name: project.title, path: `/works/${project.slug}` },
  ]);

  return (
    <>
      <JsonLd data={projectJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProjectCaseStudy project={project} />
    </>
  );
}
