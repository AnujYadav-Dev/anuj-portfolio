import type {
  BlogPostDto,
  BlogPostListItemDto,
  ProjectDto,
  ProjectListItemDto,
  ResearchPaperDto,
  ResearchPaperListItemDto,
  PageDto,
  AboutSectionDto,
  AuthorDto,
  PaginatedResponse,
  SiteSettingsMap,
} from '@portfolio/shared';

const SERVER_API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${SERVER_API_URL}${cleanPath}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      next: { revalidate: 60, ...(options.next || {}) },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.warn(`[serverFetch] ${response.status} ${response.statusText} for ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[serverFetch] Network/fetch error for ${url}:`, error);
    return null;
  }
}

export const serverApi = {
  /** Fetch public site settings map. */
  async getSiteSettings(): Promise<SiteSettingsMap> {
    const res = await serverFetch<{ data: SiteSettingsMap }>('/site-settings');
    return res?.data || {};
  },

  /** Fetch public author profile. */
  async getAuthorProfile(): Promise<AuthorDto | null> {
    const res = await serverFetch<{ data: AuthorDto }>('/auth/profile');
    return res?.data || null;
  },

  /** Fetch all published blog posts for sitemap/feed/lists. */
  async getAllPublishedBlogs(pageSize = 100): Promise<BlogPostListItemDto[]> {
    const res = await serverFetch<PaginatedResponse<BlogPostListItemDto>>(
      `/blogs?pageSize=${pageSize}`,
    );
    return res?.data || [];
  },

  /** Fetch single blog post by slug. */
  async getBlogBySlug(slug: string): Promise<BlogPostDto | null> {
    const res = await serverFetch<{ data: BlogPostDto }>(`/blogs/${encodeURIComponent(slug)}`);
    return res?.data || null;
  },

  /** Fetch all published projects for sitemap/lists. */
  async getAllPublishedProjects(pageSize = 100): Promise<ProjectListItemDto[]> {
    const res = await serverFetch<PaginatedResponse<ProjectListItemDto>>(
      `/projects?pageSize=${pageSize}`,
    );
    return res?.data || [];
  },

  /** Fetch single project by slug. */
  async getProjectBySlug(slug: string): Promise<ProjectDto | null> {
    const res = await serverFetch<{ data: ProjectDto }>(`/projects/${encodeURIComponent(slug)}`);
    return res?.data || null;
  },

  /** Fetch all published research papers for sitemap/feed/lists. */
  async getAllPublishedResearch(pageSize = 100): Promise<ResearchPaperListItemDto[]> {
    const res = await serverFetch<PaginatedResponse<ResearchPaperListItemDto>>(
      `/research?pageSize=${pageSize}`,
    );
    return res?.data || [];
  },

  /** Fetch single research paper by slug. */
  async getResearchBySlug(slug: string): Promise<ResearchPaperDto | null> {
    const res = await serverFetch<{ data: ResearchPaperDto }>(
      `/research/${encodeURIComponent(slug)}`,
    );
    return res?.data || null;
  },

  /** Fetch all published dynamic pages. */
  async getAllPublishedPages(pageSize = 100): Promise<PageDto[]> {
    const res = await serverFetch<PaginatedResponse<PageDto>>(`/pages?pageSize=${pageSize}`);
    return res?.data || [];
  },

  /** Fetch dynamic page by slug. */
  async getPageBySlug(slug: string): Promise<PageDto | null> {
    const res = await serverFetch<{ data: PageDto }>(`/pages/${encodeURIComponent(slug)}`);
    return res?.data || null;
  },

  /** Fetch all enabled about sections. */
  async getEnabledAboutSections(): Promise<AboutSectionDto[]> {
    const res = await serverFetch<{ data: AboutSectionDto[] }>('/about-sections');
    return res?.data || [];
  },

  /** Fetch about section by slug. */
  async getAboutSectionBySlug(slug: string): Promise<AboutSectionDto | null> {
    const res = await serverFetch<{ data: AboutSectionDto }>(
      `/about-sections/${encodeURIComponent(slug)}`,
    );
    return res?.data || null;
  },
};
