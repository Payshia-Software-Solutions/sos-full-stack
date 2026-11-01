import type { Metadata } from 'next';
import Script from 'next/script';
import ContactClient from '@/components/contact-client';

export const metadata: Metadata = {
  title: 'අප හා සම්බන්ධ වන්න | Contact Us | Ceylon Pharma College',
  description: 'Get in touch with Ceylon Pharma College. Contact our Colombo admissions campus or operations center. Call 0715 884 884 or WhatsApp our academic counseling team.',
  keywords: [
    'Ceylon Pharma College contact',
    'Ceylon Pharma College phone number',
    'Ceylon Pharma College address',
    'Pharmacy college admissions hotline',
    'Ceylon Pharma College WhatsApp',
    'Pharmacy course inquiries Sri Lanka'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/contact',
  },
  openGraph: {
    title: 'Contact Ceylon Pharma College | Admissions & Student Support',
    description: 'Admissions hotlines, campus locations, and student counseling channels for Ceylon Pharma College.',
    url: 'https://www.pharmacollege.lk/contact',
    siteName: 'Ceylon Pharma College',
    images: [
      {
        url: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
        width: 1200,
        height: 630,
        alt: 'Ceylon Pharma College Contact & Campus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Ceylon Pharma College',
    description: 'Call 0715 884 884 or visit our Colombo admissions campus for practical pharmacy education guidance.',
    images: ['https://content-provider.pharmacollege.lk/website/meta-seo-image.webp'],
  },
};

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Ceylon Pharma College',
    description: 'Official contact information and campus locations for Ceylon Pharma College.',
    url: 'https://www.pharmacollege.lk/contact',
    mainEntity: {
      '@type': 'EducationalOrganization',
      name: 'Ceylon Pharma College',
      url: 'https://www.pharmacollege.lk',
      telephone: '+94715884884',
      email: 'info@pharmacollege.lk',
      address: [
        {
          '@type': 'PostalAddress',
          streetAddress: 'Colombo / Nugegoda',
          addressLocality: 'Colombo',
          addressCountry: 'LK',
        },
      ],
    },
  };

  return (
    <>
      <Script
        id="contact-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <ContactClient />
    </>
  );
}
