import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GalleryClientView } from '@/components/features/gallery/GalleryClientView';
import type { GalleryItemDto } from '@portfolio/shared';

const mockGalleryItems: GalleryItemDto[] = [
  {
    id: 'gal-1',
    title: 'Distributed System Blueprint',
    description: 'Event-driven architecture with Kafka and Redis caching layers.',
    category: 'architecture',
    sortOrder: 1,
    isEnabled: true,
    mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
    altText: 'System Diagram',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'gal-2',
    title: 'Minimalist Engineering Desk',
    description: 'Triple 4K setup with mechanical ergonomic split keyboard.',
    category: 'setup',
    sortOrder: 2,
    isEnabled: true,
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    altText: 'Desk Setup',
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'gal-3',
    title: 'Next.js App Dashboard UI',
    description: 'Dark-mode glassmorphic analytics suite with real-time metrics.',
    category: 'work',
    sortOrder: 3,
    isEnabled: true,
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    altText: 'Dashboard Screenshot',
    createdAt: '2026-03-01T00:00:00Z',
  },
];

vi.mock('@/hooks/useProfile', () => ({
  useGallery: () => ({
    data: { data: mockGalleryItems },
    isLoading: false,
    error: null,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return TestWrapper;
};

describe('GalleryClientView Component', () => {
  it('renders page header, category pills, and gallery items', () => {
    render(<GalleryClientView />, { wrapper: createWrapper() });

    // Minimal page title and count
    expect(screen.getByRole('heading', { level: 1, name: /Gallery/i })).toBeInTheDocument();
    expect(screen.getByText('(3 items)')).toBeInTheDocument();

    // Category pills
    expect(screen.getByText('All Visuals')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();

    // Items rendered
    expect(screen.getByText('Distributed System Blueprint')).toBeInTheDocument();
    expect(screen.getByText('Minimalist Engineering Desk')).toBeInTheDocument();
    expect(screen.getByText('Next.js App Dashboard UI')).toBeInTheDocument();
  });

  it('filters gallery items when clicking a category pill', () => {
    render(<GalleryClientView />, { wrapper: createWrapper() });

    // Click 'Architecture' filter
    const architectureBtn = screen.getByRole('button', { name: /Architecture/i });
    fireEvent.click(architectureBtn);

    // Only Architecture item should be shown
    expect(screen.getByText('Distributed System Blueprint')).toBeInTheDocument();
    expect(screen.queryByText('Minimalist Engineering Desk')).not.toBeInTheDocument();
    expect(screen.queryByText('Next.js App Dashboard UI')).not.toBeInTheDocument();
  });

  it('opens full-screen lightbox preview dialog on item click and closes on dismiss', () => {
    render(<GalleryClientView />, { wrapper: createWrapper() });

    // Click on the first gallery card to open lightbox
    const itemCard = screen.getByRole('button', { name: /View Distributed System Blueprint/i });
    fireEvent.click(itemCard);

    // Lightbox modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getAllByText('Event-driven architecture with Kafka and Redis caching layers.').length,
    ).toBeGreaterThanOrEqual(1);

    // Close lightbox
    const closeBtn = screen.getByRole('button', { name: /Close lightbox/i });
    fireEvent.click(closeBtn);

    // Modal is closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
