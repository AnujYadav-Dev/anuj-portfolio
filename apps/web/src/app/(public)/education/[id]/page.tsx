import type { Metadata } from 'next';
import { serverApi } from '@/lib/server-api';
import { SingleEducationClientView } from '@/components/features/education/SingleEducationClientView';

interface EducationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EducationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const education = await serverApi.getEducationById(id);

  if (!education) {
    return {
      title: 'Academic Qualification | Anuj Yadav',
    };
  }

  return {
    title: `${education.degree} @ ${education.institution} | Education`,
    description: education.description?.slice(0, 160) || `Academic qualification at ${education.institution}`,
  };
}

export default async function EducationDetailPage({ params }: EducationDetailPageProps) {
  const { id } = await params;
  const education = await serverApi.getEducationById(id);

  return <SingleEducationClientView id={id} initialData={education} />;
}
