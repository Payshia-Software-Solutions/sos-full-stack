
import type { Metadata } from 'next';
import { Poppins, Roboto, Noto_Sans_Sinhala, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/components/theme-provider';
import Preloader from '@/components/preloader';
import MobileStickyCTA from '@/components/mobile-sticky-cta';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  weight: ['400', '600', '700'],
  variable: '--font-sinhala',
  display: 'swap',
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '600', '700'],
  variable: '--font-tamil',
  display: 'swap',
});

const siteConfig = {
  name: 'Ceylon Pharma College',
  description: 'Ceylon Pharma College offers ACTD-accredited and ISO 9001:2015 certified practical pharmacy education in Sri Lanka. Interactive classes, educational games, and printed study packs.',
  url: 'https://www.pharmacollege.lk',
  ogImage: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
  tagline: "Practical Pharmacy Courses in Sri Lanka | Play. Learn. Grow.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Pharmacy college Sri Lanka",
    "Pharmaceutical education",
    "Pharmacy courses",
    "Diploma in Pharmacy",
    "Advanced Community Pharmacy",
    "Healthcare education",
    "Medical training Sri Lanka",
  ],
  authors: [{ name: "Ceylon Pharma College", url: siteConfig.url }],
  creator: "Payshia Software Solutions",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@ceylonpharma",
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'si-LK': '/si',
      'ta-LK': '/ta',
    },
  },
  icons: {
    icon: [
      { url: 'https://content-provider.pharmacollege.lk/website/app-icon/favicon.ico', type: 'image/x-icon' },
      { url: 'https://content-provider.pharmacollege.lk/website/app-icon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: 'https://content-provider.pharmacollege.lk/website/app-icon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: 'https://content-provider.pharmacollege.lk/website/app-icon/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: 'https://content-provider.pharmacollege.lk/website/app-icon/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: 'https://content-provider.pharmacollege.lk/website/app-icon/android-chrome-512x512.png',
      }
    ]
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`!scroll-smooth ${poppins.variable} ${roboto.variable} ${notoSinhala.variable} ${notoTamil.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Preloader />
            <Header />
            {children}
            <Footer />
            <MobileStickyCTA />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
