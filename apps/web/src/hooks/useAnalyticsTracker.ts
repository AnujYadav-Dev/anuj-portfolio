'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ClickTargetType } from '@portfolio/shared';
import { apiClient } from '@/lib/api';

const SESSION_KEY = 'portfolio_session_id';
const ADMIN_IGNORE_KEY = 'portfolio_admin_ignore';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function generateClientSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
} {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || undefined;
    const utmMedium = params.get('utm_medium') || undefined;
    const utmCampaign = params.get('utm_campaign') || undefined;
    const utmTerm = params.get('utm_term') || undefined;
    const utmContent = params.get('utm_content') || undefined;

    return { utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
  } catch {
    return {};
  }
}

function getPageLoadTimeMs(): number | undefined {
  if (typeof window === 'undefined' || !window.performance) return undefined;
  try {
    const navEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && navEntries[0]) {
      const loadTime = Math.round(navEntries[0].duration || (navEntries[0].loadEventEnd - navEntries[0].startTime));
      if (loadTime > 0 && loadTime < 60000) return loadTime;
    }
  } catch {
    // Ignore performance timing errors
  }
  return undefined;
}

function shouldIgnoreTelemetry(): boolean {
  if (typeof window === 'undefined') return true;
  // Ignore admin traffic if set or if visiting admin dashboard
  if (localStorage.getItem(ADMIN_IGNORE_KEY) === 'true') return true;
  if (localStorage.getItem('access_token') && window.location.pathname.startsWith('/admin')) {
    return true;
  }
  return false;
}

function sendBeaconData(url: string, data: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Fail silently on beacon dispatch
  }
}

export function useAnalyticsTracker() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const activePathRef = React.useRef<string>(pathname);
  const lastRecordedPathRef = React.useRef<string | null>(null);
  const pageEnterTimeRef = React.useRef<number>(0);
  const maxScrollDepthRef = React.useRef<number>(0);

  // Initialize or retrieve Session ID
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (shouldIgnoreTelemetry()) return;

    let currentSessionId = localStorage.getItem(SESSION_KEY);
    if (!currentSessionId) {
      currentSessionId = generateClientSessionId();
      localStorage.setItem(SESSION_KEY, currentSessionId);
    }
    setSessionId(currentSessionId);

    const utms = getUtmParams();

    // Register session on backend
    apiClient
      .post('/analytics/session', {
        sessionId: currentSessionId,
        referrer: document.referrer || undefined,
        language: navigator.language || undefined,
        screenWidth: window.screen?.width > 0 ? window.screen.width : undefined,
        screenHeight: window.screen?.height > 0 ? window.screen.height : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
        ...utms,
      })
      .catch(() => {
        // Fail silently for telemetry
      });
  }, []);

  // Flush page dwell beacon
  const flushPageDwell = React.useCallback(
    (targetPath: string) => {
      if (!sessionId || shouldIgnoreTelemetry()) return;
      const durationSeconds =
        pageEnterTimeRef.current > 0
          ? Math.max(1, Math.min(86400, Math.round((Date.now() - pageEnterTimeRef.current) / 1000)))
          : 1;
      const scrollDepth = maxScrollDepthRef.current;

      sendBeaconData(`${API_BASE_URL}/analytics/beacon`, {
        sessionId,
        path: targetPath,
        durationSeconds,
        scrollDepth: scrollDepth > 0 ? scrollDepth : undefined,
      });
    },
    [sessionId],
  );

  // Scroll depth tracking
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    maxScrollDepthRef.current = 0;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        maxScrollDepthRef.current = 100;
        return;
      }
      const scrollY = window.scrollY || window.pageYOffset;
      const percent = Math.min(100, Math.max(0, Math.round((scrollY / docHeight) * 100)));
      if (percent > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = percent;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case page is short
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  // Track page view and handle page transitions
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (shouldIgnoreTelemetry()) return;

    // If transitioning from a previous path, flush duration of previous page
    if (activePathRef.current && activePathRef.current !== pathname && sessionId) {
      flushPageDwell(activePathRef.current);
    }

    activePathRef.current = pathname;
    pageEnterTimeRef.current = Date.now();
    maxScrollDepthRef.current = 0;

    const currentSession = sessionId || localStorage.getItem(SESSION_KEY);
    if (!currentSession) return;

    if (lastRecordedPathRef.current === pathname) return;
    lastRecordedPathRef.current = pathname;

    const loadTimeMs = getPageLoadTimeMs();

    // Record route view hit
    apiClient
      .post('/analytics/view', {
        sessionId: currentSession,
        path: pathname,
        title: document.title || undefined,
        referrer: document.referrer || undefined,
        loadTimeMs,
      })
      .catch(() => {
        // Fail silently for telemetry
      });
  }, [pathname, sessionId, flushPageDwell]);

  // Window unload / hide listener to flush final dwell time
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && activePathRef.current) {
        flushPageDwell(activePathRef.current);
      }
    };

    const handleBeforeUnload = () => {
      if (activePathRef.current) {
        flushPageDwell(activePathRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushPageDwell]);

  // Programmatic and delegated click telemetry helper
  const trackClick = React.useCallback(
    (targetUrl: string, targetType: ClickTargetType = ClickTargetType.External, label?: string) => {
      if (shouldIgnoreTelemetry()) return;
      const currentSession = sessionId || (typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null);

      apiClient
        .post('/analytics/click', {
          sessionId: currentSession || undefined,
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
