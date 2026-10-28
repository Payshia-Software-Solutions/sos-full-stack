
"use client";

import { useSearchParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Suspense, useEffect, useState } from 'react';
import GradePaymentGate from '@/components/GradePaymentGate';
import { LMS_API_URL } from "@/lib/config";

// Placeholder types, should be defined based on actual API response
interface Result {
  module: string;
  attempt: number;
  grade: string;
}
interface StudentDetails {
    studentName: string;
    studentId: string;
    avatar: string;
    courseName: string;
    batchCode: string;
    overallGrade: string;
    issueDate: string;
    results: Result[];
    studentBalance?: number;
    is_grade_locked?: boolean;
}

function TranscriptComponent() {
    const searchParams = useSearchParams();
    const courseCode = searchParams.get('CourseCode');
    const loggedUser = searchParams.get('LoggedUser');
    const { t } = useTranslation();

    const [studentData, setStudentData] = useState<StudentDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!loggedUser) {
            setLoading(false);
            return;
        }

        async function fetchTranscript() {
            try {
                setLoading(true);
                const response = await fetch(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(loggedUser || '')}`);
                if (!response.ok) {
                    throw new Error('Student not found');
                }
                const data = await response.json();
                const enrollments = data.studentEnrollments || {};
                const enrollment = (courseCode ? enrollments[courseCode] : Object.values(enrollments)[0]) as any;

                if (enrollment) {
                    const rawAssignments = enrollment.assignment_grades?.assignments || [];
                    const mappedResults: Result[] = rawAssignments.map((a: any, idx: number) => ({
                        module: a.assignment_name || `Module ${idx + 1}`,
                        attempt: 1,
                        grade: a.grade || 'Pending',
                    }));

                    const avgGrade = enrollment.assignment_grades?.average_grade;
                    let letterGrade = 'Pending';
                    const numAvg = parseFloat(avgGrade);
                    if (!isNaN(numAvg)) {
                        if (numAvg >= 75) letterGrade = 'Distinction';
                        else if (numAvg >= 65) letterGrade = 'Merit';
                        else if (numAvg >= 50) letterGrade = 'Pass';
                        else letterGrade = 'Referred';
                    }

                    setStudentData({
                        studentName: data.studentInfo?.name_on_certificate || data.studentInfo?.full_name || loggedUser || '',
                        studentId: loggedUser || '',
                        avatar: "https://placehold.co/100x100.png",
                        courseName: enrollment.parent_course_name || enrollment.batch_name || "Pharmacy Course",
                        batchCode: enrollment.batch_name || enrollment.course_code || courseCode || '',
                        overallGrade: letterGrade,
                        issueDate: new Date().toLocaleDateString(),
                        results: mappedResults.length > 0 ? mappedResults : [
                            { module: "Course Core Competencies", attempt: 1, grade: letterGrade }
                        ],
                        studentBalance: enrollment.studentBalance,
                        is_grade_locked: enrollment.is_grade_locked,
                    });
                } else {
                    setStudentData(null);
                }
            } catch (error) {
                console.error("Error fetching live student transcript:", error);
                setStudentData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchTranscript();
    }, [loggedUser, courseCode]);

    if (loading) {
        return (
            <div className="container mx-auto text-center py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Loading official academic transcript...</p>
            </div>
        );
    }
    
    if (!studentData) {
        return notFound();
    }
    
    const overallStatus = studentData.overallGrade === 'Distinction' || studentData.overallGrade === 'Merit' || studentData.overallGrade === 'Pass';

    return (
        <main className="bg-muted/40 py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <Card className="overflow-hidden shadow-lg">
                    <CardHeader className="bg-card p-6 border-b print:hidden">
                         <div className="flex justify-between items-start">
                            <div>
                                <Image
                                    src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                                    alt="Ceylon Pharma College Logo"
                                    width={180}
                                    height={56}
                                    className="h-auto w-40 dark:hidden"
                                />
                                <Image
                                    src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
                                    alt="Ceylon Pharma College Logo"
                                    width={180}
                                    height={56}
                                    className="h-auto w-40 hidden dark:block dark:brightness-0 dark:invert"
                                />
                                <CardTitle className="font-headline text-2xl mt-4">{t('resultsTitle')}</CardTitle>
                                <CardDescription>{t('resultsSubtitle')}</CardDescription>
                            </div>
                            <Avatar className="h-24 w-24 border-4 border-secondary">
                                <AvatarImage src={studentData.avatar} alt={studentData.studentName} data-ai-hint="student portrait" />
                                <AvatarFallback>{studentData.studentName.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">{t('resultsStudentName')}</p>
                                <p className="font-semibold text-lg">{studentData.studentName}</p>
                            </div>
                             <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">{t('resultsStudentId')}</p>
                                <p className="font-semibold text-lg">{studentData.studentId}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">{t('resultsCourseName')}</p>
                                <p className="font-semibold text-lg">{studentData.courseName}</p>
                            </div>
                             <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">{t('resultsBatchCode')}</p>
                                <p className="font-semibold text-lg">{studentData.batchCode}</p>
                            </div>
                        </div>
                        
                        <div className="border-t pt-6">
                            <GradePaymentGate
                                isLocked={studentData.is_grade_locked}
                                balance={studentData.studentBalance}
                                title="Transcript Grades Withheld - Payment Pending"
                            >
                                <h3 className="font-headline font-bold text-xl mb-4">{t('resultsSummaryTitle')}</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('resultsModule')}</TableHead>
                                            <TableHead className="text-center">{t('resultsAttempt')}</TableHead>
                                            <TableHead className="text-right">{t('resultsGrade')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentData.results.map((result, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{result.module}</TableCell>
                                                <TableCell className="text-center">{result.attempt}</TableCell>
                                                <TableCell className="text-right font-semibold">{result.grade}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="flex justify-end items-center gap-4 pt-4">
                                    <p className="font-body text-muted-foreground">{t('resultsOverallGrade')}</p>
                                    <Badge className={`text-lg px-4 py-1 ${overallStatus ? 'bg-green-600' : 'bg-red-600'}`}>
                                        {studentData.overallGrade}
                                    </Badge>
                                </div>
                            </GradePaymentGate>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-card p-6 flex justify-between items-center print:hidden">
                        <div>
                            <p className="text-xs text-muted-foreground">{t('resultsIssueDate')}</p>
                            <p className="text-sm font-medium">{studentData.issueDate}</p>
                        </div>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer />
                                {t('resultsPrint')}
                            </Button>
                            <Button variant="outline" size="sm">
                                <FileDown />
                               {t('resultsDownload')}
                            </Button>
                         </div>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}

export default function TranscriptPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <TranscriptComponent />
        </Suspense>
    )
}

    