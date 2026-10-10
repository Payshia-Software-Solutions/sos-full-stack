import { LMS_API_URL } from "./config";

export interface Course {
  id: string | number;
  course_name: string;
  course_code: string;
  course_fee: string | number;
  course_img: string;
  slug: string;
  course_description: string;
  course_duration: string;
  skill_level?: string;
  assessments?: string;
  quizzes?: string;
  category?: string;
  price?: number;
  display?: string | number;
  badge?: string;
  mode?: string;
  intake?: string;
}

export const FALLBACK_COURSES: Course[] = [
  {
    id: 1,
    course_name: "Certificate Course in Pharmacy Practice (CCPP)",
    course_code: "CS0001",
    course_fee: 15000,
    course_duration: "6 Months",
    slug: "certificate-course-in-pharmacy-practice",
    course_img: "WhatsApp Image 2025-09-20 at 10.56.49_69cedaa2.jpg",
    display: 1,
    badge: "Most Popular",
    mode: "Online • Live Zoom + Recorded Lessons",
    intake: "Registration Open",
    skill_level: "Beginner / Intermediate",
    assessments: "3 Online Exams & 3 Assignments",
    quizzes: "Interactive Educational Games",
    course_description: "A comprehensive 6-month program providing a practical foundation in medicines, prescription interpretation, dosage calculations, pharmacology, and pharmacy dispensing simulations. Includes home-delivered printed study pack and live interactive sessions."
  },
  {
    id: 2,
    course_name: "Advanced Course in Pharmacy Practice",
    course_code: "CS0002",
    course_fee: 18000,
    course_duration: "6 Months",
    slug: "advanced-course-in-pharmacy-practice",
    course_img: "pharma-advanced pharmacy practice-web copy.png",
    display: 1,
    badge: "Advanced Level",
    mode: "Online • Live Zoom + Recorded Lessons",
    intake: "Ongoing Enrollment",
    skill_level: "Advanced",
    assessments: "Module Examinations & Case Studies",
    quizzes: "Clinical Scenarios & Quiz Hub",
    course_description: "Designed for graduates of the Certificate Course who wish to master complex pharmacology, drug interactions, clinical pharmacy workflows, and healthcare regulatory compliance."
  },
  {
    id: 5,
    course_name: "Certificate Course in Pharmaceuticals",
    course_code: "CS0005",
    course_fee: 12500,
    course_duration: "4 Months",
    slug: "certificate-course-in-pharmaceuticals",
    course_img: "pharma-pharmasutical -web copy.png",
    display: 1,
    badge: "Public & Healthcare",
    mode: "Online Classes",
    intake: "Open",
    skill_level: "Foundation",
    assessments: "Online Continuous Assessments",
    quizzes: "Weekly Practice Quizzes",
    course_description: "Essential knowledge on medications, therapeutic groups, safe storage, and health decision-making tailored for healthcare workers, pharmacy assistants, and interested learners."
  },
  {
    id: 6,
    course_name: "Advanced Certificate Course in Pharmaceuticals",
    course_code: "CS0006",
    course_fee: 15000,
    course_duration: "6 Months",
    slug: "advanced-certificate-course-in-pharmaceuticals",
    course_img: "pharma-advanced pharmasutical -web copy.png",
    display: 1,
    badge: "Specialized",
    mode: "Online Classes",
    intake: "Open",
    skill_level: "Intermediate",
    assessments: "Research & Module Tests",
    quizzes: "Knowledge Tests",
    course_description: "Delves deeper into pharmaceutical science, drug classification systems, therapy management, and modern concepts in pharmaceutical care."
  },
  {
    id: 3,
    course_name: "Workshop in Pharmacy Practice",
    course_code: "CS0003",
    course_fee: 2500,
    course_duration: "1 Day Intensive",
    slug: "workshop-in-pharmacy-practice",
    course_img: "pharma-workshop pharmacy practice-web-COPY.png",
    display: 1,
    badge: "Short Program",
    mode: "Live Interactive Workshop",
    intake: "Weekend Batches",
    skill_level: "All Levels",
    assessments: "Practical Exercises",
    quizzes: "Interactive Q&A",
    course_description: "An intensive interactive workshop focusing on modern pharmacy workflows, POS simulations, and customer care essentials."
  }
];

export function getCourseCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('advanced')) return 'Advanced';
  if (lower.includes('certificate')) return 'Certificate';
  if (lower.includes('b.pharm') || lower.includes('degree')) return 'Degree';
  if (lower.includes('workshop')) return 'Workshop';
  if (lower.includes('professional')) return 'Professional';
  return 'Certificate';
}

/**
 * Server-side cached course fetcher with ISR (Incremental Static Regeneration).
 * Caches responses for 1 hour to ensure zero stress/load on backend server.
 * Instantly falls back to verified courses if API is slow or offline.
 */
export async function getCachedCourses(): Promise<Course[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${LMS_API_URL}/parent-main-course`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: any[] = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data
        .filter((c: any) => String(c.display) !== '0' && c.display !== 0)
        .map((c: any) => ({
          ...c,
          price: parseFloat(c.course_fee) || 0,
          category: getCourseCategory(c.course_name),
          mode: "Online • Live Zoom + Recorded Lessons",
          intake: "Registration Open",
        }));
    }
  } catch (error) {
    console.warn("Using fallback courses for high-performance SSR:", (error as Error).message);
  }

  return FALLBACK_COURSES.map(c => ({
    ...c,
    price: typeof c.course_fee === 'number' ? c.course_fee : parseFloat(String(c.course_fee)) || 0,
    category: getCourseCategory(c.course_name),
  }));
}
