
"use client";

import DepartmentPage from '@/components/department-template';

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

    