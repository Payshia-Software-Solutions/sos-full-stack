
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/components/theme-provider';
import Preloader from '@/components/preloader';

const siteConfig = {
  name: 'Ceylon Pharma College',
  description: 'At Ceylon Pharma College, we’re passionate about providing high-quality education in pharmacy practice. Our goal is to help you build a successful and meaningful career in healthcare. Whether you are working as or willing to become a pharmacist, pharmacy assistant, caregiver, or healthcare professional, our courses are designed just for you.',
  url: 'https://www.pharmacollege.lk',
  ogImage: 'https://content-provider.pharmacollege.lk/website/meta-seo-image.webp',
  tagline: "Sri Lanka's Trusted Partner in Pharmaceutical Education",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
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
    creator: "@yourtwitterhandle", // Replace with your actual Twitter handle
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
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
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
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
