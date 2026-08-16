
"use client";

import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getStudentDetailsByUsername, getStudentEnrollments } from '@/lib/actions/users';
import { getBatchByCode, getParentCourseById, getParentCourses } from '@/lib/actions/courses';
import { getCertificatePrintStatusById, getCertificateTemplate } from '@/lib/actions/certificates';
import type { UserFullDetails, ParentCourse, UserCertificatePrintStatus, ApiCourse, StudentEnrollmentInfo } from '@/lib/types';
import { CertificateLayout } from '@/components/print/CertificateLayout';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


import { getTranscriptTemplate } from '@/lib/actions/transcripts';

const DEFAULT_TRANSCRIPT_ELEMENTS = [
    { id: '1', type: 'title', content: 'ACADEMIC TRANSCRIPT', x: 50, y: 7, fontSize: 22, fontWeight: 'bold', color: '#000000', align: 'center', fontFamily: 'Inter' },
    { id: '2', type: 'course_name', content: '{{COURSE_NAME}}', x: 50, y: 12, fontSize: 16, fontWeight: 'bold', color: '#000000', align: 'center', fontFamily: 'Inter' },
    { id: 'd1', type: 'divider', content: '', x: 50, y: 16, width: 90, strokeWidth: 1, color: '#000000', fontSize: 12, fontWeight: 'normal', align: 'center' },
    { id: '3', type: 'paragraph', content: 'This is to certify that {{STUDENT_NAME}} has successfully completed the Certificate Course in Pharmaceuticals conducted by Ceylon Pharma College.', x: 50, y: 22, fontSize: 12, fontWeight: 'normal', color: '#1E293B', align: 'center', width: 90, fontFamily: 'Inter' },
    { id: '4', type: 'sentence', content: '{{MODULE_LIST}}', x: 50, y: 40, fontSize: 11, fontWeight: 'normal', color: '#0F172A', align: 'left', width: 90, fontFamily: 'Inter' },
    { id: '5', type: 'info_block', content: 'Candidate Name: {{STUDENT_NAME}}\nDuration: {{DURATION}}\nCompleted Date: {{COMPLETED_DATE}}\nStudent Number: {{STUDENT_ID}}\nCertificate Number: {{CERTIFICATE_ID}}', x: 24, y: 66, fontSize: 11, fontWeight: 'normal', color: '#000000', align: 'left', fontFamily: 'Inter' },
    { id: '6', type: 'sentence', content: 'Grade: {{GRADE}}', x: 14, y: 80, fontSize: 20, fontWeight: 'bold', color: '#000000', align: 'left', fontFamily: 'Inter' },
    { id: '7', type: 'image', content: 'https://content-provider.pharmacollege.lk/certificates/sample-signature.png', x: 80, y: 66, fontSize: 16, fontWeight: 'normal', color: '#000000', align: 'center', width: 22 },
    { id: '8', type: 'company_br', content: 'Dilip Fonseka,\nCourse Director', x: 80, y: 74, fontSize: 11, fontWeight: 'bold', color: '#000000', align: 'center', fontFamily: 'Inter' },
    { id: '9', type: 'qr_code', content: '{{QR_CODE}}', x: 85, y: 84, fontSize: 14, fontWeight: 'normal', color: '#000000', align: 'right', fontFamily: 'Inter' },
    { id: 'd2', type: 'divider', content: '', x: 50, y: 89, width: 90, strokeWidth: 1, color: '#000000', fontSize: 12, fontWeight: 'normal', align: 'center' },
    { id: 'gs1', type: 'grading_scale', content: 'Grading Scale', x: 24, y: 94, fontSize: 10, fontWeight: 'normal', color: '#000000', align: 'left', width: 45, fontFamily: 'Inter' },
    { id: '10', type: 'sentence', content: 'TRNS/253555/260815/CPCC29/CREF4623', x: 74, y: 97, fontSize: 8, fontWeight: 'normal', color: '#64748B', align: 'right', fontFamily: 'Inter' },
];

