import { describe, it, expect } from 'vitest';
import {
  strictRateLimiter,
  analyticsRateLimiter,
  publicRateLimiter,
} from '@/middleware/rateLimit.middleware';

describe('RateLimitMiddleware (Unit)', () => {
  it('should export configured rate limiters', () => {
    expect(strictRateLimiter).toBeDefined();
    expect(analyticsRateLimiter).toBeDefined();
    expect(publicRateLimiter).toBeDefined();
    expect(typeof strictRateLimiter).toBe('function');
    expect(typeof analyticsRateLimiter).toBe('function');
    expect(typeof publicRateLimiter).toBe('function');
  });
});
