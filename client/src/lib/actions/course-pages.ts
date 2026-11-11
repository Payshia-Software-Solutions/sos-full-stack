import { LMS_API_URL } from '@/lib/config';
import type { AdminCoursePage, CoursePageContent } from '@/lib/course-page/types';

async function request<T = any>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${LMS_API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
  return body as T;
}

export const getCoursePageAdmin = async (courseCode: string): Promise<AdminCoursePage> => {
  const body = await request(`/api/course-pages/admin/${encodeURIComponent(courseCode)}`, { method: 'GET' });
  return {
    courseCode: body.course_code ?? courseCode,
    status: body.status ?? 'none',
    draft: body.draft ?? null,
    published: body.published ?? null,
    publishedAt: body.published_at ?? null,
    updatedAt: body.updated_at ?? null,
  };
};

export const saveCoursePageDraft = async (courseCode: string, content: CoursePageContent): Promise<void> => {
  await request(`/api/course-pages/${encodeURIComponent(courseCode)}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
};

export const publishCoursePage = async (courseCode: string): Promise<string> => {
  const body = await request(`/api/course-pages/${encodeURIComponent(courseCode)}/publish`, { method: 'POST' });
  return body.published_at ?? '';
};

export const getSiteContent = async <T>(key: 'refund_policy'): Promise<T | null> => {
  const response = await fetch(`${LMS_API_URL}/api/site-content/${key}`);
  if (response.status === 404) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed with status ${response.status}`);
  }
  return (body.value ?? null) as T | null;
};

export const saveSiteContent = async (key: 'refund_policy', value: object): Promise<void> => {
  await request(`/api/site-content/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
};

const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Uploads the course cover; the server copies it to the content server and saves the file name on the course. */
export const uploadCourseCover = async (courseCode: string, file: File): Promise<{ filename: string; url: string }> => {
  if (!COVER_TYPES.includes(file.type)) throw new Error('The cover must be a JPG, PNG or WebP image');
  if (file.size > COVER_MAX_BYTES) throw new Error('The cover must be 5 MB or smaller');
  const form = new FormData();
  form.append('image', file);
  // No Content-Type header: the browser must set the multipart boundary itself.
  const response = await fetch(`${LMS_API_URL}/api/course-pages/${encodeURIComponent(courseCode)}/cover`, { method: 'POST', body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Upload failed with status ${response.status}`);
  }
  return { filename: body.filename, url: body.url };
};
