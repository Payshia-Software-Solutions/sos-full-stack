import type { Metadata } from 'next';
import PolicyPageTemplate from '@/components/policy-page-template';

export const metadata: Metadata = {
  title: 'මුදල් ආපසු ගෙවීමේ ප්‍රතිපත්තිය | Refund Policy | Ceylon Pharma College',
  description: 'Our transparent refund and withdrawal policy regarding student registrations, tuition fees, and study pack delivery at Ceylon Pharma College.',
  alternates: {
    canonical: 'https://www.pharmacollege.lk/policies/refund-policy',
  },
  openGraph: {
    title: 'මුදල් ආපසු ගෙවීමේ ප්‍රතිපත්තිය | Refund Policy | Ceylon Pharma College',
    description: 'Our transparent refund and withdrawal policy regarding student registrations, tuition fees, and study pack delivery at Ceylon Pharma College.',
    url: 'https://www.pharmacollege.lk/policies/refund-policy',
    siteName: 'Ceylon Pharma College',
  },
};

export default function RefundPolicyPage() {
  return <PolicyPageTemplate titleKey="refundPolicy" contentKey="refundPolicyContent" />;
}
