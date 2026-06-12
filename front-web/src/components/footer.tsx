
"use client";

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/context/language-context';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const policies = [
    { key: 'privacyPolicy', href: '/policies/privacy-policy' },
    { key: 'refundPolicy', href: '/policies/refund-policy' },
    { key: 'termsOfService', href: '/policies/terms-of-service' },
    { key: 'shippingPolicy', href: '/policies/shipping-policy' },
  ];

  const company = [
    { key: 'home', href: '/' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
    { key: 'blogs', href: '#' },
    { key: 'event', href: '#' },
  ];

  return (
    <footer className="bg-muted/60 text-muted-foreground">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 items-start gap-8 px-4 py-12 md:px-6">
        <div className="flex flex-col items-start gap-4 md:col-span-4">
          <Link href="/" className="flex items-center">
            <Image
              src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
              alt="Ceylon Pharma College Logo"
              width={180}
              height={56}
              className="h-auto w-40 dark:hidden"
            />
            <Image
              src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
              alt="Ceylon Pharma College Logo"
              width={180}
              height={56}
              className="h-auto w-40 hidden dark:block dark:brightness-0 dark:invert"
            />
          </Link>
          <p className="text-sm font-body">
            {t('footerSlogan')}
          </p>
           <div className="flex items-center gap-4 mt-2">
            <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
        <div className="grid gap-4 md:col-span-2">
          <h4 className="font-headline text-base font-semibold text-foreground">{t('footerPolicies')}</h4>
          <div className="text-sm font-body space-y-2">
            {policies.map((link) => (
                <Link key={link.key} href={link.href} className="block hover:text-primary transition-colors">
                    {t(link.key as any)}
                </Link>
            ))}
          </div>
        </div>
         <div className="grid gap-4 md:col-span-2">
          <h4 className="font-headline text-base font-semibold text-foreground">{t('footerCompany')}</h4>
          <div className="text-sm font-body space-y-2">
             {company.map((link) => (
                <Link key={link.key} href={link.href} className="block hover:text-primary transition-colors">
                    {t(link.key as any)}
                </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:col-span-4">
            <h4 className="font-headline text-base font-semibold text-foreground">{t('contactUs')}</h4>
             <div className="text-sm font-body space-y-4">
                 <div>
                    <h5 className="font-semibold text-foreground mb-1">{t('contactHeadOffice')}</h5>
                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>{t('contactHeadOfficeAddress')}</span>
                    </div>
                </div>
                 <div>
                    <h5 className="font-semibold text-foreground mb-1">{t('contactOperationsBranch')}</h5>
                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>{t('contactOperationsBranchAddress')}</span>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <a href="mailto:info@pharmacollege.lk" className="hover:text-primary">info@pharmacollege.lk</a>
                </div>
                <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <a href="tel:0715884884" className="hover:text-primary">0715 884 884</a>
                </div>
             </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-4 text-sm md:px-6 text-center sm:text-left">
          <p className="font-body">{t('copyright', { year: year })}</p>
          <p className="font-body">
            {t('poweredBy')}<a href="https://payshia.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-semibold">Payshia Software Solutions</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
