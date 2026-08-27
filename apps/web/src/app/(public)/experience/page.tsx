import type { Metadata } from 'next';
import { serverApi } from '@/lib/server-api';
import { ExperienceClientView } from '@/components/features/experience/ExperienceClientView';

export const metadata: Metadata = {
  title: 'Career & Professional Experience | Anuj Yadav',
  description:
    'Comprehensive history of software engineering roles, system architecture responsibilities, and distributed software systems.',
  openGraph: {
    title: 'Career & Professional Experience | Anuj Yadav',
    description:
      'Explore full software engineering roles, distributed architecture leadership, and technical history.',
  },
};

export default async function ExperiencePage() {
  const experiences = await serverApi.getExperiences();

  return <ExperienceClientView initialData={experiences} />;
}
