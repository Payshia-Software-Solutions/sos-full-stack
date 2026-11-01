import type { Metadata } from 'next';
import AlumniClient from '@/components/alumni-client';

export const metadata: Metadata = {
  title: 'ආදි ශිෂ්‍ය ජාලය | Alumni Community & Success Network | Ceylon Pharma College',
  description: 'Join the thriving 5,000+ strong alumni network of Ceylon Pharma College. Discover career opportunities, mentorship, and professional networking in Sri Lankan healthcare.',
  keywords: [
    'Ceylon Pharma College alumni',
    'Pharmacy graduates network Sri Lanka',
    'Healthcare professionals alumni',
    'Community pharmacy career network'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/alumni',
  },
  openGraph: {
    title: 'Alumni Community & Network | Ceylon Pharma College',
    description: 'Connect with over 5,000 verified pharmacy professionals across Sri Lanka.',
    url: 'https://www.pharmacollege.lk/alumni',
    siteName: 'Ceylon Pharma College',
  },
};

export default function AlumniPage() {
  return <AlumniClient />;
}
