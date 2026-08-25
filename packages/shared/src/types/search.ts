// Search DTOs and query types.

export type SearchType =
  'all' | 'project' | 'blog_post' | 'research_paper' | 'skill' | 'page' | 'about_section';

/** Single search result item. */
export interface SearchResultItemDto {
  id: string;
  type: SearchType;
  title: string;
  slug: string | null;
  url: string;
  snippet: string | null;
  category?: string | null;
  tags?: string[];
  publishedAt?: string | null;
}

/** Global search response. */
export interface SearchResultsDto {
  query: string;
  total: number;
  results: SearchResultItemDto[];
}
