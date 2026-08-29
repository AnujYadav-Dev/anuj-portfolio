'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  MailX,
  ArrowRight,
  Home,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import {
  useNewsletterUnsubscribeVerify,
  useNewsletterUnsubscribeMutation,
  useNewsletterResubscribeMutation,
} from '@/hooks/useInteractions';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { data: verifyData, isLoading: isVerifying, isError, error } = useNewsletterUnsubscribeVerify(token);
  const unsubscribeMutation = useNewsletterUnsubscribeMutation();
  const resubscribeMutation = useNewsletterResubscribeMutation();

  const [hasUnsubscribedLocally, setHasUnsubscribedLocally] = useState<boolean | null>(null);

  if (!token) {
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16">
        <Card className="bg-surface border-border p-6 sm:p-8 text-center flex flex-col items-center gap-5 max-w-lg w-full">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Missing Unsubscribe Link
            </h1>
            <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
              No verification token was found. Please make sure you clicked the complete link from your newsletter email.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
            >
              Back to Newsletter <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16">
        <Card className="bg-surface border-border p-8 sm:p-10 text-center flex flex-col items-center gap-4 max-w-lg w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Verifying Subscription
            </h1>
            <p className="text-xs text-muted">
              Please wait while we verify your unsubscribe request...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !verifyData?.data?.isValid) {
    const errorMsg = error instanceof Error ? error.message : 'Invalid or expired unsubscribe link.';
    return (
      <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16">
        <Card className="bg-surface border-border p-6 sm:p-8 text-center flex flex-col items-center gap-5 max-w-lg w-full">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Verification Failed
            </h1>
            <p className="text-xs text-destructive leading-relaxed max-w-sm mx-auto">
              {errorMsg}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              Return to Homepage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const email = verifyData.data.email;
  const isCurrentlyUnsubscribed =
    hasUnsubscribedLocally !== null
      ? hasUnsubscribedLocally
      : verifyData.data.isUnsubscribed;

  const handleConfirmUnsubscribe = () => {
    unsubscribeMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setHasUnsubscribedLocally(true);
        },
      },
    );
  };

  const handleResubscribe = () => {
    resubscribeMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setHasUnsubscribedLocally(false);
        },
      },
    );
  };

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center px-4 py-16">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {isCurrentlyUnsubscribed ? (
          <Card className="bg-surface border-border p-8 sm:p-10 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-surface-muted border border-border rounded-full text-xs font-mono text-muted uppercase tracking-wider mb-1">
                Unsubscribed
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                You Have Been Unsubscribed
              </h1>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                <strong className="text-foreground font-semibold">{email}</strong> has been removed from the newsletter dispatch list. You will no longer receive periodic updates.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResubscribe}
                isLoading={resubscribeMutation.isPending}
                className="flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-accent" />
                <span>Resubscribe / Undo</span>
              </Button>

              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'flex items-center gap-1.5',
                )}
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="bg-surface border-border p-8 sm:p-10 text-center flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
              <MailX className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-destructive/10 border border-destructive/20 rounded-full text-xs font-mono text-destructive uppercase tracking-wider mb-1">
                Confirm Unsubscribe
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Unsubscribe from Engineering Dispatch?
              </h1>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Are you sure you want to stop receiving architecture dispatches and technical articles for <strong className="text-foreground font-semibold">{email}</strong>?
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmUnsubscribe}
                isLoading={unsubscribeMutation.isPending}
                className="flex items-center gap-1.5"
              >
                <MailX className="w-4 h-4" />
                <span>Confirm Unsubscribe</span>
              </Button>

              <Link
                href="/blogs"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'flex items-center gap-1.5',
                )}
              >
                <BookOpen className="w-4 h-4" />
                <span>Keep Reading Articles</span>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
