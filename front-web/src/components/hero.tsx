"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { ChevronDown, BookOpen, GraduationCap, MessageCircle, ShieldCheck, Award, Users, Laptop } from 'lucide-react';

export default function Hero() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const whatsappMessage = 
    language === 'si'
      ? 'ආයුබෝවන් Ceylon Pharma College, මට පාඨමාලා විස්තර සහ ඉදිරි කණ්ඩායම් පිළිබඳව දැනගැනීමට අවශ්‍යයි.'
      : language === 'ta'
      ? 'வணக்கம் Ceylon Pharma College, நான் பாடநெறி விவரங்களையும் வரவிருக்கும் தொகுதிகளையும் அறிய விரும்புகிறேன்.'
      : 'Hi Ceylon Pharma College, I would like to inquire about course details and upcoming intakes.';

  return (
    <section className="relative w-full min-h-[calc(100vh-7rem)] flex items-center justify-center overflow-hidden">
      {/* Background Video with Poster Fallback */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        poster="https://content-provider.pharmacollege.lk/website/meta-seo-image.webp"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://content-provider.pharmacollege.lk/website/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Modern Balanced Dark Gradient Overlay - Crystal-clear image visibility while preserving text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-10"></div>
      
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center text-white container mx-auto px-4 md:px-6 py-12 md:py-16">
        
        {/* Play • Learn • Grow Illuminated Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-amber-300 mb-5 shadow-lg animate-in fade-in duration-700">
          <span className="whitespace-nowrap">{t('heroBadge')}</span>
        </div>

        {/* Hero Title with Language-Aware Line Spacing (Tight for English, ample breathing room for Sinhala diacritics) */}
        <h1 className={`text-2xl sm:text-4xl md:text-5xl font-headline font-bold drop-shadow-2xl tracking-tight max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both ${
          isSinhala 
            ? 'leading-[1.32] sm:leading-[1.35] md:leading-[1.36]' 
            : 'leading-tight'
        }`}>
          <span className="block">{t('heroSloganLine1')}</span>
          <span className={`block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 drop-shadow-lg pb-1 ${
            isSinhala ? 'mt-2 sm:mt-2.5' : 'mt-0.5 sm:mt-1'
          }`}>
            {t('heroSloganLine2')}
          </span>
        </h1>

        {/* Localized Subtitle with Language-Aware Line Spacing */}
        <p className={`mt-4 sm:mt-5 max-w-3xl text-sm sm:text-base md:text-lg text-white/95 font-body drop-shadow-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both ${
          isSinhala ? 'leading-relaxed md:leading-[1.8]' : 'leading-relaxed md:leading-loose'
        }`}>
          {t('heroSubtitle')}
        </p>

        {/* Primary CTAs with whitespace-nowrap */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <Button asChild size="lg" className="font-bold text-xs sm:text-sm md:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-950/40 hover:scale-105 transition-all gap-2 whitespace-nowrap">
            <Link href="#courses">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="whitespace-nowrap">{t('heroExploreCourses')}</span>
            </Link>
          </Button>

          <Button asChild size="lg" className="font-bold text-xs sm:text-sm md:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-xl shadow-amber-950/30 hover:scale-105 transition-all gap-2 whitespace-nowrap">
            <Link href="/apply">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="whitespace-nowrap">{t('heroApplyNow')}</span>
            </Link>
          </Button>

          <a 
            href={`https://wa.me/94715884884?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-emerald-600/30 backdrop-blur-md border border-white/20 text-white hover:text-emerald-300 text-xs sm:text-sm font-semibold transition-all shadow-md hover:scale-105 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">{t('heroWhatsapp')}</span>
          </a>
        </div>

        {/* Floating Social Proof & Trust Strip */}
        <div className="mt-12 w-full max-w-5xl xl:max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 p-3 sm:p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-left text-white shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both overflow-hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-white/5 border border-white/10 sm:border-transparent sm:bg-transparent min-w-0 w-full overflow-hidden">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 border border-emerald-500/30">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-bold text-sm sm:text-base md:text-lg leading-tight text-white truncate">{t('statStudents')}</p>
              <p className="text-[10px] sm:text-[11px] xl:text-xs text-white/85 mt-0.5 leading-snug whitespace-normal break-words line-clamp-2">{t('statStudentsLabel')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-white/5 border border-white/10 sm:border-transparent sm:bg-transparent min-w-0 w-full overflow-hidden">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 border border-amber-500/30">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-bold text-sm sm:text-base md:text-lg leading-tight text-white truncate">{t('statAccredited')}</p>
              <p className="text-[10px] sm:text-[11px] xl:text-xs text-white/85 mt-0.5 leading-snug whitespace-normal break-words line-clamp-2">{t('statAccreditedLabel')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-white/5 border border-white/10 sm:border-transparent sm:bg-transparent min-w-0 w-full overflow-hidden">
            <div className="p-2 sm:p-2.5 rounded-xl bg-teal-500/20 text-teal-300 shrink-0 border border-teal-500/30">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-bold text-sm sm:text-base md:text-lg leading-tight text-white truncate">{t('statIso')}</p>
              <p className="text-[10px] sm:text-[11px] xl:text-xs text-white/85 mt-0.5 leading-snug whitespace-normal break-words line-clamp-2">{t('statIsoLabel')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-white/5 border border-white/10 sm:border-transparent sm:bg-transparent min-w-0 w-full overflow-hidden">
            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0 border border-cyan-500/30">
              <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="font-bold text-sm sm:text-base md:text-lg leading-tight text-white truncate">{t('statLearning')}</p>
              <p className="text-[10px] sm:text-[11px] xl:text-xs text-white/85 mt-0.5 leading-snug whitespace-normal break-words line-clamp-2">{t('statLearningLabel')}</p>
            </div>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <Link href="#courses" className="mt-8 animate-bounce bg-white/15 p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors z-30">
          <ChevronDown className="h-5 w-5 text-white" />
          <span className="sr-only">Scroll down</span>
        </Link>
      </div>
    </section>
  );
}
