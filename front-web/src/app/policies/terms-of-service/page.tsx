import type { Metadata } from 'next';
import PolicyPageTemplate from '@/components/policy-page-template';

export const metadata: Metadata = {
  title: 'සේවා කොන්දේසි | Terms of Service | Ceylon Pharma College',
  description: 'Terms and conditions governing course registration, student code of conduct, LMS portal access, and certification policies at Ceylon Pharma College.',
  alternates: {
    canonical: 'https://www.pharmacollege.lk/policies/terms-of-service',
  },
  openGraph: {
    title: 'සේවා කොන්දේසි | Terms of Service | Ceylon Pharma College',
    description: 'Terms and conditions governing course registration, student code of conduct, LMS portal access, and certification policies at Ceylon Pharma College.',
    url: 'https://www.pharmacollege.lk/policies/terms-of-service',
    siteName: 'Ceylon Pharma College',
  },
};

export default function TermsOfServicePage() {
  return <PolicyPageTemplate titleKey="termsOfService" contentKey="termsOfServiceContent" />;
}
