import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.pharmacollege.lk';

interface Course {
  slug: string;
  updated_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '/',
    '/about',
    '/courses',
    '/contact',
    '/reviews',
    '/reviews/new',
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
    changeFrequency: 'monthly' as 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));

  try {
    const response = await fetch('https://qa-api.pharmacollege.lk/parent-main-course');
    const courses: Course[] = await response.json();

    const courseRoutes = courses.map((course) => ({
      url: `${BASE_URL}/courses/${course.slug}`,
      lastModified: new Date(course.updated_at || Date.now()).toISOString(),
      changeFrequency: 'weekly' as 'weekly',
      priority: 0.9,
    }));

    return [...staticRoutes, ...courseRoutes];
  } catch (error) {
    console.error("Failed to fetch courses for sitemap:", error);
    return staticRoutes;
  }
}
