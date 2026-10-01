"use client";

import Image from 'next/image';
import { useTranslation } from '@/context/language-context';
import { Gamepad2, Pill, MonitorPlay, BookOpen, Award, Briefcase, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const differentiators = [
  {
    icon: Gamepad2,
    title: "Educational Games",
    desc: "WinPharma, D-Pad & Pharma Hunter games make pharmacology calculations and medicine identification intuitive.",
  },
  {
    icon: Pill,
    title: "Real Dispensing Practice",
    desc: "Hands-on prescription interpretation, dosage labeling, and patient counselling simulations.",
  },
  {
    icon: MonitorPlay,
    title: "Live Zoom + Recordings",
    desc: "Interactive weekend lectures with 24/7 access to recorded lessons on our dedicated LMS portal.",
  },
  {
    icon: BookOpen,
    title: "Printed Study Pack",
    desc: "Comprehensive study materials and drug directories delivered directly to your doorstep.",
  },
  {
    icon: Award,
    title: "ACTD & ISO 9001:2015",
    desc: "Internationally accredited certificates verified through our online verification database.",
  },
  {
    icon: Briefcase,
    title: "Career & Job Support",
    desc: "Connecting qualified pharmacy graduates with leading private hospitals and community pharmacies.",
  },
];

export default function WhyChooseUs() {
  const { t } = useTranslation();

  return (
    <section id="why-choose-us" className="py-16 md:py-24 bg-card/40 border-y border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Badge variant="outline" className="w-fit mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
              The CPC Difference
            </Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground leading-tight">
              Not Just Lectures. <span className="text-primary block">Real Pharmacy Skills.</span>
            </h2>
            <div className="w-20 h-1 bg-primary mt-3 mb-6 rounded-full" />
            
            <p className="text-muted-foreground font-body leading-relaxed text-sm md:text-base">
              At Ceylon Pharma College, we move beyond boring memorization. Our blended learning model combines practical simulations, gamified revision, and expert mentorship to prepare you for actual pharmacy practice.
            </p>

            <div className="relative h-64 md:h-72 w-full rounded-2xl overflow-hidden shadow-xl mt-8 border border-border">
              <Image
                src="https://content-provider.pharmacollege.lk/website/why-chose.webp"
                alt="Students practical learning at Ceylon Pharma College"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                <span className="font-semibold block text-sm">Interactive Virtual Learning</span>
                Empowering healthcare careers across Sri Lanka & worldwide
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {differentiators.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="p-5 rounded-xl bg-background border border-border/70 hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-headline font-bold text-base text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Trust Stats Bar */}
            <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">4,700+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Students Trained</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-amber-500">830+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Google Reviews (4.9★)</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">20+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Batches Completed</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-headline font-bold text-primary">6+</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Accredited Courses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
