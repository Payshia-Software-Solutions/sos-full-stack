import Accreditations from '@/components/accreditations';
import CertificateVerifier from '@/components/certificate-verifier';
import CourseSlider from '@/components/course-slider';
import EventCalendar from '@/components/event-calendar';
import Testimonials from '@/components/testimonials';
import Hero from '@/components/hero';
import WhyChooseUs from '@/components/why-choose-us';
import Achievements from '@/components/achievements';
import { getCachedCourses } from '@/lib/courses-data';
import Script from 'next/script';

export default async function Home() {
  const courses = await getCachedCourses();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Ceylon Pharma College',
    url: 'https://www.pharmacollege.lk',
    logo: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
    description: 'Ceylon Pharma College is an ACTD-accredited institution with an ISO 9001:2015 certified Quality Management System providing practical pharmaceutical education in Sri Lanka.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'LK',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Pharmaceutical Courses',
      itemListElement: courses.map((course, index) => ({
        '@type': 'Course',
        position: index + 1,
        name: course.course_name,
        description: course.course_description,
        provider: {
          '@type': 'Organization',
          name: 'Ceylon Pharma College',
          sameAs: 'https://www.pharmacollege.lk',
        },
      })),
    },
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <main className="flex flex-col">
        <Hero />
        <CourseSlider initialCourses={courses} />
        <WhyChooseUs />
        <CertificateVerifier />
        <Achievements />
        <Testimonials />
        <Accreditations />
        <EventCalendar />
      </main>
    </>
  );
}
