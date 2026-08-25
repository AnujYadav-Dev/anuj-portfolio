'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DialogContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

export interface DialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, open, onOpenChange, children }: DialogProps) {
  const activeOpen = open !== undefined ? open : Boolean(isOpen);

  const handleClose = React.useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeOpen) {
        handleClose();
      }
    };
    if (activeOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeOpen, handleClose]);

  if (!activeOpen || typeof document === 'undefined') return null;

  return createPortal(
    <DialogContext.Provider value={{ isOpen: activeOpen, onClose: handleClose }}>
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
        {/* Dialog Frame */}
        <div className="relative z-modal w-full max-w-lg">{children}</div>
      </div>
    </DialogContext.Provider>,
    document.body,
  );
}

export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showClose?: boolean }) {
  const context = React.useContext(DialogContext);

  return (
    <div
      className={cn(
        'relative bg-surface border border-border rounded-lg shadow-xl p-6 text-foreground animate-in fade-in zoom-in-95 duration-fast',
        className,
      )}
      {...props}
    >
      {showClose && context && (
        <button
          type="button"
          onClick={context.onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors p-1 rounded-xs focus-visible:ring-1 focus-visible:ring-accent"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-lg font-bold tracking-tight text-foreground', className)} {...props} />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-muted leading-relaxed', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border',
        className,
      )}
      {...props}
    />
  );
}
