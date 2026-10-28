
"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';

const accreditations = [
  { 
    src: 'https://content-provider.pharmacollege.lk/website/ISO_9001-2015.svg', 
    alt: 'ISO 9001:2015 Certified',
    href: 'https://www.iafcertsearch.org/certification/pDsZb8ThfWbogEl0TKDgKAg7'
  },
  { src: 'https://content-provider.pharmacollege.lk/website/skildevlopment.jpg', alt: 'Skill Development Council Canada' },
  { src: 'https://content-provider.pharmacollege.lk/website/actd.png', alt: 'American Council of Training and Development' },
  { 
    src: 'https://content-provider.pharmacollege.lk/website/iaf.jpg', 
    alt: 'International Accreditation Forum',
    href: 'https://www.iafcertsearch.org/certified-entity/zTC8qmAcjlCUiN6U4BWdPqYB'
  },
  { src: 'https://content-provider.pharmacollege.lk/website/scc.png', alt: 'SCC Accredited CB-MS' },
  { src: 'https://content-provider.pharmacollege.lk/website/iqa.png', alt: 'International Qualifications & Assessments' },
  { src: 'https://content-provider.pharmacollege.lk/website/Srp-2.png', alt: 'SRP' },
];

export default function Accreditations() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';
  return (
    <section id="accreditations" className="py-16 md:py-24 bg-white dark:bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${isSinhala ? 'leading-[1.35]' : 'leading-tight'}`}>

            {t('accreditationsTitle')}
          </h2>
          <p className={`mt-4 max-w-4xl mx-auto text-muted-foreground font-body ${isSinhala ? 'leading-[1.75]' : 'leading-relaxed'}`}>

            {t('accreditationsSubtitle')}
          </p>
        </div>
        <div className="mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 items-center justify-items-center w-full">
            {accreditations.map((accreditation: any, index) => {
              const content = (
                 <div className="relative h-16 w-32 transition-all duration-300">
                    <Image
                      src={accreditation.src}
                      alt={accreditation.alt}
                      fill
                      className="object-contain"
                    />
                  </div>
              );

              if (accreditation.href) {
                return (
                  <a key={index} href={accreditation.href} target="_blank" rel="noopener noreferrer" className="opacity-75 hover:opacity-100 transition-opacity">
                    {content}
                  </a>
                )
              }

              return <div key={index} className="opacity-75">{content}</div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
