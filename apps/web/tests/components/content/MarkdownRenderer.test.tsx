import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';

describe('MarkdownRenderer (Rendering & Security Hardening)', () => {
  it('renders standard Markdown headings, lists, and paragraphs', () => {
    const md = `
# Main Header
This is a paragraph with **bold** and *italic* text.

- Item 1
- Item 2
    `;

    render(<MarkdownRenderer content={md} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Header');
    expect(screen.getByText(/This is a paragraph/)).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders callout alerts for [!NOTE] blocks', () => {
    const md = `> [!NOTE]\n> This is an important note block.`;
    render(<MarkdownRenderer content={md} />);

    expect(screen.getByText(/This is an important note block/)).toBeInTheDocument();
  });

  it('sanitizes dangerous XSS payloads such as script tags', () => {
    const md = `
Hello safe text
<script>window.pwned = true;</script>
<img src="x" onerror="alert(1)" />
<a href="javascript:alert(1)">Malicious link</a>
    `;

    const { container } = render(<MarkdownRenderer content={md} />);

    expect(screen.getByText('Hello safe text')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    const maliciousLink = container.querySelector('a');
    if (maliciousLink) {
      expect(maliciousLink.getAttribute('href')).not.toBe('javascript:alert(1)');
    }
  });
});
