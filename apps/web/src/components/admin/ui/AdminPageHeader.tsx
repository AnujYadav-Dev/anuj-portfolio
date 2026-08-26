'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { useRouter } from 'next/navigation';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  action,
  children,
}: AdminPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 pb-6 border-b border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backHref && (
          <button
            type="button"
            onClick={() => (backHref === 'back' ? router.back() : router.push(backHref))}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-xs text-muted mt-1">{description}</p>}
      </div>

      {(action || children) && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}
