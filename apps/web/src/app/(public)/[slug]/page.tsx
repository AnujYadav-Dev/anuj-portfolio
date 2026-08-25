'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DynamicPageRenderer } from '@/components/features/pages/DynamicPageRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useDynamicPage } from '@/hooks/useLayout';

export default function GenericDynamicPage() {
  const params = useParams();
  const slug = String(params?.slug || '');

  const { data: pageData, isLoading, error } = useDynamicPage(slug);
  const page = pageData?.data;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16 flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-xs text-muted mt-2">
          The requested page &quot;/{slug}&quot; could not be found.
        </p>
        <div className="pt-6">
          <Link href="/">
            <Button variant="primary" size="sm">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <DynamicPageRenderer page={page} />;
}
