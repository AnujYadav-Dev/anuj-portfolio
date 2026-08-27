'use client';

import * as React from 'react';
import type { HomepageSectionDto } from '@portfolio/shared';
import { HeroSection } from '@/components/features/home/HeroSection';
import { AboutPreview } from '@/components/features/home/AboutPreview';
import { WorksBento } from '@/components/features/home/WorksBento';
import { SkillsOverview } from '@/components/features/home/SkillsOverview';
import { ExperienceHighlights } from '@/components/features/home/ExperienceHighlights';
import { LatestBlogsSection } from '@/components/features/home/LatestBlogsSection';
import { ContactCTA } from '@/components/features/home/ContactCTA';
import { CustomMarkdownSection } from '@/components/features/home/CustomMarkdownSection';
import { useHomepageSections } from '@/hooks/useLayout';
import type { DynamicSectionProps } from './types';

// Section component registry mapping canonical database keys and aliases
const SECTION_REGISTRY: Record<string, React.ComponentType<DynamicSectionProps>> = {
  hero: HeroSection,
  about: AboutPreview,
  featured_projects: WorksBento,
  projects: WorksBento, // Alias support
  skills: SkillsOverview,
  experience: ExperienceHighlights,
  latest_articles: LatestBlogsSection,
  blogs: LatestBlogsSection, // Alias support
  contact: ContactCTA,
  custom_markdown: CustomMarkdownSection,
};

interface HomeClientViewProps {
  initialSections?: HomepageSectionDto[];
}

export function HomeClientView({ initialSections }: HomeClientViewProps) {
  const { data: sectionsData } = useHomepageSections();
  const dbSections = sectionsData?.data || initialSections;

  // Render a specific section based on registry or fallback
  const renderSection = (section: HomepageSectionDto, index: number) => {
    const Component = SECTION_REGISTRY[section.sectionKey] || CustomMarkdownSection;
    return <Component key={section.id || section.sectionKey} section={section} index={index} />;
  };

  // If sections are defined in DB, map them dynamically
  if (dbSections && dbSections.length > 0) {
    const enabledSections = dbSections
      .filter((s) => s.isEnabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Hero is the anchor masthead (uses DB configuration if present, otherwise default HeroSection)
    const heroSection =
      dbSections.find((s) => s.sectionKey === 'hero') ||
      enabledSections.find((s) => s.sectionKey === 'hero');

    const nonHeroSections = enabledSections.filter((s) => s.sectionKey !== 'hero');

    return (
      <div className="flex flex-col relative">
        {/* Sticky Stacking Hero Section (Permanent anchor masthead) */}
        {heroSection ? renderSection(heroSection, 0) : <HeroSection />}

        {/* Subsequent Sections Container (Slides OVER the Hero on scroll) */}
        {nonHeroSections.length > 0 && (
          <div className="relative z-10 bg-background border-t border-border shadow-2xl flex flex-col">
            {nonHeroSections.map((section, idx) => renderSection(section, idx + 1))}
          </div>
        )}
      </div>
    );
  }

  // Default fallback layout when no database sections are present
  return (
    <div className="flex flex-col relative">
      {/* Sticky Stacking Hero Section */}
      <HeroSection />

      {/* Subsequent Sections Container */}
      <div className="relative z-10 bg-background border-t border-border shadow-2xl flex flex-col">
        <AboutPreview />
        <WorksBento />
        <SkillsOverview />
        <ExperienceHighlights />
        <LatestBlogsSection />
        <ContactCTA />
      </div>
    </div>
  );
}
