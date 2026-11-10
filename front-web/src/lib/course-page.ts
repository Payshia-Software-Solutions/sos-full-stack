import { LMS_API_URL } from "@/lib/config";

// Course page content managed from SOS admin (server table `course_page_content`).
// Shared fields (icon, photo_url, phone) live only in the English document.

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

export interface CoursePageContent {
  en: CoursePageDoc;
  si: CoursePageDoc;
  ta: CoursePageDoc;
  overrides?: { si: string[]; ta: string[] };
}

export interface RefundPolicyDoc { title?: string; items?: { title?: string; body?: string }[] }
export type PageLanguage = 'en' | 'si' | 'ta';

export interface CoursePageData {
  courseCode: string;
  slug: string;
  publishedAt: string | null;
  content: CoursePageContent;
  refundPolicy: { en: RefundPolicyDoc; si: RefundPolicyDoc; ta: RefundPolicyDoc } | null;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function hasText(v: unknown): boolean {
  return typeof v === 'string' && v.trim() !== '';
}

// Deep merge where `base` (English) decides the shape and `over` wins wherever it has text.
function mergeFallback(base: unknown, over: unknown): unknown {
  if (Array.isArray(base)) {
    const overArr = Array.isArray(over) ? over : [];
    return base.map((item, i) => mergeFallback(item, overArr[i]));
  }
  if (isPlainObject(base)) {
    const overObj = isPlainObject(over) ? over : {};
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(base)) {
      out[key] = mergeFallback(base[key], overObj[key]);
    }
    return out;
  }
  return hasText(over) ? over : base;
}

export function resolveDoc<T extends object>(content: { en: T; si?: T; ta?: T }, lang: PageLanguage): T {
  if (lang === 'en') return content.en;
  return mergeFallback(content.en, content[lang]) as T;
}

export function isBlockEmpty(block: unknown): boolean {
  if (!isPlainObject(block)) return true;
  return !Object.values(block).some((v) =>
    Array.isArray(v) ? v.length > 0 : hasText(v)
  );
}

export function buildFaqJsonLd(doc: CoursePageDoc): object | null {
  const items = (doc.faq?.items ?? []).filter((i) => hasText(i.question) && hasText(i.answer));
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
}

// Default 3s so a slow API can never hold up the page; override with COURSE_PAGE_FETCH_TIMEOUT_MS (e.g. local dev against a remote DB).
const FETCH_TIMEOUT_MS = Number(process.env.COURSE_PAGE_FETCH_TIMEOUT_MS) || 3000;

export async function getCoursePage(slug: string): Promise<CoursePageData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${LMS_API_URL}/api/course-pages/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      next: { revalidate: 300 },
    } as RequestInit);
    if (!res.ok) return null;
    const body = await res.json();
    if (!body?.success || !isPlainObject(body.content)) return null;
    return {
      courseCode: String(body.course_code ?? ''),
      slug: String(body.slug ?? slug),
      publishedAt: body.published_at ?? null,
      content: {
        en: body.content.en ?? {},
        si: body.content.si ?? {},
        ta: body.content.ta ?? {},
        overrides: body.content.overrides,
      },
      refundPolicy: body.refund_policy ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const CONTENT_PROVIDER = 'https://content-provider.pharmacollege.lk';

/** Public URL of a course cover: covers live under /courses/{course_code}/ on the content server. */
export function buildCoverUrl(courseCode: string, courseImg?: string | null): string | null {
  const img = (courseImg ?? '').trim();
  if (!img || !courseCode) return null;
  if (/^https?:\/\//i.test(img)) return img;
  return `${CONTENT_PROVIDER}/courses/${courseCode}/${encodeURIComponent(img)}`;
}
