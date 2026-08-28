'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const cleanCode = typeof code === 'string' ? code.trim() : String(code);
  const lines = cleanCode.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setHasCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div
      className={cn(
        'group relative my-4 rounded-md border border-border bg-surface-muted overflow-hidden text-xs',
        className,
      )}
    >
      {/* Header bar if language or filename is present */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface text-muted text-[11px] font-mono">
        <span className="font-semibold text-foreground">{filename || language.toUpperCase()}</span>
        <button
          type="button"
          onClick={handleCopy}
          data-action="copy-code"
          data-track-label={`Code: ${filename || language}`}
          className="flex items-center gap-1 text-muted hover:text-accent transition-colors p-1 rounded-xs cursor-pointer select-none"
          aria-label="Copy code to clipboard"
        >
          {hasCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              <span className="text-success text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body with line numbers */}
      <div className="p-4 overflow-x-auto font-mono leading-relaxed">
        <pre className="border-0 p-0 m-0 bg-transparent flex">
          {showLineNumbers && (
            <div
              className="select-none pr-4 text-right text-placeholder border-r border-border/50 mr-4 shrink-0 font-mono text-[11px]"
              aria-hidden="true"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code className="text-foreground flex-1 font-mono">{cleanCode}</code>
        </pre>
      </div>
    </div>
  );
}
