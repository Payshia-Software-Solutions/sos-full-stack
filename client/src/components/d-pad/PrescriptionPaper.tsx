import React from 'react';
import { cn } from '@/lib/utils';

interface PrescriptionPaperProps {
  prescription: {
    doctor_name?: string;
    Pres_Method?: string;
    Pres_Name?: string;
    pres_date?: string;
    Pres_Age?: string | number;
    drugs_list?: string;
    drugs_written_list?: string;
  };
  labels?: {
    patientName?: string;
    date?: string;
    age?: string;
  };
  className?: string;
}

export function PrescriptionPaper({ 
  prescription, 
  labels = { patientName: "Patient Name", date: "Date", age: "Age" },
  className 
}: PrescriptionPaperProps) {
  
  const drugs = prescription.drugs_list 
    ? prescription.drugs_list.split(',').map(d => d.trim()).filter(Boolean)
    : [];

  const writtenDrugs = prescription.drugs_written_list
    ? prescription.drugs_written_list.split(',').map(d => d.trim())
    : [];

  const usages = ["bd", "tds", "daily", "mane", "nocte"];

  const getBaseDrugName = (fullDrug: string) => {
    const parts = fullDrug.trim().split(" ");
    const lastPart = parts[parts.length - 1]?.toLowerCase();
    if (usages.includes(lastPart)) {
      return parts.slice(0, -1).join(" ");
    }
    return fullDrug;
  };

  const displayDrugs = drugs.map((drug, i) => {
    const parts = drug.trim().split(" ");
    const lastPart = parts[parts.length - 1]?.toLowerCase();
    const hasUsage = usages.includes(lastPart);
    const usage = hasUsage ? lastPart : "";
    
    const baseName = hasUsage ? parts.slice(0, -1).join(" ") : drug;
    const writtenName = writtenDrugs[i] || baseName;
    
    return usage ? `${writtenName} ${usage}` : writtenName;
  });

  const baseDrugNames = drugs.map(getBaseDrugName);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="space-y-6 font-sans text-slate-200 bg-slate-900/60 p-6 md:p-8 rounded-b-xl relative">
        <div className="text-center border-b border-slate-800 pb-4">
          <h3 className="text-xl font-black font-headline text-emerald-400">
            {prescription.doctor_name || "Dr. Sunil Rathnayaka"}
          </h3>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
            Registered Medical Practitioner
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Reg No: MCQ/93801</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-800 pb-4">
          <div>
            <span className="font-semibold text-slate-400 block uppercase text-[10px]">{labels.patientName}</span>
            <span className="font-bold text-sm text-slate-100">{prescription.Pres_Name || '-'}</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-400 block uppercase text-[10px]">{labels.date}</span>
            <span className="font-mono text-slate-100">{prescription.pres_date || '-'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-400 block uppercase text-[10px]">{labels.age}</span>
            <span className="font-bold text-slate-100">{prescription.Pres_Age || '-'} Years</span>
          </div>
        </div>

        {/* Rx symbol & list */}
        <div className="min-h-[180px] flex flex-col">
          <div className="mb-4">
            <span className="text-5xl font-serif text-slate-700/60 select-none font-bold italic">Rx</span>
          </div>
          
          <div className="flex justify-between items-center pr-2">
            <div className="space-y-4 font-mono text-sm leading-relaxed text-slate-100 flex-1">
              {displayDrugs.length > 0 ? (
                displayDrugs.map((drugName, i) => (
                  <div key={i} className="border-b border-dashed border-slate-800 pb-2 max-w-[80%]">
                    <p className="font-bold text-slate-100">{drugName}</p>
                    <p className="text-xs text-slate-400 italic">
                      Dispense as Cover {i + 1}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No drugs configured</p>
              )}
            </div>

            {/* Right side large slash & method */}
            {prescription.Pres_Method && (
              <div className="flex items-center text-slate-300 pl-4 flex-shrink-0">
                 <span className="text-7xl font-light italic mr-3 text-slate-700/80 -rotate-12">/</span>
                 <span className="text-3xl font-bold font-mono text-slate-200">{prescription.Pres_Method}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right text-xs pt-4 border-t border-slate-800 text-slate-400 mt-8">
          <p className="italic font-serif text-slate-355">S. Rathnayaka</p>
          <p className="text-[9px] uppercase tracking-wider font-semibold">Authorized Signature</p>
        </div>
      </div>

      {/* Availability Card */}
      {baseDrugNames.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Availability
          </h4>
          <p className="text-slate-200 text-sm font-medium leading-relaxed">
            {baseDrugNames.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
