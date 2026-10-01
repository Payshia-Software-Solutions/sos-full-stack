"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import Image from 'next/image';
import { ChevronDown, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full min-h-[calc(100vh-7.5rem)] flex items-center justify-center overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85 z-10"></div>
      
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white container mx-auto px-4 md:px-6 py-16">
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

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs md:text-sm font-semibold tracking-wide text-amber-300 mb-4 animate-in fade-in duration-700">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Play • Learn • Grow</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-headline font-bold drop-shadow-2xl leading-tight tracking-wide max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {t('heroSloganLine1')}
          <span className="text-primary block mt-1">{t('heroSloganLine2')}</span>
        </h1>

        <p className="mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white/90 font-body leading-relaxed drop-shadow animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          Practical pharmacy education through interactive online classes, educational games, and real-world dispensing simulations.
        </p>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <Button asChild size="lg" className="font-bold px-6 shadow-lg hover:scale-105 transition-all">
            <Link href="#courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Explore Courses
            </Link>
          </Button>

          <Button asChild size="lg" className="font-bold px-6 bg-amber-500 hover:bg-amber-600 text-black shadow-lg hover:scale-105 transition-all">
            <a href="https://sos.pharmacollege.lk/register" target="_blank" rel="noopener noreferrer">
              <GraduationCap className="mr-2 h-4 w-4" />
              {t('heroApplyNow')}
            </a>
          </Button>

          <Button asChild size="lg" variant="outline" className="font-bold px-6 bg-transparent text-white border-white/60 hover:bg-white hover:text-black transition-all hover:scale-105">
            <a href="https://lms.pharmacollege.lk" target="_blank" rel="noopener noreferrer">
              {t('heroStudentLogin')}
            </a>
          </Button>
        </div>
        
        <Link href="#courses" className="mt-12 animate-bounce bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors z-30">
          <ChevronDown className="h-5 w-5 text-white" />
          <span className="sr-only">Scroll down</span>
        </Link>
      </div>
    </section>
  );
}
