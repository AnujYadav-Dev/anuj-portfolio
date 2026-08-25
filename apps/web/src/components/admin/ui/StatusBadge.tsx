import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ContentStatus, ContactStatus, ModerationStatus } from '@portfolio/shared';

interface StatusBadgeProps {
  status: ContentStatus | ContactStatus | ModerationStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();

  switch (normalized) {
    case 'published':
    case 'approved':
    case 'replied':
    case 'true':
    case 'active':
      return (
        <Badge variant="success" className={className}>
          {status}
        </Badge>
      );

    case 'draft':
    case 'pending':
    case 'unread':
      return (
        <Badge variant="warning" className={className}>
          {status}
        </Badge>
      );

    case 'scheduled':
      return (
        <Badge variant="accent" className={className}>
          {status}
        </Badge>
      );

    case 'archived':
    case 'read':
    case 'false':
    case 'inactive':
      return (
        <Badge variant="muted" className={className}>
          {status}
        </Badge>
      );

    case 'rejected':
    case 'disabled':
      return (
        <Badge variant="destructive" className={className}>
          {status}
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}
