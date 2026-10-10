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
import { ArrowRight, ListFilter, Clock, MonitorPlay, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from "@/components/ui/badge";
import { Course, FALLBACK_COURSES, getCourseCategory } from "@/lib/courses-data";

const CourseCardSkeleton = () => (
    <Card className="overflow-hidden h-full flex flex-col">
        <CardContent className="p-0 flex flex-col flex-grow">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 bg-card border-t flex flex-col flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex-grow" />
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-8 w-1/4" />
                </div>
            </div>
        </CardContent>
    </Card>
);

interface CourseCatalogProps {
  initialCourses?: Course[];
}

export default function CourseCatalog({ initialCourses }: CourseCatalogProps) {
  const { t } = useTranslation();
  
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

    if (selectedCategories.length > 0) {
      courses = courses.filter(course => selectedCategories.includes(course.category || 'Certificate'));
    }

    courses = courses.filter(course => (course.price || 0) >= priceRange[0] && (course.price || 0) <= priceRange[1]);
    
    setFilteredCourses(courses);
  }, [selectedCategories, priceRange, allCourses]);
  
  const courseCategories = useMemo(() => {
    const categories = [...new Set(allCourses.map(course => course.category || 'Certificate'))];
    return categories.map(category => ({ id: category, label: category }));
  }, [allCourses]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const FilterSidebar = () => (
     <aside className="w-full lg:w-72 lg:flex-shrink-0">
        <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-6">
                <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-primary" />
                    {t('filterTitle')}
                </h3>
                <Accordion type="multiple" defaultValue={['category', 'price']}>
                    <AccordionItem value="category">
                        <AccordionTrigger className="font-semibold text-sm">{t('filterCategory')}</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-3 pt-2">
                                {courseCategories.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={category.id}
                                            checked={selectedCategories.includes(category.id)}
                                            onCheckedChange={() => handleCategoryChange(category.id)}
                                        />
                                        <Label htmlFor={category.id} className="font-normal text-sm cursor-pointer">{category.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="price" className="border-b-0">
                        <AccordionTrigger className="font-semibold text-sm">{t('filterPriceRange')}</AccordionTrigger>
                        <AccordionContent>
                            <div className="mt-4">
                                <Slider
                                    defaultValue={[maxPrice]}
                                    value={[priceRange[1]]}
                                    min={0}
                                    max={maxPrice}
                                    step={500}
                                    onValueChange={(value) => setPriceRange([0, value[0]])}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                                    <span>LKR 0</span>
                                    <span>LKR {priceRange[1].toLocaleString()}</span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    </aside>
  );

  return (
    <section id="courses" className="py-12 md:py-20 bg-secondary/15">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30">
            Professional Pharmacy Programs
          </Badge>
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            {t('courseCatalogTitle')}
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base md:text-lg text-muted-foreground font-body leading-relaxed">
            Gain recognized practical qualifications through interactive online classes, real-life dispensing simulations, and home-delivered study packs.
          </p>
        </div>
        
        <div className="mt-12 flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block">
                <FilterSidebar />
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden mb-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                                <ListFilter className="h-4 w-4 text-primary" />
                                {t('filterTitle')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'All'}
                            </span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-xs">
                        <FilterSidebar />
                    </SheetContent>
                </Sheet>
            </div>
            
            <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)
                  ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => {
                      const imgUrl = course.course_img?.startsWith('http') 
                        ? course.course_img 
                        : `https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`;

                      return (
                        <div key={course.id} className="h-full group">
                          <Card className="overflow-hidden h-full flex flex-col rounded-xl border border-border/70 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-0 flex flex-col flex-grow">
                              <Link href={`/courses/${course.slug}`} className="relative aspect-video w-full overflow-hidden block bg-muted">
                                {course.badge && (
                                  <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground font-semibold text-xs shadow-md">
                                    <Sparkles className="w-3 h-3 mr-1" /> {course.badge}
                                  </Badge>
                                )}
                                <Image
                                  src={imgUrl}
                                  alt={course.course_name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </Link>
                              
                              <div className="p-5 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <Badge variant="secondary" className="font-normal text-[11px]">
                                    {course.category}
                                  </Badge>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-primary" /> {course.course_duration}
                                  </span>
                                </div>

                                <h2 className="font-headline font-bold text-base md:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                  <Link href={`/courses/${course.slug}`}>
                                    {course.course_name}
                                  </Link>
                                </h2>

                                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <MonitorPlay className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Online • Live Zoom + Recordings</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>Printed Study Pack + Certificate</span>
                                  </div>
                                </div>

                                <div className="flex-grow" />

                                <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between">
                                  <div>
                                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">Course Fee</span>
                                    <span className="font-bold text-lg font-body text-foreground">
                                      LKR {(course.price || 0).toLocaleString()}
                                    </span>
                                  </div>
                                  <Button asChild size="sm" className="font-semibold gap-1 text-xs">
                                    <Link href={`/courses/${course.slug}`}>
                                      View Course <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-16 bg-card rounded-xl border border-dashed border-border p-8">
                      <p className="text-lg font-semibold text-foreground">{t('noCoursesFoundTitle')}</p>
                      <p className="text-muted-foreground mt-2">{t('noCoursesFoundSubtitle')}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => {
                          setSelectedCategories([]);
                          setPriceRange([0, maxPrice]);
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}