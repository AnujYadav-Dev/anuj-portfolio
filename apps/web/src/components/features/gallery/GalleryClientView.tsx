'use client';

import * as React from 'react';
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Spinner } from '@/components/ui/spinner';
import { useGallery } from '@/hooks/useProfile';
import { cn } from '@/lib/cn';

export function GalleryClientView() {
  const { data: galleryData, isLoading } = useGallery();
  const allItems = React.useMemo(() => galleryData?.data || [], [galleryData]);

  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = React.useState<number | null>(null);

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

  // Active lightbox item
  const activeItem =
    activeLightboxIndex !== null && filteredItems[activeLightboxIndex]
      ? filteredItems[activeLightboxIndex]
      : null;

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : 0,
        );
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0,
        );
      } else if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredItems.length]);

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
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setActiveLightboxIndex(null);
                  }}
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
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-border bg-surface p-12 text-center my-8">
          <ImageIcon className="w-10 h-10 text-muted mx-auto mb-3 opacity-60" />
          <p className="text-sm font-semibold text-foreground">No media items in this category</p>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Visual blueprints and media items will appear here as they are uploaded from the admin panel.
          </p>
          {selectedCategory !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="mt-4 text-xs"
            >
              Reset to All Visuals
            </Button>
          )}
        </div>
      ) : (
        /* Responsive CSS Masonry Grid */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item, idx) => {
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : null;

            return (
              <RevealOnScroll
                key={item.id}
                delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}
                className="break-inside-avoid"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.title || 'gallery item'}`}
                  onClick={() => setActiveLightboxIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveLightboxIndex(idx);
                    }
                  }}
                  className="group relative overflow-hidden rounded-md border border-border bg-surface hover:border-accent transition-all duration-normal cursor-pointer flex flex-col shadow-xs hover:shadow-md"
                >
                  {/* Media Viewport */}
                  <div className="relative overflow-hidden bg-surface-muted w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.mediaUrl}
                      alt={item.altText || item.title || 'Gallery showcase item'}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-slow group-hover:scale-[1.02]"
                    />

                    {/* Quick Expand Button Hover Indicator */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-xs bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-xs">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </div>

                    {/* Category Chip Over Image */}
                    {item.category && (
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          variant="outline"
                          size="sm"
                          className="bg-background/85 backdrop-blur-xs font-mono uppercase text-[10px] tracking-wider border border-border/80"
                        >
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Compact Text Metadata Footer */}
                  {(item.title || item.description || formattedDate) && (
                    <div className="px-3 py-2.5 flex flex-col gap-0.5 border-t border-border/60 bg-surface">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        {item.title ? (
                          <h3 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                            {item.title}
                          </h3>
                        ) : (
                          <span className="text-[10px] font-mono text-muted uppercase">Visual</span>
                        )}
                        {formattedDate && (
                          <span className="text-[10px] font-mono text-muted/70 shrink-0">
                            {formattedDate}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted truncate leading-normal">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      )}

      {/* Fullscreen Interactive Lightbox Modal */}
      <Dialog
        isOpen={activeLightboxIndex !== null}
        onClose={() => setActiveLightboxIndex(null)}
      >
        {activeItem && (
          <div className="relative flex flex-col max-w-5xl w-full bg-surface border border-border rounded-lg overflow-hidden shadow-2xl p-0">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/50 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {activeItem.category && (
                  <Badge variant="accent" size="sm" className="font-mono uppercase text-[10px]">
                    {activeItem.category}
                  </Badge>
                )}
                <span className="text-xs font-bold text-foreground truncate">
                  {activeItem.title || 'Visual Preview'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-muted mr-2">
                  {activeLightboxIndex !== null ? activeLightboxIndex + 1 : 1} /{' '}
                  {filteredItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveLightboxIndex(null)}
                  className="p-1 rounded-xs text-muted hover:text-foreground hover:bg-surface border border-border cursor-pointer transition-colors"
                  aria-label="Close lightbox"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Stage Image & Navigation Arrows */}
            <div className="relative flex items-center justify-center bg-background/95 min-h-[300px] max-h-[70vh] p-2 sm:p-4 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.mediaUrl}
                alt={activeItem.altText || activeItem.title || 'Gallery item preview'}
                className="max-h-[65vh] w-auto max-w-full object-contain select-none rounded-sm shadow-md"
              />

              {/* Prev Button */}
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0,
                    );
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 hover:bg-surface text-foreground border border-border backdrop-blur-xs cursor-pointer transition-all shadow-sm"
                  aria-label="Previous item"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Next Button */}
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev + 1) % filteredItems.length : 0,
                    );
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 hover:bg-surface text-foreground border border-border backdrop-blur-xs cursor-pointer transition-all shadow-sm"
                  aria-label="Next item"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Bottom Caption & Description Bar */}
            {(activeItem.description || activeItem.createdAt) && (
              <div className="px-5 py-3 border-t border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                {activeItem.description && (
                  <p className="text-xs text-muted leading-relaxed max-w-3xl">
                    {activeItem.description}
                  </p>
                )}
                {activeItem.createdAt && (
                  <span className="text-[11px] font-mono text-muted/70 whitespace-nowrap shrink-0">
                    Uploaded{' '}
                    {new Date(activeItem.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
