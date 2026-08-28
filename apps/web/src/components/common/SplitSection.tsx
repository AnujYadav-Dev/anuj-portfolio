import * as React from 'react';
import { cn } from '@/lib/cn';

export interface SplitSectionProps {
  labelNumber?: string;
  labelTitle: React.ReactNode;
  labelSubtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SplitSection({
  labelNumber,
  labelTitle,
  labelSubtitle,
  children,
  className,
  id,
}: SplitSectionProps) {
  return (
    <section id={id} className={cn('py-16 md:py-24 border-b border-border', className)}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Label */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 flex flex-col gap-2">
              {labelNumber && (
                <span className="text-xs font-mono text-accent uppercase tracking-wider">
                  {labelNumber}
                </span>
              )}
              <h2 className="text-lg font-bold tracking-tight text-foreground leading-snug">{labelTitle}</h2>
              {labelSubtitle && (
                <p className="text-xs text-muted leading-relaxed">{labelSubtitle}</p>
              )}
            </div>
          </div>

          {/* Right Column: Content Stream */}
          <div className="lg:col-span-9">{children}</div>
        </div>
      </div>
    </section>
  );
}
