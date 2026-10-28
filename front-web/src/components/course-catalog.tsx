"use client";

import { LMS_API_URL } from "@/lib/config";
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/context/language-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  ListFilter, 
  Clock, 
  MonitorPlay, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  Search, 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  ChevronRight,
  MessageCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Course, FALLBACK_COURSES, getCourseCategory } from "@/lib/courses-data";

const CourseCardSkeleton = () => (
  <Card className="overflow-hidden h-full flex flex-col rounded-2xl border border-border/70">
    <Skeleton className="aspect-video w-full" />
    <div className="p-5 bg-card flex flex-col flex-grow space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex-grow" />
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-9 w-1/4" />
      </div>
    </div>
  </Card>
);

const formatDuration = (duration: string | number | undefined, lang: string) => {
  if (!duration) return lang === "si" ? "මාස 6" : "6 Months";
  const num = String(duration).replace(/[^0-9]/g, "");
  if (!num) return String(duration);
  if (lang === "si") return `මාස ${num}`;
  if (lang === "ta") return `${num} மாதங்கள்`;
  return `${num} Months`;
};

const getInstallmentHint = (fee: number, lang: string) => {
  if (!fee || fee <= 0) return null;
  const approx = Math.round((fee / 6) / 500) * 500;
  if (approx < 2500) return null;
  if (lang === "si") return `වාරික වශයෙන් ගෙවිය හැක (මසකට LKR ${approx.toLocaleString()})`;
  if (lang === "ta") return `தவணைக் கொடுப்பனவு (மாதம் LKR ${approx.toLocaleString()})`;
  return `Installments from LKR ${approx.toLocaleString()}/mo`;
};

interface CourseCatalogProps {
  initialCourses?: Course[];
}

