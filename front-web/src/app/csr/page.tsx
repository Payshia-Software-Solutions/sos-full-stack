"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Droplets, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
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
  const { t } = useTranslation();

  return (
    <main>
      <section className="relative h-96 bg-primary/10">
        <Image
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
          alt="Hands holding a small plant, symbolizing community care"
          fill
          className="object-cover"
          data-ai-hint="community care hands"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative container mx-auto px-4 md:px-6 h-full flex flex-col justify-center text-white">
          <div className="max-w-2xl">
            <Badge className="bg-emerald-600 text-white border-none mb-3">Community Impact</Badge>
            <h1 className="text-4xl md:text-5xl font-headline font-bold drop-shadow-lg">
              {t('csrTitle')}
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/90 drop-shadow-md">
              {t('csrSubtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('csrPhilosophyTitle')}</h2>
            <p className="mt-2 max-w-3xl mx-auto text-muted-foreground font-body">{t('csrPhilosophyDesc')}</p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div key={value.titleKey} className="text-center p-6 rounded-xl border border-border/60 bg-card">
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline font-bold text-lg text-foreground">{t(value.titleKey as any)}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{t(value.descKey as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card/50 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('csrProjectsTitle')}</h2>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">{t('csrProjectsSubtitle')}</p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {projects.map((project, idx) => (
              <Card key={idx} className="overflow-hidden group flex flex-col border border-border/70 shadow-sm hover:shadow-lg transition-all">
                <div className="relative aspect-video w-full">
                  <Image 
                    src={project.image} 
                    alt={project.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    data-ai-hint={project.hint} 
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold text-xs">
                    {project.tag}
                  </Badge>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed flex-grow">
                    {project.desc}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto self-start mt-4 font-semibold text-primary">
                    <Link href="/contact">
                      Learn More / Partner With Us <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 text-center bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-headline font-bold">{t('csrPartnerTitle')}</h2>
          <p className="mt-2 max-w-xl mx-auto text-primary-foreground/90">
            {t('csrPartnerSubtitle')}
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link href="/contact">{t('contactUs')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}