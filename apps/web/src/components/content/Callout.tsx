import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export type CalloutType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';

export interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({
  type = 'NOTE',
  title,
  children,
  className,
}: CalloutProps) {
  const configs: Record<
    CalloutType,
    {
      icon: React.ReactNode;
      borderClass: string;
      bgClass: string;
      textClass: string;
      defaultTitle: string;
    }
  > = {
    NOTE: {
      icon: <Info className="h-4 w-4 text-accent shrink-0" />,
      borderClass: 'border-l-accent border-border',
      bgClass: 'bg-surface',
      textClass: 'text-accent',
      defaultTitle: 'Note',
    },
    TIP: {
      icon: <Lightbulb className="h-4 w-4 text-success shrink-0" />,
      borderClass: 'border-l-success border-border',
      bgClass: 'bg-surface',
      textClass: 'text-success',
      defaultTitle: 'Tip',
    },
    IMPORTANT: {
      icon: <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />,
      borderClass: 'border-l-accent border-border',
      bgClass: 'bg-surface',
      textClass: 'text-accent',
      defaultTitle: 'Important',
    },
    WARNING: {
      icon: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
      borderClass: 'border-l-warning border-border',
      bgClass: 'bg-surface',
      textClass: 'text-warning',
      defaultTitle: 'Warning',
    },
    CAUTION: {
      icon: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
      borderClass: 'border-l-destructive border-border',
      bgClass: 'bg-surface',
      textClass: 'text-destructive',
      defaultTitle: 'Caution',
    },
  };

  const config = configs[type] || configs.NOTE;

  return (
    <div
      className={cn(
        'my-4 p-4 rounded-r-md border border-l-4 text-xs',
        config.bgClass,
        config.borderClass,
        className,
      )}
    >
      <div className="flex items-center gap-2 font-semibold mb-1">
        {config.icon}
        <span className={cn('text-[11px] uppercase tracking-wider', config.textClass)}>
          {title || config.defaultTitle}
        </span>
      </div>
      <div className="text-muted leading-relaxed pl-6">{children}</div>
    </div>
  );
}
