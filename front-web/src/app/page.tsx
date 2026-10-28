import Hero from '@/components/hero';
import FeaturedCourses from '@/components/featured-courses';
import WhyChooseUs from '@/components/why-choose-us';
import HowYouLearn from '@/components/how-you-learn';
import Achievements from '@/components/achievements';
import Testimonials from '@/components/testimonials';
import Accreditations from '@/components/accreditations';
import CertificateVerifierHome from '@/components/certificate-verifier-home';
import NextIntakeBanner from '@/components/next-intake-banner';
import EventCalendar from '@/components/event-calendar';
import FAQSection from '@/components/faq-section';
import BottomCTA from '@/components/bottom-cta';
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
        {/* 1. Hero */}
        <Hero />

        {/* 2. Popular Courses (100% Crawler-Visible SSR Responsive Grid) */}
        <FeaturedCourses courses={courses} />

        {/* 3. Why CPC is Different */}
        <WhyChooseUs />

        {/* 4. How You Learn – Play • Learn • Grow */}
        <HowYouLearn />

        {/* 5. Student Results & Milestones */}
        <Achievements />

        {/* 6. Student Reviews & Testimonials */}
        <Testimonials />

        {/* 7. Accreditation & Recognition (ISO 9001:2015, ACTD) */}
        <Accreditations />

        {/* 8. Online Certificate Verification (Critical Selling Point) */}
        <CertificateVerifierHome />

        {/* 9. Next Intake Announcement & Early Enrollment */}
        <NextIntakeBanner />

        {/* 9. Upcoming Workshops & Events */}
        <EventCalendar />

        {/* 10. Frequently Asked Questions (FAQ) */}
        <FAQSection />

        {/* 11. Final High-Converting Apply & WhatsApp CTA */}
        <BottomCTA />


      </main>
    </>
  );
}
