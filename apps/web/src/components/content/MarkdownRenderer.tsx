'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CodeBlock } from './CodeBlock';
import { Callout, type CalloutType } from './Callout';
import { ZoomableImage } from './ZoomableImage';
import { cn } from '@/lib/cn';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function parseCallout(text: string): { type: CalloutType; content: string } | null {
  const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)$/i);
  if (match && match[1]) {
    return {
      type: match[1].toUpperCase() as CalloutType,
      content: match[2] || '',
    };
  }
  return null;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'prose max-w-none text-foreground font-sans leading-relaxed text-sm',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return (
              <h1
                id={id}
                className="scroll-m-20 text-2xl font-extrabold tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2"
              >
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return (
              <h2
                id={id}
                className="scroll-m-20 text-xl font-bold tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2"
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return (
              <h3
                id={id}
                className="scroll-m-20 text-md font-semibold tracking-tight text-foreground mt-6 mb-3"
              >
                {children}
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="my-4 text-foreground/90 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc [&>li]:mt-1.5 text-foreground/90">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal [&>li]:mt-1.5 text-foreground/90">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => {
            // Check for callout format > [!NOTE]
            const rawText = React.Children.toArray(children)
              .map((c) => (React.isValidElement<{ children?: React.ReactNode }>(c) ? c.props.children : c))
              .flat()
              .join('');

            const callout = parseCallout(rawText);
            if (callout) {
              return <Callout type={callout.type}>{callout.content}</Callout>;
            }

            return (
              <blockquote className="my-6 border-l-3 border-accent pl-4 text-muted italic">
                {children}
              </blockquote>
            );
          },
          code: ({ inline, className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (match || codeString.includes('\n'))) {
              return <CodeBlock code={codeString} language={match ? match[1] : 'text'} />;
            }

            return (
              <code
                className="rounded-xs bg-surface-muted px-1.5 py-0.5 font-mono text-[13px] text-accent border border-border/50"
                {...props}
              >
                {children}
              </code>
            );
          },
          img: (props) => {
            const src = typeof props.src === 'string' ? props.src : undefined;
            if (!src) return null;
            return <ZoomableImage src={src} alt={props.alt || ''} caption={props.alt} />;
          },



          table: ({ children }) => (
            <div className="my-6 w-full overflow-y-auto rounded-md border border-border">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-muted text-foreground font-semibold border-b border-border">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border bg-surface">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-surface-muted/50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-semibold text-foreground text-[11px] uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-muted leading-normal">{children}</td>
          ),
          hr: () => <hr className="my-8 border-border" />,
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http') || href?.startsWith('//');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-accent underline decoration-accent/50 underline-offset-4 hover:decoration-accent hover:text-accent-hover transition-colors font-medium"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
