// Pure command query and search scope parsing utilities.

export type SearchEntityType = 'all' | 'project' | 'blog_post' | 'research_paper' | 'skill';

export interface CommandScopeDefinition {
  type: SearchEntityType;
  label: string;
}

export interface ParsedCommandQuery {
  cleanSearchTerm: string;
  searchType: SearchEntityType;
  scopeBadge: string | null;
}

/** Centralized registry mapping query prefix aliases to backend entity search types */
export const SCOPE_REGISTRY: Record<string, CommandScopeDefinition> = {
  projects: { type: 'project', label: 'Projects' },
  project: { type: 'project', label: 'Projects' },
  works: { type: 'project', label: 'Projects' },
  work: { type: 'project', label: 'Projects' },
  blogs: { type: 'blog_post', label: 'Blogs' },
  blog: { type: 'blog_post', label: 'Blogs' },
  articles: { type: 'blog_post', label: 'Blogs' },
  article: { type: 'blog_post', label: 'Blogs' },
  posts: { type: 'blog_post', label: 'Blogs' },
  research: { type: 'research_paper', label: 'Research' },
  papers: { type: 'research_paper', label: 'Research' },
  paper: { type: 'research_paper', label: 'Research' },
  skills: { type: 'skill', label: 'Skills' },
  skill: { type: 'skill', label: 'Skills' },
};

/**
 * Parses raw input from command palette or navigation triggers into structured search parameters.
 * Supports syntax like ">projects: my-query", "blogs: react", or standard "react".
 */
export function parseCommandQuery(rawQuery: string): ParsedCommandQuery {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return {
      cleanSearchTerm: '',
      searchType: 'all',
      scopeBadge: null,
    };
  }

  // Check for command prefix pattern: ">scope: term" or "scope: term"
  const match = trimmed.match(/^(?:>)?([a-zA-Z0-9_-]+):\s*(.*)$/);
  if (match) {
    const scopeKey = match[1].toLowerCase();
    const rest = match[2].trim();
    const registeredScope = SCOPE_REGISTRY[scopeKey];

    if (registeredScope) {
      return {
        cleanSearchTerm: rest,
        searchType: registeredScope.type,
        scopeBadge: registeredScope.label,
      };
    }

    // If prefix is not a known entity type (e.g. ">alpha:"), extract keyword search
    return {
      cleanSearchTerm: rest || match[1],
      searchType: 'all',
      scopeBadge: match[1],
    };
  }

  // Standard unstructured text query
  return {
    cleanSearchTerm: trimmed,
    searchType: 'all',
    scopeBadge: null,
  };
}

/**
 * Creates a formatted scoped query string for command palette invocation.
 */
export function createScopedQueryString(scope?: string, searchTerm = ''): string {
  if (!scope || !scope.trim()) {
    return searchTerm.trim();
  }

  const normalized = scope.trim().toLowerCase();
  if (normalized in SCOPE_REGISTRY) {
    return searchTerm.trim() ? `>${normalized}: ${searchTerm.trim()}` : `>${normalized}: `;
  }

  // For general keyword/topic scopes
  return searchTerm.trim() ? `${scope.trim()} ${searchTerm.trim()}` : scope.trim();
}
