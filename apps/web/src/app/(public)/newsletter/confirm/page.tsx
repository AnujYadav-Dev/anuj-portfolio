'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ArrowRight,
  Home,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { apiClient, ApiClientError } from '@/lib/api';
import { useNewsletterMutation } from '@/hooks/useInteractions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');
  const [email, setEmail] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');

  const newsletterMutation = useNewsletterMutation();
  const verificationAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation token. Please check the link from your email.');
      return;
    }

    if (verificationAttemptedRef.current === token) return;
    verificationAttemptedRef.current = token;

    async function verify() {
      try {
        const res = await apiClient.get<{ data: { message: string; email?: string } }>(
          `/newsletter/confirm`,
          { params: { token: token! } },
        );
        setStatus('success');
        setMessage(res?.data?.message || 'Your subscription is confirmed!');
        if (res?.data?.email) setEmail(res.data.email);
      } catch (err: unknown) {
        setStatus('error');
        if (err instanceof ApiClientError) {
          setMessage(err.message);
        } else if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage('Invalid or expired confirmation link.');
        }
      }
    }

    verify();
  }, [token]);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    newsletterMutation.mutate(
      { email: resendEmail.trim() },
      {
        onSuccess: () => {
          setResendEmail('');
        },
      },
    );
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16">
      {/* Background glow effects matching portfolio system */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        <div className="w-[350px] h-[350px] bg-accent/5 rounded-full blur-3xl translate-y-12" />
      </div>

      <div className="relative w-full max-w-lg">
        {status === 'loading' && (
          <Card className="bg-surface border-border p-8 sm:p-10 text-center flex flex-col items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Confirming Subscription
              </h1>
              <p className="text-xs text-muted">
                Please wait while we verify your confirmation token...
              </p>
            </div>
          </Card>
        )}

        {status === 'success' && (
          <Card className="bg-surface border-border p-8 sm:p-10 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent shadow-lg shadow-accent/5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs font-mono text-accent uppercase tracking-wider mb-1">
                Subscription Confirmed
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Welcome to Engineering Dispatch!
              </h1>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                {email ? (
                  <>
                    <strong className="text-foreground font-semibold">{email}</strong> has been
                    successfully verified. You will now receive all technical deep dives and
                    platform updates.
                  </>
                ) : (
                  message
                )}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              <Link
                href="/blogs"
                className={cn(
                  buttonVariants({ variant: 'primary', size: 'sm' }),
                  'flex items-center gap-1.5',
                )}
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Latest Articles</span>
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'flex items-center gap-1.5',
                )}
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </Card>
        )}

        {status === 'error' && (
          <Card className="bg-surface border-border p-6 sm:p-8 text-center flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Verification Failed
              </h1>
              <p className="text-xs text-destructive leading-relaxed max-w-sm mx-auto">{message}</p>
            </div>

            {/* Reusing standard system newsletter subscription box */}
            <div className="w-full pt-4 border-t border-border text-left">
              <span className="text-xs font-mono font-semibold capitalize text-foreground flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Request a New Confirmation Link</span>
              </span>
              <p className="text-xs text-muted leading-relaxed mb-3">
                Enter your email address to receive a fresh verification link.
              </p>

              <form onSubmit={handleResend} className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="developer@example.com"
                  aria-label="Email address for newsletter confirmation"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="h-9 text-xs bg-surface"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={newsletterMutation.isPending}
                  className="h-9 px-4 shrink-0"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Resend</span>
                </Button>
              </form>
            </div>

            <div className="pt-1">
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
              >
                Back to Newsletter Page <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
