import { NextResponse } from 'next/server';
import { serverApi } from '@/lib/server-api';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = getSiteUrl();

  try {
    const [settings, blogs, research] = await Promise.all([
      serverApi.getSiteSettings(),
      serverApi.getAllPublishedBlogs(50),
      serverApi.getAllPublishedResearch(50),
    ]);

    const siteTitle = settings.site_title || 'Anuj Yadav — Portfolio & Writings';
    const siteDescription =
      settings.site_description ||
      'Technical writings, system architecture case studies, and engineering research by Anuj Yadav.';
    const authorEmail = settings.author_email || 'anujyadav9449@gmail.com';
    const authorName = settings.author_name || 'Anuj Yadav';

    // Combine blogs & research into a single chronological stream
    const items: Array<{
      title: string;
      link: string;
      description: string;
      pubDate: string;
      category?: string;
    }> = [
      ...blogs.map((b) => ({
        title: b.title,
        link: `${siteUrl}/blogs/${b.slug}`,
        description: b.excerpt || b.title,
        pubDate: b.publishedAt || new Date().toISOString(),
        category: b.category?.name || 'Articles',
      })),
      ...research.map((r) => ({
        title: r.title,
        link: `${siteUrl}/research/${r.slug}`,
        description: r.abstract || r.title,
        pubDate: r.publishedAt || r.publicationDate || new Date().toISOString(),
        category: r.publicationName || 'Research',
      })),
    ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const lastBuildDate =
      items.length > 0 ? new Date(items[0].pubDate).toUTCString() : new Date().toUTCString();

    const itemsXml = items
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      ${item.category ? `<category><![CDATA[${item.category}]]></category>` : ''}
      <author>${escapeXml(authorEmail)} (${escapeXml(authorName)})</author>
    </item>`,
      )
      .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[feed.xml] Error generating RSS feed:', error);
    return new NextResponse('Failed to generate syndication feed', { status: 500 });
  }
}
