import type { Metadata } from 'next';
import { HomeClientView } from '@/components/features/home/HomeClientView';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Anuj Yadav — Full-Stack Engineer & Architect',
  description:
    'Full-Stack Developer, Systems Architect & Open Source Contributor. Explore portfolio projects, technical writings, and research.',
  canonicalPath: '/',
  type: 'website',
});

export default function HomePage() {
  return <HomeClientView />;
}
