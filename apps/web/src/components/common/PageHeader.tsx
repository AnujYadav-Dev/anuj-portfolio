import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ badge, title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('py-12 md:py-16 border-b border-border bg-background', className)}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <RevealOnScroll>
          <div className="flex flex-col gap-3 max-w-3xl">
            {badge && (
              <div>
                <Badge variant="accent" size="sm">
                  {badge}
                </Badge>
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}
            {children && <div className="pt-2">{children}</div>}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
