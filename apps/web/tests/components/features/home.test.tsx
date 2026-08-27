import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomMarkdownSection } from '@/components/features/home/CustomMarkdownSection';
import { HeroSection } from '@/components/features/home/HeroSection';
import { AboutPreview } from '@/components/features/home/AboutPreview';
import { HomeClientView } from '@/components/features/home/HomeClientView';
import type { HomepageSectionDto } from '@portfolio/shared';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return TestWrapper;
};

describe('Homepage Custom Markdown & Hero Dynamic Sections', () => {
  it('renders custom markdown section with headings, content, and CTA links', () => {
    const mockSection: HomepageSectionDto = {
      id: 'custom-1',
      sectionKey: 'custom_notes',
      title: 'Architectural Philosophy',
      sortOrder: 1,
      isEnabled: true,
      config: {
        subtitle: 'Core Engineering Pillars',
        labelNumber: '07 // PHILOSOPHY',
        content: '# Clean Architecture\n\n- Modularity over monolith\n- Single source of truth',
        ctaLabel: 'Explore Architecture',
        ctaUrl: '/works',
      },
    };

    render(<CustomMarkdownSection section={mockSection} index={0} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Architectural Philosophy')).toBeInTheDocument();
    expect(screen.getByText('Core Engineering Pillars')).toBeInTheDocument();
    expect(screen.getByText('07 // PHILOSOPHY')).toBeInTheDocument();
    expect(screen.getByText('Clean Architecture')).toBeInTheDocument();
    expect(screen.getByText('Explore Architecture')).toBeInTheDocument();
  });

  it('renders Hero section with dynamic action buttons and title', () => {
    const mockHeroSection: HomepageSectionDto = {
      id: 'hero-1',
      sectionKey: 'hero',
      title: 'Precision in detail, vision in design.',
      sortOrder: 0,
      isEnabled: true,
      config: {
        content: 'Precision in detail, vision in design, building things one block at a time.',
        heroCta1: { label: 'Explore Works', url: '/works', target: '_self' },
        heroCta2: { label: 'Get Resume', url: '/resume', target: '_blank' },
        heroCta3: { label: 'Start Dialogue', url: '/contact', target: '_self' },
      },
    };

    render(<HeroSection section={mockHeroSection} index={0} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByText('Precision in detail, vision in design, building things one block at a time.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Explore Works')).toBeInTheDocument();
    expect(screen.getByText('Get Resume')).toBeInTheDocument();
    expect(screen.getByText('Start Dialogue')).toBeInTheDocument();
  });

  it('renders dynamic sequential section numbering with custom tag in AboutPreview', () => {
    const mockAboutSection: HomepageSectionDto = {
      id: 'about-1',
      sectionKey: 'about',
      title: 'Who am I?',
      sortOrder: 1,
      isEnabled: true,
      config: {
        subtitle: 'Background & Principles',
        labelTag: 'MY STORY',
        content: 'Experienced distributed systems engineer.',
      },
    };

    render(<AboutPreview section={mockAboutSection} index={1} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('01 // MY STORY')).toBeInTheDocument();
    expect(screen.getByText('Who am I?')).toBeInTheDocument();
    expect(screen.getByText('Background & Principles')).toBeInTheDocument();
  });

  it('renders Hero as anchor masthead and filters out disabled non-hero sections in HomeClientView', () => {
    const mockSections: HomepageSectionDto[] = [
      {
        id: 'hero-1',
        sectionKey: 'hero',
        title: 'Hero Section',
        sortOrder: 0,
        isEnabled: true,
        config: { content: 'Dynamic Hero Slogan' },
      },
      {
        id: 'about-1',
        sectionKey: 'about',
        title: 'About Section Hidden',
        sortOrder: 1,
        isEnabled: false, // Disabled non-hero section
        config: {},
      },
      {
        id: 'custom-1',
        sectionKey: 'custom_markdown',
        title: 'Visible Custom Section',
        sortOrder: 2,
        isEnabled: true, // Enabled non-hero section
        config: {
          content: 'This custom section is active and visible.',
        },
      },
    ];

    render(<HomeClientView initialSections={mockSections} />, {
      wrapper: createWrapper(),
    });

    // Hero slogan is rendered
    expect(screen.getByText('Dynamic Hero Slogan')).toBeInTheDocument();
    // Disabled about section is omitted
    expect(screen.queryByText('About Section Hidden')).not.toBeInTheDocument();
    // Only enabled custom section is rendered
    expect(screen.getByText('Visible Custom Section')).toBeInTheDocument();
    expect(screen.getByText('This custom section is active and visible.')).toBeInTheDocument();
  });
});
