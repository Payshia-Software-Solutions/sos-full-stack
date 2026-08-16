
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

export const FONT_LIST = [
  { value: "Inter", label: "Inter (Sans)", family: "'Inter', sans-serif" },
  { value: "Montserrat", label: "Montserrat (Sans)", family: "'Montserrat', sans-serif" },
  { value: "Calibri", label: "Calibri (Body)", family: "'Calibri', 'Carlito', sans-serif" },
  { value: "Playfair Display", label: "Playfair Display (Serif)", family: "'Playfair Display', serif" },
  { value: "Cinzel", label: "Cinzel (Serif)", family: "'Cinzel', serif" },
  { value: "Lora", label: "Lora (Serif)", family: "'Lora', serif" },
  { value: "Great Vibes", label: "Great Vibes (Script)", family: "'Great Vibes', cursive" },
  { value: "Alex Brush", label: "Alex Brush (Script)", family: "'Alex Brush', cursive" },
  { value: "Bradley Hand ITC", label: "Bradley Hand ITC (Script)", family: "'Bradley Hand', 'Bradley Hand ITC', 'Caveat', cursive" },
];

export const formatInlineText = (rawText: string) => {
  if (!rawText) return '';
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  const regex = /(\*\*(.*?)\*\*|<b>(.*?)<\/b>|<strong>(.*?)<\/strong>)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(rawText.substring(lastIndex, match.index));
    }
    const boldContent = match[2] || match[3] || match[4] || '';
    parts.push(
      <strong key={match.index} className="font-bold">
        {boldContent}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    parts.push(rawText.substring(lastIndex));
  }

  return parts.length > 0 ? parts : rawText;
};

export const getFontFamilyStyle = (fontFamily?: string) => {
  if (!fontFamily) return "'Inter', sans-serif";
  const found = FONT_LIST.find(f => f.value === fontFamily);
  if (found) return found.family;
  return `'${fontFamily}', sans-serif`;
};


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

  const verificationUrl = `https://pharmacollege.lk/result-view?CourseCode=${encodeURIComponent(batchCode || '')}&LoggedUser=${encodeURIComponent(studentIndex || '')}`;
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
        let parsed = typeof template.template_json === 'string' ? JSON.parse(template.template_json) : template.template_json;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
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
          <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Carlito:ital,wght@0,400;0,700;1,400;1,700&family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Great+Vibes&family=Inter:wght@300..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:wght@300..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />

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
                .replace(/{{COMPLETED_DATE}}/g, formattedDate)
                .replace(/{{DURATION}}/g, '6 Months')
                .replace(/{{GRADE}}/g, 'B')
                .replace(/{{TRANSCRIPT_REF_ID}}/g, `TRNS/${studentIndex}/${batchCode || 'CPCC'}/${certificateId}`)
                .replace(/{{BATCH}}/g, batchCode || '')
                .replace(/\[Batch\]/g, batchCode || '');
            }

            if (el.type === 'image') {
              return (
                <div 
                  key={el.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width || 22}%`,
                  }}
                >
                  {el.content && (
                    <img 
                      src={el.content} 
                      alt="Signature" 
                      className="w-full h-auto object-contain max-h-32 border-none bg-transparent outline-none shadow-none"
                    />
                  )}
                </div>
              );
            }

            if (el.type === 'divider') {
              return (
                <div 
                  key={el.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width || 90}%`,
                  }}
                >
                  <div 
                    style={{
                      width: '100%',
                      height: `${(el as any).strokeWidth || 1}px`,
                      backgroundColor: el.color || '#000000',
                    }}
                  />
                </div>
              );
            }

            if (el.type === 'grading_scale') {
              const defaultRows = [
                ['Percentage', 'Grade', 'Classification'],
                ['85–100', 'A+', 'Distinction'],
                ['75–84', 'A', 'Excellent'],
                ['65–74', 'B', 'Very Good'],
                ['55–64', 'C', 'Good'],
                ['50–54', 'D', 'Pass'],
                ['Below 50', 'F', 'Fail']
              ];
              let scaleRows = defaultRows;
              if (el.content && el.content !== 'Grading Scale' && el.content.trim() !== '') {
                const lines = el.content.split('\n').filter((l: string) => l.trim() !== '');
                if (lines.length > 0) {
                  scaleRows = lines.map((line: string) => {
                    if (line.includes('|')) return line.split('|').map((c: string) => c.trim());
                    if (line.includes('\t')) return line.split('\t').map((c: string) => c.trim());
                    if (line.includes(',')) return line.split(',').map((c: string) => c.trim());
                    return [line.trim()];
                  });
                }
              }
              const headerRow = scaleRows[0] || ['Percentage', 'Grade', 'Classification'];
              const bodyRows = scaleRows.slice(1);

              return (
                <div 
                  key={el.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width || 60}%`,
                  }}
                >
                  <div 
                    className="w-full text-left font-sans space-y-1"
                    style={{
                      fontSize: `${el.fontSize || 10}px`,
                      fontFamily: getFontFamilyStyle(el.fontFamily),
                      color: el.color || '#000000',
                    }}
                  >
                    <table className="w-full text-[10px] border-collapse font-sans text-left" style={{ color: el.color || '#000000' }}>
                      <thead>
                        <tr className="border-b border-gray-400 font-bold">
                          {headerRow.map((col: string, idx: number) => (
                            <th key={idx} className="py-0.5 pr-4 font-bold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bodyRows.map((row: string[], rIdx: number) => (
                          <tr key={rIdx}>
                            {row.map((cell: string, cIdx: number) => (
                              <td key={cIdx} className={`py-0.5 pr-4 ${cIdx === 1 ? 'font-bold' : ''}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
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
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`} 
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

            const isModuleListKeyword = displayText && (displayText.includes('{{MODULE_LIST}}') || displayText.includes('{{RESULTS_TABLE}}') || displayText.includes('[Module List]'));

            return (
              <div 
                key={el.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 px-2"
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  textAlign: el.align,
                  width: `${el.width || 90}%`,
                  maxWidth: '100%'
                }}
              >
                {isModuleListKeyword ? (
                  <div className="w-full text-left font-sans space-y-1 text-gray-900 my-1">
                    <div className="font-bold text-xs text-gray-900 mb-1.5">Module Name</div>
                    <ul className="space-y-1 text-[11px] text-gray-800 list-disc list-inside font-medium leading-relaxed">
                      <li>CPP 101 - Introduction to Pharmaceuticals & Pharmacy Practice</li>
                      <li>CPP 102 - Prescription Reading & Pharmaceutical Calculations</li>
                      <li>CPP 103 - Pharmaceutical Dosage Forms & Drug Administration</li>
                      <li>CPP 104 - Pharmaceutical Storage, Quality Assurance & Pharmacy Law</li>
                      <li>CPP 105 - Therapeutics of Common Diseases</li>
                    </ul>
                  </div>
                ) : (
                  <div 
                    className={weightClass}
                    style={{
                      fontSize: `${el.fontSize}px`,
                      fontFamily: getFontFamilyStyle(el.fontFamily),
                      color: el.color,
                      whiteSpace: 'pre-wrap',
                      lineHeight: el.lineHeight || 1.3
                    }}
                  >
                    {formatInlineText(displayText)}
                  </div>
                )}
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
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`} 
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
