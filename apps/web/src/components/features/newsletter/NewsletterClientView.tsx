'use client';

import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Send } from 'lucide-react';
import { useNewsletterMutation } from '@/hooks/useInteractions';

export function NewsletterClientView() {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(false);

  const newsletterMutation = useNewsletterMutation();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    newsletterMutation.mutate(
      { email, name: name || undefined },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setEmail('');
          setName('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        badge="DIGITAL DISPATCH & ESSAYS"
        title="Engineering Newsletter"
        description="A periodic newsletter on distributed systems, modern web engineering, architecture decisions, and developer tooling."
      />

      <div className="py-12">
        <div className="max-w-[720px] mx-auto px-4 md:px-8">
          {isSuccess ? (
            <Card className="bg-surface border-border p-8 text-center flex flex-col items-center gap-4">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <h3 className="text-lg font-bold text-foreground">You&apos;re on the list!</h3>
              <p className="text-xs text-muted max-w-md leading-relaxed">
                Thank you for subscribing. You will receive new essays, case studies, and
                engineering breakdowns directly to your inbox. Zero spam, unsubscribe anytime.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSuccess(false)}
                className="mt-2"
              >
                Subscribe Another Email
              </Button>
            </Card>
          ) : (
            <Card className="bg-surface border-border p-6 sm:p-8">
              <CardHeader className="p-0 pb-6">
                <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5" /> No Spam. High Signal.
                </span>
                <CardTitle>Stay in the loop</CardTitle>
                <CardDescription>
                  Get monthly engineering essays, release notes, and deep architectural breakdowns
                  delivered straight to your inbox.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                  <Input
                    label="Name (Optional)"
                    placeholder="e.g. Satoshi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="satoshi@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full sm:w-auto"
                      isLoading={newsletterMutation.isPending}
                      rightIcon={<Send className="h-3.5 w-3.5" />}
                    >
                      Subscribe to Newsletter
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
