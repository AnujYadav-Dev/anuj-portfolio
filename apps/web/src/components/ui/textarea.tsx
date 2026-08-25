import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-foreground select-none"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-sm border border-input-border bg-input px-3 py-2 text-xs text-foreground placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y leading-relaxed',
            error && 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive',
            className,
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-destructive">{error}</p>}
        {!error && helperText && (
          <p className="text-[11px] text-muted">{helperText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
