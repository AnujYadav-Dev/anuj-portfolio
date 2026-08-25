'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Clock, RefreshCw, User, KeyRound, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

export function AdminHeader() {
  const { author, secondsRemaining, renewSession, logout } = useAdminAuth();
  const [isRenewing, setIsRenewing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      await renewSession();
    } finally {
      setIsRenewing(false);
    }
  };

  const formatTime = (totalSeconds: number | null) => {
    if (totalSeconds === null) return '--:--';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining !== null && secondsRemaining < 180;

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Left: Dynamic Breadcrumbs */}
      <AdminBreadcrumbs />

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center gap-3">
        {/* Session Expiration Countdown */}
        {secondsRemaining !== null && (
          <div
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors',
              isLowTime
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : 'bg-surface-muted border-border text-muted',
            )}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Session:</span>
            <span className="font-semibold text-foreground">{formatTime(secondsRemaining)}</span>
            <button
              type="button"
              onClick={handleRenew}
              disabled={isRenewing}
              className="p-0.5 hover:text-accent rounded transition-colors"
              title="Extend Session (Refresh Token)"
            >
              <RefreshCw className={cn('w-3 h-3', isRenewing && 'animate-spin text-accent')} />
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-surface-muted rounded-md transition-colors border border-transparent hover:border-border"
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold font-mono">
              {author?.displayName ? author.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {author?.displayName || 'Admin'}
              </span>
              <span className="text-[10px] text-muted font-mono flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-accent" /> SuperAdmin
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="font-semibold text-foreground truncate">{author?.displayName}</p>
                <p className="text-[11px] text-muted font-mono truncate">{author?.email}</p>
              </div>

              <Link
                href="/admin/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <User className="w-3.5 h-3.5 text-accent" />
                <span>Account Profile</span>
              </Link>

              <Link
                href="/admin/profile#password"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-accent" />
                <span>Change Password</span>
              </Link>

              <div className="border-t border-border my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
