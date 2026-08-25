'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={(theme as 'light' | 'dark' | 'system') || 'dark'}
      position="bottom-right"
      toastOptions={{
        className:
          'bg-surface text-foreground border border-border shadow-lg rounded-md font-sans text-xs',
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-foreground)',
          borderColor: 'var(--color-border)',
        },
      }}
    />
  );
}
