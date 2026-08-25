import { searchRepository } from '@/repositories/search.repository';
import type { SearchQuery, SearchResultItemDto, SearchResultsDto } from '@portfolio/shared';

export const searchService = {
  async search(query: SearchQuery): Promise<SearchResultsDto> {
    const q = query.q.trim();
    const limit = query.limit ?? 20;
    const type = query.type ?? 'all';

    const results: SearchResultItemDto[] = [];

    if (type === 'all' || type === 'project') {
      const projects = await searchRepository.searchProjects(q, limit);
      for (const p of projects) {
        results.push({
          id: p.id,
          type: 'project',
          title: p.title,
          slug: p.slug,
          url: `/works/by/${p.author.username}/${p.slug}`,
          snippet: p.shortDescription,
          category: p.category?.name ?? null,
          publishedAt: p.publishedAt?.toISOString() ?? null,
        });
      }
    }

    if (type === 'all' || type === 'blog_post') {
      const blogs = await searchRepository.searchBlogPosts(q, limit);
      for (const b of blogs) {
        results.push({
          id: b.id,
          type: 'blog_post',
          title: b.title,
          slug: b.slug,
          url: `/blogs/by/${b.author.username}/${b.slug}`,
          snippet: b.excerpt ?? (b.content ? b.content.slice(0, 150) + '...' : null),
          category: b.category?.name ?? null,
          publishedAt: b.publishedAt?.toISOString() ?? null,
        });
      }
    }

    if (type === 'all' || type === 'research_paper') {
      const papers = await searchRepository.searchResearchPapers(q, limit);
      for (const r of papers) {
        results.push({
          id: r.id,
          type: 'research_paper',
          title: r.title,
          slug: r.slug,
          url: `/research/${r.slug}`,
          snippet: r.abstract ?? null,
          publishedAt: r.publishedAt?.toISOString() ?? null,
        });
      }
    }

    if (type === 'all' || type === 'skill') {
      const skills = await searchRepository.searchSkills(q, limit);
      for (const s of skills) {
        results.push({
          id: s.id,
          type: 'skill',
          title: s.name,
          slug: s.slug,
          url: `/skills#${s.slug}`,
          snippet: `Skill in ${s.category?.name ?? 'General'}`,
          category: s.category?.name ?? null,
        });
      }
    }

    if (type === 'all' || type === 'page') {
      const pages = await searchRepository.searchPages(q, limit);
      for (const p of pages) {
        results.push({
          id: p.id,
          type: 'page',
          title: p.title,
          slug: p.slug,
          url: `/${p.slug}`,
          snippet: p.content ? p.content.slice(0, 150) + '...' : null,
          publishedAt: p.publishedAt?.toISOString() ?? null,
        });
      }
    }

    if (type === 'all' || type === 'about_section') {
      const sections = await searchRepository.searchAboutSections(q, limit);
      for (const a of sections) {
        results.push({
          id: a.id,
          type: 'about_section',
          title: a.title,
          slug: a.slug,
          url: `/about/${a.slug}`,
          snippet: a.content ? a.content.slice(0, 150) + '...' : null,
        });
      }
    }

    return {
      query: q,
      total: results.length,
      results: results.slice(0, limit),
    };
  },
};
