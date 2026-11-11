import { LMS_API_URL } from "@/lib/config";
import { FALLBACK_COURSES } from "@/lib/courses-data";
import { MetadataRoute } from 'next';

const BASE_URL = 'https://pharmacollege.lk';

interface Course {
  slug: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/about',
    '/courses',
    '/certificates',
    '/apply',
    '/contact',
    '/reviews',
    '/blogs',
    '/alumni',
    '/csr',
    '/students/academic-calendar',
    '/students/examinations',
    '/departments/department-of-pharmaceutical',
    '/departments/department-of-english',
    '/departments/department-of-information-communication-technology',
    '/policies/privacy-policy',
    '/policies/refund-policy',
    '/policies/terms-of-service',
    '/policies/shipping-policy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '/' || route === '/courses' || route === '/certificates' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1.0 : route === '/courses' || route === '/certificates' ? 0.9 : 0.8,
  }));

  let courseItems: { slug: string; updated_at?: string }[] = FALLBACK_COURSES.map(c => ({
    slug: c.slug,
    updated_at: new Date().toISOString(),
  }));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${LMS_API_URL}/parent-main-course`, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const remoteCourses: Course[] = await response.json();
      if (Array.isArray(remoteCourses) && remoteCourses.length > 0) {
        courseItems = remoteCourses;
      }
    }
  } catch (error) {
    console.warn("Using verified course list for sitemap:", (error as Error).message);
  }

  const courseRoutes: MetadataRoute.Sitemap = courseItems.map((course) => ({
    url: `${BASE_URL}/courses/${course.slug}`,
    lastModified: new Date(course.updated_at || Date.now()).toISOString(),
    changeFrequency: 'weekly',
    priority: 0.95,
  }));

  // Published blog posts (previously missing, so articles were hard for Google to discover)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${LMS_API_URL}/api/blogs`, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.blogs)) {
        blogRoutes = data.blogs
          .filter((b: { status?: string; slug?: string }) => b.status === 'published' && b.slug)
          .map((b: { slug: string; updated_at?: string; created_at?: string }) => {
            const date = new Date(b.updated_at || b.created_at || Date.now());
            return {
              url: `${BASE_URL}/blogs/${encodeURIComponent(b.slug)}`,
              lastModified: (isNaN(date.getTime()) ? new Date() : date).toISOString(),
              changeFrequency: 'monthly' as const,
              priority: 0.7,
            };
          });
      }
    }
  } catch (error) {
    console.warn("Skipping blog posts in sitemap:", (error as Error).message);
  }

  return [...staticRoutes, ...courseRoutes, ...blogRoutes];
}
