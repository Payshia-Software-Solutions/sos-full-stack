
"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import WhyChooseUsAbout from '@/components/why-choose-us-about';
import Accreditations from '@/components/accreditations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Users } from 'lucide-react';

const lecturePanel = [
  "Mr. Dilip Fonseka",
  "Ms. Dilshani Gunasekara",
  "Dr. Vajira Senevirathna",
  "Prof. Vishan Rudrigoo",
  "Ms. Nilanka Senevirathna",
  "Ms. Hansi Senevirathna",
  "Mr. Thilina Doloswala"
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main>
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center px-4 md:px-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">{t('aboutTitle')}</h1>
             <div className="w-24 h-1 bg-primary mt-2 mb-4" />
            <p className="mt-4 text-muted-foreground font-body leading-relaxed">
              {t('aboutPara1')}
            </p>
            <p className="mt-4 text-muted-foreground font-body leading-relaxed">
              {t('aboutPara2')}
            </p>
          </div>
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://content-provider.pharmacollege.lk/website/about-image-optimized.webp"
              alt="The modern facade of the Ceylon Pharma College building"
              fill
              className="object-cover"
              data-ai-hint="modern building students"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                      <CardHeader className="flex-row items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Target className="w-8 h-8 text-primary" />
                          </div>
                          <CardTitle className="font-headline text-2xl text-foreground">{t('visionTitle')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground font-body">{t('visionText')}</p>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader className="flex-row items-center gap-4">
                           <div className="p-3 bg-primary/10 rounded-full">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                          <CardTitle className="font-headline text-2xl text-foreground">{t('missionTitle')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground font-body">{t('missionText')}</p>
                      </CardContent>
                  </Card>
              </div>
          </div>
      </section>
      
      <WhyChooseUsAbout />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('lecturePanelTitle')}</h2>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground font-body">{t('lecturePanelSubtitle')}</p>
             <div className="w-24 h-1 bg-primary mx-auto mt-4" />
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  {lecturePanel.map((name) => (
                    <li key={name} className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Accreditations />
    </main>
  );
}
