
"use client";

import { notFound } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Laptop,
  Library,
  Target,
  UserCheck,
  FileText,
  Video,
  Book,
  FileQuestion,
  Loader2,
} from "lucide-react";

import { useTranslation } from "@/context/language-context";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { translate } from "@/ai/flows/translate-flow";


interface Course {
  id: string;
  course_name: string;
  course_code: string;
  course_fee: string;
  course_img: string;
  slug: string;
  course_description: string;
  course_duration: string;
  skill_level: string;
  assessments: string;
  quizzes: string;
}

const certificationRequirements = [
    "certReq1",
    "certReq2",
    "certReq3",
    "certReq4",
];


export default function CoursePage({ params }: { params: { slug: string } }) {
  const { t, language } = useTranslation();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [translatedDescription, setTranslatedDescription] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        const response = await fetch('https://qa-api.pharmacollege.lk/parent-main-course');
        const courses: Course[] = await response.json();
        const currentCourse = courses.find(c => c.slug === params.slug);
        if (currentCourse) {
          setCourse(currentCourse);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchCourseData();
  }, [params.slug]);
  
  const cleanDescription = useMemo(() => {
    if (!course) return '';
    // This will be used for English version and for sending to translation
    return course.course_description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  }, [course]);

  const originalHtmlDescription = useMemo(() => {
    if (!course) return '';
    return course.course_description.replace(/style="[^"]*"/g, '');
  }, [course]);
  

  useEffect(() => {
    if (!course || !cleanDescription) return;

    if (language === 'en') {
        // For English, we want to show the original HTML formatting
        setTranslatedDescription(originalHtmlDescription);
        return;
    }

    const translateDescription = async () => {
        setIsTranslating(true);
        try {
            const targetLanguage = language === 'si' ? 'Sinhala' : 'Tamil';
            const translation = await translate({ text: cleanDescription, targetLanguage });
            // Wrap paragraphs for consistent display
            const formattedTranslation = translation.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
            setTranslatedDescription(formattedTranslation);
        } catch (error) {
            console.error("Translation failed:", error);
            setTranslatedDescription(originalHtmlDescription); // Fallback to English on error
        } finally {
            setIsTranslating(false);
        }
    };
    translateDescription();
  }, [language, course, cleanDescription, originalHtmlDescription]);


  if (loading) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-16">
            <Skeleton className="h-12 w-1/3 mb-4" />
            <Skeleton className="h-8 w-2/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (!course) {
    notFound();
  }
  
  const NumberedCircle = ({ number }: { number: number }) => (
    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="font-bold text-primary text-sm">{number}</span>
    </div>
  );


  return (
    <div>
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center gap-2 text-sm font-body mb-4">
                <Link href="/" className="hover:underline">{t('home')}</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/courses" className="hover:underline">{t('courses')}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="opacity-80">{course.course_name}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold">{course.course_name}</h1>
            <p className="mt-2 text-lg text-primary-foreground/90 max-w-3xl">{t('coursePageSubtitle')}</p>
             <div className="mt-6 flex gap-4">
                <Button asChild size="lg" variant="secondary" className="font-bold">
                    <a href="https://sos.pharmacollege.lk/register" target="_blank" rel="noopener noreferrer">{t('enrollNow')}</a>
                </Button>
            </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
                <main className="lg:col-span-2 space-y-16">
                    {/* Overview Section */}
                    <div>
                        <h2 className="text-3xl font-headline font-bold text-foreground">{course.course_name}</h2>
                        <div className="w-20 h-1 bg-primary mt-2 mb-4" />
                        {isTranslating ? (
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        ) : (
                            <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-body" dangerouslySetInnerHTML={{ __html: translatedDescription }} />
                        )}
                    </div>
                    
                </main>

                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card>
                            <CardHeader className="p-0 overflow-hidden">
                                <div className="relative aspect-video">
                                     <Image 
                                        src={`https://content-provider.pharmacollege.lk/courses/${course.course_code}/${course.course_img}`}
                                        alt={course.course_name}
                                        fill 
                                        className="object-cover" 
                                        data-ai-hint="student pharmacist" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-3xl font-headline font-bold text-primary">LKR {parseFloat(course.course_fee).toLocaleString()}</p>
                                    <Badge variant="secondary">{t('limitedSeats')}</Badge>
                                </div>
                                <div className="space-y-4 text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <span><span className="font-semibold text-foreground">{t('duration')}:</span> {course.course_duration} Months</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                        <span><span className="font-semibold text-foreground">{t('level')}:</span> {course.skill_level}</span>
                                    </div>
                                </div>
                                
                                <Button asChild className="w-full mt-6 font-bold text-lg" size="lg">
                                  <a href="https://sos.pharmacollege.lk/register" target="_blank" rel="noopener noreferrer">{t('enrollNow')}</a>
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-2">{t('enrollNowSubtext')}</p>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
            </div>
        </div>
      </section>
      
      {/* How to Enroll */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-headline font-bold">{t('howToEnroll')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
                <div className="text-center">
                    <div className="p-4 bg-primary-foreground/10 rounded-full inline-block mb-3">
                        <FileText className="w-8 h-8"/>
                    </div>
                    <h3 className="font-headline font-semibold text-xl">{t('enrollStep1Title')}</h3>
                    <p className="text-sm text-primary-foreground/80 mt-1">{t('enrollStep1Desc')}</p>
                </div>
                <div className="text-center">
                     <div className="p-4 bg-primary-foreground/10 rounded-full inline-block mb-3">
                        <ClipboardCheck className="w-8 h-8"/>
                    </div>
                    <h3 className="font-headline font-semibold text-xl">{t('enrollStep2Title')}</h3>
                    <p className="text-sm text-primary-foreground/80 mt-1">{t('enrollStep2Desc')}</p>
                </div>
                <div className="text-center">
                     <div className="p-4 bg-primary-foreground/10 rounded-full inline-block mb-3">
                        <UserCheck className="w-8 h-8"/>
                    </div>
                    <h3 className="font-headline font-semibold text-xl">{t('enrollStep3Title')}</h3>
                    <p className="text-sm text-primary-foreground/80 mt-1">{t('enrollStep3Desc')}</p>
                </div>
            </div>
            <p className="mt-12 font-headline text-lg">{t('startYourCareer')}</p>
            <Button asChild size="lg" variant="secondary" className="mt-4 font-bold">
              <a href="https://sos.pharmacollege.lk/register" target="_blank" rel="noopener noreferrer">{t('applyNow')}</a>
            </Button>
        </div>
      </section>
    </div>
  );
}
