'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, DropdownItem } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer';
import { TableOfContents, extractHeadings } from '@/components/content/TableOfContents';
import { usePublicStats } from '@/hooks/useDiscovery';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { toast } from 'sonner';
import {
  Code,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

const sampleMarkdown = `
## Architectural Overview

The portfolio platform is built using modern **TypeScript**, **Next.js 16 (Turbopack)**, and an **Express.js API** backend.

> [!NOTE]
> All domain entities are managed dynamically through the PostgreSQL database via Prisma ORM.

### Code Demonstration

\`\`\`typescript
interface Developer {
  name: string;
  role: string;
  skills: string[];
}

export const anuj: Developer = {
  name: 'Anuj Yadav',
  role: 'Software Engineer',
  skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Node.js'],
};
\`\`\`

> [!TIP]
> Click the **Copy** button in the header of the code block above to copy the snippet to your clipboard.

### Feature Matrix

| Module | Protocol | Status |
| :--- | :--- | :---: |
| REST API | Express 4 + Zod | Active |
| Database | PostgreSQL 16 + Prisma | Connected |
| Design System | Tailwind CSS v4 + Tokens | Loaded |
`;

export default function HomePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { data: statsData, isLoading: isStatsLoading } = usePublicStats();
  const { trackClick } = useAnalyticsTracker();

  const headings = React.useMemo(() => extractHeadings(sampleMarkdown), []);

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-fast selection:bg-accent selection:text-accent-foreground">
      {/* Header Bar */}
      <header className="sticky top-0 z-sticky backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm tracking-tight font-mono text-foreground">
              ANUJ<span className="text-accent">.DEV</span>
            </span>
            <Badge variant="accent" size="sm">
              PHASE 5 READY
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip content="Switch theme">
              <ThemeToggle />
            </Tooltip>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                trackClick('/test', 'button_click', 'test_toast');
                toast.success('Design system and client infrastructure active!');
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Test Toast</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <RevealOnScroll>
            <div className="flex flex-col gap-4 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Design System Primitives</Badge>
                <Badge variant="success">WCAG 2.2 AA</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                High-Craft Architectural Design System
              </h1>
              <p className="text-md text-muted leading-relaxed">
                Token-driven accessible primitives, unified upward scroll reveal
                motion, syntax-highlighted Markdown/MDX engine, and full TanStack
                Query data layer.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => setIsDialogOpen(true)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Open Dialog Modal
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    const el = document.getElementById('components-demo');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Primitives
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Live Backend Telemetry Stats Bar */}
      <section className="py-8 border-b border-border bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <RevealOnScroll delayIndex={1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1 p-4 rounded-md border border-border bg-background">
                <span className="text-[11px] font-mono text-muted uppercase">
                  Published Projects
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {isStatsLoading ? '...' : statsData?.data.totalProjects ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-md border border-border bg-background">
                <span className="text-[11px] font-mono text-muted uppercase">
                  Blog Articles
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {isStatsLoading ? '...' : statsData?.data.totalBlogPosts ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-md border border-border bg-background">
                <span className="text-[11px] font-mono text-muted uppercase">
                  Technical Skills
                </span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {isStatsLoading ? '...' : statsData?.data.totalSkills ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-md border border-border bg-background">
                <span className="text-[11px] font-mono text-muted uppercase">
                  API Status
                </span>
                <span className="text-xl font-bold font-mono text-success flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5" /> Connected
                </span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Component Showcase Split Layout */}
      <section id="components-demo" className="py-16 md:py-24 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column Section Label */}
            <div className="lg:col-span-3">
              <RevealOnScroll>
                <div className="sticky top-24 flex flex-col gap-2">
                  <span className="text-xs font-mono text-accent uppercase tracking-wider">
                    01 // Components
                  </span>
                  <h2 className="text-xl font-bold text-foreground">
                    Interactive UI Primitives
                  </h2>
                  <p className="text-xs text-muted leading-relaxed">
                    Accessible, token-driven controls designed for light & dark
                    modes.
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Column Component Streams */}
            <div className="lg:col-span-9 flex flex-col gap-12">
              {/* Buttons & Badges */}
              <RevealOnScroll delayIndex={1}>
                <Card>
                  <CardHeader>
                    <CardTitle>Buttons & Badges</CardTitle>
                    <CardDescription>
                      Full variant and sizing matrix with state indicators.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="primary" size="sm">Primary</Button>
                      <Button variant="secondary" size="sm">Secondary</Button>
                      <Button variant="outline" size="sm">Outline</Button>
                      <Button variant="ghost" size="sm">Ghost</Button>
                      <Button variant="destructive" size="sm">Destructive</Button>
                      <Button variant="primary" size="sm" isLoading>Loading</Button>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default">Default</Badge>
                      <Badge variant="accent">Accent</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </CardContent>
                </Card>
              </RevealOnScroll>

              {/* Form Controls */}
              <RevealOnScroll delayIndex={2}>
                <Card>
                  <CardHeader>
                    <CardTitle>Form Controls</CardTitle>
                    <CardDescription>
                      Accessible text inputs, textareas, and popovers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Username"
                      placeholder="e.g. anuj"
                      helperText="Your public handle."
                    />
                    <Input
                      label="Email (Error State)"
                      placeholder="user@example.com"
                      error="Invalid email address format"
                    />
                    <div className="md:col-span-2">
                      <Textarea
                        label="Message"
                        placeholder="Write a message..."
                        helperText="Markdown is supported."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Popover
                      trigger={
                        <Button variant="outline" size="sm">
                          <span>Action Menu</span>
                        </Button>
                      }
                    >
                      <DropdownItem onClick={() => toast.info('Option 1 selected')}>
                        Option 1
                      </DropdownItem>
                      <DropdownItem onClick={() => toast.info('Option 2 selected')}>
                        Option 2
                      </DropdownItem>
                    </Popover>
                    <Button variant="primary" size="sm">
                      Submit Form
                    </Button>
                  </CardFooter>
                </Card>
              </RevealOnScroll>

              {/* Tabs & Accordion */}
              <RevealOnScroll delayIndex={3}>
                <Card>
                  <CardHeader>
                    <CardTitle>Navigation & Disclosure</CardTitle>
                    <CardDescription>
                      Tabbed interfaces and expandable accordions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <Tabs defaultValue="architecture">
                      <TabsList>
                        <TabsTrigger value="architecture">
                          <Layers className="h-3.5 w-3.5" /> Architecture
                        </TabsTrigger>
                        <TabsTrigger value="security">
                          <ShieldCheck className="h-3.5 w-3.5" /> Security
                        </TabsTrigger>
                        <TabsTrigger value="developer">
                          <Code className="h-3.5 w-3.5" /> Stack
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="architecture" className="p-3 bg-surface-muted rounded-sm mt-3 text-xs text-muted">
                        Layered architecture: Route → Middleware → Controller → Service → Repository → Prisma.
                      </TabsContent>
                      <TabsContent value="security" className="p-3 bg-surface-muted rounded-sm mt-3 text-xs text-muted">
                        JWT authentication with SHA-256 hashed refresh tokens, rate limiting, and helmet headers.
                      </TabsContent>
                      <TabsContent value="developer" className="p-3 bg-surface-muted rounded-sm mt-3 text-xs text-muted">
                        Next.js 16 (App Router), Turbopack, Tailwind CSS v4, and PostgreSQL.
                      </TabsContent>
                    </Tabs>

                    <Separator />

                    <Accordion>
                      <AccordionItem title="What is the design philosophy?" defaultOpen>
                        Minimalist, architectural, dark-first aesthetics with surgical warm orange accents (#ff8c42) and consistent scroll motion.
                      </AccordionItem>
                      <AccordionItem title="How is data synchronized?">
                        TanStack Query client hooks with automatic background refetching and smart cache eviction.
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Markdown / MDX Engine Showcase */}
      <section className="py-16 md:py-24 border-b border-border bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-3">
              <RevealOnScroll>
                <div className="sticky top-24 flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-mono text-accent uppercase tracking-wider">
                      02 // Content
                    </span>
                    <h2 className="text-xl font-bold text-foreground">
                      Markdown Engine
                    </h2>
                    <p className="text-xs text-muted leading-relaxed">
                      GitHub Flavored Markdown with syntax highlighting, copy code,
                      and scroll-spy TOC.
                    </p>
                  </div>
                  <TableOfContents items={headings} />
                </div>
              </RevealOnScroll>
            </div>

            <div className="lg:col-span-9">
              <RevealOnScroll delayIndex={1}>
                <div className="bg-background border border-border rounded-lg p-6 md:p-8">
                  <MarkdownRenderer content={sampleMarkdown} />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accessible Modal Primitive</DialogTitle>
            <DialogDescription>
              This dialog implements focus trapping, backdrop blur, Escape key dismissal, and portal mounting.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-xs text-muted flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar fallbackText="Anuj Yadav" size="md" />
              <div>
                <p className="font-semibold text-foreground">Anuj Yadav</p>
                <p className="text-[11px] text-muted">Lead Developer & Architect</p>
              </div>
            </div>
            <p>
              Phase 5 establishes all UI primitives and data foundations ready to build the public pages in Phase 6.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsDialogOpen(false);
                toast.success('Confirmed action in dialog');
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
