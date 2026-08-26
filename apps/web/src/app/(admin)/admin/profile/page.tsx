'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { apiClient } from '@/lib/api';
import type {
  AuthorDto,
  MediaDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@portfolio/shared';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, KeyRound, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProfilePage() {
  const { author, updateAuthor } = useAdminAuth();
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState(author?.displayName || '');
  const [bio, setBio] = useState(author?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(author?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (author) {
      setDisplayName(author.displayName || '');
      setBio(author.bio || '');
      setAvatarUrl(author.avatarUrl || '');
    }
  }, [author]);

  const handleSelectAvatar = (media: MediaDto) => {
    setAvatarUrl(media.url);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload: UpdateProfileRequest = {
        displayName,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
      };

      const res = await apiClient.put<{ data: AuthorDto }>('/auth/profile', payload);
      updateAuthor(res.data);
      toast.success('Author profile updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const payload: ChangePasswordRequest = {
        currentPassword,
        newPassword,
      };
      await apiClient.put('/auth/password', payload);
      toast.success('Password changed successfully. Please keep it safe!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <AdminPageHeader
        title="Author Account & Security"
        description="Manage your public bio, profile branding, avatar image, and authentication credentials."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Avatar & Status Quick Card */}
        <div className="space-y-4">
          <Card className="bg-surface border-border text-center p-6 flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent bg-surface-muted flex items-center justify-center shadow-lg">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-accent" />
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-semibold text-white"
              >
                Change Avatar
              </button>
            </div>

            <h3 className="font-bold text-foreground text-sm">{displayName || 'Author'}</h3>
            <p className="text-xs text-muted font-mono">{author?.email}</p>

            <div className="mt-4 pt-4 border-t border-border w-full flex items-center justify-center gap-1.5 text-xs text-accent font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>SuperAdmin Status</span>
            </div>
          </Card>
        </div>

        {/* Right 2 Cols: Profile Form & Password Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details */}
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                <span>Public Author Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Display Name</label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Bio / About Snippet
                  </label>
                  <Textarea
                    placeholder="Tell visitors about your background..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="bg-background text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"

                    variant="primary"
                    size="sm"
                    isLoading={isSavingProfile}
                    disabled={isSavingProfile}
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    <span>Save Profile Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="bg-surface border-border" id="password">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-accent" />
                <span>Security & Password Update</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted">
                Requires entering your existing password before updating credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Current Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="bg-background text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">New Password</label>
                    <Input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-background text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-background text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    isLoading={isChangingPassword}
                    disabled={isChangingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectAvatar}
        title="Select Author Avatar Image"
        acceptType="image"
      />
    </div>
  );
}
