import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-foreground select-none">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-sm border border-input-border bg-input px-3 py-2 text-xs text-foreground placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error &&
              'border-destructive focus-visible:ring-destructive focus-visible:border-destructive',
            className,
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-destructive">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-muted">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
