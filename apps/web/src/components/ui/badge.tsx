import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[11px] font-mono font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-surface-muted text-muted border border-border',
        accent:
          'bg-accent/15 text-accent border border-accent/30',
        outline:
          'border border-border text-foreground bg-transparent',
        muted:
          'bg-surface-muted text-muted',
        success:
          'bg-success/15 text-success border border-success/30',
        warning:
          'bg-warning/15 text-warning border border-warning/30',
        destructive:
          'bg-destructive/15 text-destructive border border-destructive/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
