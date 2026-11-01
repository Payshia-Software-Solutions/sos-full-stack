import type { Metadata } from 'next';
import CsrClient from '@/components/csr-client';

export const metadata: Metadata = {
  title: 'සමාජ සත්කාරක ව්‍යාපෘති | CSR & Community Healthcare Initiatives | Ceylon Pharma College',
  description: 'Explore Corporate Social Responsibility (CSR) and community health programs by Ceylon Pharma College, promoting public health awareness and safe medicine use across Sri Lanka.',
  keywords: [
    'Ceylon Pharma College CSR',
    'Healthcare community projects Sri Lanka',
    'Medicine awareness CSR',
    'Ceylon Pharma College community service'
  ],
  alternates: {
    canonical: 'https://www.pharmacollege.lk/csr',
  },
  openGraph: {
    title: 'CSR & Community Healthcare Initiatives | Ceylon Pharma College',
    description: 'Dedicated community health empowerment and safe medicine use projects by Ceylon Pharma College.',
    url: 'https://www.pharmacollege.lk/csr',
    siteName: 'Ceylon Pharma College',
  },
};

export default function CsrPage() {
  return <CsrClient />;
}
