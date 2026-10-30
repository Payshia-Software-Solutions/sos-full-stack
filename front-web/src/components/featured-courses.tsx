"use client";

import Image from "next/image";
import Link from "next/link";
import { Course } from "@/lib/courses-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MonitorPlay, ArrowRight, Award, Star, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/context/language-context";

interface FeaturedCoursesProps {
  courses: Course[];
}

function formatDuration(duration: string | number | undefined, lang: string) {
  if (!duration) {
    return lang === 'si' ? 'මාස 6' : lang === 'ta' ? '6 மாதங்கள்' : '6 Months';
  }
  const str = String(duration).trim();
  if (/^\d+$/.test(str)) {
    return lang === 'si' ? `මාස ${str}` : lang === 'ta' ? `${str} மாதங்கள்` : `${str} Months`;
  }
  if (lang === 'si') {
    return str.replace(/Months/i, 'මාස').replace(/Month/i, 'මාස').replace(/Days/i, 'දින').replace(/Day/i, 'දින');
  }
  if (lang === 'ta') {
    return str.replace(/Months/i, 'மாதங்கள்').replace(/Month/i, 'மாதம்').replace(/Days/i, 'நாட்கள்').replace(/Day/i, 'நாள்');
  }
  return str;
}

function getInstallmentHint(feeNumber: number, lang: string) {
  return null;
}

