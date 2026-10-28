"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function WhyChooseUsAbout() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const benefits = [
    "Practical curriculum focused on real-world community dispensing",
    "Live Zoom sessions with immediate lecturer doubt clearance",
    "Printed study pack delivered directly to your home",
    "Official LMS access with video playback and practice quizzes"
  ];

  return (
    <section id="why-choose-us" className="py-16 md:py-24 bg-card/50 border-t border-border/40">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center px-4 md:px-6">
        
        {/* Left: Image with Subtle Glow */}
        <div className="lg:col-span-5 relative h-80 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-border/80 group">
          <Image
            src="https://content-provider.pharmacollege.lk/website/why-chose.webp"
            alt="Students listening to a lecture at Ceylon Pharma College"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
            <p className="font-headline font-bold text-base">Quality Healthcare Education</p>
            <p className="text-xs text-white/80 mt-0.5">Empowering students island-wide through modern technology</p>
          </div>
        </div>

        {/* Right: Text & Stats */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <Badge variant="outline" className="w-fit mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
            Why Ceylon Pharma College
          </Badge>

          <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${
            isSinhala ? 'leading-[1.35]' : 'leading-tight'
          }`}>
            {t('whyChooseUsAboutTitle')}
          </h2>

          <div className="w-20 h-1 bg-primary mt-3 mb-6 rounded-full" />

          <p className={`text-muted-foreground font-body text-base ${
            isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
          }`}>
            {t('whyChooseUsAboutPara')}
          </p>

          {/* Key Bullet Points */}
          <div className="mt-6 space-y-2.5">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-foreground/90 font-body">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-8 pt-6 border-t border-border/80 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-3xl sm:text-4xl font-headline font-bold text-primary">5,000+</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{t('whyChooseUsStat1')}</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-headline font-bold text-amber-500">6+</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium uppercase">{t('whyChooseUsStat2')}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-3xl sm:text-4xl font-headline font-bold text-teal-600 dark:text-teal-400">98%</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Exam Pass Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
