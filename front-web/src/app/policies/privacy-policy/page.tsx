import type { Metadata } from 'next';
import Script from 'next/script';
import PolicyPageTemplate from '@/components/policy-page-template';

export const metadata: Metadata = {
  title: 'රහස්‍යතා ප්‍රතිපත්තිය | Privacy Policy | Ceylon Pharma College',
  description: 'Official Privacy Policy for Ceylon Pharma College (PVT) LTD. Learn how we collect, safeguard, and use personal data across our website and mobile applications.',
  alternates: {
    canonical: 'https://www.pharmacollege.lk/policies/privacy-policy',
  },
  openGraph: {
    title: 'රහස්‍යතා ප්‍රතිපත්තිය | Privacy Policy | Ceylon Pharma College',
    description: 'Official Privacy Policy for Ceylon Pharma College (PVT) LTD. Learn how we collect, safeguard, and use personal data across our website and mobile applications.',
    url: 'https://www.pharmacollege.lk/policies/privacy-policy',
    siteName: 'Ceylon Pharma College',
  },
};

export default function PrivacyPolicyPage() {
  const privacySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | Ceylon Pharma College',
    url: 'https://www.pharmacollege.lk/policies/privacy-policy',
    description: 'Privacy Policy and Data Protection guidelines for Ceylon Pharma College website and mobile applications.',
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Ceylon Pharma College (PVT) LTD',
      url: 'https://www.pharmacollege.lk',
      telephone: '+94715884884',
      email: 'info@pharmacollege.lk',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'L35, West Tower, World Trade Center',
        addressLocality: 'Colombo 01',
        addressCountry: 'LK',
      },
    },
  };

  return (
    <>
      <Script
        id="privacy-policy-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
      />
      <PolicyPageTemplate titleKey="privacyPolicy" contentKey="privacyPolicyContent" />
    </>
  );
}
