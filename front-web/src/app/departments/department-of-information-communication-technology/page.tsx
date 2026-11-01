import type { Metadata } from 'next';
import DepartmentPage from '@/components/department-template';

export const metadata: Metadata = {
  title: 'තොරතුරු තාක්ෂණ අංශය | Department of ICT & Digital Health | Ceylon Pharma College',
  description: 'Pharmacy software, digital inventory management, and ICT for healthcare systems at Ceylon Pharma College.',
  alternates: {
    canonical: 'https://www.pharmacollege.lk/departments/department-of-information-communication-technology',
  },
  openGraph: {
    title: 'තොරතුරු තාක්ෂණ අංශය | Department of ICT & Digital Health | Ceylon Pharma College',
    description: 'Pharmacy software, digital inventory management, and ICT for healthcare systems at Ceylon Pharma College.',
    url: 'https://www.pharmacollege.lk/departments/department-of-information-communication-technology',
    siteName: 'Ceylon Pharma College',
  },
};

const departmentData = {
  nameKey: 'deptNameICT',
  descriptionKey: 'deptDescICT',
  image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
  contact: {
    phone: '0715 884 884',
    email: 'ict@pharmacollege.lk',
  },
  faculty: [],
  programs: [
    { nameKey: 'courseTitleICT', descriptionKey: 'programDescICT', slug: 'ict-for-pharmacy' },
  ]
};

export default function IctDepartmentPage() {
  return <DepartmentPage departmentData={departmentData} />;
}
