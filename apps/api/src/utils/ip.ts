import type { Request } from 'express';

/** Extract client IP address from request, accounting for reverse proxies. */
export function getClientIp(req: Request): string {
  // 1. Cloudflare header
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim().length > 0) {
    return normalizeIpForDb(cfIp.trim());
  }

  // 2. Standard X-Real-IP
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim().length > 0) {
    return normalizeIpForDb(realIp.trim());
  }

  // 3. Fastly / Akamai True-Client-IP
  const trueClientIp = req.headers['true-client-ip'] || req.headers['fastly-client-ip'];
  if (typeof trueClientIp === 'string' && trueClientIp.trim().length > 0) {
    return normalizeIpForDb(trueClientIp.trim());
  }

  // 4. Standard X-Forwarded-For (first IP is the client)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return normalizeIpForDb(first);
    }
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    const first = forwarded[0]?.split(',')[0]?.trim();
    if (first) {
      return normalizeIpForDb(first);
    }
  }

  // 5. Direct socket IP
  if (req.ip) {
    return normalizeIpForDb(req.ip);
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

/** Normalize IP for PostgreSQL INET column (strip IPv6-mapped prefix and optional port). */
export function normalizeIpForDb(ip: string): string {
  let clean = ip.replace(/^::ffff:/, '').trim();
  const ipv6WithPort = clean.match(/^\[([a-fA-F0-9:]+)\](?::\d+)?$/);
  if (ipv6WithPort && ipv6WithPort[1]) {
    return ipv6WithPort[1];
  }
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(clean)) {
    clean = clean.split(':')[0]!;
  }
  return clean;
}
