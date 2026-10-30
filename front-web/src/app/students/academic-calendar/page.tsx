import type { Metadata } from 'next';
import AcademicCalendarClient from '@/components/academic-calendar-client';

export const metadata: Metadata = {
  title: 'ශාස්ත්‍රීය දින දර්ශනය | Academic Calendar | Ceylon Pharma College',
  description: 'Academic schedule, intake start dates, semester timetables, assignment deadlines, and exam dates at Ceylon Pharma College.',
  keywords: [
    'Ceylon Pharma College academic calendar',
    'Pharmacy course timetable Sri Lanka',
    'Pharmacy intake dates',
    'Ceylon Pharma College semester calendar'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/students/academic-calendar',
  },
  openGraph: {
    title: 'Academic Calendar | Ceylon Pharma College',
    description: 'Lecture schedules, semester dates, and examination timelines.',
    url: 'https://www.pharmacollege.lk/students/academic-calendar',
    siteName: 'Ceylon Pharma College',
  },
};

export default function AcademicCalendarPage() {
  return <AcademicCalendarClient />;
}
