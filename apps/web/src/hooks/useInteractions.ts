'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
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
    mutationFn: (input) =>
      apiClient.post<{ data: ContactSubmissionDto }>('/contact', input),
    onSuccess: () => {
      toast.success('Thank you! Your message has been sent.');
    },
    onError: (err: any) => {
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

  return useMutation<
    { data: GuestbookEntryDto },
    Error,
    CreateGuestbookEntryInput
  >({
    mutationFn: (input) =>
      apiClient.post<{ data: GuestbookEntryDto }>('/guestbook', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestbook'] });
      toast.success('Entry submitted! It will appear after moderation.');
    },
    onError: (err: any) => {
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
      toast.success(res.data?.message || 'Subscribed successfully! Check your inbox.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to subscribe to newsletter.');
    },
  });
}
