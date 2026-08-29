'use client';

import * as React from 'react';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ResumePdfViewerProps {
  fileUrl?: string | null;
  title?: string;
  onSwitchToWeb?: () => void;
}

export function ResumePdfViewer({
  fileUrl,
  title,
  onSwitchToWeb,
}: ResumePdfViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true);

  if (!fileUrl) {
    return (
      <Card className="bg-surface border-border p-12 text-center flex flex-col items-center gap-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-muted border border-border text-muted">
          <FileText className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">No PDF Resume Uploaded</h2>
          <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
            There is currently no active PDF resume uploaded in the system. You can still view the interactive web resume.
          </p>
        </div>
        {onSwitchToWeb && (
          <Button variant="primary" size="sm" onClick={onSwitchToWeb} className="mt-2">
            Switch to Web Resume
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="relative w-full rounded-lg border border-border bg-surface overflow-hidden shadow-2xl min-h-[750px] h-[85vh]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-surface/90 backdrop-blur-xs">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="text-xs font-mono text-muted">Loading PDF document...</span>
        </div>
      )}

      <iframe
        src={`${fileUrl}#view=FitH&toolbar=1`}
        title={title || 'Curriculum Vitae PDF'}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 bg-white"
      />
    </div>
  );
}
