"use client";

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getCertificateTemplate } from '@/lib/actions/certificates';
import { CertificateLayout } from '@/components/print/CertificateLayout';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';

export default function PreviewCertificatePage() {
    const searchParams = useSearchParams();
    const courseCode = searchParams.get('course_code') || '';

    const { data: templateData, isLoading } = useQuery({
        queryKey: ['certificateTemplateForPreview', courseCode],
        queryFn: () => getCertificateTemplate(courseCode),
        enabled: !!courseCode,
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-8">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading Certificate Template Preview...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-200 print:bg-white">
            <div className="fixed top-4 right-4 z-50 no-print">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Test Page
                </Button>
            </div>
            <main className="flex justify-center items-start min-h-screen p-8 print:p-0">
                <div className="print-container bg-white shadow-lg print:shadow-none">
                    <CertificateLayout
                        studentName="JOHN DOE"
                        studentIndex="2026-0034"
                        courseName="Sample Course Name Layout"
                        issueDate={new Date().toISOString()}
                        certificateId="CPC-PREVIEW-001"
                        batchCode={courseCode || 'CPCC22'}
                        template={templateData?.success ? templateData.template : null}
                    />
                </div>
            </main>
        </div>
    );
}
