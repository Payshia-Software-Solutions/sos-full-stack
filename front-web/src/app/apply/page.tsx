import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCachedCourses } from '@/lib/courses-data';
import ApplyFlow from '@/components/apply-flow';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Online Application & Admissions | Ceylon Pharma College',
  description: 'Apply online for pharmacy practice certificate & diploma courses at Ceylon Pharma College. Fast admissions, flexible installments, and home-delivered study packs in Sri Lanka.',
  keywords: [
    'Pharmacy course registration Sri Lanka',
    'Apply Ceylon Pharma College',
    'Online pharmacy course application',
    'Certificate course in pharmacy practice apply',
    'Diploma in pharmacy admission Sri Lanka',
  ],
  openGraph: {
    title: 'Apply Online | Ceylon Pharma College Admissions',
    description: 'Fast 3-step online application for pharmacy education in Sri Lanka.',
    url: 'https://www.pharmacollege.lk/apply',
  },
};

function ApplyFlowFallback() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-6">
      <Skeleton className="h-10 w-2/3 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

export default async function ApplyPage() {
  const courses = await getCachedCourses();

  return (
    <main className="min-h-screen bg-secondary/15 py-8 md:py-16">
      <Suspense fallback={<ApplyFlowFallback />}>
        <ApplyFlow initialCourses={courses} />
      </Suspense>
    </main>
  );
}
