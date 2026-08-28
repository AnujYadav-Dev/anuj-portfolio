'use client';

import * as React from 'react';

const CLICK_THRESHOLD = 10;
const RESET_DELAY_MS = 800;

/**
 * Disables and removes all loaded website stylesheets using native browser DOM APIs.
 * Also installs a MutationObserver to strip any dynamically injected styles during client transitions.
 */
export function disableAllStylesheets(): void {
  if (typeof document === 'undefined') return;

  // 1. Disable all document.styleSheets via CSSOM
  try {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        sheet.disabled = true;
      } catch {
        // Ignore cross-origin stylesheet access restrictions
      }
    }
  } catch {
    // Gracefully ignore stylesheet access errors
  }

  // 2. Disable and remove all link[rel="stylesheet"] tags
  try {
    const linkElements = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
    linkElements.forEach((link) => {
      try {
        link.disabled = true;
      } catch {
        // Ignore if disabled property throws
      }
      link.remove();
    });
  } catch {
    // Gracefully handle DOM removal errors
  }

  // 3. Disable and remove all <style> tags
  try {
    const styleElements = document.querySelectorAll<HTMLStyleElement>('style');
    styleElements.forEach((style) => {
      try {
        if (style.sheet) {
          style.sheet.disabled = true;
        }
      } catch {
        // Ignore sheet access errors
      }
      try {
        (style as unknown as { disabled?: boolean }).disabled = true;
      } catch {
        // Ignore if disabled property throws
      }
      style.remove();
    });
  } catch {
    // Gracefully handle DOM removal errors
  }

  // 4. Observe DOM to remove newly injected stylesheets during client-side navigation
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (
              node.tagName === 'STYLE' ||
              (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet')
            ) {
              const el = node as HTMLElement & { disabled?: boolean; sheet?: CSSStyleSheet };
              try {
                if (el.sheet) {
                  el.sheet.disabled = true;
                }
              } catch {
                // Ignore sheet access errors
              }
              try {
                el.disabled = true;
              } catch {
                // Ignore if disabled property throws
              }
              el.remove();
            }
          }
        });
      }
    });

    if (document.head) {
      observer.observe(document.head, { childList: true, subtree: true });
    }
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

/**
 * Custom hook that tracks rapid clicks on theme triggers.
 * Once 10 rapid clicks occur without significant pause (>= 800ms),
 * it activates the unstyled website Easter egg.
 */
export function useEasterEggTrigger() {
  const clickCountRef = React.useRef(0);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerClick = React.useCallback((onAction?: () => void) => {
    // 1. Always execute the caller's action immediately (e.g. setTheme)
    if (onAction) {
      onAction();
    }

    // 2. Increment rapid click counter
    clickCountRef.current += 1;

    // 3. Reset existing timeout
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // 4. Check if Easter egg threshold is reached
    if (clickCountRef.current >= CLICK_THRESHOLD) {
      disableAllStylesheets();
      clickCountRef.current = 0;
    } else {
      // 5. Reset count if user pauses longer than RESET_DELAY_MS
      resetTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, RESET_DELAY_MS);
    }
  }, []);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return { registerClick };
}
