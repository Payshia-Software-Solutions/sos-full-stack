import type { Metadata } from 'next';
import Script from 'next/script';
import ReviewsClient from '@/components/reviews-client';

export const metadata: Metadata = {
  title: 'ශිෂ්‍ය ප්‍රතිචාර | Student Reviews & Testimonials | Ceylon Pharma College',
  description: 'Read authentic verified student reviews and success stories from Ceylon Pharma College graduates working across leading hospitals and community pharmacies in Sri Lanka. 4.9 Star Rating on Google.',
  keywords: [
    'Ceylon Pharma College reviews',
    'Ceylon Pharma College student feedback',
    'Pharmacy course reviews Sri Lanka',
    'Ceylon Pharma College rating',
    'Pharmacy assistant graduate testimonials'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/reviews',
  },
  openGraph: {
    title: 'Student Reviews & Success Stories | Ceylon Pharma College',
    description: 'Read how 5,000+ alumni transformed their healthcare careers through Ceylon Pharma College practical training.',
    url: 'https://www.pharmacollege.lk/reviews',
    siteName: 'Ceylon Pharma College',
    images: [
      {
        url: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
        width: 1200,
        height: 630,
        alt: 'Ceylon Pharma College Student Reviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Reviews | Ceylon Pharma College',
    description: 'Verified student feedback and 4.9-star ratings for practical pharmacy education.',
    images: ['https://content-provider.pharmacollege.lk/website/meta-seo-image.webp'],
  },
};

export default function ReviewsPage() {
  const reviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Ceylon Pharma College',
    url: 'https://www.pharmacollege.lk',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '150',
    },
  };

  return (
    <>
      <Script
        id="reviews-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
      />
      <ReviewsClient />
    </>
  );
}
