import type { Metadata } from 'next';
import ExaminationsClient from '@/components/examinations-client';

export const metadata: Metadata = {
  title: 'විභාග සහ ඇගයීම් ක්‍රමවේදය | Examinations & Assessments | Ceylon Pharma College',
  description: 'Guidelines for assignments, online exams, prescription decoding practical assessments, and grading standards at Ceylon Pharma College.',
  keywords: [
    'Ceylon Pharma College exams',
    'Pharmacy assessment criteria Sri Lanka',
    'Prescription decoding exam',
    'Pharmacy grading scale'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/students/examinations',
  },
  openGraph: {
    title: 'Examinations & Assessments | Ceylon Pharma College',
    description: 'Practical evaluation standards and examination policies.',
    url: 'https://www.pharmacollege.lk/students/examinations',
    siteName: 'Ceylon Pharma College',
  },
};

export default function ExaminationsPage() {
  return <ExaminationsClient />;
}
