'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function Popover({ trigger, children, align = 'left', className }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 z-dropdown min-w-[180px] bg-surface border border-border rounded-md shadow-lg p-2 text-foreground animate-in fade-in zoom-in-95 duration-fast',
            alignmentClasses[align],
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  className,
  onClick,
  children,
  disabled = false,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted hover:text-accent rounded-xs transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}
