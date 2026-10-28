"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Droplets, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const projects = [
  {
    title: "Community Medication Awareness & Safe Storage Campaigns",
    desc: "Educating regional communities on rational medicine use, safe disposal of expired drugs, and preventing accidental pediatric overdoses.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop",
    hint: "community healthcare doctors and patients",
    tag: "Public Health"
  },
  {
    title: "Youth Healthcare Scholarship Program",
    desc: "Empowering deserving school leavers with study packs and tuition support to acquire certified pharmacy assistant qualifications.",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=600&auto=format&fit=crop",
    hint: "student learning healthcare",
    tag: "Education Equity"
  }
];

const values = [
  { icon: Heart, titleKey: 'csrValueTitle1', descKey: 'csrValueDesc1' },
  { icon: Users, titleKey: 'csrValueTitle2', descKey: 'csrValueDesc2' },
  { icon: Droplets, titleKey: 'csrValueTitle3', descKey: 'csrValueDesc3' },
];

export default function CsrPage() {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Header Banner */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950 text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-200/80 mb-4">
            <Link href="/" className="hover:text-white transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-amber-300 font-semibold">{t('csrProjects')}</span>
          </div>

          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-emerald-200 border-emerald-400/30 gap-1.5 inline-flex items-center">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Social Responsibility & Community Care</span>
            </Badge>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white drop-shadow-xl ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {t('csrTitle')}
            </h1>

            <div className="w-20 h-1 bg-amber-400 mt-3 mb-4 rounded-full" />

            <p className={`text-white/90 font-body text-base md:text-lg max-w-2xl ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {t('csrSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Philosophy & Core Pillars */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Community Philosophy
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-headline font-bold text-foreground ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {t('csrPhilosophyTitle')}
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-4 rounded-full" />
            <p className={`text-muted-foreground font-body text-sm md:text-base ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {t('csrPhilosophyDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div key={value.titleKey} className="text-center p-6 sm:p-8 rounded-2xl border border-border/80 bg-card hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4 text-primary">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="font-headline font-bold text-lg text-foreground">{t(value.titleKey as any)}</h3>
                <p className="text-muted-foreground mt-2 text-xs sm:text-sm leading-relaxed font-body">
                  {t(value.descKey as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured CSR Projects */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Ongoing Initiatives
            </Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
              Featured Community Projects
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {projects.map((p, i) => (
              <div key={i} className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs border-none shadow-md">
                      {p.tag}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline font-bold text-lg text-foreground mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
