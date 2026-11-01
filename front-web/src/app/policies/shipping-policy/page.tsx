import type { Metadata } from 'next';
import PolicyPageTemplate from '@/components/policy-page-template';

export const metadata: Metadata = {
  title: 'මුද්‍රිත පොත් බෙදාහැරීමේ ප්‍රතිපත්තිය | Study Pack Shipping Policy | Ceylon Pharma College',
  description: 'Information regarding free doorstep courier delivery of printed pharmacy workbooks, revision packs, and course study materials across Sri Lanka.',
  alternates: {
    canonical: 'https://www.pharmacollege.lk/policies/shipping-policy',
  },
  openGraph: {
    title: 'මුද්‍රිත පොත් බෙදාහැරීමේ ප්‍රතිපත්තිය | Study Pack Shipping Policy | Ceylon Pharma College',
    description: 'Information regarding free doorstep courier delivery of printed pharmacy workbooks, revision packs, and course study materials across Sri Lanka.',
    url: 'https://www.pharmacollege.lk/policies/shipping-policy',
    siteName: 'Ceylon Pharma College',
  },
};

export default function ShippingPolicyPage() {
  return <PolicyPageTemplate titleKey="shippingPolicy" contentKey="shippingPolicyContent" />;
}
