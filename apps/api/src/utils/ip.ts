import type { Request } from 'express';

/** Extract client IP address from request, accounting for reverse proxies. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  if (req.ip) {
    return req.ip.replace(/^::ffff:/, '');
  }

  return '127.0.0.1';
}

/** Parse referrer URL into a human-readable source label. */
export function parseReferrerSource(referrer: string | undefined): string | null {
  if (!referrer) {
    return 'direct';
  }

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();

    if (hostname.includes('google')) return 'google';
    if (hostname.includes('twitter') || hostname.includes('t.co') || hostname.includes('x.com')) {
      return 'twitter';
    }
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('github')) return 'github';
    if (hostname.includes('facebook')) return 'facebook';
    if (hostname.includes('reddit')) return 'reddit';

    return hostname;
  } catch {
    return 'unknown';
  }
}

/** Normalize IP for PostgreSQL INET column (strip IPv6-mapped prefix). */
export function normalizeIpForDb(ip: string): string {
  return ip.replace(/^::ffff:/, '');
}
