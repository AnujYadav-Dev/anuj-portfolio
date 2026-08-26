'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({
  src,
  alt = '',
  fallbackText,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-sm',
    xl: 'h-20 w-20 text-lg',
  };

  const initials = fallbackText
    ? fallbackText
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border border-border bg-surface-muted items-center justify-center font-mono font-semibold text-muted select-none',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
