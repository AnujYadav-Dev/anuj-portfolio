import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from '@/components/layout/Footer';

vi.mock('@/hooks/useLayout', () => ({
  useNavItems: (_location?: string) => ({
    data: {
      data: [
        {
          id: 'col-works',
          label: 'Works',
          url: '/works',
          location: 'footer',
          itemType: 'group',
          children: [
            { id: 'l1', label: 'Case Studies', url: '/works', isExternal: false },
            { id: 'l2', label: 'GitHub Repos', url: 'https://github.com', isExternal: true },
          ],
        },
        {
          id: 'col-writing',
          label: 'Writing',
          url: '/blogs',
          location: 'footer',
          itemType: 'group',
          children: [
            { id: 'l3', label: 'Engineering Essays', url: '/blogs', isExternal: false },
          ],
        },
      ],
    },
  }),
  useSiteSettings: () => ({
    data: {
      data: {
        author_name: 'Anuj Yadav',
        site_title: 'Anuj Yadav Portfolio',
        author_email: 'anuj@example.com',
        availability_status: 'available',
      },
    },
  }),
}));

vi.mock('@/hooks/useProfile', () => ({
  useSocialLinks: () => ({
    data: {
      data: [
        { id: 's1', platform: 'GitHub', label: 'GitHub', url: 'https://github.com/anuj' },
        { id: 's2', platform: 'LinkedIn', label: 'LinkedIn', url: 'https://linkedin.com/in/anuj' },
      ],
    },
  }),
}));

const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: mockSetTheme,
    resolvedTheme: 'dark',
  }),
}));

vi.mock('@/hooks/useInteractions', () => ({
  useNewsletterMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Footer (Multi-Column Architecture & Standards)', () => {
  it('renders semantic role="contentinfo" and navigation landmarks', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    const footerNav = screen.getByRole('navigation', { name: /Footer Navigation/i });
    expect(footerNav).toBeInTheDocument();
  });

  it('renders exact copyright format: © 2026 [Portfolio Name]. All rights reserved.', () => {
    render(<Footer />);

    const copyright = screen.getByText(/© 2026 Anuj Yadav\. All rights reserved\./i);
    expect(copyright).toBeInTheDocument();
  });

  it('renders Stay in the Loop newsletter subscription and availability status', () => {
    render(<Footer />);

    expect(screen.getByText(/Stay in the Loop/i)).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Email address for newsletter subscription/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join/i })).toBeInTheDocument();
  });

  it('renders dynamic categorized columns and their child links', () => {
    render(<Footer />);

    expect(screen.getByText('Works')).toBeInTheDocument();
    expect(screen.getByText('Writing')).toBeInTheDocument();

    const internalLink = screen.getByRole('link', { name: /Case Studies/i });
    expect(internalLink).toBeInTheDocument();
    expect(internalLink).toHaveAttribute('href', '/works');

    const externalLink = screen.getByRole('link', { name: /GitHub Repos/i });
    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute('href', 'https://github.com');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders dynamic social media links from useSocialLinks()', () => {
    render(<Footer />);

    const githubSocial = screen.getByLabelText(/GitHub/i);
    expect(githubSocial).toBeInTheDocument();
    expect(githubSocial).toHaveAttribute('href', 'https://github.com/anuj');
  });

  it('renders Developer Hub & Syndication links (RSS 2.0, Sitemap, Robots)', () => {
    render(<Footer />);

    const rssLink = screen.getByRole('link', { name: /RSS 2.0/i });
    expect(rssLink).toHaveAttribute('href', '/feed.xml');

    const sitemapLink = screen.getByRole('link', { name: /Sitemap/i });
    expect(sitemapLink).toHaveAttribute('href', '/sitemap.xml');

    const robotsLink = screen.getByRole('link', { name: /Robots\.txt/i });
    expect(robotsLink).toHaveAttribute('href', '/robots.txt');
  });

  it('renders 3-mode segmented theme controls and handles theme changes', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    const systemBtn = screen.getByLabelText(/System Theme/i);
    const lightBtn = screen.getByLabelText(/Light Mode/i);
    const darkBtn = screen.getByLabelText(/Dark Mode/i);

    expect(systemBtn).toBeInTheDocument();
    expect(lightBtn).toBeInTheDocument();
    expect(darkBtn).toBeInTheDocument();

    await user.click(lightBtn);
    expect(mockSetTheme).toHaveBeenCalledWith('light');

    await user.click(systemBtn);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('copies email to clipboard on copy email button click', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(<Footer />);

    const copyBtn = screen.getByTitle(/Click to copy email address/i);
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('anuj@example.com');
  });
});
