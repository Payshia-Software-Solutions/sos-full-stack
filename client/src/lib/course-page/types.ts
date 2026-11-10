// Course page content types. Kept in sync with front-web/src/lib/course-page.ts
// (the two apps share no package). Shared fields (icon, photo_url, phone) live only in `en`.

export interface CoursePageDoc {
  hero?: { eyebrow?: string; title?: string; headline?: string; promise?: string };
  facts?: {
    next_intake?: string; mode?: string; medium?: string; entry_requirements?: string;
    study_materials?: string; learning_style?: string; support?: string; certificate?: string;
    class_day?: string; class_time?: string;
  };
  overview?: { title?: string; paragraphs?: string[] };
  audience?: { title?: string; intro?: string; items?: string[]; note?: string };
  features?: { title?: string; intro?: string; closing?: string; items?: { icon?: string; title?: string; description?: string }[] };
  learn?: { title?: string; intro?: string; items?: string[]; closing?: string };
  modules?: { title?: string; items?: { title?: string; description?: string }[] };
  assessment?: { title?: string; intro?: string; items?: string[]; note?: string };
  schedule?: { title?: string; note?: string; recordings?: string };
  lecturers?: { title?: string; items?: { name?: string; qualifications?: string; photo_url?: string }[] };
  faq?: { title?: string; items?: { question?: string; answer?: string }[] };
  cta?: { title?: string; subtitle?: string; tagline?: string; phone?: string };
}

export type TranslatedLanguage = 'si' | 'ta';
export type PageLanguage = 'en' | TranslatedLanguage;

export interface CoursePageContent {
  en: CoursePageDoc;
  si: CoursePageDoc;
  ta: CoursePageDoc;
  overrides?: { si: string[]; ta: string[] };
}

export interface RefundPolicyDoc { title?: string; items?: { title?: string; body?: string }[] }
export interface RefundPolicy { en: RefundPolicyDoc; si: RefundPolicyDoc; ta: RefundPolicyDoc }

export interface AdminCoursePage {
  courseCode: string;
  status: 'draft' | 'published' | 'none';
  draft: CoursePageContent | null;
  published: CoursePageContent | null;
  publishedAt: string | null;
  updatedAt: string | null;
}

export const SHARED_FIELDS = ['icon', 'photo_url', 'phone'] as const;

export const COURSE_PAGE_ICONS = [
  'gamepad-2', 'pill', 'calculator', 'book-open', 'video', 'play-circle', 'trophy', 'stethoscope',
  'briefcase', 'graduation-cap', 'flask-conical', 'clipboard-check', 'users', 'shield-check', 'heart-pulse', 'award',
] as const;

export const emptyContent = (): CoursePageContent => ({ en: {}, si: {}, ta: {}, overrides: { si: [], ta: [] } });
