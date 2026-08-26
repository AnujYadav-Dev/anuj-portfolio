import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import { constructMetadata, generateBlogPostingJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { BlogReader } from '@/components/features/blogs/BlogReader';

interface SingleBlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SingleBlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverApi.getBlogBySlug(slug);

  if (!post) {
    return constructMetadata({
      title: 'Article Not Found',
      description: 'The requested article could not be located.',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || `Read ${post.title} by ${post.author?.displayName || 'Anuj Yadav'}`,
    canonicalPath: `/blogs/${post.slug}`,
    keywords: post.seoKeywords || post.tags?.join(', '),
    type: 'article',
    publishedTime: post.publishedAt || post.createdAt,
    modifiedTime: post.updatedAt,
    authors: [post.author?.displayName || 'Anuj Yadav'],
    tags: post.tags,
  });
}

export default async function SingleBlogPage({ params }: SingleBlogPageProps) {
  const { slug } = await params;
  const post = await serverApi.getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const blogJsonLd = generateBlogPostingJsonLd(post);
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
    { name: post.title, path: `/blogs/${post.slug}` },
  ]);

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogReader post={post} />
    </>
  );
}
