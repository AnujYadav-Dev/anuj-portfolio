import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MasonryGallery, type MasonryGalleryItem } from '@/components/features/gallery/MasonryGallery';

const sampleItems: MasonryGalleryItem[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
    title: 'Architecture Blueprint',
    caption: 'Event-driven system diagram',
    category: 'Architecture',
    altText: 'Diagram Alt',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    title: 'Dashboard Screen',
    caption: 'Real-time analytics UI',
    category: 'UI/UX',
    altText: 'UI Alt',
  },
];

describe('MasonryGallery Component', () => {
  it('renders images in a masonry layout with captions and categories', () => {
    render(<MasonryGallery items={sampleItems} />);

    expect(screen.getByText('Event-driven system diagram')).toBeInTheDocument();
    expect(screen.getByText('Real-time analytics UI')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('UI/UX')).toBeInTheDocument();
  });

  it('opens interactive lightbox on click and allows next/prev navigation', () => {
    render(<MasonryGallery items={sampleItems} />);

    // Click first item to open lightbox
    const firstCard = screen.getByRole('button', { name: /Architecture Blueprint/i });
    fireEvent.click(firstCard);

    // Lightbox modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    // Click next button
    const nextBtn = screen.getByRole('button', { name: /Next image/i });
    fireEvent.click(nextBtn);

    // Should now be on image 2 / 2
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    // Close lightbox
    const closeBtn = screen.getByRole('button', { name: /Close lightbox/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders clean empty state when no items are provided', () => {
    render(<MasonryGallery items={[]} emptyMessage="No screenshots found" />);
    expect(screen.getByText('No screenshots found')).toBeInTheDocument();
  });
});
