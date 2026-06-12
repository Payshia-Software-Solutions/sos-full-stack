
"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Droplets, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const projects: any[] = [
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
          alt="Hands holding a small plant, symbolizing growth and community care"
          fill
          className="object-cover"
          data-ai-hint="community care hands"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 md:px-6 h-full flex flex-col justify-center text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-headline font-bold drop-shadow-lg">
              {t('csrTitle')}
            </h1>
            <p className="mt-4 text-lg text-white/90 drop-shadow-md">
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
            <div className="w-24 h-1 bg-primary mx-auto mt-4" />
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div key={value.titleKey} className="text-center">
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                  <value.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-headline font-bold text-xl text-foreground">{t(value.titleKey as any)}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{t(value.descKey as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('csrProjectsTitle')}</h2>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">{t('csrProjectsSubtitle')}</p>
             <div className="w-24 h-1 bg-primary mx-auto mt-4" />
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.length > 0 ? projects.map((project) => (
              <Card key={project.titleKey} className="overflow-hidden group flex flex-col">
                 <Link href={`/csr/${project.slug}`} className="block">
                    <div className="relative aspect-video">
                        <Image src={project.image} alt={t(project.titleKey as any)} fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={project.hint} />
                    </div>
                 </Link>
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-headline text-xl font-bold">
                         <Link href={`/csr/${project.slug}`} className="hover:text-primary transition-colors">{t(project.titleKey as any)}</Link>
                    </h3>
                    <p className="text-muted-foreground text-sm mt-2 flex-grow">{t(project.descKey as any)}</p>
                    <Button variant="link" asChild className="p-0 h-auto self-start mt-4 font-semibold">
                       <Link href={`/csr/${project.slug}`}>
                        {t('eventsLearnMore')} <ArrowRight className="ml-1 h-4 w-4" />
                       </Link>
                    </Button>
                </div>
              </Card>
            )) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No projects available at the moment. Please check back later.</p>
              </div>
            )}
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
            <Button asChild size="lg" variant="secondary">
                <Link href="/contact">{t('contactUs')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

    