export default function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  const { language } = useTranslation();
  const displayCourses = courses.slice(0, 4);

  const localizedContent = {
    si: {
      badge: "අපගේ පාඨමාලා",
      title: "ශ්‍රී ලංකාවේ ප්‍රමුඛතම ඖෂධවේදී පාඨමාලා",
      subtitle: "ප්‍රතීතනය ලත් මාර්ගගත පාඨමාලා හරහා රැකියාවට සෘජුවම සුදුසු ඖෂධ නිකුත් කිරීමේ ප්‍රායෝගික කුසලතා, බෙහෙත් වට්ටෝරු කියවීම සහ ඖෂධවේදය ප්‍රගුණ කරන්න.",
      feeLabel: "පාඨමාලා ගාස්තුව",
      detailsBtn: "විස්තර",
      applyBtn: "ලියාපදිංචිය",
      viewAllBtn: "සියලුම පාඨමාලා සහ විෂය නිර්දේශ බලන්න",
      onlineBadge: "සජීවී Zoom + පටිගත කිරීම්",
      assessmentsBadge: "විභාග සහ පැවරුම්",
      popularBadge: "ජනප්‍රියම පාඨමාලාව",
      studentCountLabel: "සිසුන්",
    },
    ta: {
      badge: "எங்கள் திட்டங்களை ஆராயுங்கள்",
      title: "இலங்கையின் முன்னணி மருந்தியல் படிப்புகள்",
      subtitle: "அங்கீகரிக்கப்பட்ட ஆன்லைன் திட்டங்கள் மூலம் வேலைக்குத் தயாரான மருந்தக விநியோகத் திறன்கள், மருந்துச்சீட்டு வாசிப்பு மற்றும் மருந்தியல் அறிவைப் பெறுங்கள்.",
      feeLabel: "படிப்பு கட்டணம்",
      detailsBtn: "விவரங்கள்",
      applyBtn: "விண்ணப்பிக்க",
      viewAllBtn: "அனைத்து பாடநெறிகளையும் பார்க்கவும்",
      onlineBadge: "நேரலை Zoom + பதிவுகள்",
      assessmentsBadge: "தேர்வுகள் மற்றும் பணிகள்",
      popularBadge: "மிகவும் பிரபலம்",
      studentCountLabel: "மாணவர்கள்",
    },
    en: {
      badge: "Explore Our Programs",
      title: "Popular Pharmacy Courses in Sri Lanka",
      subtitle: "Gain job-ready pharmaceutical dispensing skills, prescription interpretation, and pharmacology mastery through accredited online programs.",
      feeLabel: "Course Fee",
      detailsBtn: "Details",
      applyBtn: "Apply Now",
      viewAllBtn: "View All Programs & Syllabuses",
      onlineBadge: "Online • Live Zoom + LMS",
      assessmentsBadge: "Exams & Assignments",
      popularBadge: "Most Popular",
      studentCountLabel: "students",
    },
  }[language] || {
    badge: "Explore Our Programs",
    title: "Popular Pharmacy Courses in Sri Lanka",
    subtitle: "Gain job-ready pharmaceutical dispensing skills, prescription interpretation, and pharmacology mastery through accredited online programs.",
    feeLabel: "Course Fee",
    detailsBtn: "Details",
    applyBtn: "Apply Now",
    viewAllBtn: "View All Programs & Syllabuses",
    onlineBadge: "Online • Live Zoom + LMS",
    assessmentsBadge: "Exams & Assignments",
    popularBadge: "Most Popular",
    studentCountLabel: "students",
  };

  return (
    <section id="courses" className="w-full py-16 md:py-24 bg-gradient-to-b from-background via-emerald-50/20 to-background dark:via-emerald-950/10">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 bg-primary/5">
            {localizedContent.badge}
          </Badge>
          <h2 className={`text-3xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
            language === 'si' ? 'leading-[1.32]' : 'leading-tight'
          }`}>
            {localizedContent.title}
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto mt-4 rounded-full" />
          <p className={`mt-4 text-muted-foreground text-base md:text-lg font-body ${
            language === 'si' ? 'leading-[1.75]' : 'leading-relaxed'
          }`}>
            {localizedContent.subtitle}
          </p>
        </div>

        {/* 100% Crawler-Visible Semantic Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {displayCourses.map((course, index) => {
            const imgUrl = course.course_img?.startsWith("http")
              ? course.course_img
              : `https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`;

            const feeNumber =
              typeof course.course_fee === "number"
                ? course.course_fee
                : parseFloat(String(course.course_fee)) || 0;

            const isPopular = index === 0 || course.course_code === "CS0001" || course.badge?.toLowerCase().includes("popular");
            const durationText = formatDuration(course.course_duration, language);
            const installmentText = getInstallmentHint(feeNumber, language);
            const studentCount = isPopular ? "1,500+" : (index === 1 ? "1,100+" : (index === 2 ? "450+" : "800+"));

            return (
              <article
                key={course.id}
                className={`flex flex-col h-full rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 relative ${
                  isPopular 
                    ? "border-primary/60 ring-2 ring-primary/20 shadow-md" 
                    : "border-border/80 hover:border-primary/40"
                }`}
              >
                {/* Most Popular Highlight Pill */}
                {isPopular && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-[11px] shadow-lg tracking-wide">
                    <span>🔥</span>
                    <span>{localizedContent.popularBadge}</span>
                  </div>
                )}

                {/* Image */}
                <Link
                  href={`/courses/${course.slug}`}
                  className="relative aspect-video w-full overflow-hidden block bg-muted shrink-0"
                  aria-label={course.course_name}
                >
                  <Image
                    src={imgUrl}
                    alt={course.course_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between text-xs mb-2 gap-2">
                    <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">
                      {course.category || "Certificate"}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                      <span className="text-muted-foreground font-normal">({studentCount})</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`font-headline font-bold text-base md:text-lg text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors ${
                    language === 'si' ? 'leading-normal' : 'leading-snug'
                  }`}>
                    <Link href={`/courses/${course.slug}`}>
                      {course.course_name}
                    </Link>
                  </h3>

                  {/* Key Highlights */}
                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground/90">{durationText}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MonitorPlay className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{localizedContent.onlineBadge}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{localizedContent.assessmentsBadge}</span>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
                          {localizedContent.feeLabel}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold font-headline text-foreground">
                            {feeNumber > 0 ? `LKR ${feeNumber.toLocaleString()}` : "Contact for Fee"}
                          </span>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-mono font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded shrink-0">
                        {course.course_code}
                      </span>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-primary hover:text-primary rounded-lg">
                        <Link href={`/courses/${course.slug}`}>
                          {localizedContent.detailsBtn}
                        </Link>
                      </Button>
                      
                      <Button asChild size="sm" className="w-full text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-1 rounded-lg">
                        <Link href={`/apply?course=${course.slug}`}>
                          <span>{localizedContent.applyBtn}</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                        </Link>
                      </Button>
                    </div>

                  </div>

                </div>
              </article>
            );
          })}
        </div>

        {/* View All Programs Action */}
        <div className="mt-14 text-center">
          <Button asChild size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-6 text-base shadow-sm rounded-xl">
            <Link href="/courses">
              {localizedContent.viewAllBtn} <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
