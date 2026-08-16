
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
            parent_course_id: courseCodeParam || ''
        };
    }, [certData, certificateId, courseCodeParam, searchParams, docTypeParam]);

    // Step 3: Fetch student details.
    const { data: studentData } = useQuery<UserFullDetails>({
        queryKey: ['studentDetailsForCert', effectiveCertData.student_number],
        queryFn: () => getStudentDetailsByUsername(effectiveCertData.student_number),
        enabled: !!effectiveCertData.student_number,
    });

    // Step 4: Fetch all parent courses for fast in-memory course resolution.
    const { data: parentCourses } = useQuery<ParentCourse[]>({
        queryKey: ['allParentCourses'],
        queryFn: getParentCourses,
        staleTime: 5 * 60 * 1000,
    });

    // Step 5: Fetch batch details if parent_course_id is missing from certData and no param provided.
    const { data: batchData } = useQuery<ApiCourse>({
        queryKey: ['batchDataForCert', effectiveCertData.course_code],
        queryFn: () => getBatchByCode(effectiveCertData.course_code),
        enabled: !!effectiveCertData.course_code && !effectiveCertData.parent_course_id && !courseCodeParam,
    });

    const resolvedParentCourseId = effectiveCertData.parent_course_id || batchData?.parent_course_id;

    // Step 6: Fallback fetch for individual parent course if not found in list.
    const { data: fetchedCourseData } = useQuery<ParentCourse>({
        queryKey: ['parentCourseDataForCert', resolvedParentCourseId],
        queryFn: () => getParentCourseById(String(resolvedParentCourseId)),
        enabled: !!resolvedParentCourseId && !courseCodeParam,
    });

    // Step 7: Resolve final courseData object.
    const courseData: ParentCourse | undefined = useMemo(() => {
        if (courseCodeParam && parentCourses) {
            const matched = parentCourses.find(c => c.course_code === courseCodeParam || String(c.id) === String(courseCodeParam));
            if (matched) return matched;
        }
        if (resolvedParentCourseId && parentCourses) {
            const matched = parentCourses.find(c => String(c.id) === String(resolvedParentCourseId) || c.course_code === String(resolvedParentCourseId));
            if (matched) return matched;
        }
        return fetchedCourseData;
    }, [courseCodeParam, parentCourses, resolvedParentCourseId, fetchedCourseData]);

    // Step 8: Resolve course_code for template lookup.
    const templateCourseCode = courseCodeParam || effectiveCertData.course_code || courseData?.course_code || null;

    // Step 9: Fetch certificate/transcript template using resolved course_code.
    const { data: templateData } = useQuery({
        queryKey: ['documentTemplateForPrint', templateCourseCode, docTypeParam],
        queryFn: async () => {
            if (docTypeParam === 'Transcript') {
                const courseObj = parentCourses?.find(c => c.course_code === templateCourseCode || String(c.id) === String(templateCourseCode));
                const courseIdToFetch = courseObj ? String(courseObj.id) : templateCourseCode;
                try {
                    const transRes = await getTranscriptTemplate(courseIdToFetch!);
                    if (transRes?.success && transRes?.template) {
                        let parsedData: any = {};
                        try {
                            parsedData = typeof transRes.template.template_data === 'string' ? JSON.parse(transRes.template.template_data) : transRes.template.template_data;
                        } catch (e) {}
                        if (parsedData.elements && parsedData.elements.length > 0) {
                            return {
                                success: true,
                                template: {
                                    template_id: 1,
                                    template_name: parsedData.template_name || 'Transcript',
                                    left_margin: 0,
                                    top_to_name: 0,
                                    left_to_date: 0,
                                    top_to_date: 0,
                                    left_to_qr: 0,
                                    top_to_qr: 0,
                                    qr_width: 14,
                                    is_active: parsedData.isActive !== false ? 1 : 0,
                                    back_image: parsedData.backImage || '',
                                    course_code: templateCourseCode!,
                                    orientation: parsedData.orientation || 'Portrait',
                                    template_json: JSON.stringify({
                                        pageSize: parsedData.pageSize || 'A4',
                                        orientation: parsedData.orientation || 'Portrait',
                                        elements: parsedData.elements || []
                                    })
                                }
                            };
                        }
                    }
                } catch (e) {}

                // Default Transcript Template layout if no database transcript exists yet
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

            // Fetch Certificate Template
            const certRes = await getCertificateTemplate(templateCourseCode!);
            if (certRes?.success && certRes?.template) {
                const t = certRes.template;
                if (t.template_json) {
                    try {
                        const parsed = JSON.parse(t.template_json);
                        const hasTranscriptElements = parsed.elements && parsed.elements.some((el: any) => 
                            (el.content && el.content.includes('ACADEMIC TRANSCRIPT')) || 
                            (el.content && el.content.includes('{{MODULE_LIST}}'))
                        );
                        if (hasTranscriptElements) {
                            t.template_json = JSON.stringify({
                                pageSize: 'A4',
                                orientation: 'Landscape',
                                elements: DEFAULT_CERTIFICATE_ELEMENTS
                            });
                        }
                    } catch (e) {}
                }
                return certRes;
            }

            // Default Certificate Template layout
            return {
                success: true,
                template: {
                    template_id: 1,
                    template_name: 'Certificate of Completion',
                    left_margin: 0,
                    top_to_name: 0,
                    left_to_date: 0,
                    top_to_date: 0,
                    left_to_qr: 0,
                    top_to_qr: 0,
                    qr_width: 14,
                    is_active: 1,
                    back_image: 'https://content-provider.pharmacollege.lk/certificates/certificate-bg-standard.png',
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
                        batchCode={effectiveCertData.course_code}
                        template={templateData?.success ? templateData.template : null}
                    />
                </div>
            </main>
        </div>
    );
}
