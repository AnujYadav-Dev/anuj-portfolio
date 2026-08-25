'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { MediaDto, PaginatedResponse, UpdateMediaRequest } from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
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
import { Spinner } from '@/components/ui/spinner';
import {
  HardDrive,
  UploadCloud,
  Search,
  Copy,
  Trash2,
  Edit2,
  FileText,
  Image as ImageIcon,
  Check,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export default function AdminMediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mediaType, setMediaType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Inspector / Editor Modal
  const [inspectingItem, setInspectingItem] = useState<MediaDto | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MediaDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: '24' };
      if (search) params.search = search;
      if (mediaType !== 'all') params.mediaType = mediaType;

      const res = await apiClient.get<PaginatedResponse<MediaDto>>('/media', { params });
      setMediaList(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.totalItems || 0);
    } catch {
      toast.error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [page, search, mediaType]);

  const handleOpenInspect = (item: MediaDto) => {
    setInspectingItem(item);
    setAltText(item.altText || '');
    setCaption(item.caption || '');
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingItem) return;

    setIsUpdating(true);
    try {
      const payload: UpdateMediaRequest = {
        altText: altText || null,
        caption: caption || null,
      };

      await apiClient.put(`/media/${inspectingItem.id}`, payload);
      toast.success('Media metadata updated');
      setInspectingItem(null);
      fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update metadata');
    } finally {
      setIsUpdating(false);
    }
  };

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
      if (uploadAlt) formData.append('altText', uploadAlt);
      if (uploadCaption) formData.append('caption', uploadCaption);

      await apiClient.upload('/media', formData);
      toast.success('Asset uploaded successfully!');
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadAlt('');
      setUploadCaption('');
      fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/media/${deleteTarget.id}`);
      toast.success('Asset deleted permanently.');
      setDeleteTarget(null);
      setInspectingItem(null);
      fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete asset');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Direct URL copied to clipboard!');
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Centralized Media Library"
        description="Unified storage asset repository for project screenshots, blog covers, PDFs, and avatars."
        action={
          <Button variant="primary" size="sm" onClick={() => setIsUploadOpen(true)}>
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
            <span>Upload New Asset</span>
          </Button>
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-placeholder pointer-events-none" />
            <Input
              type="text"
              placeholder="Search assets by filename or alt text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
            {['all', 'image', 'pdf', 'video'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMediaType(type)}
                className={cn(
                  'px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors',
                  mediaType === type
                    ? 'bg-surface text-foreground font-bold shadow-sm'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-muted">
          {totalItems} total assets
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner className="w-8 h-8 text-accent" />
          <span className="text-xs font-mono text-muted">Loading assets...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border rounded-xl p-8 bg-surface">
          <HardDrive className="w-10 h-10 text-placeholder mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">No media assets found</p>
          <p className="text-xs text-muted mt-1">Upload images, diagrams, or PDF resumes.</p>
          <Button variant="primary" size="sm" onClick={() => setIsUploadOpen(true)} className="mt-4">
            Upload File
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {mediaList.map((item) => {
            const isImage = item.mediaType === 'image';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenInspect(item)}
                className="group relative rounded-lg overflow-hidden border border-border bg-surface flex flex-col shadow-sm hover:border-accent transition-all cursor-pointer p-1.5"
              >
                <div className="aspect-square w-full rounded bg-surface-muted overflow-hidden flex items-center justify-center relative">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-accent" />
                  )}

                  {/* Quick Copy Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-1.5">
                  <p className="font-semibold text-[11px] text-foreground truncate">{item.filename}</p>
                  <div className="flex items-center justify-between text-[9px] text-muted font-mono mt-0.5">
                    <span className="uppercase">{item.mediaType}</span>
                    <span>{formatBytes(item.sizeBytes)}</span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md bg-surface border-border p-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-accent" />
                <span>Upload New Media File</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="border-2 border-dashed border-border hover:border-accent rounded-xl p-6 text-center bg-background/50">
                <p className="text-xs font-semibold text-foreground mb-1">
                  {uploadFile ? uploadFile.name : 'Choose a file'}
                </p>
                <p className="text-[10px] text-muted font-mono mb-3">PNG, JPG, WebP, SVG, PDF up to 10MB</p>
                <input
                  type="file"
                  id="direct-upload-file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('direct-upload-file')?.click()}
                >
                  Browse Files
                </Button>
              </div>


              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Alt Text (Accessibility)</label>
                <Input
                  type="text"
                  placeholder="Describe image..."
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Caption (Optional)</label>
                <Input
                  type="text"
                  placeholder="Image caption"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="bg-background text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!uploadFile || isUploading}
                isLoading={isUploading}
              >
                Upload File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspect & Edit Metadata Modal */}
      <Dialog open={Boolean(inspectingItem)} onOpenChange={(open) => !open && setInspectingItem(null)}>
        <DialogContent className="max-w-2xl bg-surface border-border p-6 max-h-[85vh] flex flex-col">
          {inspectingItem && (
            <form onSubmit={handleUpdateMetadata} className="space-y-4 flex-1 flex flex-col">
              <DialogHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
                <DialogTitle className="text-base font-bold text-foreground truncate max-w-sm">
                  {inspectingItem.filename}
                </DialogTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(inspectingItem)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Asset
                </Button>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
                <div className="aspect-square w-full rounded-lg bg-surface-muted border border-border overflow-hidden flex items-center justify-center p-2">
                  {inspectingItem.mediaType === 'image' ? (
                    <img
                      src={inspectingItem.url}
                      alt={inspectingItem.altText || ''}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <FileText className="w-16 h-16 text-accent" />
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-background border border-border space-y-1 font-mono text-[11px]">
                    <p className="text-muted">Type: <span className="text-foreground">{inspectingItem.mimeType}</span></p>
                    <p className="text-muted">Size: <span className="text-foreground">{formatBytes(inspectingItem.sizeBytes)}</span></p>

                    {inspectingItem.width && (
                      <p className="text-muted">Dimensions: <span className="text-foreground">{inspectingItem.width} × {inspectingItem.height} px</span></p>
                    )}
                    <p className="text-muted">Created: <span className="text-foreground">{new Date(inspectingItem.createdAt).toLocaleString()}</span></p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Direct URL</label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="text"
                        readOnly
                        value={inspectingItem.url}
                        className="bg-background text-xs font-mono select-all"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5"
                        onClick={() => handleCopyUrl(inspectingItem.url)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Alt Text (Accessibility)</label>
                    <Input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Caption (Optional)</label>
                    <Input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="bg-background text-xs"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setInspectingItem(null)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isUpdating} disabled={isUpdating}>
                  Save Metadata
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Media Asset"
        description={`Permanently delete '${deleteTarget?.filename}'? This cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
