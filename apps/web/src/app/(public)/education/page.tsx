import type { Metadata } from 'next';
import { serverApi } from '@/lib/server-api';
import { EducationClientView } from '@/components/features/education/EducationClientView';

export const metadata: Metadata = {
  title: 'Education & Academic Qualifications | Anuj Yadav',
  description:
    'Formal academic degrees, computer science curriculum foundations, coursework, and technical achievements.',
  openGraph: {
    title: 'Education & Academic Qualifications | Anuj Yadav',
    description:
      'Formal academic degrees, computer science foundations, and technical credentials.',
  },
};

export default async function EducationPage() {
  const educationList = await serverApi.getEducation();

  return <EducationClientView initialData={educationList} />;
}
