'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShieldCheck, Download, Award } from 'lucide-react';

export interface ProofDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  mediaUrl: string;
  date?: string;
  issuer?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  isCertificate?: boolean;
}

export function ProofDocumentModal({
  isOpen,
  onClose,
  title,
  subtitle,
  mediaUrl,
  date,
  issuer,
  credentialId,
  credentialUrl,
  description,
  isCertificate = true,
}: ProofDocumentModalProps) {
  const isPdf = mediaUrl.toLowerCase().endsWith('.pdf');

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="4xl">
      <DialogContent className="max-w-4xl bg-surface border-border p-6 flex flex-col gap-4">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 mb-1">
            {isCertificate ? (
              <ShieldCheck className="h-4 w-4 text-accent" />
            ) : (
              <Award className="h-4 w-4 text-accent" />
            )}
            <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-semibold">
              {isCertificate ? 'Verified Certificate Proof' : 'Honors & Recognition Proof'}
            </span>
          </div>

          <DialogTitle className="text-lg font-bold text-foreground">
            {title}
          </DialogTitle>

          {subtitle && (
            <DialogDescription className="text-xs text-muted">
              {subtitle} {date ? `• ${date}` : ''}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Media Preview Box */}
        <div className="relative w-full rounded-lg border border-border bg-black/40 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[55vh]">
          {isPdf ? (
            <iframe
              src={`${mediaUrl}#toolbar=0`}
              title={title}
              className="w-full h-[50vh] border-0"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <img
                src={mediaUrl}
                alt={title}
                className="max-h-[50vh] max-w-full object-contain rounded border border-border/40 shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted bg-surface-muted/50 p-3 rounded-md border border-border/50 mt-2">
          <div className="flex flex-wrap items-center gap-3">
            {issuer && (
              <Badge variant="outline" size="sm">
                Issuer: {issuer}
              </Badge>
            )}
            {credentialId && (
              <span className="text-foreground font-semibold">
                ID: <span className="text-muted font-normal">{credentialId}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline flex items-center gap-1 font-semibold"
            >
              <Download className="h-3 w-3" />
              {/* <span>Full Media</span> */}
            </a>
          </div>
        </div>

        {description && (
          <p className="text-xs text-foreground/80 leading-relaxed pt-1">
            {description}
          </p>
        )}

        <DialogFooter className="border-t border-border pt-3">
          {credentialUrl && (
            <a
              href={credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-auto"
            >
              <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                Verify on Issuing Site
              </Button>
            </a>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
