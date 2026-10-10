"use client";

import { LMS_API_URL } from "@/lib/config";
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, Clock, MonitorPlay, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Skeleton } from './ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course, FALLBACK_COURSES, getCourseCategory } from "@/lib/courses-data";

const CourseCardSkeleton = () => (
    <div className="p-1 h-full">
        <Card className="overflow-hidden h-full flex flex-col">
            <CardContent className="p-0 flex flex-col flex-grow">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 bg-card border-t flex flex-col flex-grow">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex-grow" />
                    <div className="flex justify-between items-center mt-4">
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

interface CourseSliderProps {
  initialCourses?: Course[];
}

export default function CourseSlider({ initialCourses }: CourseSliderProps) {
  const { t } = useTranslation();
  
  const baseCourses = useMemo(() => {
    return (initialCourses && initialCourses.length > 0) ? initialCourses : FALLBACK_COURSES;
  }, [initialCourses]);

  const [courses, setCourses] = useState<Course[]>(baseCourses);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(`${LMS_API_URL}/parent-main-course`);
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const visibleCourses = data
            .filter((course: any) => String(course.display) !== '0' && course.display !== 0)
            .map((c: any) => ({
              ...c,
              price: parseFloat(String(c.course_fee)) || 0,
              category: getCourseCategory(c.course_name),
              mode: "Online • Live Zoom + Recordings",
            }));
          setCourses(visibleCourses);
        }
      } catch (error) {
        console.warn("Using SSR fallback for course slider:", error);
      }
    }
    fetchCourses();
  }, []);

  return (
    <section id="courses" className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30">
            Featured Programs
          </Badge>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            {t('courseSliderTitle')}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-3 rounded-full" />
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Choose from Sri Lanka's leading practical pharmacy courses designed for career success.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: courses.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem key={index} className="pl-2 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <CourseCardSkeleton />
                </CarouselItem>
              ))
            ) : (
              courses.map((course) => {
                const imgUrl = course.course_img?.startsWith('http') 
                  ? course.course_img 
                  : `https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`;
                
                const feeNumber = typeof course.course_fee === 'number' 
                  ? course.course_fee 
                  : (parseFloat(String(course.course_fee)) || 0);

                return (
                  <CarouselItem key={course.id} className="pl-2 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1 h-full">
                      <Card className="overflow-hidden h-full flex flex-col rounded-xl border border-border/80 bg-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
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
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>

                          <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary" /> {course.course_duration}
                              </span>
                              <span>•</span>
                              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                Live Zoom + Recorded
                              </span>
                            </div>

                            <h3 className="font-headline font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                              <Link href={`/courses/${course.slug}`}>
                                {course.course_name}
                              </Link>
                            </h3>

                            <div className="flex-grow" />

                            <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">Fee</span>
                                <span className="font-bold text-base font-body text-foreground">
                                  LKR {feeNumber.toLocaleString()}
                                </span>
                              </div>
                              <Button asChild size="sm" className="font-semibold gap-1 text-xs">
                                <Link href={`/courses/${course.slug}`}>
                                  Details <ArrowRight className="w-3 h-3" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-background shadow-md border-border" />
          <CarouselNext className="hidden sm:flex -right-4 bg-background shadow-md border-border" />
        </Carousel>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link href="/courses">
              View All Programs <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
