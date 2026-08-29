'use client';

import * as React from 'react';
import { ExternalLink, Award, ShieldCheck, FileCheck2, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/RevealOnScroll';
import { ProofDocumentModal, type ProofDocumentModalProps } from '@/components/features/about/ProofDocumentModal';

import type { CertificateDto, AchievementDto } from '@portfolio/shared';

export interface CertificatesGalleryProps {
  certificates: CertificateDto[];
  achievements: AchievementDto[];
}

export function CertificatesGallery({ certificates, achievements }: CertificatesGalleryProps) {
  const [selectedProof, setSelectedProof] = React.useState<Omit<ProofDocumentModalProps, 'isOpen' | 'onClose'> | null>(null);

  const handleOpenCertProof = (cert: CertificateDto, issueDate: string) => {
    if (!cert.certificateImageUrl) return;
    setSelectedProof({
      title: cert.name,
      subtitle: cert.issuingOrganization,
      date: issueDate,
      issuer: cert.issuingOrganization,
      credentialId: cert.credentialId || undefined,
      credentialUrl: cert.credentialUrl || undefined,
      mediaUrl: cert.certificateImageUrl,
      isCertificate: true,
    });
  };

  const handleOpenAchProof = (ach: AchievementDto, achDate: string) => {
    if (!ach.imageUrl) return;
    setSelectedProof({
      title: ach.title,
      subtitle: ach.issuer || undefined,
      date: achDate,
      issuer: ach.issuer || undefined,
      credentialUrl: ach.url || undefined,
      description: ach.description || undefined,
      mediaUrl: ach.imageUrl,
      isCertificate: false,
    });
  };

  return (
    <div className="flex flex-col gap-16">
      {/* Certifications Section */}
      {certificates.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <h3 className="text-lg font-bold text-foreground">Professional Certifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, idx) => {
              const issueDate = cert.issueDate
                ? new Date(cert.issueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '';

              return (
                <RevealOnScroll key={cert.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <Card className="bg-surface border-border h-full flex flex-col justify-between">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono text-muted uppercase">
                          {cert.issuingOrganization}
                        </span>
                        {issueDate && (
                          <span className="text-xs font-mono text-muted">{issueDate}</span>
                        )}
                      </div>
                      <CardTitle className="text-md">{cert.name}</CardTitle>
                      {cert.credentialId && (
                        <p className="text-[11px] font-mono text-placeholder truncate mt-1">
                          ID: {cert.credentialId}
                        </p>
                      )}
                    </CardHeader>

                    <CardFooter className="justify-between border-t border-border mt-4 pt-3 text-xs flex-wrap gap-2">
                      {cert.certificateImageUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2.5 text-accent border-accent/30 hover:bg-accent/10"
                          onClick={() => handleOpenCertProof(cert, issueDate)}
                        >
                          <FileCheck2 className="h-3 w-3 mr-1" />
                          <span>View Proof</span>
                        </Button>
                      ) : (
                        <span className="text-muted">Verified</span>
                      )}

                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline underline-offset-4 flex items-center gap-1 font-semibold ml-auto"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Verify</span>
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      )}

      {/* Honors & Achievements Section */}
      {achievements.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-accent" />
            <h3 className="text-lg font-bold text-foreground">Honors & Competitions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((ach, idx) => {
              const achDate = ach.date
                ? new Date(ach.date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '';

              return (
                <RevealOnScroll key={ach.id} delayIndex={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                  <Card className="bg-surface border-border h-full flex flex-col justify-between">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {ach.issuer && (
                          <Badge variant="outline" size="sm">
                            {ach.issuer}
                          </Badge>
                        )}
                        {achDate && <span className="text-xs font-mono text-muted">{achDate}</span>}
                      </div>
                      <CardTitle className="text-md">{ach.title}</CardTitle>
                      {ach.description && (
                        <CardDescription className="mt-2 leading-relaxed">
                          {ach.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardFooter className="border-t border-border mt-4 pt-3 text-xs justify-between flex-wrap gap-2">
                      {ach.imageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2.5 text-accent border-accent/30 hover:bg-accent/10"
                          onClick={() => handleOpenAchProof(ach, achDate)}
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          <span>View Photo & Proof</span>
                        </Button>
                      )}

                      {ach.url && (
                        <a
                          href={ach.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline underline-offset-4 flex items-center gap-1 font-semibold ml-auto"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Announcement</span>
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      )}

      {/* Proof Modal Viewer */}
      {selectedProof && (
        <ProofDocumentModal
          isOpen={Boolean(selectedProof)}
          onClose={() => setSelectedProof(null)}
          {...selectedProof}
        />
      )}
    </div>
  );
}

