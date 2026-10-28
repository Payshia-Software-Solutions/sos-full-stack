"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Search, 
  Award, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  GraduationCap, 
  UserCheck, 
  ChevronRight,
  Lock,
  Globe2
} from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { LMS_API_URL } from "@/lib/config";
import debounce from "lodash.debounce";
import { cn } from "@/lib/utils";

interface StudentSearchResult {
  id: string;
  username: string;
  name_on_certificate: string;
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
  const { language } = useTranslation();
  const isSinhala = language === "si";
  const isTamil = language === "ta";

  const [query, setQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setFilteredStudents([]);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`${LMS_API_URL}/userFullDetails/search/?q=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data: StudentSearchResult[] = await response.json();
        setFilteredStudents(Array.isArray(data) ? data : []);
      } else {
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
    if (query.trim().length >= 3) {
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
      const response = await fetch(`${LMS_API_URL}/get-student-full-info?loggedUser=${student.username}`);
      if (response.ok) {
        const data: StudentFullData = await response.json();
        setSelectedStudentData(data);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setFilteredStudents([]);
    setSelectedStudentData(null);
  };

  return (
    <section 
      id="certificate-verification" 
      className="py-16 md:py-24 bg-gradient-to-b from-card/60 via-primary/5 to-card/60 border-y border-border/50 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <Badge 
            variant="outline" 
            className="mb-3 px-3 py-1 font-semibold text-primary border-primary/30 bg-primary/5 gap-1.5 inline-flex items-center"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>
              {isSinhala 
                ? 'අපගේ සුවිශේෂී වටිනාකම • Critical Selling Point' 
                : '100% Verifiable Credentials • Critical Trust Guarantee'}
            </span>
          </Badge>

          <h2 className={cn(
            "text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-foreground tracking-tight",
            isSinhala ? "leading-[1.32]" : "leading-tight"
          )}>
            {isSinhala 
              ? 'ශ්‍රී ලංකාවේ එකම 24/7 මාර්ගගතව තහවුරු කළ හැකි ඖෂධවේදී සහතිකය' 
              : isTamil
              ? 'இலங்கையில் 24/7 ஆன்லைனில் சரிபார்க்கக்கூடிய ஒரே மருந்தியல் சான்றிதழ்'
              : 'Sri Lanka’s Only 24/7 Digitally Verifiable Pharmacy Credential'}
          </h2>

          <div className="w-20 h-1 bg-primary mt-3 mb-4 rounded-full" />

          <p className={cn(
            "text-muted-foreground font-body text-sm sm:text-base max-w-2xl",
            isSinhala ? "leading-[1.75]" : "leading-relaxed"
          )}>
            {isSinhala 
              ? 'ව්‍යාජ සහතිකවලින් තොර, රෝහල් සහ ඖෂධහල් ජාලයන් සෘජුවම පිළිගන්නා, ACTD හා ISO 9001:2015 තත්ත්ව ප්‍රමිතියෙන් යුතු නිල සහතිකයක් අපගේ සෑම උපාධිධාරියෙකුටම හිමිවේ.' 
              : 'Every certificate issued by Ceylon Pharma College carries an encrypted verification ID and QR code, trusted by leading private hospitals and retail pharmacy chains island-wide.'}
          </p>
        </div>

        {/* 2-Column Grid: Left Selling Point Benefits + Right Live Verifier Tool */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column (Col 5): The 3 Trust Pillars */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-5 rounded-2xl bg-background border border-border/80 shadow-sm hover:border-primary/40 transition-all flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm sm:text-base text-foreground mb-1">
                  {isSinhala ? 'රෝහල් & ෆාමසි සෘජු පිළිගැනීම' : 'Hospital & Pharmacy Preferred'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSinhala 
                    ? 'Hemas, Nawaloka, Asiri, MediCare සහ ප්‍රමුඛ පෙළේ ඖෂධහල් ජාල සේවකයින් බඳවා ගැනීමේදී අපගේ දත්ත පද්ධතියෙන් සෘජුවම සහතික සත්‍යාපනය කරගනී.' 
                    : 'Leading private hospital groups and community pharmacy chains verify credentials directly through our real-time database during hiring.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border/80 shadow-sm hover:border-primary/40 transition-all flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm sm:text-base text-foreground mb-1">
                  {isSinhala ? 'ACTD (USA/UK) & ISO 9001:2015' : 'Internationally Accredited'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSinhala 
                    ? 'ජාත්‍යන්තර ප්‍රතීතනය ලත් අපගේ සහතික IAF CertSearch හරහා ලෝකයේ ඕනෑම රටකදී හෝ විදේශ රැකියා සුදුසුකම් සනාථ කරගැනීමට වලංගු වේ.' 
                    : 'Audited under ISO 9001:2015 Quality Management standards and accredited by ACTD USA/UK for both local and overseas credential evaluation.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border/80 shadow-sm hover:border-primary/40 transition-all flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm sm:text-base text-foreground mb-1">
                  {isSinhala ? 'ව්‍යාජ සහතිකවලින් තොර 100% ආරක්‍ෂාව' : 'Tamper-Proof QR Protection'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSinhala 
                    ? 'සෑම සහතිකයකටම අනන්‍ය වූ QR කේතයක් සහ Student Index Number එකක් පවතින බැවින් කිසිවෙකුට සහතික ව්‍යාජ ලෙස පිටපත් කළ නොහැක.' 
                    : 'Each certificate features an individualized QR code and registration number, preventing counterfeit duplication and protecting graduate credibility.'}
                </p>
              </div>
            </div>

            {/* Link to Full Certificates Page */}
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full sm:w-auto font-semibold text-xs gap-2 rounded-xl h-10 border-primary/30 text-primary hover:bg-primary/5">
                <Link href="/certificates">
                  <span>{isSinhala ? 'සම්පූර්ණ සහතිකපත් සත්‍යාපන ද්වාරය බලන්න' : 'Visit Full Certificate Verification Portal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

          </div>

          {/* Right Column (Col 7): Live Working Search & Preview Card */}
          <div className="lg:col-span-7">
            <Card className="rounded-2xl border border-border/80 bg-background shadow-xl p-5 sm:p-6">
              <CardContent className="p-0 space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {isSinhala ? 'සජීවී සත්‍යාපන සෙවුම' : 'Live Verification Registry'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    24/7 LMS Database
                  </span>
                </div>

                {/* Search Input Box */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={isSinhala ? 'ශිෂ්‍ය අංකය හෝ නම ඇතුළත් කරන්න (උදා: Kasun, Dilshan, CCPP)' : 'Enter Student ID or Name (e.g. Kasun, Dilshan, CCPP)'}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (selectedStudentData) setSelectedStudentData(null);
                    }}
                    className="h-12 w-full rounded-xl pl-11 pr-11 text-sm bg-muted/30 border-border focus:border-primary uppercase font-mono"
                  />
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  {searchLoading && (
                    <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                  )}
                </div>

                {/* Quick Hint / Demo Tags */}
                {!selectedStudentData && filteredStudents.length === 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
                    <span>{isSinhala ? 'උත්සාහ කර බලන්න (Try searching):' : 'Try searching:'}</span>
                    {["Kasun", "Dilshan", "CCPP"].map((demo) => (
                      <button
                        key={demo}
                        onClick={() => setQuery(demo)}
                        className="px-2 py-0.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors font-mono text-[11px] border border-border/60"
                      >
                        {demo}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Results Dropdown List */}
                {filteredStudents.length > 0 && !selectedStudentData && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 animate-in fade-in-50">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {isSinhala ? 'ගැලපෙන සිසුන් හමුවිය:' : 'Matching students found:'}
                    </p>
                    {filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleStudentSelect(student)}
                        className="w-full p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {student.name_on_certificate.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-headline font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary">
                              {student.name_on_certificate}
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground">
                              Index: {student.username}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0 font-semibold bg-primary/10 text-primary">
                          {isSinhala ? 'තහවුරු කරන්න' : 'Verify'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* Details Loading Spinner */}
                {detailsLoading && (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span>{isSinhala ? 'සහතිකපත් තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading verified credentials...'}</span>
                  </div>
                )}

                {/* Selected Student Verified Credentials Card */}
                {selectedStudentData && !detailsLoading && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {isSinhala ? 'සත්‍යාපිත ශිෂ්‍යයා (Verified Student)' : 'Officially Verified Graduate'}
                        </span>
                      </div>
                      <button 
                        onClick={handleReset} 
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        {isSinhala ? 'නැවත සොයන්න' : 'Search again'}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-headline font-bold text-base text-foreground">
                        {selectedStudentData.studentInfo.name_on_certificate}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        Student Index: {selectedStudentData.studentInfo.username}
                      </p>
                    </div>

                    {/* Enrollments */}
                    <div className="space-y-2 pt-2 border-t border-primary/15">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                        {isSinhala ? 'සම්පූර්ණ කරන ලද පාඨමාලා:' : 'Completed Enrollments:'}
                      </p>
                      {Object.values(selectedStudentData.studentEnrollments).map((enrollment) => (
                        <div 
                          key={enrollment.id}
                          className="p-2.5 rounded-lg bg-background border border-border/80 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {enrollment.parent_course_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {enrollment.batch_name} ({enrollment.course_code})
                            </p>
                          </div>
                          <Button asChild size="sm" className="h-7 text-[11px] font-semibold gap-1 shrink-0">
                            <Link href={`/result-view?CourseCode=${enrollment.course_code}&LoggedUser=${selectedStudentData.studentInfo.username}`}>
                              <span>{isSinhala ? 'ප්‍රතිඵලය' : 'View Result'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </section>
  );
}
