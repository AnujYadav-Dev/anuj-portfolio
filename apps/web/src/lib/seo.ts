import type { Metadata } from 'next';
import type {
  BlogPostDto,
  ProjectDto,
  ResearchPaperDto,
  AuthorDto,
  SiteSettingsMap,
} from '@portfolio/shared';

/** Returns the canonical site URL from environment or default. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export interface ConstructMetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[] | string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
}

/** Construct standard Next.js Metadata object with OpenGraph and Twitter cards. */
export function constructMetadata(options: ConstructMetadataOptions = {}): Metadata {
  const siteUrl = getSiteUrl();
  const title = options.title
    ? `${options.title} | Anuj Yadav`
    : 'Anuj Yadav — Full-Stack Engineer & Architect';
  const description =
    options.description ||
    'Full-Stack Developer, Systems Architect & Open Source Contributor. Explore portfolio projects, technical writings, and research.';

  const canonicalUrl = options.canonicalPath
    ? `${siteUrl}${options.canonicalPath.startsWith('/') ? options.canonicalPath : `/${options.canonicalPath}`}`
    : siteUrl;

  const defaultOgImage = `${siteUrl}/api/og?title=${encodeURIComponent(options.title || 'Anuj Yadav')}&type=${options.type || 'website'}`;
  const ogImage = options.image || defaultOgImage;

  const keywords = Array.isArray(options.keywords)
    ? options.keywords
    : options.keywords
      ? options.keywords.split(',').map((k) => k.trim())
      : [
          'Anuj Yadav',
          'Full-Stack Developer',
          'Software Engineer',
          'Systems Architect',
          'Next.js',
          'TypeScript',
          'Node.js',
          'React',
          'Distributed Systems',
        ];

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Anuj Yadav', url: siteUrl }],
    creator: 'Anuj Yadav',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      types: {
        'application/rss+xml': [{ url: `${siteUrl}/feed.xml`, title: 'Anuj Yadav RSS Feed' }],
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Anuj Yadav Portfolio',
      locale: 'en_US',
      type: options.type === 'article' ? 'article' : 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: options.title || 'Anuj Yadav Portfolio',
        },
      ],
      ...(options.type === 'article' && {
        publishedTime: options.publishedTime,
        modifiedTime: options.modifiedTime,
        authors: options.authors || ['Anuj Yadav'],
        tags: options.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@anujyadav',
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

// ─── JSON-LD Structured Data Generators ────────────────────────

/** Generate WebSite Schema JSON-LD with Sitelinks SearchBox. */
export function generateWebSiteJsonLd(settings?: SiteSettingsMap) {
  const siteUrl = getSiteUrl();
  const siteName = settings?.site_title || 'Anuj Yadav Portfolio';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description:
      settings?.site_description ||
      'Full-Stack Developer, Systems Architect & Open Source Contributor.',
    author: {
      '@type': 'Person',
      name: settings?.author_name || 'Anuj Yadav',
      url: siteUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Generate Person / Profile Schema JSON-LD. */
export function generatePersonJsonLd(author?: AuthorDto | null, settings?: SiteSettingsMap) {
  const siteUrl = getSiteUrl();
  const displayName = author?.displayName || settings?.author_name || 'Anuj Yadav';
  const bio =
    author?.bio ||
    settings?.site_description ||
    'Full-Stack Developer & Systems Architect passionate about crafting high-performance applications.';
  const jobTitle = settings?.author_job_title || 'Full-Stack Engineer & Architect';

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: displayName,
    jobTitle,
    url: siteUrl,
    image:
      author?.avatarUrl ||
      `${siteUrl}/api/og?title=${encodeURIComponent(displayName)}&type=profile`,
    description: bio,
    sameAs: [
      settings?.twitter_handle ? `https://x.com/${settings.twitter_handle.replace('@', '')}` : '',
      'https://github.com/AnujYadav-Dev',
      'https://www.linkedin.com/in/anujyadav-dev/',
    ].filter(Boolean),
  };
}

/** Generate BlogPosting Schema JSON-LD. */
export function generateBlogPostingJsonLd(post: BlogPostDto) {
  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/blogs/${post.slug}`;
  const imageUrl =
    post.coverImageUrl ||
    post.ogImageUrl ||
    `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}&type=blog&category=${encodeURIComponent(post.category?.name || 'Engineering')}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
    image: imageUrl,
    url: postUrl,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author?.displayName || 'Anuj Yadav',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Anuj Yadav',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags?.join(', ') || post.seoKeywords || undefined,
  };
}

/** Generate SoftwareApplication / CreativeWork Schema JSON-LD for Projects. */
export function generateProjectJsonLd(project: ProjectDto) {
  const siteUrl = getSiteUrl();
  const projectUrl = `${siteUrl}/works/${project.slug}`;
  const imageUrl =
    project.coverImageUrl ||
    project.ogImageUrl ||
    `${siteUrl}/api/og?title=${encodeURIComponent(project.title)}&type=project&category=${encodeURIComponent(project.category?.name || 'Project')}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.seoTitle || project.title,
    description: project.seoDescription || project.shortDescription,
    url: projectUrl,
    image: imageUrl,
    applicationCategory: project.category?.name || 'DeveloperApplication',
    operatingSystem: 'All',
    author: {
      '@type': 'Person',
      name: project.author?.displayName || 'Anuj Yadav',
      url: siteUrl,
    },
    ...(project.githubUrl && { codeRepository: project.githubUrl }),
    ...(project.liveUrl && { installUrl: project.liveUrl }),
  };
}

/** Generate ScholarlyArticle Schema JSON-LD for Research. */
export function generateScholarlyArticleJsonLd(paper: ResearchPaperDto) {
  const siteUrl = getSiteUrl();
  const paperUrl = `${siteUrl}/research/${paper.slug}`;
  const imageUrl =
    paper.ogImageUrl ||
    `${siteUrl}/api/og?title=${encodeURIComponent(paper.title)}&type=research&category=${encodeURIComponent(paper.publicationName || 'Research')}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: paper.seoTitle || paper.title,
    description: paper.seoDescription || paper.abstract || paper.title,
    url: paperUrl,
    image: imageUrl,
    datePublished: paper.publicationDate || paper.publishedAt || paper.createdAt,
    author: {
      '@type': 'Person',
      name: paper.author?.displayName || 'Anuj Yadav',
      url: siteUrl,
    },
    ...(paper.publicationName && { publication: paper.publicationName }),
    ...(paper.doi && { identifier: `doi:${paper.doi}` }),
  };
}

/** Generate BreadcrumbList Schema JSON-LD. */
export function generateBreadcrumbsJsonLd(items: Array<{ name: string; path: string }>) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
