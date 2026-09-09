import { describe, it, expect } from 'vitest';
import type { Request } from 'express';
import { getClientIp, normalizeIpForDb, parseReferrerSource } from '@/utils/ip';

describe('IP & Referrer Utilities (Unit)', () => {
  describe('normalizeIpForDb', () => {
    it('strips ::ffff: prefix from IPv4-mapped IPv6 address', () => {
      expect(normalizeIpForDb('::ffff:192.168.1.1')).toBe('192.168.1.1');
    });

    it('strips port from IPv4 address', () => {
      expect(normalizeIpForDb('203.0.113.195:44321')).toBe('203.0.113.195');
    });

    it('strips port and brackets from bracketed IPv6 address', () => {
      expect(normalizeIpForDb('[2001:db8::1]:8080')).toBe('2001:db8::1');
      expect(normalizeIpForDb('[::1]')).toBe('::1');
    });

    it('leaves standard IPv4 and IPv6 untouched', () => {
      expect(normalizeIpForDb('1.1.1.1')).toBe('1.1.1.1');
      expect(normalizeIpForDb('2606:4700:4700::1111')).toBe('2606:4700:4700::1111');
    });
  });

  describe('getClientIp', () => {
    it('prefers cf-connecting-ip header when present', () => {
      const req = {
        headers: {
          'cf-connecting-ip': '198.51.100.1',
          'x-real-ip': '10.0.0.1',
        },
      } as unknown as Request;

      expect(getClientIp(req)).toBe('198.51.100.1');
    });

    it('uses x-real-ip if cf-connecting-ip is missing', () => {
      const req = {
        headers: {
          'x-real-ip': '198.51.100.2',
        },
      } as unknown as Request;

      expect(getClientIp(req)).toBe('198.51.100.2');
    });

    it('extracts first IP from x-forwarded-for string', () => {
      const req = {
        headers: {
          'x-forwarded-for': '198.51.100.3, 10.0.0.2',
        },
      } as unknown as Request;

      expect(getClientIp(req)).toBe('198.51.100.3');
    });

    it('extracts first IP from x-forwarded-for array', () => {
      const req = {
        headers: {
          'x-forwarded-for': ['198.51.100.4, 10.0.0.3'],
        },
      } as unknown as Request;

      expect(getClientIp(req)).toBe('198.51.100.4');
    });

    it('falls back to socket ip or 127.0.0.1', () => {
      const reqWithIp = { headers: {}, ip: '127.0.0.1' } as unknown as Request;
      expect(getClientIp(reqWithIp)).toBe('127.0.0.1');

      const reqEmpty = { headers: {} } as unknown as Request;
      expect(getClientIp(reqEmpty)).toBe('127.0.0.1');
    });
  });

  describe('parseReferrerSource', () => {
    it('identifies known search and social platforms', () => {
      expect(parseReferrerSource('https://www.google.com/search?q=portfolio')).toBe('google');
      expect(parseReferrerSource('https://t.co/xyz123')).toBe('twitter');
      expect(parseReferrerSource('https://x.com/post')).toBe('twitter');
      expect(parseReferrerSource('https://www.linkedin.com/feed')).toBe('linkedin');
      expect(parseReferrerSource('https://github.com/AnujYadav-Dev')).toBe('github');
    });

    it('handles direct or missing referrer', () => {
      expect(parseReferrerSource(undefined)).toBe('direct');
      expect(parseReferrerSource('')).toBe('direct');
    });

    it('falls back to hostname for unknown referrers', () => {
      expect(parseReferrerSource('https://techcrunch.com/article')).toBe('techcrunch.com');
    });
  });
});
