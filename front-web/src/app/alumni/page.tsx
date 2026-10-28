"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Briefcase, Mic, Handshake, ChevronRight, GraduationCap, Users, Award, Star } from 'lucide-react';

const successStories = [
  {
    name: 'Nadeesha Perera',
    title: 'CCPP Batch 14 • Pharmacy Assistant, MediCare',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop',
    fallback: 'NP',
    hint: 'female professional smiling',
    quoteKey: 'alumniQuote1',
  },
  {
    name: 'Kasun Rathnayake',
    title: 'CCPP Batch 12 • Community Pharmacy In-charge',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop',
    fallback: 'KR',
    hint: 'male professional smiling',
    quoteKey: 'alumniQuote2',
  },
  {
    name: 'Fathima Nuha',
    title: 'Advanced Course Alumna • Medical Representative',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&auto=format&fit=crop',
    fallback: 'FN',
    hint: 'female professional in healthcare',
    quoteKey: 'alumniQuote3',
  },
];

const getInvolved = [
  { icon: Mic, titleKey: 'getInvolvedTitle1', descKey: 'getInvolvedDesc1' },
  { icon: Handshake, titleKey: 'getInvolvedTitle2', descKey: 'getInvolvedDesc2' },
  { icon: Briefcase, titleKey: 'getInvolvedTitle3', descKey: 'getInvolvedDesc3' },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?q=80&w=2070&auto=format&fit=crop", alt: "Alumni at a reunion event", hint: "alumni reunion" },
  { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop", alt: "Alumni networking session", hint: "professionals networking" },
  { src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop", alt: "Past graduation ceremony", hint: "graduation day" },
];

export default function AlumniPage() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Header Banner */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950 text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-200/80 mb-4">
            <Link href="/" className="hover:text-white transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-amber-300 font-semibold">{t('alumni')}</span>
          </div>

          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-emerald-200 border-emerald-400/30 gap-1.5 inline-flex items-center">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>5,000+ Strong Healthcare Network</span>
            </Badge>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white drop-shadow-xl ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {t('alumniTitle')}
            </h1>

            <div className="w-20 h-1 bg-amber-400 mt-3 mb-4 rounded-full" />

            <p className={`text-white/90 font-body text-base md:text-lg max-w-2xl ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {t('alumniSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Success Stories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Career Milestones
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {t('alumniSuccessTitle')}
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-4 rounded-full" />
            <p className={`text-muted-foreground font-body text-sm md:text-base ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {t('alumniSuccessSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {successStories.map((story) => (
              <Card key={story.name} className="flex flex-col text-center rounded-2xl border border-border/80 bg-card hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-8 flex-grow flex flex-col items-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20 shadow-sm">
                    <AvatarImage src={story.image} alt={story.name} data-ai-hint={story.hint}/>
                    <AvatarFallback>{story.fallback}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-headline font-bold text-lg text-foreground">{story.name}</h3>
                  <p className="text-primary font-semibold text-xs mt-0.5">{story.title}</p>
                  <p className="text-muted-foreground mt-4 text-xs sm:text-sm italic flex-grow leading-relaxed font-body">
                    &ldquo;{t(story.quoteKey as any)}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Get Involved Section */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
                Alumni Engagement
              </Badge>
              <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${
                isSinhala ? 'leading-[1.35]' : 'leading-tight'
              }`}>
                {t('getInvolvedTitle')}
              </h2>
              <div className="w-20 h-1 bg-primary mt-3 mb-6 rounded-full" />
              <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed">
                {t('getInvolvedSubtitle')}
              </p>

              <div className="mt-8 space-y-6">
                {getInvolved.map((item) => (
                  <div key={item.titleKey} className="flex gap-4 p-4 rounded-xl border border-border/60 bg-card">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-foreground">{t(item.titleKey as any)}</h3>
                      <p className="text-muted-foreground mt-1 text-xs sm:text-sm leading-relaxed">{t(item.descKey as any)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Images */}
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.map((image, index) => (
                <div key={index} className={`relative rounded-2xl overflow-hidden shadow-md border border-border/80 group ${
                  index === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
                }`}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
