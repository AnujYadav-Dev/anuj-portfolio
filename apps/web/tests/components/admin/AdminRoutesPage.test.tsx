import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminRoutesDirectoryPage from '@/app/(admin)/admin/routes/page';

// Mock the apiClient for dynamic pages and about sections
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Mock tanstack query
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[]; queryFn?: () => Promise<unknown> }) => {
    if (queryKey[0] === 'admin-pages-routes') {
      return {
        data: {
          data: [
            { id: 'p1', title: 'Now Page', slug: 'now', status: 'published', updatedAt: new Date().toISOString() },
            { id: 'p2', title: 'Uses & Hardware', slug: 'uses', status: 'published', updatedAt: new Date().toISOString() },
            { id: 'p3', title: 'Draft Terms', slug: 'terms-draft', status: 'draft', updatedAt: new Date().toISOString() },
          ],
        },
        isLoading: false,
        refetch: vi.fn(),
      };
    }
    if (queryKey[0] === 'admin-about-sections-routes') {
      return {
        data: {
          data: [
            { id: 'a1', title: 'My Skills', slug: 'skills', isEnabled: true, sortOrder: 0 },
            { id: 'a2', title: 'Hidden Section', slug: 'secret-timeline', isEnabled: false, sortOrder: 1 },
          ],
        },
        isLoading: false,
        refetch: vi.fn(),
      };
    }
    return { data: null, isLoading: false, refetch: vi.fn() };
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AdminRoutesDirectoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header, metric cards, and all route categories', () => {
    render(<AdminRoutesDirectoryPage />);

    expect(screen.getByRole('heading', { name: /Routes Directory & URL Explorer/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Total Tracked URLs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Public Pages|Public URLs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Admin CMS URLs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dynamic DB Pages/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/System Redirects|Redirects & Aliases/i).length).toBeGreaterThan(0);
  });

  it('renders static public routes and admin routes correctly', () => {
    render(<AdminRoutesDirectoryPage />);

    // Static public routes
    expect(screen.getByText('/about')).toBeInTheDocument();
    expect(screen.getByText('/works')).toBeInTheDocument();
    expect(screen.getByText('/blogs')).toBeInTheDocument();
    expect(screen.getByText('/resume')).toBeInTheDocument();
    expect(screen.getByText('/contact')).toBeInTheDocument();

    // Admin routes
    expect(screen.getByText('/admin/analytics')).toBeInTheDocument();
    expect(screen.getByText('/admin/blogs')).toBeInTheDocument();
    expect(screen.getByText('/admin/works')).toBeInTheDocument();
    expect(screen.getByText('/admin/routes')).toBeInTheDocument();
  });

  it('renders dynamic database pages and about sections with correct statuses', () => {
    render(<AdminRoutesDirectoryPage />);

    // Dynamic pages
    expect(screen.getByText('/now')).toBeInTheDocument();
    expect(screen.getByText('/uses')).toBeInTheDocument();
    expect(screen.getByText('/terms-draft')).toBeInTheDocument();

    // Dynamic about sections
    expect(screen.getByText('/about/skills')).toBeInTheDocument();
    expect(screen.getByText('/about/secret-timeline')).toBeInTheDocument();
  });

  it('filters routes when switching category tabs', async () => {
    const user = userEvent.setup();
    render(<AdminRoutesDirectoryPage />);

    // Click 'Redirects & Aliases' tab
    const redirectsTab = screen.getByRole('button', { name: /Redirects & Aliases/i });
    await user.click(redirectsTab);

    // Redirect routes should be visible
    expect(screen.getByText('/rss.xml')).toBeInTheDocument();
    expect(screen.getByText('/feed.xml')).toBeInTheDocument();
    expect(screen.getByText(/RSS Feed Alias Redirect/i)).toBeInTheDocument();

    // Static pages shouldn't be in the redirect list
    expect(screen.queryByText('App Router (app/(public)/works/page.tsx)')).not.toBeInTheDocument();
  });

  it('filters routes in real-time when typing into search input', async () => {
    const user = userEvent.setup();
    render(<AdminRoutesDirectoryPage />);

    const searchInput = screen.getByPlaceholderText(/Search path, title, destination, or source\.\.\./i);
    await user.type(searchInput, 'timeline');

    expect(screen.getByText('/my-timeline')).toBeInTheDocument();
    expect(screen.getByText('/admin/timeline')).toBeInTheDocument();
    expect(screen.queryByText('/contact')).not.toBeInTheDocument();
  });

  it('copies URL to clipboard and triggers feedback on copy button click', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(<AdminRoutesDirectoryPage />);

    const copyButtons = screen.getAllByTitle(/Copy URL/i);
    await user.click(copyButtons[0]);

    expect(writeTextMock).toHaveBeenCalled();
  });
});
