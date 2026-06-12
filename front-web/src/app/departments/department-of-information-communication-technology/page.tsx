
"use client";

import DepartmentPage from '@/components/department-template';

const departmentData = {
  nameKey: 'deptNameIct',
  descriptionKey: 'deptDescIct',
  image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
  contact: {
    phone: '0715 884 884',
    email: 'ict@pharmacollege.lk',
  },
  faculty: [],
  programs: [
    { nameKey: 'programNameIctDip', descriptionKey: 'programDescComingSoon', slug: '#' },
    { nameKey: 'programNameIctWeb', descriptionKey: 'programDescComingSoon', slug: '#' },
  ]
};

export default function IctDepartmentPage() {
    return <DepartmentPage departmentData={departmentData} />;
}

    