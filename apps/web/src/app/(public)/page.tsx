'use client';

import * as React from 'react';
import { HeroSection } from '@/components/features/home/HeroSection';
import { AboutPreview } from '@/components/features/home/AboutPreview';
import { WorksBento } from '@/components/features/home/WorksBento';
import { SkillsOverview } from '@/components/features/home/SkillsOverview';
import { ExperienceHighlights } from '@/components/features/home/ExperienceHighlights';
import { LatestBlogsSection } from '@/components/features/home/LatestBlogsSection';
import { ContactCTA } from '@/components/features/home/ContactCTA';
import { useHomepageSections } from '@/hooks/useLayout';

export default function HomePage() {
  const { data: sectionsData } = useHomepageSections();
  const dbSections = sectionsData?.data;

  // If sections are defined in DB, map them dynamically
  if (dbSections && dbSections.length > 0) {
    const sectionComponentMap: Record<string, React.ReactNode> = {
      hero: <HeroSection key="hero" />,
      about: <AboutPreview key="about" />,
      projects: <WorksBento key="projects" />,
      skills: <SkillsOverview key="skills" />,
      experience: <ExperienceHighlights key="experience" />,
      blogs: <LatestBlogsSection key="blogs" />,
      contact: <ContactCTA key="contact" />,
    };

    return (
      <div className="flex flex-col">
        {dbSections
          .filter((s) => s.isEnabled)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => sectionComponentMap[s.sectionKey] || null)}
      </div>
    );
  }

  // Default fallback order
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutPreview />
      <WorksBento />
      <SkillsOverview />
      <ExperienceHighlights />
      <LatestBlogsSection />
      <ContactCTA />
    </div>
  );
}
