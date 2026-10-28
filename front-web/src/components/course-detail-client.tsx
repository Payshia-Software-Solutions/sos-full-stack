"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Laptop,
  MessageCircle,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Check,
  Package,
  Truck,
  FileText,
  Briefcase,
  HelpCircle,
  PhoneCall,
  GraduationCap,
  Layers,
  ArrowRight,
  FileCheck2,
  Lock
} from "lucide-react";

import { useTranslation } from "@/context/language-context";
import { useMemo } from "react";
import { getCourseTranslation } from "@/lib/course-translations";
import { Course } from "@/lib/courses-data";

const formatDuration = (duration: string | number | undefined, lang: string) => {
  if (!duration) return lang === "si" ? "මාස 6" : lang === "ta" ? "6 மாதங்கள்" : "6 Months";
  const num = String(duration).replace(/[^0-9]/g, "");
  if (!num) return String(duration);
  if (lang === "si") return `මාස ${num}`;
  if (lang === "ta") return `${num} மாதங்கள்`;
  return `${num} Months`;
};

const getInstallmentHint = (fee: number, lang: string) => {
  if (!fee || fee <= 0) return null;
  const approx = Math.round((fee / 6) / 500) * 500;
  if (approx < 2000) return null;
  if (lang === "si") return `වාරික වශයෙන් ගෙවිය හැක (මසකට LKR ${approx.toLocaleString()} සිට)`;
  if (lang === "ta") return `தவணைக் கொடுப்பනவு (மாதம் LKR ${approx.toLocaleString()} முதல்)`;
  return `Flexible Installments from LKR ${approx.toLocaleString()}/mo`;
};

interface CourseDetailClientProps {
  course: Course;
  slug: string;
}

