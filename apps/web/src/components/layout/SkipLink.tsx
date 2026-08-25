import * as React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:font-semibold focus:rounded-sm focus:shadow-lg focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
