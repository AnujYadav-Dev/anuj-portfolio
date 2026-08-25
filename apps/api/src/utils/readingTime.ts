const WORDS_PER_MINUTE = 200;

/** Calculate estimated reading time in minutes for markdown or text content. */
export function calculateReadingTime(content: string | null | undefined): number {
  if (!content) {
    return 1;
  }

  // Strip code blocks and markdown symbols for cleaner word counting
  const cleanText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~[\]()<>!-]/g, ' ')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);

  return Math.max(1, minutes);
}
