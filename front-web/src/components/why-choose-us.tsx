
"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';

export default function WhyChooseUs() {
  const { t } = useTranslation();
  return (
    <section id="why-choose-us" className="py-16 md:py-24 bg-card/50">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center px-4 md:px-6">
        <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
          <Image
            src="https://content-provider.pharmacollege.lk/website/why-chose.webp"
            alt="Students listening to a lecture at Ceylon Pharma College"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('whyChooseUsTitle')}</h2>
          <div className="w-24 h-1 bg-primary mt-2 mb-6" />
          <p className="text-muted-foreground font-body leading-relaxed">
            {t('whyChooseUsPara1')}
          </p>
          <p className="mt-4 text-muted-foreground font-body leading-relaxed">
            {t('whyChooseUsPara2')}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-headline font-bold text-primary">4700+</p>
              <p className="mt-1 text-muted-foreground font-body tracking-wide">{t('whyChooseUsStat1')}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-headline font-bold text-primary">6+</p>
              <p className="mt-1 text-muted-foreground font-body tracking-wide uppercase">{t('whyChooseUsStat2')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
