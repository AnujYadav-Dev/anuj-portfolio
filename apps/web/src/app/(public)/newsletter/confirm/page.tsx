'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight, Home, BookOpen } from 'lucide-react';
import { apiClient, ApiClientError } from '@/lib/api';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');
  const [email, setEmail] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation token. Please check the link from your email.');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const res = await apiClient.get<{ data: { message: string; email?: string } }>(
          `/newsletter/confirm`,
          { params: { token } },
        );
        if (isMounted) {
          setStatus('success');
          setMessage(res.data.message || 'Your subscription is confirmed!');
          if (res.data.email) setEmail(res.data.email);
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          if (err instanceof ApiClientError) {
            setMessage(err.message);
          } else {
            setMessage('Invalid or expired confirmation link.');
          }
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    try {
      await apiClient.post('/newsletter/subscribe', { email: resendEmail });
      setResendSuccess(true);
    } catch {
      // Ignored - still show feedback
      setResendSuccess(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl translate-y-12" />
      </div>

      <div className="relative w-full max-w-lg bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl text-center">
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Confirming Subscription
              </h1>
              <p className="text-sm text-zinc-400">
                Please wait while we verify your confirmation token...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                Subscription Confirmed
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Welcome to Engineering Dispatch!
              </h1>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                {email ? (
                  <>
                    <strong className="text-zinc-200">{email}</strong> has been successfully
                    verified. You will now receive all technical deep dives and platform updates.
                  </>
                ) : (
                  message
                )}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/blogs"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <BookOpen className="w-4 h-4" />
                Read Latest Articles
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/50 font-medium text-sm transition-all"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Verification Failed
              </h1>
              <p className="text-sm text-rose-300/90 leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>

            {!resendSuccess ? (
              <form onSubmit={handleResend} className="mt-6 pt-4 border-t border-zinc-800 space-y-3">
                <p className="text-xs text-zinc-400">Enter your email to request a new confirmation link:</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resending}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5"
                  >
                    {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                If the email is eligible, a new confirmation link has been sent!
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Back to Newsletter Page <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
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
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
