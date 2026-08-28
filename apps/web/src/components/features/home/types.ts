import type { HomepageSectionDto } from '@portfolio/shared';

export interface DynamicSectionProps {
  section?: HomepageSectionDto;
  index?: number;
}

export function formatSectionTag({
  index,
  showSectionNumber = true,
  labelTag,
  tagSeparator = '//',
  customLabelNumber,
}: {
  index?: number;
  showSectionNumber?: boolean;
  labelTag?: string;
  tagSeparator?: string;
  customLabelNumber?: string;
}): string | undefined {
  if (customLabelNumber) return customLabelNumber;

  const numPart = showSectionNumber ? String(index ?? 1).padStart(2, '0') : '';
  const sepPart = tagSeparator !== undefined ? tagSeparator.trim() : '';
  const tagPart = labelTag !== undefined ? labelTag.trim() : '';

  const parts = [numPart, sepPart, tagPart].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : undefined;
}
