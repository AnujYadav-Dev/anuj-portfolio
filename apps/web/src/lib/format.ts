/**
 * Text and Markdown formatting utilities.
 */

/**
 * Strips markdown formatting and returns a clean plain text excerpt of specified max length.
 */
export function getPlainTextSummary(markdown?: string | null, maxLength = 180): string {
  if (!markdown || !markdown.trim()) return '';

  // Remove code blocks
  let clean = markdown.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  clean = clean.replace(/`([^`]+)`/g, '$1');
  // Remove markdown headings
  clean = clean.replace(/^#{1,6}\s+/gm, '');
  // Remove images
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, '');
  // Remove links, keep text
  clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  // Remove bold/italic formatting
  clean = clean.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
  // Remove bullet points / blockquotes
  clean = clean.replace(/^[*\-+>]\s+/gm, '');
  // Remove numbered lists
  clean = clean.replace(/^\d+\.\s+/gm, '');
  // Collapse whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  if (clean.length <= maxLength) return clean;

  // Trim to last complete word within maxLength
  const truncated = clean.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const safeEnd = lastSpace > maxLength * 0.7 ? lastSpace : maxLength;

  return `${clean.slice(0, safeEnd).trim()}...`;
}

/**
 * Format a date range string (e.g., 'Jan 2024 — Present').
 */
export function formatDateRange(
  startDate?: string | Date | null,
  endDate?: string | Date | null,
  isCurrent?: boolean,
): string {
  if (!startDate) return '';
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  if (isCurrent) return `${start} — Present`;
  if (!endDate) return start;
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  return `${start} — ${end}`;
}
