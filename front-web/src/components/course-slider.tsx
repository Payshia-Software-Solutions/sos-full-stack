
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, Clock, BookOpen, ClipboardList } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Skeleton } from './ui/skeleton';
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  course_fee: string;
  course_img: string;
  slug: string;
  course_duration: string;
  skill_level: string;
  assessments: string;
  display: string;
}

const CourseCardSkeleton = () => (
    <div className="p-1 h-full">
        <Card className="overflow-hidden h-full flex flex-col">
            <CardContent className="p-0 flex flex-col flex-grow">
                <Skeleton className="aspect-square w-full" />
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

export default function CourseSlider() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('https://qa-api.pharmacollege.lk/parent-main-course');
        const data = await response.json();
        const visibleCourses = data.filter((course: Course) => course.display !== '0');
        setCourses(visibleCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <section id="courses" className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
            {t('courseSliderTitle')}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-2" />
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: courses.length > 4,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="pl-2 basis-3/4 md:basis-[43.5%] lg:basis-[30.3%] xl:basis-[23.25%]">
                  <CourseCardSkeleton />
                </CarouselItem>
              ))
            ) : (
              courses.map((course) => (
                <CarouselItem key={course.id} className="pl-2 basis-3/4 md:basis-[43.5%] lg:basis-[30.3%] xl:basis-[23.25%]">
                  <Link href={`/courses/${course.slug}`} className="block h-full group">
                    <div className="p-1 h-full">
                      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                        <CardContent className="p-0 flex flex-col flex-grow">
                          <div className="relative aspect-square">
                             {(course.id === "1" || course.id === "2") && (
                                <Badge className="absolute top-3 right-3 z-10 bg-blue-600 text-white border-blue-600 text-sm py-1 px-3">Trending</Badge>
                             )}
                            <Image
                              src={`https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`}
                              alt={course.course_name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              data-ai-hint="pharmacist student"
                            />
                          </div>
                          <div className="p-4 bg-card border-t flex flex-col flex-grow">
                            <h3 className="font-headline font-bold text-base h-12 leading-tight">{course.course_name}</h3>
                             <div className="mt-4 flex items-start justify-around text-center">
                                <div className="flex flex-col items-center gap-1.5 w-1/2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span className="text-xs text-muted-foreground">{course.course_duration}</span>
                                </div>
                                 <div className="flex flex-col items-center gap-1.5 w-1/2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <span className="text-xs text-muted-foreground">{course.skill_level}</span>
                                </div>
                            </div>
                            <div className="flex-grow" />
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                              <p className="font-bold text-lg font-body text-primary">LKR {parseFloat(course.course_fee).toLocaleString()}</p>
                              <ArrowRight className="h-5 w-5 text-primary opacity-0 transform -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