export default function CourseCatalog({ initialCourses }: CourseCatalogProps) {
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const labels = useMemo(() => {
    switch (language) {
      case 'si':
        return {
          badge: 'වෘත්තීය ඖෂධවේදී පාඨමාලා',
          title: 'අපගේ පිළිගත් පාඨමාලා මාලාව',
          subtitle: 'සජීවී Zoom දේශන, අධ්‍යාපනික ක්‍රීඩා, මුද්‍රිත පොත් කට්ටලය සහ රජයේ සහ ජාත්‍යන්තරව පිළිගත් සහතිකපත් සමඟ ඔබේ වෘත්තීය ගමන අරඹන්න.',
          online: 'Live Zoom + LMS පටිගත කිරීම්',
          studyPack: 'මුද්‍රිත පොත් කට්ටලය + සහතිකය',
          courseFee: 'පාඨමාලා ගාස්තුව',
          viewCourse: 'විස්තර',
          applyNow: 'අයදුම් කරන්න',
          resetFilters: 'පෙරහන් යළි සකසන්න',
          searchPlaceholder: 'පාඨමාලා නම හෝ කේතය අනුව සොයන්න...',
          allCourses: 'සියලු පාඨමාලා',
          popularBadge: 'වඩාත් ජනප්‍රිය',
          filterTitle: 'පෙරහන්',
          resultsCount: 'පාඨමාලා {count} ක් හමුවිය',
        };
      case 'ta':
        return {
          badge: 'தொழில்முறை பார்மசி பாடநெறிகள்',
          title: 'எங்கள் அங்கீகரிக்கப்பட்ட பாடநெறிகள்',
          subtitle: 'நேரடி Zoom விரிவுரைகள், கற்றல் விளையாட்டுகள் மற்றும் அங்கீகரிக்கப்பட்ட சான்றிதழுடன் உங்கள் மருத்துவ வாழ்க்கையைத் தொடங்குங்கள்.',
          online: 'நேரடி Zoom + LMS பதிவுகள்',
          studyPack: 'அச்சிடப்பட்ட புத்தகங்கள் + சான்றிதழ்',
          courseFee: 'பாடநெறி கட்டணம்',
          viewCourse: 'விவரங்கள்',
          applyNow: 'விண்ணப்பிக்கவும்',
          resetFilters: 'வடிகட்டிகளை மீட்டமை',
          searchPlaceholder: 'பாடநெறியைத் தேடுங்கள்...',
          allCourses: 'அனைத்து பாடநெறிகள்',
          popularBadge: 'மிகவும் பிரபலம்',
          filterTitle: 'வடிகட்டிகள்',
          resultsCount: '{count} பாடநெறிகள் காணப்படுகின்றன',
        };
      default:
        return {
          badge: 'Professional Pharmacy Programs',
          title: 'Accredited Pharmacy Courses',
          subtitle: 'Gain recognized practical qualifications through interactive online classes, real-life dispensing simulations, and home-delivered study packs.',
          online: 'Live Zoom + 24/7 LMS Recordings',
          studyPack: 'Printed Study Pack + Certificate',
          courseFee: 'Course Fee',
          viewCourse: 'Details',
          applyNow: 'Apply Now',
          resetFilters: 'Reset Filters',
          searchPlaceholder: 'Search courses by title or code...',
          allCourses: 'All Courses',
          popularBadge: 'Most Popular',
          filterTitle: 'Filters',
          resultsCount: '{count} courses available',
        };
    }
  }, [language]);
  
  const baseCourses = useMemo(() => {
    const src = (initialCourses && initialCourses.length > 0) ? initialCourses : FALLBACK_COURSES;
    return src.map(c => ({
      ...c,
      price: typeof c.course_fee === 'number' ? c.course_fee : (parseFloat(String(c.course_fee)) || 0),
      category: c.category || getCourseCategory(c.course_name),
      mode: c.mode || "Online • Live Zoom + Recordings",
    }));
  }, [initialCourses]);

  const [allCourses, setAllCourses] = useState<Course[]>(baseCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(baseCourses);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const initialMax = useMemo(() => Math.max(...baseCourses.map(c => c.price || 0), 20000), [baseCourses]);
  const [priceRange, setPriceRange] = useState<number[]>([0, initialMax]);
  const [maxPrice, setMaxPrice] = useState(initialMax);

  useEffect(() => {
    async function refreshCourses() {
      try {
        const response = await fetch(`${LMS_API_URL}/parent-main-course`);
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const coursesWithCategory: Course[] = data
            .filter((c: any) => String(c.display) !== '0' && c.display !== 0)
            .map((course: any) => ({
              ...course,
              price: parseFloat(String(course.course_fee)) || 0,
              category: getCourseCategory(course.course_name),
              mode: "Online • Live Zoom + Recordings",
              intake: "Registration Open",
            }));
          
          setAllCourses(coursesWithCategory);
          const computedMax = Math.max(...coursesWithCategory.map(c => c.price || 0), 20000);
          setMaxPrice(computedMax);
          setPriceRange(prev => [prev[0], Math.max(prev[1], computedMax)]);
        }
      } catch (error) {
        console.warn("Could not background refresh courses:", error);
      }
    }
    refreshCourses();
  }, []);

  useEffect(() => {
    let courses = allCourses;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      courses = courses.filter(c => 
        c.course_name.toLowerCase().includes(q) || 
        (c.course_code && c.course_code.toLowerCase().includes(q)) ||
        (c.course_description && c.course_description.toLowerCase().includes(q))
      );
    }

    if (selectedCategories.length > 0) {
      courses = courses.filter(course => selectedCategories.includes(course.category || 'Certificate'));
    }

    courses = courses.filter(course => (course.price || 0) >= priceRange[0] && (course.price || 0) <= priceRange[1]);
    
    setFilteredCourses(courses);
  }, [searchQuery, selectedCategories, priceRange, allCourses]);
  
  const courseCategories = useMemo(() => {
    const categories = [...new Set(allCourses.map(course => course.category || 'Certificate'))];
    return categories.map(category => ({ 
      id: category, 
      label: category,
      count: allCourses.filter(c => (c.category || 'Certificate') === category).length
    }));
  }, [allCourses]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
  };

  const FilterSidebar = () => (
    <aside className="w-full lg:w-72 shrink-0">
      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm sticky top-24">
        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/80">
            <h3 className="font-headline font-bold text-base text-foreground flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-primary" />
              <span>{labels.filterTitle}</span>
            </h3>
            {(selectedCategories.length > 0 || priceRange[1] < maxPrice || searchQuery) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters} 
                className="text-xs text-muted-foreground hover:text-primary h-7 px-2"
              >
                {labels.resetFilters}
              </Button>
            )}
          </div>

          <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
            <AccordionItem value="category" className="border-b border-border/60">
              <AccordionTrigger className="font-semibold text-sm py-4">Category</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2.5 pt-1">
                  {courseCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryChange(category.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor={`cat-${category.id}`} className="text-xs font-medium cursor-pointer text-foreground/90">
                          {category.label}
                        </Label>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price" className="border-b-0">
              <AccordionTrigger className="font-semibold text-sm py-4">Price Range</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-1 space-y-3">
                  <Slider
                    defaultValue={[maxPrice]}
                    value={[priceRange[1]]}
                    min={0}
                    max={maxPrice}
                    step={1000}
                    onValueChange={(value) => setPriceRange([0, value[0]])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>LKR 0</span>
                    <span className="font-semibold text-foreground">Up to LKR {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Quick Support Pill */}
          <div className="mt-6 pt-4 border-t border-border/70 text-center">
            <p className="text-xs text-muted-foreground mb-2">Need help choosing a course?</p>
            <a
              href="https://wa.me/94715884884?text=Hi%20Ceylon%20Pharma%20College,%20I%20need%20guidance%20on%20choosing%20the%20right%20pharmacy%20course."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs transition-colors border border-emerald-500/30"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Free Student Counseling</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Modern Branded Hero Section */}
      <section className="relative py-14 md:py-20 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{labels.allCourses}</span>
          </div>

          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 gap-1.5 inline-flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{labels.badge}</span>
            </Badge>
            
            <h1 className={`text-3xl md:text-5xl font-headline font-bold text-foreground tracking-tight ${
              isSinhala ? 'leading-[1.35]' : 'leading-tight'
            }`}>
              {labels.title}
            </h1>
            
            <div className="w-20 h-1 bg-primary mt-3 mb-4 rounded-full" />
            
            <p className={`text-muted-foreground font-body text-sm md:text-base max-w-2xl ${
              isSinhala ? 'leading-[1.75]' : 'leading-relaxed'
            }`}>
              {labels.subtitle}
            </p>

            {/* Quick Search Bar */}
            <div className="mt-8 max-w-xl relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder={labels.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-5 rounded-xl bg-card border-border/80 shadow-sm focus-visible:ring-primary text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Trust Badges Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> ACTD Accredited
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> ISO 9001:2015 Certified
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-500" /> 5,000+ Alumni
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Catalog Grid with Filters */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>

            {/* Mobile Filters Header */}
            <div className="lg:hidden w-full mb-4">
              <div className="flex items-center justify-between gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 rounded-xl border-border">
                      <ListFilter className="h-4 w-4 text-primary" />
                      <span>{labels.filterTitle}</span>
                      {selectedCategories.length > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                          {selectedCategories.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full max-w-xs p-4">
                    <SheetTitle className="text-base font-bold mb-2">Filter Courses</SheetTitle>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>

                <span className="text-xs text-muted-foreground font-medium">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                </span>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="flex-1 w-full">
              {/* Results Top Bar */}
              <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-border/60">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {labels.resultsCount.replace('{count}', String(filteredCourses.length))}
                </span>
                {selectedCategories.length > 0 && (
                  <div className="flex items-center gap-2">
                    {selectedCategories.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-xs gap-1 font-normal">
                        {cat}
                        <button onClick={() => handleCategoryChange(cat)} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)}
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map((course, index) => {
                    const imgUrl = course.course_img?.startsWith('http') 
                      ? course.course_img 
                      : `https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`;

                    const feeNumber = course.price || (parseFloat(String(course.course_fee)) || 0);
                    const isPopular = index === 0 || course.course_code === "CS0001" || course.badge?.toLowerCase().includes("popular");
                    const durationText = formatDuration(course.course_duration, language);
                    const installmentText = getInstallmentHint(feeNumber, language);
                    const studentCount = isPopular ? "1,500+" : (index === 1 ? "1,100+" : "800+");

                    return (
                      <article 
                        key={course.id} 
                        className={`flex flex-col h-full rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 relative ${
                          isPopular 
                            ? "border-primary/60 ring-2 ring-primary/20 shadow-md" 
                            : "border-border/80 hover:border-primary/40"
                        }`}
                      >
                        {/* Most Popular Pill */}
                        {isPopular && (
                          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-[11px] shadow-lg tracking-wide">
                            <span>🔥</span>
                            <span>{labels.popularBadge}</span>
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
                            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        
                        {/* Body */}
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

                          {/* Course Title */}
                          <h2 className={`font-headline font-bold text-base md:text-lg text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors ${
                            isSinhala ? 'leading-normal' : 'leading-snug'
                          }`}>
                            <Link href={`/courses/${course.slug}`}>
                              {course.course_name}
                            </Link>
                          </h2>

                          {/* Features */}
                          <div className="space-y-2 text-xs text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="font-medium text-foreground/90">{durationText}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MonitorPlay className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{labels.online}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{labels.studyPack}</span>
                            </div>
                          </div>

                          {/* Pricing & Actions */}
                          <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
                            <div className="flex items-baseline justify-between gap-2">
                              <div>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
                                  {labels.courseFee}
                                </span>
                                <span className="text-xl font-bold font-headline text-foreground">
                                  {feeNumber > 0 ? `LKR ${feeNumber.toLocaleString()}` : "Contact for Fee"}
                                </span>
                                {installmentText && (
                                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                                    {installmentText}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded shrink-0">
                                {course.course_code}
                              </span>
                            </div>

                            {/* Dual Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-primary hover:text-primary rounded-lg">
                                <Link href={`/courses/${course.slug}`}>
                                  {labels.viewCourse}
                                </Link>
                              </Button>
                              <Button asChild size="sm" className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-sm rounded-lg">
                                <Link href={`/apply?course=${course.slug}`}>
                                  {labels.applyNow}
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border p-8">
                  <p className="text-lg font-semibold text-foreground">No courses match your criteria</p>
                  <p className="text-muted-foreground mt-2 text-sm">Try broadening your search term or reset applied filters.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 rounded-xl"
                    onClick={handleResetFilters}
                  >
                    {labels.resetFilters}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
