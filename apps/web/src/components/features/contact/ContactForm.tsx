'use client';

import * as React from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useContactMutation } from '@/hooks/useInteractions';

export function ContactForm() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSuccess, setIsSuccess] = React.useState(false);

  const contactMutation = useContactMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    contactMutation.mutate(
      { name, email, subject: subject || undefined, message },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        },
      },
    );
  };

  if (isSuccess) {
    return (
      <Card className="bg-surface border-border p-8 text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="text-lg font-bold text-foreground">
          Message Sent Successfully!
        </h3>
        <p className="text-xs text-muted max-w-md leading-relaxed">
          Thank you for reaching out. I have received your dispatch and will review and respond as soon as possible.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSuccess(false)}
          className="mt-2"
        >
          Send Another Message
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle>Send an Inquiry</CardTitle>
        <CardDescription>
          Fill in the details below. All submissions are encrypted and routed directly to my priority inbox.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name *"
              placeholder="e.g. Satoshi Nakamoto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="satoshi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Input
            label="Subject"
            placeholder="e.g. Distributed System Architecture Consultation"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Textarea
            label="Message *"
            placeholder="Describe your project, timeline, scope, or inquiry in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              isLoading={contactMutation.isPending}
              rightIcon={<Send className="h-3.5 w-3.5" />}
            >
              Submit Message
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
