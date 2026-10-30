import type { Metadata } from 'next';
import DepartmentPage from '@/components/department-template';

export const metadata: Metadata = {
  title: 'ඖෂධවේදී අධ්‍යයන අංශය | Department of Pharmaceutical Sciences | Ceylon Pharma College',
  description: 'Explore programs, practical pharmacology modules, and professional dispensing qualifications offered by the Department of Pharmaceutical Sciences at Ceylon Pharma College.',
  alternates: {
    canonical: 'https://www.pharmacollege.lk/departments/department-of-pharmaceutical',
  },
  openGraph: {
    title: 'ඖෂධවේදී අධ්‍යයන අංශය | Department of Pharmaceutical Sciences | Ceylon Pharma College',
    description: 'Explore programs, practical pharmacology modules, and professional dispensing qualifications offered by the Department of Pharmaceutical Sciences at Ceylon Pharma College.',
    url: 'https://www.pharmacollege.lk/departments/department-of-pharmaceutical',
    siteName: 'Ceylon Pharma College',
  },
};

const departmentData = {
  nameKey: 'deptNamePharmaceutical',
  descriptionKey: 'deptDescPharmaceutical',
  image: 'https://images.unsplash.com/photo-1583324113620-91542302de3e?q=80&w=2070&auto=format&fit=crop',
  contact: {
    phone: '0715 884 884',
    email: 'pharma@pharmacollege.lk',
  },
  faculty: [],
  programs: [
    { nameKey: 'courseTitleDPP', descriptionKey: 'programDescPharma', slug: 'diploma-in-pharmacy-practice' },
    { nameKey: 'courseTitleACP', descriptionKey: 'programDescPharma', slug: 'advanced-community-pharmacy-practice' },
  ]
};

export default function PharmaceuticalDepartmentPage() {
  return <DepartmentPage departmentData={departmentData} />;
}
