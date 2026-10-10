import type { Metadata } from 'next';
import CourseCatalog from '@/components/course-catalog';
import { getCachedCourses } from '@/lib/courses-data';

export const metadata: Metadata = {
  title: 'Pharmacy Courses in Sri Lanka | Ceylon Pharma College',
  description: 'Explore ACTD accredited and ISO 9001:2015 certified pharmacy courses in Sri Lanka. Interactive online classes, educational games, and home-delivered study packs.',
  keywords: [
    'Pharmacy course in Sri Lanka',
    'Certificate course in pharmacy practice',
    'Online pharmacy course Sri Lanka',
    'Pharmacy assistant course Sri Lanka',
    'Ceylon Pharma College courses',
  ],
  openGraph: {
    title: 'Pharmacy Courses in Sri Lanka | Ceylon Pharma College',
    description: 'Practical pharmacy education with interactive online classes and certificate verification.',
    url: 'https://www.pharmacollege.lk/courses',
  },
};

export default async function CoursesPage() {
  const courses = await getCachedCourses();

  return (
    <main>
      <CourseCatalog initialCourses={courses} />
    </main>
  );
}
