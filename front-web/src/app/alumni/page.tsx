
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/language-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Briefcase, Mic, Handshake, ChevronRight } from 'lucide-react';

const successStories = [
  {
    name: 'Dr. Nimali Fernando',
    title: 'Senior Clinical Pharmacist, National Hospital',
    image: 'https://placehold.co/150x150.png',
    fallback: 'NF',
    hint: 'female doctor smiling',
    quoteKey: 'alumniQuote1',
  },
  {
    name: 'Sanjay Kumar',
    title: 'Founder, MedLife Pharma',
    image: 'https://placehold.co/150x150.png',
    fallback: 'SK',
    hint: 'male entrepreneur',
    quoteKey: 'alumniQuote2',
  },
  {
    name: 'Aisha Perera',
    title: 'Pharmaceutical Researcher, USA',
    image: 'https://placehold.co/150x150.png',
    fallback: 'AP',
    hint: 'female researcher lab',
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
  const { t } = useTranslation();

  return (
    <main>
      <section className="relative h-96 bg-primary/10">
        <Image
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
          alt="Graduates throwing their caps in the air"
          fill
          className="object-cover"
          data-ai-hint="graduates celebration"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 md:px-6 h-full flex flex-col justify-center text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-headline font-bold drop-shadow-lg">
              {t('alumniTitle')}
            </h1>
            <p className="mt-4 text-lg text-white/90 drop-shadow-md">
              {t('alumniSubtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('alumniSuccessTitle')}</h2>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">{t('alumniSuccessSubtitle')}</p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4" />
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <Card key={story.name} className="flex flex-col text-center">
                <CardContent className="p-8 flex-grow flex flex-col items-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
                        <AvatarImage src={story.image} alt={story.name} data-ai-hint={story.hint}/>
                        <AvatarFallback>{story.fallback}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-headline font-bold text-xl text-foreground">{story.name}</h3>
                    <p className="text-primary font-medium text-sm">{story.title}</p>
                    <p className="text-muted-foreground mt-4 text-sm italic flex-grow">"{t(story.quoteKey as any)}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

       <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('getInvolvedTitle')}</h2>
                    <p className="mt-2 text-muted-foreground font-body">{t('getInvolvedSubtitle')}</p>
                    <div className="mt-8 space-y-6">
                        {getInvolved.map((item) => (
                            <div key={item.titleKey} className="flex gap-4">
                                <div className="p-3 bg-primary/10 rounded-full h-fit">
                                    <item.icon className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-headline font-bold text-xl text-foreground">{t(item.titleKey as any)}</h3>
                                    <p className="text-muted-foreground mt-1 text-sm">{t(item.descKey as any)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    {galleryImages.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group shadow-md">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={image.hint}
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                        </div>
                    ))}
                     <div className="relative aspect-square rounded-lg overflow-hidden group shadow-md bg-primary/20 flex flex-col items-center justify-center p-4 text-center">
                        <h3 className="font-headline font-bold text-foreground text-lg">{t('alumniGalleryCTA')}</h3>
                        <Button variant="outline" size="sm" asChild className="mt-3">
                            <Link href="#">{t('alumniGalleryButton')}<ChevronRight /></Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section className="py-16 md:py-24 text-center bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-headline font-bold">{t('stayConnectedTitle')}</h2>
          <p className="mt-2 max-w-xl mx-auto text-primary-foreground/90">
            {t('stayConnectedSubtitle')}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
                <Link href="#">{t('updateDetails')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                <Link href="#">{t('joinNetwork')}</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}