const DEFAULT_CERTIFICATE_ELEMENTS = [
    { id: '1', type: 'title', content: 'CERTIFICATE OF COMPLETION', x: 50, y: 18, fontSize: 24, fontWeight: 'bold', color: '#0F172A', align: 'center', fontFamily: 'Inter' },
    { id: '2', type: 'paragraph', content: 'This is to certify that', x: 50, y: 26, fontSize: 14, fontWeight: 'normal', color: '#475569', align: 'center', fontFamily: 'Inter' },
    { id: '3', type: 'student_name', content: '{{STUDENT_NAME}}', x: 50, y: 38, fontSize: 32, fontWeight: 'bold', color: '#1E293B', align: 'center', fontFamily: 'Inter' },
    { id: '4', type: 'sentence', content: 'has successfully completed the prescribed course of study in', x: 50, y: 48, fontSize: 13, fontWeight: 'normal', color: '#475569', align: 'center', fontFamily: 'Inter' },
    { id: '5', type: 'course_name', content: '{{COURSE_NAME}}', x: 50, y: 56, fontSize: 20, fontWeight: 'semibold', color: '#0F172A', align: 'center', fontFamily: 'Inter' },
    { id: '6', type: 'info_block', content: 'Certificate ID: {{CERTIFICATE_ID}}\nIssued Date: {{ISSUED_DATE}}\nStudent Number: {{STUDENT_ID}}', x: 22, y: 84, fontSize: 11, fontWeight: 'normal', color: '#64748B', align: 'left', fontFamily: 'Inter' },
    { id: '7', type: 'company_br', content: 'Ceylon Pharma College (Pvt) Ltd', x: 82, y: 84, fontSize: 11, fontWeight: 'semibold', color: '#64748B', align: 'right', fontFamily: 'Inter' },
    { id: '8', type: 'qr_code', content: '{{QR_CODE}}', x: 8, y: 82, fontSize: 14, fontWeight: 'normal', color: '#000000', align: 'left', fontFamily: 'Inter' },
];

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

    const docTypeParam = searchParams.get('doc_type') || 'Certificate';

    // Step 2: Fallback certData resolution so print preview always renders smoothly
    const effectiveCertData: UserCertificatePrintStatus = useMemo(() => {
        if (certData) return certData;
        return {
            id: certificateId || '1',
            certificate_id: certificateId || 'CREF4623',
            student_number: searchParams.get('student_number') || 'PA30129',
            course_code: courseCodeParam || 'CS0005',
            print_date: new Date().toISOString().split('T')[0],
            print_status: '1',
            print_by: 'Admin',
            type: docTypeParam,
            parent_course_id: ''
        };
    }, [certData, certificateId, courseCodeParam, searchParams, docTypeParam]);

    // Step 3: Fetch student details.
    const { data: studentData } = useQuery<UserFullDetails>({
        queryKey: ['studentDetailsForCert', effectiveCertData.student_number],
        queryFn: () => getStudentDetailsByUsername(effectiveCertData.student_number),
        enabled: !!effectiveCertData.student_number,
    });

    // Step 3.5: Fetch student course enrollments to resolve exact batch code (e.g. CPCC31)
    const { data: studentEnrollments } = useQuery<StudentEnrollmentInfo[]>({
        queryKey: ['studentEnrollmentsForCert', effectiveCertData.student_number],
        queryFn: () => getStudentEnrollments(effectiveCertData.student_number),
        enabled: !!effectiveCertData.student_number,
    });

    // Step 4: Fetch all parent courses for fast in-memory course resolution.
    const { data: parentCourses } = useQuery<ParentCourse[]>({
        queryKey: ['allParentCourses'],
        queryFn: getParentCourses,
        staleTime: 5 * 60 * 1000,
    });

    // Step 5: Fetch batch details when course_code is a batch code (e.g. CPCC31) to resolve parent course
    const { data: batchData } = useQuery<ApiCourse>({
        queryKey: ['batchDataForCert', effectiveCertData.course_code],
        queryFn: async () => {
            try {
                return await getBatchByCode(effectiveCertData.course_code);
            } catch (e) {
                return null as any;
            }
        },
        enabled: !!effectiveCertData.course_code,
    });

    const resolvedParentCourseId = (certData && certData.parent_course_id) ? certData.parent_course_id : batchData?.parent_course_id;

    // Step 6: Fallback fetch for individual parent course if not found in list.
    const { data: fetchedCourseData } = useQuery<ParentCourse>({
        queryKey: ['parentCourseDataForCert', resolvedParentCourseId],
        queryFn: () => getParentCourseById(String(resolvedParentCourseId)),
        enabled: !!resolvedParentCourseId,
    });

    // Step 7: Resolve final parent courseData object.
    const courseData: ParentCourse | undefined = useMemo(() => {
        const codeToMatch = courseCodeParam || effectiveCertData.course_code;
        // 1. Try matching parent course directly with courseCodeParam or effectiveCertData.course_code (e.g. CS0005)
        if (parentCourses && codeToMatch) {
            const matchedDirect = parentCourses.find(c => c.course_code === codeToMatch || String(c.id) === String(codeToMatch));
            if (matchedDirect) return matchedDirect;
        }
        // 2. Try matching using parent_course_id from batchData (e.g. batch CPCC29 -> parent_course_id = 1 -> CS0005)
        if (resolvedParentCourseId && parentCourses) {
            const matchedParent = parentCourses.find(c => String(c.id) === String(resolvedParentCourseId) || c.course_code === String(resolvedParentCourseId));
            if (matchedParent) return matchedParent;
        }
        // 3. Fallback to fetchedCourseData or first parentCourse in list
        return fetchedCourseData || (parentCourses && parentCourses.length > 0 ? parentCourses[0] : undefined);
    }, [parentCourses, courseCodeParam, effectiveCertData.course_code, resolvedParentCourseId, fetchedCourseData]);

    // Step 8: Resolve parent course_code (e.g. CS0005) for template lookup.
    const templateCourseCode = courseData?.course_code || courseCodeParam || effectiveCertData.course_code || null;

    // Step 8.5: Resolve exact student batch code (e.g. CPCC31) for QR Code URL
    const effectiveBatchCode = useMemo(() => {
        if (effectiveCertData.course_code && !effectiveCertData.course_code.startsWith('CS')) {
            return effectiveCertData.course_code;
        }
        if (studentEnrollments && studentEnrollments.length > 0) {
            const targetParentId = courseData?.id || resolvedParentCourseId;
            const matched = studentEnrollments.find(e => 
                (targetParentId && String((e as any).parent_course_id) === String(targetParentId)) ||
                (e.course_code && !e.course_code.startsWith('CS'))
            );
            if (matched && matched.course_code) {
                return matched.course_code;
            }
            if (studentEnrollments[0].course_code) {
                return studentEnrollments[0].course_code;
            }
        }
        return effectiveCertData.course_code;
    }, [effectiveCertData.course_code, studentEnrollments, courseData, resolvedParentCourseId]);

    // Step 9: Fetch certificate/transcript template from certificate_template table
    const { data: templateData } = useQuery({
        queryKey: ['documentTemplateForPrint', templateCourseCode, docTypeParam],
        queryFn: async () => {
            try {
                const res = await getCertificateTemplate(templateCourseCode!, docTypeParam);
                if (res?.success && res?.template) {
                    return res;
                }
            } catch (e) {}

            if (docTypeParam === 'Transcript') {
                return {
                    success: true,
                    template: {
                        template_id: 1,
                        template_name: 'Academic Transcript',
                        left_margin: 0,
                        top_to_name: 0,
                        left_to_date: 0,
                        top_to_date: 0,
                        left_to_qr: 0,
                        top_to_qr: 0,
                        qr_width: 14,
                        is_active: 1,
                        back_image: '',
                        course_code: templateCourseCode!,
                        orientation: 'Portrait',
                        template_json: JSON.stringify({
                            pageSize: 'A4',
                            orientation: 'Portrait',
                            elements: DEFAULT_TRANSCRIPT_ELEMENTS
                        })
                    }
                };
            }

            return {
                success: true,
                template: {
                    template_id: 1,
                    template_name: 'Default Certificate',
                    left_margin: 0,
                    top_to_name: 304,
                    left_to_date: 22,
                    top_to_date: 672,
                    left_to_qr: 8,
                    top_to_qr: 656,
                    qr_width: 14,
                    is_active: 1,
                    back_image: '',
                    course_code: templateCourseCode!,
                    orientation: 'Landscape',
                    template_json: JSON.stringify({
                        pageSize: 'A4',
                        orientation: 'Landscape',
                        elements: DEFAULT_CERTIFICATE_ELEMENTS
                    })
                }
            };
        },
        enabled: !!templateCourseCode,
    });

    useEffect(() => {
        if (effectiveCertData) {
            document.title = `${docTypeParam} - ${effectiveCertData.student_number}`;
        }
    }, [effectiveCertData, docTypeParam]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoadingCert && !courseCodeParam) {
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

    return (
        <div className="bg-gray-200 print:bg-white">
            <div className="fixed top-4 right-4 z-50 no-print">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print {docTypeParam}
                </Button>
            </div>
            <main className="flex justify-center items-start min-h-screen p-8 print:p-0">
                <div className="print-container bg-white shadow-lg print:shadow-none">
                    <CertificateLayout
                        studentName={studentData?.name_on_certificate || 'Student Name'}
                        studentIndex={effectiveCertData.student_number}
                        courseName={courseData?.course_name || 'Certificate Course'}
                        issueDate={effectiveCertData.print_date}
                        certificateId={effectiveCertData.certificate_id}
                        courseData={courseData}
                        batchCode={effectiveBatchCode}
                        template={templateData?.success ? templateData.template : null}
                    />
                </div>
            </main>
        </div>
    );
}
