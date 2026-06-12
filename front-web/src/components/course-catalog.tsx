
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/context/language-context";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ListFilter } from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Skeleton } from './ui/skeleton';

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  course_fee: string;
  course_img: string;
  slug: string;
  category: string;
}

const CourseCardSkeleton = () => (
    <div className="h-full">
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

const getCourseCategory = (courseName: string): string => {
    const name = courseName.toLowerCase();
    if (name.includes('diploma')) return 'Diploma';
    if (name.includes('advanced')) return 'Advanced';
    if (name.includes('certificate')) return 'Certificate';
    if (name.includes('b.pharm')) return 'Degree';
    if (name.includes('workshop')) return 'Workshop';
    if (name.includes('professional')) return 'Professional';
    return 'Other';
};


export default function CourseCatalog() {
  const { t } = useTranslation();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await fetch('https://qa-api.pharmacollege.lk/parent-main-course');
        let data = await response.json();
        const coursesWithCategory: Course[] = data.map((course: any) => ({
            ...course,
            price: parseFloat(course.course_fee),
            category: getCourseCategory(course.course_name)
        }));
        setAllCourses(coursesWithCategory);
        const maxCoursePrice = Math.max(...coursesWithCategory.map(c => c.price));
        setMaxPrice(maxCoursePrice);
        setPriceRange([0, maxCoursePrice]);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    let courses = allCourses;

    if (selectedCategories.length > 0) {
      courses = courses.filter(course => selectedCategories.includes(course.category));
    }

    courses = courses.filter(course => course.price >= priceRange[0] && course.price <= priceRange[1]);
    
    setFilteredCourses(courses);
  }, [selectedCategories, priceRange, allCourses]);
  
  const courseCategories = useMemo(() => {
    if (loading) return [];
    const categories = [...new Set(allCourses.map(course => course.category))];
    return categories.map(category => ({ id: category, label: category }));
  }, [allCourses, loading]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const FilterSidebar = () => (
     <aside className="w-full lg:w-72 lg:flex-shrink-0">
        <Card>
            <CardContent className="p-6">
                <h3 className="font-headline text-xl font-bold mb-4">{t('filterTitle')}</h3>
                <Accordion type="multiple" defaultValue={['category', 'price']}>
                    <AccordionItem value="category">
                        <AccordionTrigger className="font-semibold">{t('filterCategory')}</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-3">
                                {courseCategories.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={category.id}
                                            checked={selectedCategories.includes(category.id)}
                                            onCheckedChange={() => handleCategoryChange(category.id)}
                                        />
                                        <Label htmlFor={category.id} className="font-normal cursor-pointer">{category.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="price" className="border-b-0">
                        <AccordionTrigger className="font-semibold">{t('filterPriceRange')}</AccordionTrigger>
                        <AccordionContent>
                            <div className="mt-4">
                                <Slider
                                    defaultValue={[maxPrice]}
                                    min={0}
                                    max={maxPrice}
                                    step={500}
                                    onValueCommit={(value) => setPriceRange([0, value[0]])}
                                />
                                <div className="flex justify-between text-sm text-muted-foreground mt-2">
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
    <section id="courses" className="py-16 md:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">{t('courseCatalogTitle')}</h1>
           <div className="w-24 h-1 bg-primary mx-auto mt-4" />
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground font-body">
            {t('courseCatalogSubtitle')}
          </p>
        </div>
        
        <div className="mt-12 flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="hidden lg:block">
                <FilterSidebar />
            </div>

             {/* Mobile Filters */}
            <div className="lg:hidden mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <ListFilter className="mr-2 h-4 w-4" />
                            {t('filterTitle')}
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
                    filteredCourses.map((course) => (
                      <Link href={`/courses/${course.slug}`} key={course.id} className="block h-full group">
                        <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                          <CardContent className="p-0 flex flex-col flex-grow">
                            <div className="relative aspect-video">
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
                              <div className="flex-grow" />
                              <div className="flex justify-between items-center mt-4">
                                <p className="font-bold text-lg font-body text-primary">LKR {course.price.toLocaleString()}</p>
                                <ArrowRight className="h-5 w-5 text-primary opacity-0 transform -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <p className="text-lg font-semibold text-foreground">{t('noCoursesFoundTitle')}</p>
                      <p className="text-muted-foreground mt-2">{t('noCoursesFoundSubtitle')}</p>
                    </div>
                  )}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

    