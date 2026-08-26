import { describe, it, expect } from 'vitest';
import { parseCommandQuery, createScopedQueryString, SCOPE_REGISTRY } from '@/lib/command-parser';

describe('command-parser', () => {
  describe('parseCommandQuery', () => {
    it('returns empty and "all" type for empty or whitespace query', () => {
      expect(parseCommandQuery('')).toEqual({
        cleanSearchTerm: '',
        searchType: 'all',
        scopeBadge: null,
      });

      expect(parseCommandQuery('   ')).toEqual({
        cleanSearchTerm: '',
        searchType: 'all',
        scopeBadge: null,
      });
    });

    it('parses standard query without prefix as "all" type', () => {
      expect(parseCommandQuery('react nextjs')).toEqual({
        cleanSearchTerm: 'react nextjs',
        searchType: 'all',
        scopeBadge: null,
      });
    });

    it('resolves registered scope aliases correctly with > prefix', () => {
      // Projects
      expect(parseCommandQuery('>projects: portfolio')).toEqual({
        cleanSearchTerm: 'portfolio',
        searchType: 'project',
        scopeBadge: 'Projects',
      });

      expect(parseCommandQuery('>works: ')).toEqual({
        cleanSearchTerm: '',
        searchType: 'project',
        scopeBadge: 'Projects',
      });

      // Blogs
      expect(parseCommandQuery('>blogs: tailwind')).toEqual({
        cleanSearchTerm: 'tailwind',
        searchType: 'blog_post',
        scopeBadge: 'Blogs',
      });

      expect(parseCommandQuery('>articles: architecture')).toEqual({
        cleanSearchTerm: 'architecture',
        searchType: 'blog_post',
        scopeBadge: 'Blogs',
      });

      // Skills
      expect(parseCommandQuery('>skills: typescript')).toEqual({
        cleanSearchTerm: 'typescript',
        searchType: 'skill',
        scopeBadge: 'Skills',
      });

      // Research
      expect(parseCommandQuery('>research: ai')).toEqual({
        cleanSearchTerm: 'ai',
        searchType: 'research_paper',
        scopeBadge: 'Research',
      });
    });

    it('resolves registered scope aliases without leading > sign', () => {
      expect(parseCommandQuery('projects: dashboard')).toEqual({
        cleanSearchTerm: 'dashboard',
        searchType: 'project',
        scopeBadge: 'Projects',
      });

      expect(parseCommandQuery('blogs: typescript 5')).toEqual({
        cleanSearchTerm: 'typescript 5',
        searchType: 'blog_post',
        scopeBadge: 'Blogs',
      });
    });

    it('safely handles unrecognized scope prefixes as general keywords', () => {
      expect(parseCommandQuery('>alpha: custom search')).toEqual({
        cleanSearchTerm: 'custom search',
        searchType: 'all',
        scopeBadge: 'alpha',
      });

      expect(parseCommandQuery('>alpha: ')).toEqual({
        cleanSearchTerm: 'alpha',
        searchType: 'all',
        scopeBadge: 'alpha',
      });
    });
  });

  describe('createScopedQueryString', () => {
    it('returns empty string when scope is empty or undefined', () => {
      expect(createScopedQueryString()).toBe('');
      expect(createScopedQueryString('')).toBe('');
      expect(createScopedQueryString('   ')).toBe('');
    });

    it('formats registered scopes with > prefix', () => {
      expect(createScopedQueryString('projects')).toBe('>projects: ');
      expect(createScopedQueryString('blogs', 'react')).toBe('>blogs: react');
      expect(createScopedQueryString('works')).toBe('>works: ');
      expect(createScopedQueryString('skills', 'node')).toBe('>skills: node');
    });

    it('formats unregistered custom scopes as keyword strings', () => {
      expect(createScopedQueryString('alpha')).toBe('alpha');
      expect(createScopedQueryString('alpha', 'test')).toBe('alpha test');
    });
  });

  describe('SCOPE_REGISTRY', () => {
    it('contains valid search entity mappings', () => {
      expect(SCOPE_REGISTRY.projects.type).toBe('project');
      expect(SCOPE_REGISTRY.blogs.type).toBe('blog_post');
      expect(SCOPE_REGISTRY.skills.type).toBe('skill');
      expect(SCOPE_REGISTRY.research.type).toBe('research_paper');
    });
  });
});
