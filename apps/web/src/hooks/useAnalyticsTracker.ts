'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api';

const SESSION_KEY = 'portfolio_session_id';

function generateClientSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function useAnalyticsTracker() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  // Initialize session
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let currentSessionId = localStorage.getItem(SESSION_KEY);
    if (!currentSessionId) {
      currentSessionId = generateClientSessionId();
      localStorage.setItem(SESSION_KEY, currentSessionId);
    }
    setSessionId(currentSessionId);

    // Register session on backend
    apiClient
      .post('/analytics/session', {
        sessionId: currentSessionId,
        referrer: document.referrer || undefined,
        language: navigator.language || undefined,
        screenWidth: window.screen.width > 0 ? window.screen.width : undefined,
        screenHeight: window.screen.height > 0 ? window.screen.height : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
      })
      .catch(() => {
        // Fail silently for telemetry
      });
  }, []);

  // Track page view on route change
  React.useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;

    apiClient
      .post('/analytics/view', {
        sessionId,
        path: pathname,
        title: document.title || undefined,
        referrer: document.referrer || undefined,
      })
      .catch(() => {
        // Fail silently for telemetry
      });
  }, [pathname, sessionId]);

  const trackClick = React.useCallback(
    (targetUrl: string, targetType: string = 'outbound_link', label?: string) => {
      if (!sessionId) return;

      apiClient
        .post('/analytics/click', {
          sessionId,
          sourcePath: pathname,
          targetUrl,
          targetType,
          label: label || undefined,
        })
        .catch(() => {
          // Fail silently for telemetry
        });
    },
    [pathname, sessionId],
  );


  return { sessionId, trackClick };
}
