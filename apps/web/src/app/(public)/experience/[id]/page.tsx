import type { Metadata } from 'next';
import { serverApi } from '@/lib/server-api';
import { SingleExperienceClientView } from '@/components/features/experience/SingleExperienceClientView';

interface ExperienceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExperienceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const experience = await serverApi.getExperienceById(id);

  if (!experience) {
    return {
      title: 'Experience Profile | Anuj Yadav',
    };
  }

  return {
    title: `${experience.role} @ ${experience.companyName} | Experience`,
    description: experience.description?.slice(0, 160) || `Professional role at ${experience.companyName}`,
  };
}

export default async function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const { id } = await params;
  const experience = await serverApi.getExperienceById(id);

  return <SingleExperienceClientView id={id} initialData={experience} />;
}