export default function CourseDetailClient({ course, slug }: CourseDetailClientProps) {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';
  const isTamil = language === 'ta';

  const activeLang = (language === 'si' || language === 'ta' || language === 'en') ? language : 'en';
  const localizedData = useMemo(() => {
    return getCourseTranslation(slug, activeLang);
  }, [slug, activeLang]);

  const feeNumber = typeof course.course_fee === 'number' 
    ? course.course_fee 
    : parseFloat(course.course_fee) || 0;

  const durationText = formatDuration(course.course_duration, language);
  const installmentText = getInstallmentHint(feeNumber, language);
  const imgUrl = course.course_img?.startsWith('http') 
    ? course.course_img 
    : `https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`;

  const displayName = localizedData.name || course.course_name;
  const displaySubtitle = localizedData.subtitle;

  const whatsappMessage = language === 'si'
    ? `ආයුබෝවන් Ceylon Pharma College, මට ${displayName} පාඨමාලාව පිළිබඳ වැඩිදුර විස්තර, මුද්‍රිත පොත් කට්ටලය සහ ඉදිරි කණ්ඩායම් කාලසටහන දැනගැනීමට අවශ්‍යයි.`
    : language === 'ta'
    ? `வணக்கம் Ceylon Pharma College, நான் ${displayName} பாடநெறி பற்றிய கூடுதல் விவரங்கள் மற்றும் புதிய தொகுதி நேர அட்டவணையை அறிய விரும்புகிறேன்.`
    : `Hi Ceylon Pharma College, I'd like to get more details and registration information for: ${displayName}`;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-12">
      
      {/* 1. Illuminated High-Impact Hero Section */}
      <section className="relative py-14 md:py-20 bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950 text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-200/80 mb-5 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/courses" className="hover:text-white transition-colors">{t('courses')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-amber-300 font-semibold truncate max-w-xs md:max-w-md">{displayName}</span>
          </div>

          <div className="max-w-4xl">
            {/* Accreditation & Quality Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold border-none text-xs px-3 py-1 shadow-md">
                {course.course_code}
              </Badge>
              <Badge variant="outline" className="text-emerald-200 border-emerald-400/30 bg-emerald-500/10 text-xs px-3 py-1 backdrop-blur-sm">
                ACTD Accredited (USA/UK)
              </Badge>
              <Badge variant="outline" className="text-emerald-200 border-emerald-400/30 bg-emerald-500/10 text-xs px-3 py-1 backdrop-blur-sm">
                ISO 9001:2015 Certified
              </Badge>
              <Badge className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1">
                {isSinhala ? 'ලියාපදිංචිය විවෘතයි' : isTamil ? 'சேர்க்கை திறக்கப்பட்டுள்ளது' : 'Registration Open'}
              </Badge>
            </div>

            {/* Course Title with Language-Aware Line Heights */}
            <h1 className={`text-2xl sm:text-4xl md:text-5xl font-headline font-bold text-white drop-shadow-xl tracking-tight ${
              isSinhala ? 'leading-[1.34]' : isTamil ? 'leading-[1.34]' : 'leading-tight'
            }`}>
              {displayName}
            </h1>

            <div className="w-20 h-1 bg-amber-400 my-4 rounded-full" />

            <p className={`text-white/90 text-sm sm:text-base md:text-lg font-body max-w-3xl ${
              isSinhala ? 'leading-[1.75]' : isTamil ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {displaySubtitle}
            </p>

            {/* Quick Metrics Proof Strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-xs text-white/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-semibold">{isSinhala ? 'කාලය' : isTamil ? 'காலம்' : 'Duration'}</p>
                  <p className="font-bold text-white text-xs sm:text-sm">{durationText}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-semibold">{isSinhala ? 'ක්‍රමවේදය' : isTamil ? 'முறை' : 'Mode'}</p>
                  <p className="font-bold text-white text-xs sm:text-sm">{isSinhala ? '100% Online Zoom' : isTamil ? '100% ஆன்லைன்' : '100% Online Zoom'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-semibold">{isSinhala ? 'පොත් කට්ටලය' : isTamil ? 'புத்தகங்கள்' : 'Study Pack'}</p>
                  <p className="font-bold text-emerald-300 text-xs sm:text-sm">{isSinhala ? 'නිවසටම නොමිලේ' : isTamil ? 'வீட்டுக்கே இலவசம்' : 'Free Doorstep Pack'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-semibold">{isSinhala ? 'ඇගයුම' : isTamil ? 'மதிப்பீடு' : 'Rating'}</p>
                  <p className="font-bold text-white text-xs sm:text-sm">4.9 / 5.0 (5,000+)</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-semibold">{isSinhala ? 'ප්‍රතීතනය' : isTamil ? 'அங்கீகாரம்' : 'Credential'}</p>
                  <p className="font-bold text-white text-xs sm:text-sm">ACTD & ISO</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button asChild size="lg" className="font-bold text-sm bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-xl shadow-amber-950/40 rounded-xl px-7 py-6 hover:scale-105 transition-all gap-2">
                <Link href={`/apply?course=${course.slug}`}>
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>{t('enrollNow')}</span>
                </Link>
              </Button>

              <a
                href={`https://wa.me/94715884884?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-emerald-600/30 text-white hover:text-emerald-300 font-semibold text-sm border border-white/20 transition-all backdrop-blur-md hover:scale-105 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isSinhala ? 'WhatsApp මගින් විමසන්න' : isTamil ? 'WhatsApp மூலம் விசாரிக்கவும்' : 'Inquire via WhatsApp'}</span>
              </a>

              <Button asChild variant="ghost" size="lg" className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl text-xs sm:text-sm">
                <Link href="#curriculum">
                  <span>{isSinhala ? 'විෂය නිර්දේශය බලන්න' : isTamil ? 'பாடத்திட்டத்தைப் பார்க்கவும்' : 'View Syllabus'}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content & High-Converting Sticky Sidebar */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
            
            {/* Left Column (Col 8): Rich Content Sections */}
            <main className="lg:col-span-8 space-y-12">
              
              {/* SECTION A: Course Overview */}
              <div className="bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground ${
                    isSinhala ? 'leading-[1.35]' : 'leading-tight'
                  }`}>
                    {isSinhala ? 'පාඨමාලා හැඳින්වීම' : isTamil ? 'பாடநெறி கண்ணோட்டம்' : 'Course Overview'}
                  </h2>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs py-1 px-3">
                    {course.course_code}
                  </Badge>
                </div>
                <div className="w-16 h-1 bg-primary mb-6 rounded-full" />
                
                <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-body leading-relaxed space-y-4">
                  {localizedData.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className={isSinhala || isTamil ? "leading-[1.8]" : "leading-relaxed"}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* 4 Pillars Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/60">
                  {localizedData.highlights.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/70 bg-secondary/20 flex gap-3.5 hover:border-primary/40 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-sm text-foreground mb-1">{h.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: Physical Printed Study Pack Feature Showcase */}
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/10 p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Package className="w-32 h-32 text-emerald-600" />
                </div>

                <div className="relative z-10">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1 mb-3 gap-1.5 inline-flex items-center">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{isSinhala ? 'නොමිලේ නිවසටම ප්‍රවාහනය' : isTamil ? 'இலவச வீட்டு விநியோகம்' : 'Free Island-Wide Delivery'}</span>
                  </Badge>

                  <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground mb-2 ${
                    isSinhala ? 'leading-[1.35]' : 'leading-tight'
                  }`}>
                    {localizedData.studyPackTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground font-body max-w-2xl mb-6 leading-relaxed">
                    {localizedData.studyPackSubtitle}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {localizedData.studyPackItems.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-background/90 border border-emerald-500/20 shadow-sm flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          {item.iconType === 'book' && <BookOpen className="w-5 h-5" />}
                          {item.iconType === 'workbook' && <FileCheck2 className="w-5 h-5" />}
                          {item.iconType === 'chart' && <Layers className="w-5 h-5" />}
                          {item.iconType === 'truck' && <Truck className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-sm text-foreground mb-1">{item.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {isSinhala ? 'සියලුම පොත් සහ අත්පොත් මුද්‍රිත පිටපත් ලෙස ලැබේ (PDF පමණක් නොවේ)' : 'Full Physical Books & Workbooks included (Not just PDFs)'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isSinhala ? 'ලියාපදිංචි වී දින 3-5ක් ඇතුළත නිවසටම ලැබේ' : 'Dispatched within 3-5 days of enrollment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION C: 6-Module Curriculum Accordion */}
              <div id="curriculum" className="bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-sm scroll-mt-24">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground ${
                    isSinhala ? 'leading-[1.35]' : 'leading-tight'
                  }`}>
                    {localizedData.curriculumTitle}
                  </h2>
                  <Badge variant="outline" className="border-border text-xs px-3 py-1">
                    6 {isSinhala ? 'මොඩියුල' : isTamil ? 'தொகுதிகள்' : 'Modules'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-body mb-6 leading-relaxed">
                  {localizedData.curriculumSubtitle}
                </p>
                <div className="w-16 h-1 bg-primary mb-6 rounded-full" />

                <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-3">
                  {localizedData.modules.map((mod, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`item-${idx}`}
                      className="border border-border/70 rounded-xl px-4 sm:px-5 data-[state=open]:border-primary/50 data-[state=open]:bg-secondary/15 transition-all overflow-hidden"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 text-left font-headline font-bold text-sm sm:text-base text-foreground">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {mod.number}
                          </span>
                          <span className="leading-snug">{mod.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-5 text-xs sm:text-sm text-muted-foreground font-body">
                        <p className="mb-3.5 text-foreground/80 leading-relaxed font-medium">
                          {mod.desc}
                        </p>
                        <ul className="space-y-2.5 pl-2">
                          {mod.topics.map((topic, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                              <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                              <span className="leading-relaxed">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* SECTION D: Who Can Join? */}
              <div className="bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-sm">
                <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground mb-2 ${
                  isSinhala ? 'leading-[1.35]' : 'leading-tight'
                }`}>
                  {localizedData.whoCanJoinTitle}
                </h2>
                <div className="w-16 h-1 bg-primary mb-6 rounded-full" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localizedData.whoCanJoin.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/70 bg-secondary/15 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-headline font-bold text-sm text-foreground mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION E: Career Pathways */}
              <div className="bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-sm">
                <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground mb-2 ${
                  isSinhala ? 'leading-[1.35]' : 'leading-tight'
                }`}>
                  {localizedData.careerTitle}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-body mb-6 leading-relaxed">
                  {localizedData.careerSubtitle}
                </p>
                <div className="w-16 h-1 bg-primary mb-6 rounded-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localizedData.careers.map((career, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/70 bg-background flex items-start gap-3.5 hover:border-primary/40 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block mb-0.5">
                          {career.field}
                        </span>
                        <h3 className="font-headline font-bold text-sm text-foreground mb-1">{career.role}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{career.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION F: Learning Methodology & Play • Learn • Grow */}
              <div className="bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-sm">
                <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground mb-2 ${
                  isSinhala ? 'leading-[1.35]' : 'leading-tight'
                }`}>
                  {localizedData.learningExperienceTitle}
                </h2>
                <div className="w-16 h-1 bg-primary mb-6 rounded-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localizedData.learningExperience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/70 bg-secondary/15 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-sm text-foreground mb-1">{exp.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{exp.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION G: Course FAQs */}
              <div className="bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h2 className={`text-2xl sm:text-3xl font-headline font-bold text-foreground ${
                    isSinhala ? 'leading-[1.35]' : 'leading-tight'
                  }`}>
                    {localizedData.faqsTitle}
                  </h2>
                </div>
                <div className="w-16 h-1 bg-primary mb-6 rounded-full" />

                <Accordion type="single" collapsible className="w-full space-y-3">
                  {localizedData.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border border-border/70 rounded-xl px-4 sm:px-5">
                      <AccordionTrigger className="hover:no-underline py-4 text-left font-headline font-semibold text-sm sm:text-base text-foreground leading-snug">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-4 text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

            </main>

            {/* Right Column (Col 4): Sticky High-Converting Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                
                {/* Main Conversion Card */}
                <Card className="rounded-2xl border border-border/80 shadow-2xl bg-card overflow-hidden">
                  
                  {/* Course Image Header */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image 
                      src={imgUrl}
                      alt={displayName}
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-500" 
                      priority
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-emerald-600 text-white font-semibold text-xs border-none shadow-md">
                        {course.skill_level || "Certificate"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 z-10">
                      <Badge className="bg-black/70 backdrop-blur-md text-amber-300 font-bold text-xs border border-white/20">
                        {course.course_code}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Tuition & Installment Plan */}
                    <div className="mb-5 pb-5 border-b border-border/80">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-1">
                        {isSinhala ? 'පාඨමාලා ගාස්තුව' : isTamil ? 'பாடநெறிக் கட்டணம்' : 'Course Tuition'}
                      </span>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-3xl font-headline font-bold text-foreground">
                          {feeNumber > 0 ? `LKR ${feeNumber.toLocaleString()}` : "Contact for Fee"}
                        </span>
                        <Badge variant="secondary" className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10">
                          {isSinhala ? 'සීමිත ආසන' : isTamil ? 'வரையறுக்கப்பட்ட இடங்கள்' : 'Limited Seats'}
                        </Badge>
                      </div>
                      {installmentText && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>{installmentText}</span>
                        </p>
                      )}
                    </div>

                    {/* Highlights Checklist */}
                    <div className="space-y-3 text-xs text-muted-foreground mb-6 font-body">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-foreground/90 font-medium">
                          <Clock className="w-4 h-4 text-primary" /> {isSinhala ? 'කාලය:' : 'Duration:'}
                        </span>
                        <span className="font-semibold text-foreground">{durationText}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-foreground/90 font-medium">
                          <Laptop className="w-4 h-4 text-primary" /> {isSinhala ? 'දේශන:' : 'Delivery:'}
                        </span>
                        <span className="font-semibold text-foreground">Live Zoom + LMS</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-foreground/90 font-medium">
                          <Package className="w-4 h-4 text-emerald-600" /> {isSinhala ? 'මුද්‍රිත පොත්:' : 'Study Pack:'}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{isSinhala ? 'නිවසටම නොමිලේ' : 'Free Doorstep'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-foreground/90 font-medium">
                          <Award className="w-4 h-4 text-primary" /> {isSinhala ? 'ප්‍රතීතනය:' : 'Accreditation:'}
                        </span>
                        <span className="font-semibold text-foreground">ACTD & ISO 9001</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-foreground/90 font-medium">
                          <CalendarDays className="w-4 h-4 text-primary" /> {isSinhala ? 'ලියාපදිංචිය:' : 'Intake:'}
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{isSinhala ? 'දැන් විවෘතයි' : 'Now Open'}</span>
                      </div>
                    </div>

                    {/* Primary Enroll Button */}
                    <Button asChild className="w-full font-bold text-base bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md py-6 rounded-xl hover:scale-[1.02] transition-transform" size="lg">
                      <Link href={`/apply?course=${course.slug}`}>
                        {t('enrollNow')}
                      </Link>
                    </Button>

                    {/* Secondary WhatsApp Button */}
                    <a 
                      href={`https://wa.me/94715884884?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-3 font-semibold text-xs flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all text-center"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{isSinhala ? 'WhatsApp මගින් ක්ෂණික විමසීම්' : isTamil ? 'WhatsApp மூலம் விசாரிக்கவும்' : 'Inquire via WhatsApp'}</span>
                    </a>

                    {/* Admissions Hotline Card */}
                    <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-primary" />
                        <span>Hotline:</span>
                      </div>
                      <a href="tel:0715884884" className="font-bold text-foreground hover:text-primary transition-colors">
                        0715 884 884
                      </a>
                    </div>

                    {/* Trust Footnote */}
                    <div className="mt-4 pt-3 border-t border-border/50 text-center">
                      <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{isSinhala ? 'ක්ෂණික LMS පිවිසුම සහ නිල රිසිට්පත' : 'Instant LMS Access & Official Receipt'}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Direct Verification Assurance Box */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>{isSinhala ? '24/7 සත්‍යාපනය කළ හැකි සහතිකය' : '24/7 Verifiable Credential'}</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    {isSinhala 
                      ? 'අපගේ සෑම සහතිකයකටම අනන්‍ය වූ QR කේතයක් පවතින අතර pharmacollege.lk/certificates මගින් රෝහල් වලට සෘජුවම තහවුරු කරගත හැක.'
                      : 'Every certificate carries an individual QR code and verification ID verifiable worldwide on pharmacollege.lk/certificates.'}
                  </p>
                  <Link href="/certificates" className="text-primary hover:underline text-[11px] font-semibold inline-flex items-center gap-1">
                    <span>{isSinhala ? 'සහතිකපත් සත්‍යාපන ද්වාරය බලන්න' : 'View Verification Portal'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </section>

      {/* 3. Modern 3-Step Enrollment Roadmap */}
      <section className="py-16 md:py-24 bg-card/50 border-y border-border/60">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 bg-primary/5">
            {isSinhala ? 'පියවර 3 ක සරල ක්‍රියාවලිය' : isTamil ? 'எளிய 3-படி செயல்முறை' : 'Simple 3-Step Process'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-foreground">
            {t('howToEnroll')}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-3 mb-12 rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm relative group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-headline font-bold text-lg text-foreground mb-2">
                {t('enrollStep1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                {t('enrollStep1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm relative group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-headline font-bold text-lg text-foreground mb-2">
                {t('enrollStep2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                {t('enrollStep2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm relative group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-headline font-bold text-lg text-foreground mb-2">
                {isSinhala ? 'LMS පිවිසුම සහ පොත් කට්ටලය ලැබීම' : isTamil ? 'LMS அணுகல் மற்றும் புத்தகங்கள்' : 'LMS Access & Study Pack Delivery'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
                {isSinhala 
                  ? 'ගෙවීම තහවුරු වූ වහාම ශිෂ්‍ය ද්වාරයට (LMS) ප්‍රවේශය ලැබෙන අතර නිල මුද්‍රිත පොත් කට්ටලය ඔබේ නිවසටම කුරියර් මගින් එවනු ලැබේ.'
                  : 'Instant LMS credentials are provided, and your official printed study pack is dispatched directly to your doorstep.'}
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" className="font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl px-8 py-6 rounded-xl hover:scale-105 transition-all gap-2">
              <Link href={`/apply?course=${course.slug}`}>
                <GraduationCap className="w-5 h-5" />
                <span>{isSinhala ? 'ඔබේ අයදුම්පත දැන්ම යොමු කරන්න' : 'Start Your Online Application Now'}</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Mobile Floating Sticky Bottom Conversion Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-md border-t border-border lg:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
            {isSinhala ? 'ගාස්තුව' : 'Fee'}
          </span>
          <span className="text-base font-bold text-foreground">
            LKR {feeNumber.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/94715884884?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-emerald-600/10 text-emerald-600 border border-emerald-600/30 flex items-center justify-center"
            aria-label="WhatsApp Inquiry"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-5 py-5 rounded-xl shadow-md">
            <Link href={`/apply?course=${course.slug}`}>
              {t('enrollNow')}
            </Link>
          </Button>
        </div>
      </div>

    </div>
  );
}
