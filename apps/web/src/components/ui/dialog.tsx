'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type DialogSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | 'full'
  | 'default';

export const DIALOG_SIZES: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[96vw]',
  default: 'max-w-2xl',
};

interface DialogContextValue {
  isOpen: boolean;
  onClose: () => void;
  size?: DialogSize;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

export interface DialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: DialogSize;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, open, onOpenChange, size, children }: DialogProps) {
  const activeOpen = open !== undefined ? open : Boolean(isOpen);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleClose = React.useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeOpen) {
        handleClose();
      }

      if (e.key === 'Tab' && activeOpen && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length > 0) {
          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
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
    <DialogContext.Provider value={{ isOpen: activeOpen, onClose: handleClose, size }}>
      <div className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
        {/* Dialog Centering Frame */}
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          className="relative z-modal w-full flex items-center justify-center pointer-events-auto"
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>,
    document.body,
  );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: DialogSize;
  showClose?: boolean;
  resizable?: boolean;
  expandable?: boolean;
  minWidth?: number;
  maxWidth?: number;
}

export function DialogContent({
  className,
  children,
  size,
  showClose = true,
  resizable = true,
  expandable = true,
  minWidth,
  maxWidth,
  style,
  ...props
}: DialogContentProps) {
  const context = React.useContext(DialogContext);
  const effectiveSize = size || context?.size;

  const contentRef = React.useRef<HTMLDivElement>(null);
  const [customWidth, setCustomWidth] = React.useState<number | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);

  // Resize drag handling using PointerEvents with symmetrical tracking
  const handlePointerDown = React.useCallback(
    (direction: 'right' | 'left') => (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable) return;
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startRect = contentRef.current?.getBoundingClientRect();
      const initialWidth = startRect ? startRect.width : 500;
      setIsResizing(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const multiplier = direction === 'right' ? 2 : -2;
        const rawWidth = initialWidth + deltaX * multiplier;

        // Dynamic boundaries based on actual current viewport
        const viewportMaxWidth =
          typeof window !== 'undefined' ? window.innerWidth - 32 : 1440;
        const lowerBound = minWidth ?? Math.min(300, viewportMaxWidth);
        const upperBound = maxWidth ?? viewportMaxWidth;

        const clampedWidth = Math.min(Math.max(rawWidth, lowerBound), upperBound);
        setCustomWidth(clampedWidth);
        setIsExpanded(false);
      };

      const handlePointerUp = (upEvent: PointerEvent) => {
        setIsResizing(false);
        try {
          (e.target as HTMLElement).releasePointerCapture(upEvent.pointerId);
        } catch {
          // ignore
        }
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [resizable, minWidth, maxWidth],
  );

  const handleResetWidth = React.useCallback(() => {
    setCustomWidth(null);
    setIsExpanded(false);
  }, []);

  const handleToggleExpand = React.useCallback(() => {
    setCustomWidth(null);
    setIsExpanded((prev) => !prev);
  }, []);

  // Determine whether className already has custom max-w-* class
  const hasCustomMaxWidth = className && /\bmax-w-\S+/.test(className);

  // Clean conflicting max-w-* classes when dynamic sizing (expanded or manual resize) is active
  const isCustomSized = isExpanded || customWidth !== null;
  const filteredClassName =
    isCustomSized && className
      ? className.replace(/\bmax-w-\S+/g, '').trim()
      : className;

  // Compute sizing class for default un-resized state
  const sizeClass = isExpanded
    ? 'max-w-[96vw]'
    : customWidth !== null
      ? ''
      : effectiveSize
        ? DIALOG_SIZES[effectiveSize]
        : hasCustomMaxWidth
          ? ''
          : 'max-w-2xl';

  return (
    <div
      ref={contentRef}
      style={{
        ...style,
        width: isExpanded
          ? 'calc(100vw - 2rem)'
          : customWidth !== null
            ? `${customWidth}px`
            : undefined,
        maxWidth: isExpanded
          ? 'calc(100vw - 2rem)'
          : customWidth !== null
            ? 'calc(100vw - 2rem)'
            : undefined,
      }}
      className={cn(
        'relative w-full bg-surface border border-border rounded-lg shadow-2xl p-6 text-foreground',
        'animate-in fade-in zoom-in-95 duration-fast',
        'max-h-[90vh] flex flex-col',
        sizeClass,
        isResizing && 'select-none transition-none',
        filteredClassName,
      )}
      {...props}
    >
      {/* Top Header Action Buttons (Expand & Close) */}
      <div className="absolute top-6 right-10 flex items-center gap-1.5 z-30">
        {expandable && (
          <button
            type="button"
            onClick={handleToggleExpand}
            className="text-muted hover:text-foreground hover:bg-surface-muted/80 hover:shadow-xs active:scale-90 active:bg-surface-muted transition-all duration-150 p-1.5 rounded-md cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
            aria-label={isExpanded ? 'Restore dialog width' : 'Maximize dialog width'}
            title={isExpanded ? 'Restore standard width' : 'Expand wide mode'}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        )}

        {showClose && context && (
          <button
            type="button"
            onClick={context.onClose}
            className="text-muted hover:text-foreground hover:bg-surface-muted/80 hover:shadow-xs active:scale-90 active:bg-surface-muted transition-all duration-150 p-1.5 rounded-md cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
            aria-label="Close dialog"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content with separate scroll gutter away from controls */}
      <div className="w-full flex-1 overflow-y-auto min-h-0 pr-2 -mr-1 custom-scrollbar">
        {children}
      </div>

      {/* Interactive Bottom Corner Resize Grips */}
      {resizable && (
        <>
          {/* Right Corner Resize Grip */}
          <div
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            onPointerDown={handlePointerDown('right')}
            onDoubleClick={handleResetWidth}
            title="Drag to resize dialog width (Double-click to reset)"
            className={cn(
              'absolute bottom-0 right-0 w-6 h-6 cursor-ew-resize flex items-end justify-end p-1.5 z-20 select-none opacity-40 hover:opacity-100 transition-opacity',
              isResizing && 'opacity-100 text-accent',
            )}
          >
            <svg
              className="w-3 h-3 text-muted hover:text-accent pointer-events-none"
              viewBox="0 0 12 12"
              fill="currentColor"
            >
              <circle cx="10" cy="10" r="1.2" />
              <circle cx="6" cy="10" r="1.2" />
              <circle cx="10" cy="6" r="1.2" />
              <circle cx="2" cy="10" r="1.2" />
              <circle cx="6" cy="6" r="1.2" />
              <circle cx="10" cy="2" r="1.2" />
            </svg>
          </div>

          {/* Left Corner Resize Grip */}
          <div
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            onPointerDown={handlePointerDown('left')}
            onDoubleClick={handleResetWidth}
            title="Drag to resize dialog width (Double-click to reset)"
            className={cn(
              'absolute bottom-0 left-0 w-6 h-6 cursor-ew-resize flex items-end justify-start p-1.5 z-20 select-none opacity-40 hover:opacity-100 transition-opacity',
              isResizing && 'opacity-100 text-accent',
            )}
          >
            <svg
              className="w-3 h-3 text-muted hover:text-accent pointer-events-none rotate-90"
              viewBox="0 0 12 12"
              fill="currentColor"
            >
              <circle cx="10" cy="10" r="1.2" />
              <circle cx="6" cy="10" r="1.2" />
              <circle cx="10" cy="6" r="1.2" />
              <circle cx="2" cy="10" r="1.2" />
              <circle cx="6" cy="6" r="1.2" />
              <circle cx="10" cy="2" r="1.2" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4 shrink-0 pr-16', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-base sm:text-lg font-bold tracking-tight text-foreground pr-2', className)}
      {...props}
    />
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
        'flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border shrink-0',
        className,
      )}
      {...props}
    />
  );
}
