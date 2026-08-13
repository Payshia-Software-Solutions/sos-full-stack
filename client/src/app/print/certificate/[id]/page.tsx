
"use client";

import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getStudentDetailsByUsername } from '@/lib/actions/users';
import { getBatchByCode, getParentCourseById, getParentCourses } from '@/lib/actions/courses';
import { getCertificatePrintStatusById, getCertificateTemplate } from '@/lib/actions/certificates';
import type { UserFullDetails, ParentCourse, UserCertificatePrintStatus, ApiCourse } from '@/lib/types';
import { CertificateLayout } from '@/components/print/CertificateLayout';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function PrintCertificatePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const certificateId = params.id as string;

    // Optional: course_code can be passed as ?course_code=CS0001
    const courseCodeParam = searchParams.get('course_code');

    // Step 1: Fetch the core certificate data.
    const { data: certData, isLoading: isLoadingCert, isError: isErrorCert } = useQuery<UserCertificatePrintStatus | null>({
        queryKey: ['certificateData', certificateId],
        queryFn: () => getCertificatePrintStatusById(certificateId),
        enabled: !!certificateId,
        retry: false,
    });

    // Step 2: Fetch student details.
    const { data: studentData } = useQuery<UserFullDetails>({
        queryKey: ['studentDetailsForCert', certData?.student_number],
        queryFn: () => getStudentDetailsByUsername(certData!.student_number),
        enabled: !!certData?.student_number,
    });

    // Step 3: Fetch all parent courses for fast in-memory course resolution.
    const { data: parentCourses } = useQuery<ParentCourse[]>({
        queryKey: ['allParentCourses'],
        queryFn: getParentCourses,
        staleTime: 5 * 60 * 1000,
    });

    // Step 4: Fetch batch details if parent_course_id is missing from certData and no param provided.
    const { data: batchData } = useQuery<ApiCourse>({
        queryKey: ['batchDataForCert', certData?.course_code],
        queryFn: () => getBatchByCode(certData!.course_code),
        enabled: !!certData?.course_code && !certData?.parent_course_id && !courseCodeParam,
    });

    const resolvedParentCourseId = certData?.parent_course_id || batchData?.parent_course_id;

    // Step 5: Fallback fetch for individual parent course if not found in list.
    const { data: fetchedCourseData } = useQuery<ParentCourse>({
        queryKey: ['parentCourseDataForCert', resolvedParentCourseId],
        queryFn: () => getParentCourseById(String(resolvedParentCourseId)),
        enabled: !!resolvedParentCourseId && !courseCodeParam,
    });

    // Step 6: Resolve final courseData object.
    const courseData: ParentCourse | undefined = useMemo(() => {
        if (courseCodeParam && parentCourses) {
            const matched = parentCourses.find(c => c.course_code === courseCodeParam);
            if (matched) return matched;
        }
        if (resolvedParentCourseId && parentCourses) {
            const matched = parentCourses.find(c => String(c.id) === String(resolvedParentCourseId));
            if (matched) return matched;
        }
        return fetchedCourseData;
    }, [courseCodeParam, parentCourses, resolvedParentCourseId, fetchedCourseData]);

    // Step 7: Resolve course_code for template lookup.
    const templateCourseCode = courseCodeParam || courseData?.course_code || null;

    // Step 8: Fetch certificate template using the resolved course_code.
    const { data: templateData } = useQuery({
        queryKey: ['certificateTemplateForPrint', templateCourseCode],
        queryFn: () => getCertificateTemplate(templateCourseCode!),
        enabled: !!templateCourseCode,
    });

    useEffect(() => {
        if (!isLoadingCert && certData) {
            document.title = `Certificate - ${certData.student_number}`;
        }
    }, [isLoadingCert, certData]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoadingCert) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-8">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading Certificate Data...</p>
                <div className="w-[210mm] h-[297mm] bg-white shadow-lg mt-8">
                    <Skeleton className="w-full h-full" />
                </div>
            </div>
        );
    }

    if (isErrorCert || !certData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-8">
                <h1 className="text-2xl font-bold text-destructive">Certificate Not Found</h1>
                <p className="text-muted-foreground">The certificate ID might be invalid or there was an error.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-200 print:bg-white">
            <div className="fixed top-4 right-4 z-50 no-print">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Certificate
                </Button>
            </div>
            <main className="flex justify-center items-start min-h-screen p-8 print:p-0">
                <div className="print-container bg-white shadow-lg print:shadow-none">
                    <CertificateLayout
                        studentName={studentData?.name_on_certificate || 'Loading Student...'}
                        studentIndex={certData.student_number}
                        courseName={courseData?.course_name || 'Loading Course...'}
                        issueDate={certData.print_date}
                        certificateId={certData.certificate_id}
                        courseData={courseData}
                        batchCode={certData.course_code}
                        template={templateData?.success ? templateData.template : null}
                    />
                </div>
            </main>
        </div>
    );
}
