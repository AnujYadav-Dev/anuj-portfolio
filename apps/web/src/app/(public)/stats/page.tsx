import type { Metadata } from 'next';
import { StatsClientView } from '@/components/features/stats/StatsClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Dynamic Platform Statistics & Telemetry',
  description:
    'Real-time aggregation of portfolio data, publications, open-source repositories, and experience metrics.',
  canonicalPath: '/stats',
  type: 'website',
});

export default function StatsPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Statistics', path: '/stats' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <StatsClientView />
    </>
  );
}
