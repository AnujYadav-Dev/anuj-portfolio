'use client';

import * as React from 'react';
import { Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Dialog } from '@/components/ui/dialog';

export interface ZoomableImageProps {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
}

export function ZoomableImage({ src, alt = '', caption, className }: ZoomableImageProps) {
  const [isZoomed, setIsZoomed] = React.useState(false);

  return (
    <>
      <figure className={cn('my-6 group flex flex-col items-center', className)}>
        <div
          onClick={() => setIsZoomed(true)}
          className="relative overflow-hidden rounded-md border border-border bg-surface-muted cursor-zoom-in group-hover:border-muted transition-colors max-w-full"
        >
          <img
            src={src}
            alt={alt || caption || ''}
            className="w-full h-auto object-cover max-h-[500px] transition-transform duration-normal group-hover:scale-[1.01]"
          />
          <div className="absolute top-2 right-2 p-1.5 rounded-xs bg-background/80 text-muted opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
            <Maximize2 className="h-3.5 w-3.5" />
          </div>
        </div>
        {caption && (
          <figcaption className="mt-2 text-center text-xs text-muted italic font-mono">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Dialog */}
      <Dialog isOpen={isZoomed} onClose={() => setIsZoomed(false)}>
        <div className="relative flex flex-col items-center max-w-4xl w-full p-2">
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute -top-10 right-0 p-1.5 rounded-full bg-surface text-muted hover:text-foreground border border-border cursor-pointer transition-colors"
            aria-label="Close zoom preview"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={src}
            alt={alt || caption || ''}
            className="w-auto h-auto max-h-[85vh] max-w-full rounded-md object-contain border border-border shadow-2xl"
          />
          {caption && (
            <p className="mt-3 text-center text-xs text-muted font-mono bg-surface/80 px-3 py-1 rounded-sm border border-border">
              {caption}
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
}
