
"use client";

import { useSearchParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Book, Award, AlertTriangle, UserCheck, GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Suspense, useEffect, useState } from 'react';
import StarRating from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// --- New Interfaces for the API response ---

interface StudentInfo {
    id: string;
    student_id: string;
    username: string;
    full_name: string;
    name_on_certificate: string;
}

interface Assignment {
    assignment_id: string;
    assignment_name: string;
    grade: string;
}

interface AssignmentGrades {
    assignments: Assignment[];
    average_grade: string;
}

interface Enrollment {
    id:string;
    course_code: string;
    batch_name: string;
    parent_course_name: string;
    assignment_grades: AssignmentGrades;
    certificate_eligibility: boolean;
}

interface ApiResponse {
    title: string;
    studentInfo: StudentInfo;
    studentEnrollments: {
        [key: string]: Enrollment;
    };
}

// --- Component to display the results ---

function ResultsViewComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseCode = searchParams.get('CourseCode');
    const loggedUser = searchParams.get('LoggedUser');
    const { t } = useTranslation();

    const [studentData, setStudentData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!loggedUser) {
            setLoading(false);
            return;
        }

        async function fetchStudentDetails() {
            try {
                setLoading(true);
                const response = await fetch(`https://qa-api.pharmacollege.lk/get-student-full-info?loggedUser=${loggedUser}`);
                if (!response.ok) {
                    // This will trigger notFound() if the user itself doesn't exist
                    throw new Error('Student not found');
                }
                const data: ApiResponse = await response.json();
                setStudentData(data);
            } catch (error) {
                console.error("Error fetching student details:", error);
                setStudentData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchStudentDetails();
    }, [loggedUser]);
    
    if (loading) {
        return (
            <main className="bg-muted/40 py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <div className="text-center mb-8">
                         <div className="flex justify-center items-center gap-4 mb-4 text-primary">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-lg font-semibold">Loading Results...</p>
                        </div>
                        <Skeleton className="h-16 w-48 mx-auto" />
                    </div>
                    
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    if (!studentData) {
        // This will show a 404 if the student doesn't exist at all
        return notFound();
    }
    
    const enrollment = courseCode ? studentData.studentEnrollments[courseCode] : null;

    if (!enrollment) {
        // If the student exists but is not enrolled in the specified course code
        return (
             <main className="bg-muted/40 py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <Card className="text-center">
                        <CardHeader>
                             <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                                <AlertTriangle className="h-10 w-10 text-destructive" />
                            </div>
                            <CardTitle className="font-headline text-2xl md:text-3xl font-bold text-destructive mt-4">
                                Enrollment Not Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-muted-foreground">
                                Student <span className="font-bold text-foreground">{studentData.studentInfo.name_on_certificate}</span> (ID: {loggedUser}) exists, but is not enrolled in course code <span className="font-bold text-foreground">{courseCode}</span>.
                           </p>
                            <Button onClick={() => router.push(`/transcript?LoggedUser=${loggedUser}`)}>View Student Transcript</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    if (!enrollment.certificate_eligibility) {
        return (
            <main className="bg-muted/40 py-12 md:py-16">
               <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                   <Card className="text-center">
                       <CardHeader>
                            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                               <AlertTriangle className="h-10 w-10 text-destructive" />
                           </div>
                           <CardTitle className="font-headline text-2xl md:text-3xl font-bold text-destructive mt-4">
                               Not Eligible for Certificate
                           </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                          <p className="text-muted-foreground">
                               Student <span className="font-bold text-foreground">{studentData.studentInfo.name_on_certificate}</span> is not eligible to receive the certificate for this course at this time.
                          </p>
                       </CardContent>
                   </Card>
               </div>
           </main>
       )
    }

    const averageGrade = parseFloat(enrollment.assignment_grades.average_grade);
    
    const getFinalGrade = () => {
        if (isNaN(averageGrade)) return "Result Not Submitted";
        if (averageGrade >= 90) return "A+";
        if (averageGrade >= 80) return "A";
        if (averageGrade >= 75) return "A-";
        if (averageGrade >= 70) return "B+";
        if (averageGrade >= 65) return "B";
        if (averageGrade >= 60) return "B-";
        if (averageGrade >= 55) return "C+";
        if (averageGrade >= 45) return "C";
        if (averageGrade >= 40) return "C-";
        if (averageGrade >= 35) return "D+";
        if (averageGrade >= 30) return "D";
        return "E";
    };

    const getRating = () => {
        if (!enrollment.certificate_eligibility || isNaN(averageGrade)) return 0;
        if (averageGrade >= 75) return 5;
        if (averageGrade >= 65) return 4;
        if (averageGrade >= 55) return 3;
        if (averageGrade >= 45) return 2;
        if (averageGrade >= 35) return 1;
        return 0;
    };
    
    const finalGrade = getFinalGrade();
    const rating = getRating();

    return (
        <main className="bg-muted/40 py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                 <div className="mb-4">
                    <Button asChild variant="outline">
                        <Link href="/#verify">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Verifier
                        </Link>
                    </Button>
                </div>
                <div className="text-center mb-8">
                    <Image
                        src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                        alt="Ceylon Pharma College Logo"
                        width={200}
                        height={62}
                        className="h-auto w-48 mx-auto dark:hidden"
                    />
                    <Image
                        src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                        alt="Ceylon Pharma College Logo"
                        width={200}
                        height={62}
                        className="h-auto w-48 mx-auto hidden dark:block dark:brightness-0 dark:invert"
                    />
                     {enrollment.certificate_eligibility && (
                        <>
                            <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary mt-6">{t('certResultTitle')}</h1>
                            <p className="text-muted-foreground">{t('certResultSubtitle')}</p>
                        </>
                    )}
                </div>
                
                <Card>
                    <CardContent className="p-6 space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('certStudentName')}</span>
                            <span className="font-semibold">{studentData.studentInfo.name_on_certificate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('certIndexNo')}</span>
                            <span className="font-semibold">{studentData.studentInfo.username}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('certCourseName')}</span>
                            <span className="font-semibold text-right">{enrollment.parent_course_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('certCourseCode')}</span>
                            <span className="font-semibold">{enrollment.course_code}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('certFinalGrade')}</span>
                            <span className="font-semibold">{finalGrade}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('certRating')}</span>
                            {rating > 0 ? (
                                <StarRating rating={rating} />
                            ) : (
                                <span className="font-semibold">{t('certNoGrade')}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}

export default function ResultsViewPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ResultsViewComponent />
        </Suspense>
    )
}

    