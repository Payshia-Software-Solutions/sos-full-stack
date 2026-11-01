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
  allowed_schedules?: string;
  allowed_qualifications?: string;
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


export interface BatchSchedule {
  id: string | number;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  days?: string;
  time_slot?: string;
  badge?: string;
  is_active?: number | boolean;
}

export interface EducationalQualification {
  id: string | number;
  title_en: string;
  title_si?: string;
  title_ta?: string;
  display_order?: number;
  is_active?: number | boolean;
}

export const FALLBACK_SCHEDULES: BatchSchedule[] = [
  {
    id: 1,
    name_en: 'Weekend Batch (Saturday & Sunday)',
    name_si: 'සති අන්ත කණ්ඩායම (සෙනසුරාදා / ඉරිදා)',
    name_ta: 'வார இறுதி தொகுதி (சனி மற்றும் ஞாயிறு)',
    days: 'Saturday & Sunday',
    time_slot: '8.30 AM - 1.30 PM',
    badge: 'Most Popular for Working Students',
  },
  {
    id: 2,
    name_en: 'Weekday Batch (Tuesday & Thursday)',
    name_si: 'සතියේ දින සන්ධ්‍යා කණ්ඩායම (අඟහරුවාදා / බ්‍රහස්පතින්දා)',
    name_ta: 'வார நாள் மாலை தொகுதி (செவ்வாய் மற்றும் வியாழன்)',
    days: 'Tuesday & Thursday',
    time_slot: 'Evening Sessions (7.30 PM - 9.30 PM)',
    badge: 'Convenient Online Sessions',
  },
  {
    id: 3,
    name_en: 'Sunday Only Batch',
    name_si: 'ඉරිදා පමණක් පැවැත්වෙන කණ්ඩායම',
    name_ta: 'ஞாயிறு மட்டும் தொகுதி',
    days: 'Sunday',
    time_slot: '8.30 AM - 4.30 PM',
    badge: 'Special Intensive Class',
  },
  {
    id: 4,
    name_en: 'Full-Time Weekday Batch (Monday - Friday)',
    name_si: 'සතියේ දින පූර්ණ කාලීන කණ්ඩායම (සඳුදා - සිකුරාදා)',
    name_ta: 'முழு நேர வார நாள் தொகுதி',
    days: 'Monday to Friday',
    time_slot: '9.00 AM - 2.00 PM',
    badge: 'Fast-Track Program',
  },
];

export const FALLBACK_QUALIFICATIONS: EducationalQualification[] = [
  { id: 1, title_en: 'G.C.E. O/L Qualified', title_si: 'සාමාන්‍ය පෙළ සමත් (G.C.E. O/L)', title_ta: 'க.பொ.த சாதாரண தரம் தேர்ச்சி', display_order: 1 },
  { id: 2, title_en: 'G.C.E. A/L (Bio / Maths)', title_si: 'උසස් පෙළ විද්‍යා අංශය (G.C.E. A/L Bio/Maths)', title_ta: 'க.பொ.த உயர்தரம் (உயிரியல் / கணிதம்)', display_order: 2 },
  { id: 3, title_en: 'G.C.E. A/L (Other Streams)', title_si: 'උසස් පෙළ වාණිජ / කලා / තාක්ෂණවේදය', title_ta: 'க.பொ.த உயர்தரம் (ஏனைய துறைகள்)', display_order: 3 },
  { id: 4, title_en: 'Currently working in a Pharmacy', title_si: 'දැනටමත් ඖෂධසලක සේවය කරන අයෙක් (Pharmacy Experience)', title_ta: 'தற்போது மருந்தகத்தில் பணிபுரிபவர்', display_order: 4 },
  { id: 5, title_en: 'Degree / Higher Diploma Holder', title_si: 'වෙනත් ඩිප්ලෝමා හෝ උපාධිධාරී (Degree / Diploma)', title_ta: 'பட்டம் அல்லது உயர் டிப்ளோமா பெற்றவர்', display_order: 5 },
];

export async function fetchBatchSchedules(): Promise<BatchSchedule[]> {
  try {
    const res = await fetch(`${LMS_API_URL}/batch-schedules`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn("Could not fetch schedules from API, using fallback.");
  }
  return FALLBACK_SCHEDULES;
}

export async function fetchEducationalQualifications(): Promise<EducationalQualification[]> {
  try {
    const res = await fetch(`${LMS_API_URL}/educational-qualifications`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn("Could not fetch qualifications from API, using fallback.");
  }
  return FALLBACK_QUALIFICATIONS;
}
