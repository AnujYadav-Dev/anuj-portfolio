'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('Successfully authenticated. Welcome back!');
      router.replace(redirectTarget);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please check your credentials.';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Title Watermark */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-muted border border-border mb-3 text-accent shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          ANUJ<span className="text-accent">.Y</span> CMS
        </h1>
        <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">
          Administrative Control Center
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-border bg-surface shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-foreground">
            Sign In to Dashboard
          </CardTitle>
          <CardDescription className="text-xs text-muted">
            Enter your superadmin credentials to manage content and platform telemetry.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted" />
                <span>Email Address</span>
              </label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                className="bg-background text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted" />
                <span>Password</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="bg-background text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-xs font-semibold mt-2"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Authenticate & Enter
            </Button>
          </form>

          {/* Helper hint */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-[11px] text-placeholder font-mono">
              Protected by HS256 JWT Token Rotation & IP Telemetry.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
