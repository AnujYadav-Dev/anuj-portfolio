'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '@/lib/api';
import type {
  ContactSubmissionDto,
  CreateContactInput,
  CreateGuestbookEntryInput,
  GuestbookEntryDto,
  NewsletterSubscribeInput,
  PaginatedResponse,
  TestimonialDto,
} from '@portfolio/shared';
import { toast } from 'sonner';

export function useContactMutation() {
  return useMutation<{ data: ContactSubmissionDto }, Error, CreateContactInput>({
    mutationFn: (input) => {
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('portfolio_session_id') || undefined : undefined;
      return apiClient.post<{ data: ContactSubmissionDto }>('/contact', {
        ...input,
        sessionId: input.sessionId || sessionId,
      });
    },
    onSuccess: () => {
      toast.success('Thank you! Your message has been sent.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send message. Please try again.');
    },
  });
}

export function useGuestbook(page = 1, pageSize = 20) {
  return useQuery<PaginatedResponse<GuestbookEntryDto>>({
    queryKey: ['guestbook', page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<GuestbookEntryDto>>('/guestbook', {
        params: { page, pageSize },
      }),
  });
}

export function useGuestbookMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ data: GuestbookEntryDto }, Error, CreateGuestbookEntryInput>({
    mutationFn: (input) => apiClient.post<{ data: GuestbookEntryDto }>('/guestbook', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestbook'] });
      toast.success('Entry submitted! It will appear after moderation.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit entry.');
    },
  });
}

export function useTestimonials(isFeatured?: boolean) {
  return useQuery<{ data: TestimonialDto[] }>({
    queryKey: ['testimonials', isFeatured],
    queryFn: () =>
      apiClient.get<{ data: TestimonialDto[] }>('/testimonials', {
        params: isFeatured !== undefined ? { isFeatured } : undefined,
      }),
  });
}

export function useNewsletterMutation() {
  return useMutation<{ data: { message: string } }, Error, NewsletterSubscribeInput>({
    mutationFn: (input) =>
      apiClient.post<{ data: { message: string } }>('/newsletter/subscribe', input),
    onSuccess: (res) => {
      const msg = res.data?.message || 'Subscribed successfully! Check your inbox.';
      if (msg.toLowerCase().includes('already')) {
        toast.info(msg);
      } else {
        toast.success(msg);
      }
    },
    onError: (err: unknown) => {
      const isConflict =
        (err instanceof ApiClientError && err.statusCode === 409) ||
        (err instanceof Error && err.message.toLowerCase().includes('already subscribed'));

      if (isConflict) {
        toast.info('You are already subscribed to the newsletter with this email.');
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to subscribe to newsletter.';
        toast.error(msg);
      }
    },
  });
}

export function useNewsletterUnsubscribeVerify(token: string | null) {
  return useQuery<{ data: { isValid: boolean; email: string; isUnsubscribed: boolean } }>({
    queryKey: ['newsletter-unsubscribe-verify', token],
    queryFn: () =>
      apiClient.get<{ data: { isValid: boolean; email: string; isUnsubscribed: boolean } }>(
        '/newsletter/unsubscribe',
        { params: { token: token! } },
      ),
    enabled: Boolean(token && token.trim()),
    retry: false,
  });
}

export function useNewsletterUnsubscribeMutation() {
  return useMutation<{ data: { message: string; email: string } }, Error, { token: string }>({
    mutationFn: (input) =>
      apiClient.post<{ data: { message: string; email: string } }>('/newsletter/unsubscribe', input),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Unsubscribed successfully.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to unsubscribe. Please try again.');
    },
  });
}

export function useNewsletterResubscribeMutation() {
  return useMutation<{ data: { message: string; email: string } }, Error, { token: string }>({
    mutationFn: (input) =>
      apiClient.post<{ data: { message: string; email: string } }>('/newsletter/resubscribe', input),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Resubscribed successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to resubscribe. Please try again.');
    },
  });
}

