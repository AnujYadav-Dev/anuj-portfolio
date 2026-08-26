import type { Metadata } from 'next';
import { SkillsClientView } from '@/components/features/about/SkillsClientView';
import { constructMetadata, generateBreadcrumbsJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Skills, Technologies & Tools',
  description:
    'Comprehensive technical disciplines, language proficiencies, frameworks, databases, and DevOps tooling.',
  canonicalPath: '/skills',
  type: 'profile',
});

export default function SkillsPage() {
  const breadcrumbJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Skills', path: '/skills' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <SkillsClientView />
    </>
  );
}
