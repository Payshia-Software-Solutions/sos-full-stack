
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative w-full h-[calc(100vh-7.5rem)]">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://content-provider.pharmacollege.lk/website/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white container mx-auto px-4 md:px-6">
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Image
            src="https://content-provider.pharmacollege.lk/logo/logo-cpc-white.png"
            alt="Ceylon Pharma College Logo"
            width={240}
            height={75}
            className="brightness-0 invert"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-2xl leading-tight tracking-wider animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {t('heroSloganLine1')}
          <br />
          {t('heroSloganLine2')}
        </h1>
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <Button asChild size="lg" className="font-bold w-48 hover:scale-105 transition-all">
            <a href="https://sos.pharmacollege.lk/register" target="_blank" rel="noopener noreferrer">{t('heroApplyNow')}</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-bold w-48 bg-transparent text-white border-white hover:bg-white hover:text-black transition-all hover:scale-105">
            <a href="https://lms.pharmacollege.lk" target="_blank" rel="noopener noreferrer">{t('heroStudentLogin')}</a>
          </Button>
        </div>
        
        <Link href="#courses" className="absolute bottom-10 animate-bounce bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors z-30">
          <ChevronDown className="h-6 w-6 text-white" />
          <span className="sr-only">Scroll down</span>
        </Link>
      </div>
    </section>
  );
}
