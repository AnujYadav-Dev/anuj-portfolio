'use client';

import React, { useState, useEffect, useCallback } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api';
import type { MediaDto, PaginatedResponse } from '@portfolio/shared';
import { Image as ImageIcon, FileText, UploadCloud, Search, Check, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaDto) => void;
  title?: string;
  acceptType?: 'image' | 'pdf' | 'all';
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  acceptType = 'image',
}: MediaPickerModalProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [mediaList, setMediaList] = useState<MediaDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaDto | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchMedia = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = { pageSize: '40' };
      if (acceptType !== 'all') params.mediaType = acceptType;
      if (search) params.search = search;

      const res = await apiClient.get<PaginatedResponse<MediaDto>>('/media', { params });
      setMediaList(res.data || []);
    } catch {
      toast.error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, acceptType, search]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please choose a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (altText) formData.append('altText', altText);
      if (caption) formData.append('caption', caption);

      const res = await apiClient.upload<{ data: MediaDto }>('/media', formData);
      toast.success('Asset uploaded successfully!');
      onSelect(res.data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="max-w-3xl bg-surface border-border p-6 max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-accent" />
            <span>{title}</span>
          </DialogTitle>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setTab('library')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                tab === 'library'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground',
              )}
            >
              Browse Library
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                tab === 'upload'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground',
              )}
            >
              Upload New
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Library Browser */}
        {tab === 'library' && (
          <div className="flex-1 flex flex-col min-h-0 py-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-placeholder pointer-events-none" />
              <Input
                type="text"
                placeholder="Search assets by name or alt text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background text-xs h-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px] border border-border rounded-lg p-3 bg-background/50">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 py-16 text-muted">
                  <Spinner className="w-6 h-6 text-accent" />
                  <span className="font-mono text-xs">Loading media assets...</span>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 py-16 text-muted text-center">
                  <ImageIcon className="w-8 h-8 text-placeholder" />
                  <p className="text-sm font-semibold text-foreground">No media assets found</p>
                  <p className="text-xs text-muted">Switch to the Upload tab to add files.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {mediaList.map((item) => {
                    const isSelected = selectedMedia?.id === item.id;
                    const isImage = item.mediaType === 'image';

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelectedMedia(item)}
                        className={cn(
                          'relative group rounded-lg overflow-hidden border text-left flex flex-col bg-surface hover:border-accent transition-all p-1.5',
                          isSelected
                            ? 'border-accent ring-2 ring-accent/30 bg-accent/5'
                            : 'border-border',
                        )}
                      >
                        <div className="aspect-square w-full rounded bg-surface-muted overflow-hidden flex items-center justify-center relative">
                          {isImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.url}
                              alt={item.altText || item.filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-accent" />
                          )}

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-foreground truncate w-full">
                          {item.filename}
                        </p>
                        <span className="text-[9px] text-muted font-mono uppercase">
                          {item.mediaType}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Dropzone */}
        {tab === 'upload' && (
          <form onSubmit={handleUpload} className="flex-1 py-4 space-y-4">
            <div className="border-2 border-dashed border-border hover:border-accent rounded-xl p-8 text-center bg-background/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">
                {uploadFile ? uploadFile.name : 'Choose a file to upload'}
              </p>
              <p className="text-xs text-muted mb-4 font-mono">
                PNG, JPG, WebP, SVG, PDF up to 10MB
              </p>
              <input
                type="file"
                id="media-file-input"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="hidden"
                accept={
                  acceptType === 'image'
                    ? 'image/*'
                    : acceptType === 'pdf'
                      ? 'application/pdf'
                      : '*/*'
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('media-file-input')?.click()}
              >
                Select File from Computer
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Alt Text (Accessibility)
                </label>
                <Input
                  type="text"
                  placeholder="Describe image for screen readers"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Caption (Optional)</label>
                <Input
                  type="text"
                  placeholder="Image caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-xs font-semibold"
              disabled={!uploadFile || isUploading}
              isLoading={isUploading}
            >
              Upload and Insert Asset
            </Button>
          </form>
        )}

        {/* Footer Actions */}
        {tab === 'library' && (
          <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
            <div className="text-xs text-muted truncate">
              {selectedMedia ? (
                <span>
                  Selected: <strong className="text-foreground">{selectedMedia.filename}</strong>
                </span>
              ) : (
                'Select an asset from the grid'
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={!selectedMedia}
                onClick={handleConfirmSelect}
              >
                Insert Selected
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
