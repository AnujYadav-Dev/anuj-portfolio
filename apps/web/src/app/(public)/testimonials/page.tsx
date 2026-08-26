import type { Metadata } from 'next';
import { TestimonialsClientView } from '@/components/features/testimonials/TestimonialsClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Recommendations & Testimonials',
  description:
    'Kind words, recommendations, and feedback from engineering leaders, colleagues, and collaborators.',
  canonicalPath: '/testimonials',
  type: 'profile',
});

export default function TestimonialsPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Testimonials', path: '/testimonials' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <TestimonialsClientView />
    </>
  );
}
