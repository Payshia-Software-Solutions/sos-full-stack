import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getCachedCourses, FALLBACK_COURSES, Course } from "@/lib/courses-data";
import { getCourseTranslation } from "@/lib/course-translations";
import CourseDetailClient from "@/components/course-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCourseBySlug(slug: string): Promise<Course | null> {
  const allCourses = await getCachedCourses();
  const found = allCourses.find((c) => c.slug === slug);
  if (found) return found;

  const fallback = FALLBACK_COURSES.find((c) => c.slug === slug);
  if (fallback) return fallback;

  return null;
}

export async function generateStaticParams() {
  return FALLBACK_COURSES.map((course) => ({
    slug: course.slug,
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    return {
      title: "Course Not Found | Ceylon Pharma College",
      description: "The requested pharmacy course could not be found.",
    };
  }

  const enData = getCourseTranslation(params.slug, 'en');
  const pageTitle = `${course.course_name} | Ceylon Pharma College Sri Lanka`;
  const pageDescription = enData.subtitle || course.course_description;
  const canonicalUrl = `https://www.pharmacollege.lk/courses/${course.slug}`;
  const imgUrl = course.course_img?.startsWith('http')
    ? course.course_img
    : `https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      course.course_name,
      course.course_code,
      'Pharmacy course in Sri Lanka',
      'Certificate in pharmacy practice',
      'Online pharmacy education Sri Lanka',
      'ACTD accredited pharmacy certificate',
      'Ceylon Pharma College'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: 'Ceylon Pharma College',
      images: [
        {
          url: imgUrl,
          width: 1200,
          height: 630,
          alt: course.course_name,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [imgUrl],
    },
  };
}

export default async function CourseDetailPage(props: PageProps) {
  const params = await props.params;
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  const feeNumber = typeof course.course_fee === 'number'
    ? course.course_fee
    : parseFloat(course.course_fee) || 0;

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.course_name,
    description: course.course_description,
    courseCode: course.course_code,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Ceylon Pharma College',
      sameAs: 'https://www.pharmacollege.lk',
      logo: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      duration: course.course_duration,
      inLanguage: ['en', 'si', 'ta'],
      courseWorkload: `${course.course_duration} with live lectures and self-paced LMS`,
    },
    offers: {
      '@type': 'Offer',
      price: feeNumber,
      priceCurrency: 'LKR',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
      url: `https://www.pharmacollege.lk/courses/${course.slug}`,
    },
    educationalCredentialAwarded: 'ACTD Accredited Certificate in Pharmacy Practice (ISO 9001:2015)',
  };

  return (
    <>
      <Script
        id={`course-schema-${course.course_code}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <main>
        <CourseDetailClient course={course} slug={params.slug} />
      </main>
    </>
  );
}
