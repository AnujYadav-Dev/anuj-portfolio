'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('border-b border-border transition-colors duration-fast', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left font-semibold text-sm text-foreground hover:text-accent transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted transition-transform duration-fast',
            isOpen && 'rotate-180 text-accent',
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4 pt-1 text-xs text-muted leading-relaxed animate-in fade-in slide-in-from-top-1 duration-fast">
          {children}
        </div>
      )}
    </div>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col border-t border-border w-full', className)}>{children}</div>
  );
}
