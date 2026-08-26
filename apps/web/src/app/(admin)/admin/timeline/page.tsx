'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type {
  TimelineEventDto,
  CreateTimelineEventRequest,
  UpdateTimelineEventRequest,
} from '@portfolio/shared';
import { TimelineEventType } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { ReorderableList } from '@/components/admin/ui/ReorderableList';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Milestone } from 'lucide-react';

import { toast } from 'sonner';

export default function AdminTimelinePage() {
  const [events, setEvents] = useState<TimelineEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEventDto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState<TimelineEventType>(TimelineEventType.Milestone);
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TimelineEventDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: TimelineEventDto[] }>('/timeline-events/admin/all');
      setEvents(res.data || []);
    } catch {
      toast.error('Failed to load timeline events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]!);
    setEndDate('');
    setEventType(TimelineEventType.Milestone);
    setUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt: TimelineEventDto) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDescription(evt.description || '');
    setDate(evt.date ? evt.date.split('T')[0]! : '');
    setEndDate(evt.endDate ? evt.endDate.split('T')[0]! : '');
    setEventType(evt.eventType);
    setUrl(evt.url || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      toast.error('Title and Date are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateTimelineEventRequest | UpdateTimelineEventRequest = {
        title,
        description: description || undefined,
        eventType,
        date: date,
        endDate: endDate || undefined,
        url: url || undefined,
      };

      if (editingEvent) {
        await apiClient.put(`/timeline-events/${editingEvent.id}`, payload);
        toast.success('Event updated successfully');
      } else {
        await apiClient.post('/timeline-events', {
          ...payload,
          sortOrder: events.length + 1,
        });
        toast.success('Event added to timeline');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save timeline event';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (newEvents: TimelineEventDto[]) => {
    setEvents(newEvents);
    try {
      await apiClient.put('/timeline-events/reorder', {
        items: newEvents.map((e) => ({ id: e.id, sortOrder: e.sortOrder })),
      });
      toast.success('Timeline order updated');
    } catch {
      toast.error('Failed to save order');
      fetchEvents();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/timeline-events/${deleteTarget.id}`);
      toast.success(`Event '${deleteTarget.title}' deleted.`);
      setDeleteTarget(null);
      fetchEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete event';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Journey & Career Timeline"
        description="Chronological milestones, major achievements, career transitions, and life events."
        action={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Milestone</span>
          </Button>
        }
      />

      <ReorderableList
        items={events}
        onReorder={handleReorder}
        isLoading={isLoading}
        renderItem={(item) => (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs">{item.title}</span>
                <span className="text-[10px] text-accent font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-border uppercase">
                  {item.eventType}
                </span>
              </div>
              <p className="text-[11px] text-muted font-mono mt-0.5">
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
                {item.description && ` — ${item.description.substring(0, 60)}...`}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted hover:text-foreground"
                onClick={() => openEditModal(item)}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteTarget(item)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      />

      {/* Editor Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Milestone className="w-4 h-4 text-accent" />
                <span>{editingEvent ? `Edit: ${editingEvent.title}` : 'Add Milestone Event'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Event Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Promoted to Senior Systems Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as TimelineEventType)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value={TimelineEventType.Milestone}>Milestone</option>
                  <option value={TimelineEventType.Job}>Job / Career Transition</option>
                  <option value={TimelineEventType.Education}>Education</option>
                  <option value={TimelineEventType.Project}>Project Launch</option>
                  <option value={TimelineEventType.Achievement}>Achievement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    End Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  External Link URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="Additional context about this milestone..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                disabled={isSaving}
              >
                Save Milestone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Milestone"
        description={`Are you sure you want to delete '${deleteTarget?.title}' from your journey?`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
