import type { Metadata } from 'next';
import DepartmentPage from '@/components/department-template';

export const metadata: Metadata = {
  title: 'ඉංග්‍රීසි භාෂා අධ්‍යයන අංශය | Department of English for Healthcare | Ceylon Pharma College',
  description: 'Medical and professional English communication courses tailored for pharmacists, healthcare practitioners, and medical representatives.',
  alternates: {
    canonical: 'https://www.pharmacollege.lk/departments/department-of-english',
  },
  openGraph: {
    title: 'ඉංග්‍රීසි භාෂා අධ්‍යයන අංශය | Department of English for Healthcare | Ceylon Pharma College',
    description: 'Medical and professional English communication courses tailored for pharmacists, healthcare practitioners, and medical representatives.',
    url: 'https://www.pharmacollege.lk/departments/department-of-english',
    siteName: 'Ceylon Pharma College',
  },
};

const departmentData = {
  nameKey: 'deptNameEnglish',
  descriptionKey: 'deptDescEnglish',
  image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop',
  contact: {
    phone: '0715 884 884',
    email: 'english@pharmacollege.lk',
  },
  faculty: [],
  programs: [
    { nameKey: 'courseTitleEnglish', descriptionKey: 'programDescEnglish', slug: 'english-for-pharmacy' },
  ]
};

export default function EnglishDepartmentPage() {
  return <DepartmentPage departmentData={departmentData} />;
}
