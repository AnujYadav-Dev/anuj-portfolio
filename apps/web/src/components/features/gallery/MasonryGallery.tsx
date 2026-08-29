'use client';

import * as React from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export interface MasonryGalleryItem {
  id: string;
  url: string;
  title?: string | null;
  caption?: string | null;
  category?: string | null;
  altText?: string | null;
  createdAt?: string | null;
}

export interface MasonryGalleryProps {
  items: MasonryGalleryItem[];
  columnsClassName?: string;
  emptyMessage?: string;
  className?: string;
}

export function MasonryGallery({
  items,
  columnsClassName = 'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6',
  emptyMessage = 'No visual items available in this gallery.',
  className,
}: MasonryGalleryProps) {
  const [activeLightboxIndex, setActiveLightboxIndex] = React.useState<number | null>(null);

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + items.length) % items.length : 0,
        );
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActiveLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, items.length]);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center my-6">
        <ImageIcon className="w-10 h-10 text-muted mx-auto mb-3 opacity-60" />
        <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const activeItem = activeLightboxIndex !== null ? items[activeLightboxIndex] : null;

  return (
    <>
      {/* Responsive Masonry Layout */}
      <div className={cn(columnsClassName, className)}>
        {items.map((item, idx) => {
          const displayTitle = item.title;
          const displayCaption = item.caption;
          const formattedDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            : null;

          return (
            <RevealOnScroll
              key={item.id || idx}
              delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}
              className="break-inside-avoid"
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={`View ${displayTitle || displayCaption || item.altText || 'gallery item'}`}
                onClick={() => setActiveLightboxIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveLightboxIndex(idx);
                  }
                }}
                className="group relative overflow-hidden rounded-md border border-border bg-surface hover:border-accent transition-all duration-normal cursor-pointer flex flex-col shadow-xs hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {/* Media Stage */}
                <div className="relative overflow-hidden bg-surface-muted w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.altText || displayTitle || displayCaption || 'Gallery visual'}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-slow group-hover:scale-[1.015]"
                  />

                  {/* Quick Expand Icon Overlay */}
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

                {/* Clean Single Metadata Footer */}
                {(displayTitle || displayCaption || formattedDate) && (
                  <div className="px-3.5 py-2.5 flex flex-col gap-0.5 border-t border-border/60 bg-surface">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      {displayTitle ? (
                        <h3 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                          {displayTitle}
                        </h3>
                      ) : displayCaption ? (
                        <p className="text-xs font-mono font-medium text-foreground group-hover:text-accent transition-colors truncate">
                          {displayCaption}
                        </p>
                      ) : (
                        <span className="text-[10px] font-mono text-muted uppercase">Visual</span>
                      )}
                      {formattedDate && (
                        <span className="text-[10px] font-mono text-muted/70 shrink-0">
                          {formattedDate}
                        </span>
                      )}
                    </div>
                    {displayTitle && displayCaption && displayTitle !== displayCaption && (
                      <p className="text-[11px] text-muted truncate leading-normal">
                        {displayCaption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          );
        })}
      </div>

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
                <span className="text-xs font-bold text-foreground truncate font-mono">
                  {activeItem.title || activeItem.caption || 'Visual Preview'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-muted mr-2">
                  {activeLightboxIndex !== null ? activeLightboxIndex + 1 : 1} / {items.length}
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
                src={activeItem.url}
                alt={activeItem.altText || activeItem.title || activeItem.caption || 'Gallery item preview'}
                className="max-h-[65vh] w-auto max-w-full object-contain select-none rounded-sm shadow-md"
              />

              {/* Prev Button */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev - 1 + items.length) % items.length : 0,
                    );
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 hover:bg-surface text-foreground border border-border backdrop-blur-xs cursor-pointer transition-all shadow-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              {/* Next Button */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev + 1) % items.length : 0,
                    );
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 hover:bg-surface text-foreground border border-border backdrop-blur-xs cursor-pointer transition-all shadow-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Bottom Caption Bar */}
            {(activeItem.caption || activeItem.title) && (
              <div className="px-4 py-2.5 border-t border-border bg-surface-muted/30 text-center">
                <p className="text-xs text-muted font-mono leading-relaxed max-w-2xl mx-auto">
                  {activeItem.caption || activeItem.title}
                </p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
