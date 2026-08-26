'use client';

import React, { useState, useRef } from 'react';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { MediaPickerModal } from './MediaPickerModal';
import type { MediaDto } from '@portfolio/shared';

import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Code,
  FileCode,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Table as TableIcon,
  Image as ImageIcon,
  Columns2,
  Eye,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder = 'Write Markdown content here...',
  minHeight = '360px',
  className,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'split' | 'write' | 'preview'>('split');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selection}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
    }, 10);
  };

  const handleInsertMedia = (media: MediaDto) => {
    if (media.mediaType === 'image') {
      const alt = media.altText || media.filename;
      insertText(`![${alt}](`, `)`, media.url);
    } else {
      insertText(`[${media.filename}](`, `)`, media.url);
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">{label}</label>
          <span className="text-[11px] font-mono text-muted">
            {value.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      )}

      <div className="border border-border rounded-lg bg-surface overflow-hidden shadow-sm flex flex-col">
        {/* Formatting Toolbar */}
        <div className="border-b border-border bg-surface-muted/50 p-1.5 flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-center gap-0.5">
            <button
              type="button"
              onClick={() => insertText('**', '**', 'bold text')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertText('*', '*', 'italic text')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => insertText('## ', '\n', 'Heading 2')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertText('### ', '\n', 'Heading 3')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => insertText('`', '`', 'code')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertText('```typescript\n', '\n```', '// Code snippet')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Code Block"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertText('> ', '', 'Quote text')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertText('- ', '', 'List item')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertText('1. ', '', 'Numbered item')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => insertText('[', '](https://example.com)', 'Link Title')}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                insertText('| Column 1 | Column 2 |\n| :--- | :--- |\n| Item 1 | Value 1 |\n', '')
              }
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              title="Insert Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/10 rounded transition-colors"
              title="Insert Asset from Media Library"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media</span>
            </button>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-1 bg-surface p-0.5 rounded border border-border">
            <button
              type="button"
              onClick={() => setViewMode('write')}
              className={cn(
                'p-1 rounded text-xs transition-colors',
                viewMode === 'write'
                  ? 'bg-surface-muted text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
              title="Write Mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={cn(
                'p-1 rounded text-xs transition-colors hidden md:block',
                viewMode === 'split'
                  ? 'bg-surface-muted text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
              title="Split View Mode"
            >
              <Columns2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'p-1 rounded text-xs transition-colors',
                viewMode === 'preview'
                  ? 'bg-surface-muted text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
              title="Live Preview Mode"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div
          className={cn(
            'grid divide-border min-h-0',
            viewMode === 'split'
              ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x'
              : 'grid-cols-1',
          )}
          style={{ minHeight }}
        >
          {/* Write Pane */}
          {(viewMode === 'write' || viewMode === 'split') && (
            <div className="relative flex flex-col h-full bg-background">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full p-4 bg-transparent text-xs font-mono text-foreground placeholder:text-placeholder focus:outline-none resize-none leading-relaxed"
                style={{ minHeight }}
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className="p-6 overflow-y-auto bg-surface prose-sm max-w-none text-foreground"
              style={{ minHeight }}
            >
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <p className="text-xs text-placeholder italic">
                  Live preview will render here as you type...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleInsertMedia}
        title="Insert Media into Content"
        acceptType="all"
      />
    </div>
  );
}
