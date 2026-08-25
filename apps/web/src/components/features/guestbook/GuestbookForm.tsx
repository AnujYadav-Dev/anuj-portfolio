'use client';

import * as React from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useGuestbookMutation } from '@/hooks/useInteractions';

export function GuestbookForm() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');

  const guestbookMutation = useGuestbookMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    guestbookMutation.mutate(
      { authorName: name, authorEmail: email || undefined, message },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
          setMessage('');
        },
      },
    );
  };

  const characterCount = message.length;
  const maxCharacters = 500;

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-4 w-4 text-accent" />
          <CardTitle>Sign the Community Guestbook</CardTitle>
        </div>
        <CardDescription>
          Leave a friendly note, greeting, or feedback. Entries appear publicly once moderated.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name / Handle *"
              placeholder="e.g. Satoshi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email (Optional / Private)"
              type="email"
              placeholder="satoshi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="Never shown publicly."
            />
          </div>

          <div className="relative">
            <Textarea
              label="Message *"
              placeholder="Write a greeting, impression, or message..."
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= maxCharacters) {
                  setMessage(e.target.value);
                }
              }}
              rows={3}
              required
            />
            <span className="absolute right-3 bottom-2 text-[10px] font-mono text-placeholder">
              {characterCount} / {maxCharacters}
            </span>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={guestbookMutation.isPending}
              rightIcon={<Send className="h-3.5 w-3.5" />}
            >
              Sign Guestbook
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
