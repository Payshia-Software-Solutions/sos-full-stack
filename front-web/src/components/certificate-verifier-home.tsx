"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Search, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  ChevronRight,
  Lock,
  Globe2,
  UserCheck
} from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { LMS_API_URL } from "@/lib/config";
import debounce from "lodash.debounce";
import { cn } from "@/lib/utils";

interface StudentSearchResult {
  id: string;
  username: string;
  name_on_certificate: string;
  student_id?: string;
  certificate_id?: string;
  course_code?: string;
}

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
  id: string;
  course_code: string;
  batch_name: string;
  parent_course_name: string;
  assignment_grades: AssignmentGrades;
  certificate_eligibility: boolean;
}

interface StudentFullData {
  title: string;
  studentInfo: StudentInfo;
  studentEnrollments: Record<string, Enrollment>;
}

export default function CertificateVerifierHome() {
  const { t, language } = useTranslation();
  const isSinhala = language === "si";
  const isTamil = language === "ta";

  const [query, setQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setFilteredStudents([]);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      // Query Next.js internal search API with multi-strategy resolution
      const response = await fetch(`/api/certificate/search?q=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data: StudentSearchResult[] = await response.json();
        setFilteredStudents(Array.isArray(data) ? data : []);
      } else {
        // Fallback directly to LMS
        const cleanUser = trimmed.replace(/[\/\\ \-_]/g, '').toUpperCase();
        const fallbackRes = await fetch(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(cleanUser)}`);
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          if (fbData?.studentInfo?.username) {
            const s = fbData.studentInfo;
            setFilteredStudents([{
              id: String(s.id),
              username: s.username,
              name_on_certificate: s.name_on_certificate || s.full_name || `${s.first_name} ${s.last_name}`,
              student_id: s.student_id,
            }]);
            return;
          }
        }
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error("Certificate search error:", error);
      setFilteredStudents([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((val: string) => performSearch(val), 350),
    [performSearch]
  );

  useEffect(() => {
    if (query.trim().length >= 2) {
      setSearchLoading(true);
      debouncedSearch(query);
    } else {
      setFilteredStudents([]);
      setSearchLoading(false);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleStudentSelect = async (student: StudentSearchResult) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      const cleanUser = student.username.trim().replace(/[\/\\ \-_]/g, '').toUpperCase();
      
      let data: StudentFullData | null = null;
      try {
        const res = await fetch(`/api/certificate/details?loggedUser=${encodeURIComponent(cleanUser)}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // fallback
      }

      if (!data || !data.studentInfo) {
        const res = await fetch(`${LMS_API_URL}/get-student-full-info?loggedUser=${encodeURIComponent(cleanUser)}`);
        if (res.ok) {
          data = await res.json();
        }
      }

      if (!data || !data.studentInfo) {
        throw new Error('Student information could not be retrieved.');
      }

      setSelectedStudentData(data);
    } catch (error: any) {
      console.error("Error fetching student details:", error);
      setDetailsError(error.message || 'Failed to fetch student details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setFilteredStudents([]);
    setSelectedStudentData(null);
    setDetailsError(null);
  };

  return (
    <section 
      id="certificate-verification" 
      className="bg-primary py-16 md:py-24 text-primary-foreground relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        
        {/* CPC White Logo Centered */}
        <div className="mb-6">
          <Image
            src="https://content-provider.pharmacollege.lk/logo/logo-cpc.png"
            alt="Ceylon Pharma College Logo"
            width={200}
            height={62}
            className="brightness-0 invert mx-auto"
            priority
          />
        </div>

        {/* Illuminated Critical Selling Point Trust Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-4 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {isSinhala 
              ? 'අපගේ සුවිශේෂී වටිනාකම • Critical Selling Point' 
              : '100% Verifiable Credentials • Critical Trust Guarantee'}
          </span>
        </div>

        {/* Headline */}
        <h2 className={cn(
          "text-3xl md:text-5xl font-headline font-bold text-white tracking-tight",
          isSinhala ? "leading-[1.35]" : "leading-tight"
        )}>
          {t('certVerifierTitle')}
        </h2>

        {/* Subtitle */}
        <p className={cn(
          "mt-4 text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto",
          isSinhala ? "leading-[1.75]" : "leading-relaxed"
        )}>
          {t('certVerifierSubtitle')}
        </p>

        {/* Centered Search Bar Box */}
        <div className="mt-8 max-w-xl mx-auto relative text-left">
          <div className="relative">
            <Input 
              name="certificateNumber" 
              placeholder={isSinhala ? 'ශිෂ්‍ය අංකය (උදා: PA24600), සහතික අංකය හෝ නම' : 'ENTER STUDENT INDEX (E.G. PA24600), CERT ID OR NAME'} 
              aria-label={t('certVerifierButton')}
              className="h-14 w-full rounded-xl border-2 border-primary-foreground/50 bg-primary-foreground/95 pl-14 pr-14 text-base text-primary placeholder:text-primary/65 focus:border-primary-foreground focus:bg-primary-foreground focus:ring-2 focus:ring-primary-foreground/50 uppercase font-mono font-medium shadow-lg"
              onChange={(e) => {
                setQuery(e.target.value.toUpperCase());
                if (selectedStudentData) setSelectedStudentData(null);
              }}
              value={query}
            />
            <Search className="h-6 w-6 absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none" />
            {searchLoading && <Loader2 className="h-6 w-6 absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 animate-spin" />}
          </div>

          {/* Clean Example Search Hint */}
          {!query && (
            <p className="text-xs text-primary-foreground/85 pt-2 text-center font-body">
              <span className="font-medium">{isSinhala ? 'උදාහරණ (e.g.): ' : 'Examples: '}</span>
              <span className="font-mono text-primary-foreground/95">PA24600</span>
              <span className="mx-1.5 opacity-60">•</span>
              <span className="font-mono text-primary-foreground/95">CREF4307</span>
              <span className="mx-1.5 opacity-60">•</span>
              <span className="font-mono text-primary-foreground/95">Kasun</span>
              <span className="mx-1.5 opacity-60">•</span>
              <span className="font-mono text-primary-foreground/95">Dilshan</span>
            </p>
          )}

          {/* Details Loading Spinner */}
          {detailsLoading && (
            <div className="mt-6 flex flex-col justify-center items-center gap-2 text-primary-foreground/90 py-6">
              <Loader2 className="h-7 w-7 animate-spin" />
              <p className="text-sm font-medium">
                {isSinhala ? 'සත්‍යාපිත ශිෂ්‍ය තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading verified credentials...'}
              </p>
            </div>
          )}

          {detailsError && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/20 border border-destructive/40 text-primary-foreground text-xs text-center">
              {detailsError}
            </div>
          )}

          {/* Empty State when searched but nothing found */}
          {query.trim().length >= 2 && !searchLoading && filteredStudents.length === 0 && !selectedStudentData && (
            <div className="mt-4 p-5 rounded-xl bg-background/15 border border-primary-foreground/20 text-center text-primary-foreground space-y-2 backdrop-blur-sm animate-in fade-in-50">
              <p className="font-semibold text-sm">
                {isSinhala ? 'සිසුන් හෝ සහතිකපත් හමු නොවීය (No matching records)' : 'No matching student or certificate found'}
              </p>
              <p className="text-xs text-primary-foreground/80 leading-relaxed max-w-md mx-auto">
                {isSinhala 
                  ? 'කරුණාකර නිවැරදි ශිෂ්‍ය අංකය (උදා: PA24600 හෝ PA/24/600), සහතික අංකය (උදා: CREF4307) හෝ නම පරීක්ෂා කර නැවත උත්සාහ කරන්න.' 
                  : 'Please verify your Student Index (e.g. PA24600), Certificate ID (e.g. CREF4307), or Name and try again.'}
              </p>
            </div>
          )}

          {/* Search Results Dropdown List with Strict Left Alignment */}
          {filteredStudents.length > 0 && !selectedStudentData && !detailsLoading && (
            <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto animate-in fade-in-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left">
              <p className="text-xs font-semibold text-primary-foreground/85 px-1 text-left">
                {isSinhala ? `ගැලපෙන සිසුන් ${filteredStudents.length} ක් හමුවිය:` : `Found ${filteredStudents.length} matching record(s):`}
              </p>
              {filteredStudents.map((student) => (
                <button
                  key={student.id + student.username}
                  onClick={() => handleStudentSelect(student)}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-background text-foreground hover:bg-muted/95 transition-all shadow-md hover:shadow-lg group border border-border/80 text-left cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0 uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                    {student.name_on_certificate?.trim().charAt(0) || <UserCheck className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-grow min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap text-left">
                      <p className="font-headline font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate text-left">
                        {student.name_on_certificate}
                      </p>
                      {student.certificate_id && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {student.certificate_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 text-left">
                      Index: <span className="font-semibold text-foreground/85">{student.username}</span>
                      {student.student_id && student.student_id !== student.username && (
                        <span className="ml-1.5 opacity-70">({student.student_id})</span>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <span>{isSinhala ? 'තහවුරු කරන්න' : 'Verify'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Student Verified Credentials Card */}
          {selectedStudentData && !detailsLoading && (
            <div className="mt-4 p-5 rounded-2xl bg-background text-foreground shadow-2xl border border-border/80 space-y-4 animate-in fade-in-50 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    {isSinhala ? 'සත්‍යාපිත උපාධිධාරී ශිෂ්‍යයා (Officially Verified)' : 'Officially Verified Graduate'}
                  </span>
                </div>
                <button 
                  onClick={handleReset} 
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  {isSinhala ? 'නැවත සොයන්න' : 'Search again'}
                </button>
              </div>

              <div>
                <h4 className="font-headline font-bold text-base sm:text-lg text-foreground">
                  {selectedStudentData.studentInfo.name_on_certificate || selectedStudentData.studentInfo.full_name}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Student Index: <span className="font-bold text-foreground/90">{selectedStudentData.studentInfo.username}</span>
                  {selectedStudentData.studentInfo.student_id && (
                    <span className="ml-1.5 opacity-70">({selectedStudentData.studentInfo.student_id})</span>
                  )}
                </p>
              </div>

              {/* Completed Enrollments */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {isSinhala ? 'සම්පූර්ණ කරන ලද පාඨමාලා:' : 'Completed Enrollments:'}
                </p>
                {Object.values(selectedStudentData.studentEnrollments || {}).map((enrollment) => (
                  <div 
                    key={enrollment.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {enrollment.parent_course_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {enrollment.batch_name} ({enrollment.course_code})
                      </p>
                    </div>
                    <Button asChild size="sm" className="h-8 text-xs font-semibold gap-1 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href={`/result-view?CourseCode=${enrollment.course_code}&LoggedUser=${selectedStudentData.studentInfo.username}`}>
                        <span>{isSinhala ? 'ප්‍රතිඵලය' : 'View Result'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Description Paragraph from Image 2 */}
        <p className="mt-10 max-w-3xl mx-auto text-primary-foreground/85 text-xs sm:text-sm font-body leading-relaxed">
          {t('certVerifierDescription')}
        </p>

        {/* 3 Glassmorphic Trust Pillars on Emerald Green */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto text-left">
          
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <h4 className="font-headline font-bold text-sm sm:text-base text-white">
                {isSinhala ? 'රෝහල් & ෆාමසි සෘජු පිළිගැනීම' : 'Hospital & Pharmacy Preferred'}
              </h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-body">
              {isSinhala 
                ? 'Hemas, Nawaloka, Asiri, MediCare සහ ප්‍රමුඛ පෙළේ ඖෂධහල් ජාල සේවකයින් බඳවා ගැනීමේදී අපගේ දත්ත පද්ධතියෙන් සෘජුවම සහතික සත්‍යාපනය කරගනී.' 
                : 'Leading private hospital groups and community pharmacy chains verify credentials directly through our real-time database during hiring.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Globe2 className="w-5 h-5 text-emerald-300" />
              </div>
              <h4 className="font-headline font-bold text-sm sm:text-base text-white">
                {isSinhala ? 'ACTD (USA/UK) & ISO 9001:2015' : 'Internationally Accredited'}
              </h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-body">
              {isSinhala 
                ? 'ජාත්‍යන්තර ප්‍රතීතනය ලත් අපගේ සහතික IAF CertSearch හරහා ලෝකයේ ඕනෑම රටකදී හෝ විදේශ රැකියා සුදුසුකම් සනාථ කරගැනීමට වලංගු වේ.' 
                : 'Audited under ISO 9001:2015 Quality Management standards and accredited by ACTD USA/UK for both local and overseas credential evaluation.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <h4 className="font-headline font-bold text-sm sm:text-base text-white">
                {isSinhala ? 'ව්‍යාජ සහතිකවලින් තොර 100% ආරක්‍ෂාව' : 'Tamper-Proof QR Protection'}
              </h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-body">
              {isSinhala 
                ? 'සෑම සහතිකයකටම අනන්‍ය වූ QR කේතයක් සහ Student Index Number එකක් පවතින බැවින් කිසිවෙකුට සහතික ව්‍යාජ ලෙස පිටපත් කළ නොහැක.' 
                : 'Each certificate features an individualized QR code and registration number, preventing counterfeit duplication and protecting graduate credibility.'}
            </p>
          </div>

        </div>

        {/* Link to Full Certificates Page */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="font-semibold text-xs gap-2 rounded-xl h-10 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white">
            <Link href="/certificates">
              <span>{isSinhala ? 'සම්පූර්ණ සහතිකපත් සත්‍යාපන ද්වාරය බලන්න' : 'Visit Full Certificate Verification Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
