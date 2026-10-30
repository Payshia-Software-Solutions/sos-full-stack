import type { Metadata } from 'next';
import Script from 'next/script';
import { LMS_API_URL } from '@/lib/config';
import BlogsClient from '@/components/blogs-client';

export const metadata: Metadata = {
  title: 'ඖෂධවේදී ලිපි සහ සෞඛ්‍ය දැනුම | Pharmacy Articles & Health Blog | Ceylon Pharma College',
  description: 'Explore expert healthcare articles, pharmacy dispensing guides, prescription analysis, and career advice written by registered pharmacists at Ceylon Pharma College.',
  keywords: [
    'Pharmacy blog Sri Lanka',
    'Pharmaceutical articles',
    'Drug dispensing guides',
    'Community pharmacy practice Sri Lanka',
    'Ceylon Pharma College blog',
    'Healthcare education articles'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/blogs',
  },
  openGraph: {
    title: 'Pharmacy Practice & Healthcare Blog | Ceylon Pharma College',
    description: 'Practical clinical insights, medicine dispensing safety, and pharmacy career guides in Sri Lanka.',
    url: 'https://www.pharmacollege.lk/blogs',
    siteName: 'Ceylon Pharma College',
    images: [
      {
        url: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
        width: 1200,
        height: 630,
        alt: 'Ceylon Pharma College Pharmacy Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pharmacy Practice Articles | Ceylon Pharma College',
    description: 'Expert healthcare and dispensing insights from Ceylon Pharma College pharmacists.',
    images: ['https://content-provider.pharmacollege.lk/website/meta-seo-image.webp'],
  },
};

async function getInitialBlogs() {
  try {
    const res = await fetch(`${LMS_API_URL}/api/blogs`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        return data.blogs.filter((b: any) => b.status === 'published');
      }
    }
  } catch (error) {
    console.warn("Could not fetch blogs for SSR pre-render:", (error as Error).message);
  }
  return [];
}

export default async function BlogsPage() {
  const blogs = await getInitialBlogs();

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Ceylon Pharma College Articles & Blog',
    description: 'Articles on pharmacy practice, medicine dispensing, and healthcare education in Sri Lanka.',
    url: 'https://www.pharmacollege.lk/blogs',
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
        id="blogs-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <BlogsClient initialBlogs={blogs} />
    </>
  );
}
