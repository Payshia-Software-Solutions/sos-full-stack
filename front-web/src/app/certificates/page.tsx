import type { Metadata } from 'next';
import Script from 'next/script';
import CertificatesClient from '@/components/certificates-client';

export const metadata: Metadata = {
  title: 'සහතිකපත් සත්‍යාපනය | Online Certificate Verification | Ceylon Pharma College',
  description: 'Instantly verify the authenticity of pharmacy certificates and qualifications issued by Ceylon Pharma College. 24/7 digital registry trusted by leading private hospitals and retail pharmacies island-wide.',
  keywords: [
    'Ceylon Pharma College certificate verification',
    'Verify pharmacy certificate Sri Lanka',
    'Online student index verification',
    'ACTD certificate check',
    'Pharmacist qualification verification',
    'Ceylon Pharma College student registry'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/certificates',
  },
  openGraph: {
    title: 'Online Certificate & Qualification Verification | Ceylon Pharma College',
    description: 'Instant 24/7 verification registry for Ceylon Pharma College accredited credentials. Prevent counterfeit certificates with tamper-proof QR security.',
    url: 'https://www.pharmacollege.lk/certificates',
    siteName: 'Ceylon Pharma College',
    images: [
      {
        url: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
        width: 1200,
        height: 630,
        alt: 'Ceylon Pharma College Certificate Verification Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Certificate Verification | Ceylon Pharma College',
    description: 'Verify pharmacy qualifications and student credentials issued by Ceylon Pharma College.',
    images: ['https://content-provider.pharmacollege.lk/website/meta-seo-image.webp'],
  },
};

export default function CertificatesPage() {
  const certSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Online Certificate Verification Portal',
    description: 'Verify pharmacy credentials and certificate authenticity for Ceylon Pharma College graduates.',
    url: 'https://www.pharmacollege.lk/certificates',
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Ceylon Pharma College',
      url: 'https://www.pharmacollege.lk',
      logo: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
    },
  };

  return (
    <>
      <Script
        id="certificates-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(certSchema) }}
      />
      <CertificatesClient />
    </>
  );
}
