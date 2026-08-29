'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, Printer, Mail, MapPin, ArrowUpRight, ChevronDown, ChevronUp, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { ResumePdfViewer } from '@/components/features/resume/ResumePdfViewer';

import { useActiveResume, useExperiences, useEducation, useSkills, useSocialLinks } from '@/hooks/useProfile';
import { useProjects } from '@/hooks/useProjects';
import { useSiteSettings } from '@/hooks/useLayout';

export function ResumeViewer() {
  const [viewMode, setViewMode] = React.useState<'web' | 'pdf'>('web');
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const { data: resumeData } = useActiveResume();
  const { data: expData } = useExperiences();
  const { data: eduData } = useEducation();
  const { data: skillsData } = useSkills();
  const { data: socialData } = useSocialLinks();
  const { data: projectsData } = useProjects({ isFeatured: true, pageSize: 4 });
  const { data: settingsData } = useSiteSettings();

  const authorName =
    settingsData?.data?.['author_name'] || settingsData?.data?.['author.name'] || 'Anuj Yadav';
  const authorTitle =
    settingsData?.data?.['author_job_title'] ||
    settingsData?.data?.['author.title'] ||
    'Software Engineer';
  const authorEmail =
    settingsData?.data?.['author_email'] ||
    settingsData?.data?.['author.email'] ||
    'anujyadav9449@gmail.com';
  const authorLocation =
    settingsData?.data?.['author_location'] ||
    settingsData?.data?.['author.location'] ||
    'Bengaluru, India';

  const experiences = expData?.data || [];
  const education = eduData?.data || [];
  const skills = skillsData?.data || [];
  const featuredProjects = projectsData?.data || [];
  const socialLinks = (socialData?.data || []).filter((s) => s.isEnabled);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Unified Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-lg border border-border bg-surface print:hidden">
        {/* Left: View Mode Switcher + Version Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-surface-muted border border-border rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('web')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer',
                viewMode === 'web'
                  ? 'bg-accent text-black font-bold shadow-xs'
                  : 'text-muted hover:text-foreground',
              )}
            >
              Interactive Web
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5',
                viewMode === 'pdf'
                  ? 'bg-accent text-black font-bold shadow-xs'
                  : 'text-muted hover:text-foreground',
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>PDF Document</span>
            </button>
          </div>

          <Badge variant="accent" size="sm" className="font-mono hidden sm:inline-flex">
            v{resumeData?.data?.versionLabel || 'LATEST'}
          </Badge>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {viewMode === 'web' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print
            </Button>
          )}

          {viewMode === 'pdf' && resumeData?.data?.fileUrl && (
            <a href={resumeData.data.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
              >
                Open in New Tab
              </Button>
            </a>
          )}

          {resumeData?.data?.fileUrl && (
            <a href={resumeData.data.fileUrl} download target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="sm" rightIcon={<Download className="h-3.5 w-3.5" />}>
                Download PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Render selected view mode */}
      {viewMode === 'pdf' ? (
        <ResumePdfViewer
          fileUrl={resumeData?.data?.fileUrl}
          title={resumeData?.data?.title}
          onSwitchToWeb={() => setViewMode('web')}
        />
      ) : (
        /* Structured Interactive Web Resume Canvas */
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-12 flex flex-col gap-10 print:border-0 print:p-0 print:bg-white print:text-black">
          {/* Resume Header */}
          <div className="flex flex-col gap-3 border-b border-border pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground print:text-black">
                {authorName}
              </h1>
              <p className="text-sm font-semibold text-accent font-mono print:text-black">
                {authorTitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-mono pt-1 print:text-gray-700">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-accent" />
                {authorEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {authorLocation}
              </span>
            </div>

            {/* Dynamic Social Links from Admin */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-muted hover:text-accent bg-surface-muted/60 border border-border/70 hover:border-accent/40 transition-colors"
                  >
                    <Globe className="h-3 w-3 text-accent" />
                    <span>{s.label || s.platform}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-60" />
                  </a>
                ))}
              </div>
            )}
          </div>


          {/* Experience Section */}
          {experiences.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent print:text-black">
                  Professional Experience
                </h2>
                <Link
                  href="/experience"
                  className="text-[11px] font-mono text-muted hover:text-accent flex items-center gap-1 print:hidden"
                >
                  <span>All Roles</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="flex flex-col gap-6">
                {experiences.map((exp) => {
                  const start = new Date(exp.startDate).getFullYear();
                  const end = exp.isCurrent
                    ? 'Present'
                    : exp.endDate
                      ? new Date(exp.endDate).getFullYear()
                      : '';

                  const isExpanded = expandedItems.has(exp.id);
                  const isLongDescription = (exp.description || '').length > 130;

                  return (
                    <div key={exp.id} className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                        <span className="font-bold text-sm text-foreground print:text-black">
                          {exp.role} <span className="text-muted font-normal">at</span>{' '}
                          <span className="text-accent font-semibold">{exp.companyName}</span>
                        </span>
                        <span className="font-mono text-muted">
                          {start} — {end}
                        </span>
                      </div>

                      {exp.description && (
                        <div className="text-xs text-muted leading-relaxed">
                          <p>
                            {isLongDescription && !isExpanded
                              ? `${exp.description.slice(0, 130).trim()}...`
                              : exp.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1.5 print:hidden">
                            {isLongDescription && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(exp.id)}
                                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                              >
                                <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            )}

                            <Link
                              href={`/experience/${exp.id}`}
                              className="text-[11px] font-semibold text-muted hover:text-accent flex items-center gap-1 transition-colors"
                            >
                              <span>View Role Deep-Dive</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {exp.technologies.map((t) => (
                            <Badge key={t} variant="outline" size="sm">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Works / Projects Section */}
          {featuredProjects.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent print:text-black">
                  Key Projects & Architecture
                </h2>
                <Link
                  href="/works"
                  className="text-[11px] font-mono text-muted hover:text-accent flex items-center gap-1 print:hidden"
                >
                  <span>All Projects</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredProjects.map((proj) => {
                  const isExpanded = expandedItems.has(proj.id);
                  const isLong = (proj.shortDescription || '').length > 110;

                  return (
                    <div
                      key={proj.id}
                      className="p-4 rounded-md border border-border/70 bg-surface-muted/30 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-foreground">{proj.title}</span>
                          {proj.category && (
                            <span className="text-[10px] font-mono text-muted uppercase">
                              {proj.category.name}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted leading-relaxed mt-1">
                          {isLong && !isExpanded
                            ? `${proj.shortDescription.slice(0, 110).trim()}...`
                            : proj.shortDescription}
                        </p>

                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(proj.id)}
                            className="text-[10px] font-mono text-accent hover:underline flex items-center gap-0.5 mt-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Less' : 'More'}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between print:hidden text-xs">
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies?.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" size="sm" className="text-[10px] py-0">
                              {t}
                            </Badge>
                          ))}
                        </div>

                        <Link
                          href={`/works/${proj.slug}`}
                          className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5 ml-auto"
                        >
                          <span>Case Study</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent print:text-black">
                  Education & Academic Credentials
                </h2>
                <Link
                  href="/education"
                  className="text-[11px] font-mono text-muted hover:text-accent flex items-center gap-1 print:hidden"
                >
                  <span>All Education</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {education.map((edu) => {
                  const start = new Date(edu.startDate).getFullYear();
                  const end = edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present';

                  return (
                    <div key={edu.id} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-foreground print:text-black">
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                        </span>
                        <span className="font-mono text-muted">
                          {start} — {end}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">{edu.institution}</span>
                        {edu.grade && (
                          <span className="font-mono text-[11px] text-accent">Grade: {edu.grade}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technical Skills Section */}
          {skills.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent print:text-black">
                  Core Competencies & Stack
                </h2>
                <Link
                  href="/skills"
                  className="text-[11px] font-mono text-muted hover:text-accent flex items-center gap-1 print:hidden"
                >
                  <span>Skills Matrix</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <Badge key={s.id} variant="default" size="sm">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

