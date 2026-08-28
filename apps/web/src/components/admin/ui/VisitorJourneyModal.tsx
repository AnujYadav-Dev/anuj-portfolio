'use client';

import * as React from 'react';
import type { AdminVisitorJourneyDto } from '@portfolio/shared';
import { apiClient } from '@/lib/api';
import {
  X,
  Footprints,
  Clock,
  Globe,
  Monitor,
  Eye,
  ExternalLink,
  Mail,
  FileText,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface VisitorJourneyModalProps {
  visitorId: string | null;
  onClose: () => void;
}

export function VisitorJourneyModal({ visitorId, onClose }: VisitorJourneyModalProps) {
  const [journey, setJourney] = React.useState<AdminVisitorJourneyDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!visitorId) return;

    setIsLoading(true);
    apiClient
      .get<{ data: AdminVisitorJourneyDto }>(`/analytics/admin/visitors/${visitorId}/journey`)
      .then((res) => {
        setJourney(res.data);
      })
      .catch(() => {
        toast.error('Failed to load visitor journey footprint');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [visitorId]);

  if (!visitorId) return null;

  const visitor = journey?.visitor;

  const getIntentBadge = (category: string | null | undefined, score: number) => {
    switch (category) {
      case 'recruiter':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-warning/15 text-warning border border-warning/30">
            💼 Recruiter ({score} pts)
          </span>
        );
      case 'lead':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-success/15 text-success border border-success/30">
            📬 Direct Lead ({score} pts)
          </span>
        );
      case 'tech_evaluator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-accent/15 text-accent border border-accent/30">
            🛠️ Tech Evaluator ({score} pts)
          </span>
        );
      case 'reader':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-info/15 text-info border border-info/30">
            📖 Deep Reader ({score} pts)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-surface-muted text-muted border border-border">
            🌐 Casual ({score} pts)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="h-full w-full max-w-4xl border-l border-border bg-surface shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-muted/50">
          <div className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-accent" />
            <div>
              <h2 className="font-mono text-sm font-semibold text-foreground">Visitor Footprint & Journey</h2>
              <span className="font-mono text-[11px] text-muted">Session ID: {visitor?.sessionId?.substring(0, 18)}...</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-sm text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-muted animate-pulse">
              Reconstructing chronological visitor footprint...
            </div>
          ) : !journey || !visitor ? (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-muted">
              Visitor timeline records not found.
            </div>
          ) : (
            <>
              {/* Visitor Overview Profile Card */}
              <div className="rounded-md border border-border bg-surface-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">{visitor.ipAddress}</span>
                    {getIntentBadge(visitor.intentCategory, visitor.intentScore)}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Total Dwell: {journey.totalDwellTimeSeconds}s</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5 truncate">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span>{visitor.city || visitor.region ? `${visitor.city || ''}, ${visitor.country || 'Unknown'}` : visitor.country || 'Unknown Geo'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Monitor className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span>{visitor.browser || 'Unknown'} on {visitor.os || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span>Source: {visitor.referrerSource || 'Direct'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Layers className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span>Visits: {visitor.visitCount} times</span>
                  </div>
                </div>

                {/* UTM Campaign Context if available */}
                {(visitor.utmSource || visitor.utmCampaign || visitor.utmMedium) && (
                  <div className="mt-2 pt-2 border-t border-border/50 font-mono text-[11px] bg-surface p-2 rounded-xs flex flex-wrap gap-x-3 gap-y-1">
                    {visitor.utmSource && <span><strong className="text-muted">Source:</strong> {visitor.utmSource}</span>}
                    {visitor.utmMedium && <span><strong className="text-muted">Medium:</strong> {visitor.utmMedium}</span>}
                    {visitor.utmCampaign && <span><strong className="text-muted">Campaign:</strong> {visitor.utmCampaign}</span>}
                    {visitor.utmTerm && <span><strong className="text-muted">Term:</strong> {visitor.utmTerm}</span>}
                  </div>
                )}
              </div>

              {/* Chronological Timeline */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Chronological Journey Flow ({journey.steps.length} actions)
                </h3>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {journey.steps.map((step, idx) => {
                    const isClick = step.type === 'link_click';
                    const isContact = step.type === 'contact_submission';
                    const isResume = isClick && String(step.pathOrUrl).includes('resume');
                    const isCodeCopy = isClick && step.title.toLowerCase().includes('copy');

                    return (
                      <div key={idx} className="relative group">
                        {/* Step Marker Icon */}
                        <div
                          className={`absolute -left-6 top-1 h-5 w-5 rounded-full border flex items-center justify-center ${
                            isContact
                              ? 'bg-success/20 border-success text-success'
                              : isResume
                              ? 'bg-warning/20 border-warning text-warning'
                              : isCodeCopy
                              ? 'bg-accent/20 border-accent text-accent'
                              : isClick
                              ? 'bg-accent/20 border-accent text-accent'
                              : 'bg-surface border-border text-muted group-hover:border-accent'
                          }`}
                        >
                          {isContact ? (
                            <Mail className="h-2.5 w-2.5" />
                          ) : isResume ? (
                            <FileText className="h-2.5 w-2.5" />
                          ) : isCodeCopy ? (
                            <Copy className="h-2.5 w-2.5" />
                          ) : isClick ? (
                            <ExternalLink className="h-2.5 w-2.5" />
                          ) : (
                            <Eye className="h-2.5 w-2.5" />
                          )}
                        </div>

                        {/* Step Card */}
                        <div className="rounded-sm border border-border/80 bg-surface-muted/30 p-3 hover:border-accent/40 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-semibold text-foreground truncate">
                              {step.title}
                            </span>
                            <span className="font-mono text-[10px] text-muted shrink-0">
                              {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-muted gap-2">
                            <span className="truncate text-placeholder">{step.pathOrUrl}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              {step.durationSeconds !== undefined && step.durationSeconds !== null && step.durationSeconds > 0 && (
                                <span className="text-accent">{step.durationSeconds}s dwell</span>
                              )}
                              {step.scrollDepth !== undefined && step.scrollDepth !== null && step.scrollDepth > 0 && (
                                <span className="text-info">{step.scrollDepth}% read</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
