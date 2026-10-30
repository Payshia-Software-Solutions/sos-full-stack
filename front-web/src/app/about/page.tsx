import type { Metadata } from 'next';
import Script from 'next/script';
import AboutClient from '@/components/about-client';

export const metadata: Metadata = {
  title: 'අප ගැන | About Ceylon Pharma College | Practical Pharmacy Education Sri Lanka',
  description: 'Learn about Ceylon Pharma College - Sri Lanka\'s leading institution for practical pharmacy education. ACTD USA accredited and ISO 9001:2015 certified with 5,000+ graduates island-wide.',
  keywords: [
    'Ceylon Pharma College about us',
    'Practical pharmacy education Sri Lanka',
    'Pharmacy training institute Colombo',
    'ACTD accredited pharmacy college',
    'ISO 9001:2015 certified pharmacy Sri Lanka',
    'Dilip Fonseka pharmacy college',
    'Pharmacy course director Sri Lanka',
    'Pharmacy practical training institute'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/about',
  },
  openGraph: {
    title: 'About Ceylon Pharma College | Practical Pharmacy Education in Sri Lanka',
    description: 'Practical pharmaceutical training with simulation software, home-delivered printed study packs, and international ACTD/ISO accreditation.',
    url: 'https://www.pharmacollege.lk/about',
    siteName: 'Ceylon Pharma College',
    images: [
      {
        url: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
        width: 1200,
        height: 630,
        alt: 'Ceylon Pharma College Campus and Faculty',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Ceylon Pharma College | Practical Pharmacy Education',
    description: 'ACTD accredited & ISO 9001:2015 certified practical pharmacy education in Sri Lanka.',
    images: ['https://content-provider.pharmacollege.lk/website/meta-seo-image.webp'],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Ceylon Pharma College',
    description: 'Ceylon Pharma College offers ACTD-accredited and ISO 9001:2015 certified practical pharmacy education in Sri Lanka.',
    url: 'https://www.pharmacollege.lk/about',
    mainEntity: {
      '@type': 'EducationalOrganization',
      name: 'Ceylon Pharma College',
      url: 'https://www.pharmacollege.lk',
      logo: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
      telephone: '+94715884884',
      email: 'info@pharmacollege.lk',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nugegoda / Colombo',
        addressCountry: 'LK',
      },
    },
  };

  return (
    <>
      <Script
        id="about-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutClient />
    </>
  );
}
