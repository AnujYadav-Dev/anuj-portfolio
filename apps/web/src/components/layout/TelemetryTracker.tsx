'use client';

import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';

export function TelemetryTracker() {
  useAnalyticsTracker();
  return null;
}
