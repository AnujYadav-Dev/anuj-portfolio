import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WorksClientView } from '@/components/features/works/WorksClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = constructMetadata({
  title: 'Works & Engineering Projects',
  description:
    'Systems architecture, web platforms, open-source utilities, and developer tooling built for performance and scalability.',
  canonicalPath: '/works',
  type: 'website',
});

function WorksLoadingFallback() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
      <Skeleton className="h-14 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Skeleton key={n} className="h-64 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function WorksPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Works', path: '/works' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Suspense fallback={<WorksLoadingFallback />}>
        <WorksClientView />
      </Suspense>
    </>
  );
}

