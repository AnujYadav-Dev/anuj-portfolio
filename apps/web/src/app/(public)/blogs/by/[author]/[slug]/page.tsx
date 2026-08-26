import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';
import { constructMetadata, generateBlogPostingJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { BlogReader } from '@/components/features/blogs/BlogReader';

interface AuthorSingleBlogPageProps {
  params: Promise<{ author: string; slug: string }>;
}

export async function generateMetadata({ params }: AuthorSingleBlogPageProps): Promise<Metadata> {
  const { author, slug } = await params;
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
    description:
      post.seoDescription ||
      post.excerpt ||
      `Read ${post.title} by ${post.author?.displayName || author}`,
    canonicalPath: `/blogs/by/${author}/${post.slug}`,
    keywords: post.seoKeywords || post.tags?.join(', '),
    type: 'article',
    publishedTime: post.publishedAt || post.createdAt,
    modifiedTime: post.updatedAt,
    authors: [post.author?.displayName || author],
    tags: post.tags,
  });
}

export default async function AuthorSingleBlogPage({ params }: AuthorSingleBlogPageProps) {
  const { author, slug } = await params;
  const post = await serverApi.getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const blogJsonLd = generateBlogPostingJsonLd(post);
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
    { name: `@${author}`, path: `/blogs/by/${author}` },
    { name: post.title, path: `/blogs/by/${author}/${post.slug}` },
  ]);

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogReader post={post} />
    </>
  );
}
