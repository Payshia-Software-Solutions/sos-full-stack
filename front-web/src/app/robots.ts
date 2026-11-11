import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /_next/ must stay crawlable: it serves the JS/CSS Google needs to render pages
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://pharmacollege.lk/sitemap.xml',
  };
}
