"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import WhyChooseUsAbout from '@/components/why-choose-us-about';
import Accreditations from '@/components/accreditations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Users, GraduationCap, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const lecturePanel = [
  { name: "Mr. Dilip Fonseka", role: "Course Director & Senior Pharmacist", field: "Pharmacy Practice & Regulations" },
  { name: "Dr. Vajira Senevirathna", role: "Medical Consultant & Senior Lecturer", field: "Clinical Pharmacology & Therapeutics" },
  { name: "Prof. Vishan Rudrigoo", role: "Visiting Professor", field: "Pharmaceutical Sciences & Quality Systems" },
  { name: "Ms. Dilshani Gunasekara", role: "Senior Lecturer", field: "Community Pharmacy & Dispensing Skills" },
  { name: "Ms. Nilanka Senevirathna", role: "Lecturer", field: "Medical Terminology & Calculations" },
  { name: "Ms. Hansi Senevirathna", role: "Lecturer", field: "Patient Safety & Healthcare Ethics" },
  { name: "Mr. Thilina Doloswala", role: "Lead Systems & Learning Specialist", field: "Interactive Educational Tech & LMS" },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main>
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center px-4 md:px-6">
          <div>
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
              Institutional Profile
            </Badge>
            <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground">{t('aboutTitle')}</h1>
            <div className="w-24 h-1 bg-primary mt-3 mb-6 rounded-full" />
            <p className="text-muted-foreground font-body leading-relaxed text-base md:text-lg">
              {t('aboutPara1')}
            </p>
            <p className="mt-4 text-muted-foreground font-body leading-relaxed text-sm md:text-base">
              {t('aboutPara2')}
            </p>
          </div>
          <div className="relative h-72 md:h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-border">
            <Image
              src="https://content-provider.pharmacollege.lk/website/about-image-optimized.webp"
              alt="Ceylon Pharma College Building and Learning Environment"
              fill
              className="object-cover"
              data-ai-hint="modern building students"
              priority
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border border-border/80 shadow-md">
                      <CardHeader className="flex-row items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <Target className="w-8 h-8 text-primary" />
                          </div>
                          <CardTitle className="font-headline text-2xl text-foreground">{t('visionTitle')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground font-body leading-relaxed">{t('visionText')}</p>
                      </CardContent>
                  </Card>
                  <Card className="border border-border/80 shadow-md">
                      <CardHeader className="flex-row items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                          <CardTitle className="font-headline text-2xl text-foreground">{t('missionTitle')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground font-body leading-relaxed">{t('missionText')}</p>
                      </CardContent>
                  </Card>
              </div>
          </div>
      </section>
      
      <WhyChooseUsAbout />

      {/* Lecturer Panel */}
      <section className="py-16 md:py-24 bg-secondary/15">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
              Experienced Faculty
            </Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('lecturePanelTitle')}</h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-4 rounded-full" />
            <p className="text-muted-foreground font-body text-sm md:text-base">{t('lecturePanelSubtitle')}</p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {lecturePanel.map((lecturer) => (
              <Card key={lecturer.name} className="border border-border/80 bg-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-foreground">
                        {lecturer.name}
                      </h3>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {lecturer.role}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 border-t border-border/60 pt-2">
                        {lecturer.field}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Accreditations />
    </main>
  );
}
