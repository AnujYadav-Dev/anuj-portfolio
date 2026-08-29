'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useGallery } from '@/hooks/useProfile';
import { MasonryGallery, type MasonryGalleryItem } from '@/components/features/gallery/MasonryGallery';
import { cn } from '@/lib/cn';

export function GalleryClientView() {
  const { data: galleryData, isLoading } = useGallery();
  const allItems = React.useMemo(() => galleryData?.data || [], [galleryData]);

  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // Compute unique categories and counts from database items
  const categories = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allItems.forEach((item) => {
      const cat = item.category?.trim().toLowerCase() || 'general';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = Object.entries(counts).map(([key, count]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      count,
    }));

    return [{ key: 'all', label: 'All Visuals', count: allItems.length }, ...list];
  }, [allItems]);

  // Filter items by selected category
  const filteredItems = React.useMemo(() => {
    if (selectedCategory === 'all') return allItems;
    return allItems.filter(
      (item) => (item.category?.trim().toLowerCase() || 'general') === selectedCategory,
    );
  }, [allItems, selectedCategory]);

  const masonryItems: MasonryGalleryItem[] = React.useMemo(
    () =>
      filteredItems.map((item) => ({
        id: item.id,
        url: item.mediaUrl,
        title: item.title,
        caption: item.description,
        category: item.category,
        altText: item.altText,
        createdAt: item.createdAt,
      })),
    [filteredItems],
  );

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Minimal Sleek Header & Filtration Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground uppercase">
            Gallery
          </h1>
          <span className="text-xs font-mono text-muted">
            ({allItems.length} {allItems.length === 1 ? 'item' : 'items'})
          </span>
        </div>

        {/* Minimal Subtle Filtration Tags with Inline Horizontal Scroll */}
        {categories.length > 1 && (
          <nav
            aria-label="Gallery category filters"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-w-full sm:max-w-[70%] py-1 -my-1 shrink-0"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer select-none whitespace-nowrap shrink-0',
                    isSelected
                      ? 'bg-surface-muted text-foreground font-semibold border border-border'
                      : 'text-muted hover:text-foreground hover:bg-surface-muted/40',
                  )}
                >
                  <span>{cat.label}</span>
                  <span className="ml-1 text-[10px] text-muted/80 font-normal">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner className="w-8 h-8 text-accent" />
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            Loading Visual Gallery...
          </span>
        </div>
      ) : (
        <>
          <MasonryGallery
            items={masonryItems}
            emptyMessage={
              selectedCategory === 'all'
                ? 'Visual blueprints and media items will appear here as they are uploaded.'
                : 'No media items found in this category.'
            }
          />
          {filteredItems.length === 0 && selectedCategory !== 'all' && (
            <div className="text-center -mt-2 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="text-xs"
              >
                Reset to All Visuals
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
