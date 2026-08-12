
"use client";

import Image from 'next/image';
import { format } from 'date-fns';
import { Roboto } from 'next/font/google';
import { cn } from '@/lib/utils';
import type { ParentCourse } from '@/lib/types';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});


export interface CertificateTemplate {
  template_id: number;
  template_name: string;
  left_margin: number;
  top_to_name: number;
  left_to_date: number;
  top_to_date: number;
  left_to_qr: number;
  top_to_qr: number;
  qr_width: number;
  is_active: number;
  back_image: string;
  course_code: string;
  orientation: string;
  template_json?: string | null;
}

interface CertificateLayoutProps {
  studentName: string;
  studentIndex: string;
  courseName: string;
  issueDate: string;
  certificateId: string;
  courseData?: ParentCourse;
  batchCode?: string;
  template?: CertificateTemplate | null;
}

export const CertificateLayout = ({ 
  studentName, 
  studentIndex, 
  courseName, 
  issueDate, 
  certificateId, 
  courseData, 
  batchCode,
  template 
}: CertificateLayoutProps) => {

  const isPortrait = template?.orientation === 'Portrait';
  const hasTemplate = !!template && template.is_active === 1;

  // Format issue date safely
  let formattedDate = '';
  try {
    formattedDate = format(new Date(issueDate), 'MMMM d, yyyy');
  } catch (e) {
    formattedDate = issueDate || '';
  }

  const printStyles = `
    @page {
      size: A4 ${isPortrait ? 'portrait' : 'landscape'};
      margin: 0 !important;
    }
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-container {
        width: ${isPortrait ? '210mm' : '297mm'} !important;
        height: ${isPortrait ? '297mm' : '210mm'} !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
      }
    }
  `;

  if (hasTemplate) {
    let dynamicElements: any[] = [];
    let templatePageSize = 'A4';
    
    if (template.template_json) {
      try {
        const parsed = JSON.parse(template.template_json);
        dynamicElements = parsed.elements || [];
        templatePageSize = parsed.pageSize || 'A4';
      } catch (e) {
        dynamicElements = [];
      }
    }

    if (dynamicElements.length > 0) {
      let containerClass = "w-[297mm] h-[210mm]";
      if (templatePageSize === 'Letter') {
        containerClass = isPortrait ? "w-[8.5in] h-[11in]" : "w-[11in] h-[8.5in]";
      } else {
        containerClass = isPortrait ? "w-[210mm] h-[297mm]" : "w-[297mm] h-[210mm]";
      }

      return (
        <div 
          className={cn(
            "relative bg-white text-black select-none overflow-hidden", 
            containerClass,
            roboto.className
          )}
          style={{
            backgroundImage: `url('${template.back_image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: printStyles }} />
          {/* Dynamic Google Fonts Link */}
          <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400..900&family=Great+Vibes&family=Inter:wght@300..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:wght@300..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />

          {dynamicElements.map((el) => {
            let displayText = el.content;
            if (displayText) {
              displayText = displayText
                .replace(/{{STUDENT_NAME}}/g, studentName)
                .replace(/\[Student Name\]/g, studentName)
                .replace(/{{COURSE_NAME}}/g, courseName)
                .replace(/\[Course Name\]/g, courseName)
                .replace(/{{CERTIFICATE_ID}}/g, certificateId)
                .replace(/\[Certificate ID\]/g, certificateId)
                .replace(/{{STUDENT_ID}}/g, studentIndex)
                .replace(/\[Student ID\]/g, studentIndex)
                .replace(/{{ISSUED_DATE}}/g, formattedDate)
                .replace(/\[Issued Date\]/g, formattedDate)
                .replace(/{{BATCH}}/g, batchCode || '')
                .replace(/\[Batch\]/g, batchCode || '');
            }

            if (el.type === 'qr_code') {
              return (
                <div 
                  key={el.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.fontSize}%`,
                    aspectRatio: '1/1'
                  }}
                >
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://pharmacollege.lk/verify/' + certificateId)}`} 
                    alt="Verification QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }

            const weightClass = 
              el.fontWeight === 'black' ? 'font-black' :
              el.fontWeight === 'bold' ? 'font-bold' :
              el.fontWeight === 'semibold' ? 'font-semibold' : 'font-normal';

            return (
              <div 
                key={el.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 px-2"
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width || 90}%`,
                  textAlign: el.align,
                }}
              >
                <div 
                  className={weightClass}
                  style={{
                    fontSize: `${el.fontSize}px`,
                    fontFamily: el.fontFamily || 'Inter',
                    color: el.color || '#000000',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.2
                  }}
                >
                  {displayText}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Legacy Fallback when template_json is empty
    return (
      <div 
        className={cn(
          "relative bg-white text-black select-none", 
          isPortrait ? "w-[210mm] h-[297mm]" : "w-[297mm] h-[210mm]",
          roboto.className
        )}
        style={{
          backgroundImage: `url('${template.back_image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: printStyles }} />
        {/* Dynamic Name */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center px-4"
          style={{
            left: `${template.left_margin}%`,
            top: `${template.top_to_name / 10}%`,
            width: '90%'
          }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-wide leading-tight">
            {studentName}
          </h1>
        </div>

        {/* Dynamic Date */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
          style={{
            left: `${template.left_to_date}%`,
            top: `${template.top_to_date / 10}%`,
          }}
        >
          <p className="text-lg md:text-xl font-semibold text-gray-700">
            {formattedDate}
          </p>
        </div>

        {/* Dynamic QR Code */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${template.left_to_qr}%`,
            top: `${template.top_to_qr / 10}%`,
            width: `${template.qr_width}%`,
            aspectRatio: '1/1'
          }}
        >
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://pharmacollege.lk/verify/' + certificateId)}`} 
            alt="Verification QR Code" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Dynamic metadata watermark / footer */}
        <div className="absolute bottom-6 left-12 text-left text-[10px] text-gray-500 font-mono z-20">
          <p>Cert. ID: {certificateId}</p>
          <p>Student No: {studentIndex}</p>
          <p>Batch: {batchCode}</p>
        </div>
      </div>
    );
  }

  // Fallback to default hardcoded layout
  return (
    <div className={cn("relative w-[297mm] h-[210mm] bg-white text-black", roboto.className)}
      style={{
        backgroundImage: `url('https://content-provider.pharmacollege.lk/certificates/certificate-bg-english-free-v1.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      {/* Main content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-16">

        {/* Logo Section */}
        <div className="w-full flex justify-start -mt-8 ml-8">
            <div className="relative h-24 w-24">
                <Image src="https://content-provider.pharmacollege.lk/certificates/logo-cropped.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
        </div>

        {/* Body section */}
        <div className="w-full flex-grow flex flex-col justify-center items-start text-left ml-8 max-w-xl -mt-24">
          <p className="text-2xl text-gray-700 tracking-wider">CERTIFICATE OF COMPLETION</p>
          <p className="text-lg text-gray-600 mt-8">This certificate is awarded to</p>
          <h1 className="text-5xl font-bold my-4 text-gray-900 leading-tight">
            {studentName}
          </h1>
          <p className="text-lg text-gray-600 max-w-lg">
            in recognition of the successful completion and dedication to the <strong className="font-bold text-gray-700">English Language Development Program.</strong>
          </p>
          <p className="text-lg text-gray-600 max-w-lg mt-4">
            conducted by
          </p>
          <h2 className="text-3xl font-bold my-2 text-primary">
            Ceylon Pharma College
          </h2>
        </div>

        {/* Footer section */}
        <div className="w-full flex justify-between items-end ml-8">
           <div className="text-left text-xs text-gray-500 font-mono">
                <p>Cert. ID: {certificateId}</p>
                <p>Student No: {studentIndex}</p>
                <p>Batch: {batchCode}</p>
            </div>
            <div className="flex gap-12">
                <div className="text-center">
                    <div className="relative h-16 w-48">
                    <Image src="https://content-provider.pharmacollege.lk/certificates/hansi-sign-1.png" alt="Academic Instructor Signature" fill style={{ objectFit: 'contain' }}/>
                    </div>
                    <div className="border-t border-gray-600 w-48 mt-1"></div>
                    <p className="text-sm font-semibold mt-1">Academic Instructor</p>
                </div>
                
                <div className="text-center">
                    <div className="relative h-16 w-48">
                    <Image src="https://content-provider.pharmacollege.lk/certificates/sign.png" alt="Director Signature" fill style={{ objectFit: 'contain' }}/>
                    </div>
                    <div className="border-t border-gray-600 w-48 mt-1"></div>
                    <p className="text-sm font-semibold mt-1">Director</p>
                </div>

                <div className="text-center">
                    <div className="h-16 w-48 flex items-center justify-center">
                    <p className="text-sm text-gray-600">{formattedDate}</p>
                    </div>
                    <div className="border-t border-gray-600 w-48 mt-1"></div>
                    <p className="text-sm font-semibold mt-1">Date</p>
                </div>
            </div>
        </div>
      </div>
       {/* Company Registration Number */}
        <div className="absolute bottom-8 right-16 text-right text-xs text-gray-500 font-mono z-20">
            <p>PV00253555</p>
        </div>
    </div>
  );
};
