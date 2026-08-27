'use client';

import * as React from 'react';
import { Download, Printer, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useActiveResume, useExperiences, useEducation, useSkills } from '@/hooks/useProfile';
import { useSiteSettings } from '@/hooks/useLayout';

export function ResumeViewer() {
  const { data: resumeData } = useActiveResume();
  const { data: expData } = useExperiences();
  const { data: eduData } = useEducation();
  const { data: skillsData } = useSkills();
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md border border-border bg-surface print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">ACTIVE VERSION:</span>
          <Badge variant="accent" size="sm">
            {resumeData?.data?.versionLabel || 'LATEST'}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-3.5 w-3.5" />}
          >
            Print
          </Button>

          {resumeData?.data?.fileUrl && (
            <a href={resumeData.data.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="sm" rightIcon={<Download className="h-3.5 w-3.5" />}>
                Download PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Structured Resume Canvas */}
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-12 flex flex-col gap-10 print:border-0 print:p-0 print:bg-white print:text-black">
        {/* Resume Header */}
        <div className="flex flex-col gap-2 border-b border-border pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground print:text-black">
            {authorName}
          </h1>
          <p className="text-sm font-semibold text-accent font-mono print:text-black">
            {authorTitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-mono pt-2 print:text-gray-700">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {authorEmail}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {authorLocation}
            </span>
          </div>
        </div>

        {/* Experience Section */}
        {experiences.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-2 print:text-black">
              Experience
            </h2>
            <div className="flex flex-col gap-6">
              {experiences.map((exp) => {
                const start = new Date(exp.startDate).getFullYear();
                const end = exp.isCurrent
                  ? 'Present'
                  : exp.endDate
                    ? new Date(exp.endDate).getFullYear()
                    : '';

                return (
                  <div key={exp.id} className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between text-xs">
                      <span className="font-bold text-sm text-foreground print:text-black">
                        {exp.role} <span className="text-muted font-normal">at</span>{' '}
                        {exp.companyName}
                      </span>
                      <span className="font-mono text-muted">
                        {start} — {end}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-muted leading-relaxed">{exp.description}</p>
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

        {/* Education Section */}
        {education.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-2 print:text-black">
              Education
            </h2>
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
                    <span className="text-muted">{edu.institution}</span>
                    {edu.grade && (
                      <span className="font-mono text-[11px] text-accent">Grade: {edu.grade}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Technical Skills Section */}
        {skills.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent border-b border-border/60 pb-2 print:text-black">
              Core Competencies
            </h2>
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
    </div>
  );
}
