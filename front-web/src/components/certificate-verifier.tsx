"use client";

import { LMS_API_URL } from "@/lib/config";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Search, User, ChevronRight, Loader2, ArrowLeft, GraduationCap, UserCheck, Book, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import debounce from 'lodash.debounce';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import StarRating from "./star-rating";
import GradePaymentGate from "./GradePaymentGate";

// --- API Response Interfaces ---

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
    studentBalance?: number;
    is_grade_locked?: boolean;
    payment_gate?: any;
}

interface StudentFullData {
    title: string;
    studentInfo: StudentInfo;
    studentEnrollments: {
        [key: string]: Enrollment;
    };
    paymentGateSettings?: any;
}

// --- Search Results Component ---

const SearchResults = ({ 
  students, 
  loading, 
  onStudentSelect,
  isSinhala 
}: { 
  students: StudentSearchResult[]; 
  loading: boolean; 
  onStudentSelect: (student: StudentSearchResult) => void;
  isSinhala: boolean;
}) => {
    if (loading) {
      return (
        <div className="mt-4 flex items-center justify-center gap-2 text-primary-foreground/90 py-5">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm font-medium">
            {isSinhala ? 'සත්‍යාපන දත්ත පද්ධතියෙන් සොයමින් පවතී...' : 'Searching verified registry...'}
          </p>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <div className="mt-4 p-5 rounded-xl bg-background/15 border border-primary-foreground/20 text-center text-primary-foreground space-y-2 backdrop-blur-sm animate-in fade-in-50">
          <p className="font-semibold text-sm">
            {isSinhala ? 'සිසුන් හෝ සහතිකපත් හමු නොවීය (No matching records)' : 'No matching student or certificate found'}
          </p>
          <p className="text-xs text-primary-foreground/80 leading-relaxed max-w-md mx-auto">
            {isSinhala 
              ? 'කරුණාකර නිවැරදි ශිෂ්‍ය අංකය (උදා: PA24600 හෝ PA/24/600), සහතික අංකය (උදා: CREF4307) හෝ නම පරීක්ෂා කර නැවත උත්සාහ කරන්න.' 
              : 'Please verify your Student Index (e.g. PA24600 or PA/24/600), Certificate ID (e.g. CREF4307), or Name and try again.'}
          </p>
        </div>
      );
    }
    
    return (
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto animate-in fade-in-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left">
            <p className="text-xs font-semibold text-primary-foreground/85 px-1 text-left">
              {isSinhala ? `ගැලපෙන සිසුන් ${students.length} ක් හමුවිය:` : `Found ${students.length} matching record(s):`}
            </p>
            {students.map((student) => (
                <button 
                  key={student.id + student.username} 
                  onClick={() => onStudentSelect(student)} 
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-background text-foreground hover:bg-muted/95 transition-all shadow-md hover:shadow-lg group border border-border/80 text-left cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0 uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                        {student.name_on_certificate?.trim().charAt(0) || <User className="w-5 h-5 text-muted-foreground" />}
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
    );
};

// --- Enrollment List Component ---
const EnrollmentList = ({ 
  studentData, 
  isSinhala 
}: { 
  studentData: StudentFullData; 
  isSinhala: boolean;
}) => {
    const enrollments = Object.values(studentData.studentEnrollments || {});
    const studentUsername = studentData.studentInfo.username;

    return (
        <div className="mt-4 space-y-3 animate-in fade-in-50 text-left">
            <div className="p-3.5 rounded-xl bg-background/15 border border-primary-foreground/20 backdrop-blur-sm flex items-center justify-between text-left">
              <div className="text-left">
                <span className="text-[11px] font-mono text-primary-foreground/70 uppercase block text-left">
                  {isSinhala ? 'සත්‍යාපිත ශිෂ්‍යයා' : 'Verified Graduate'}
                </span>
                <h3 className="text-base sm:text-lg font-headline font-bold text-primary-foreground text-left">
                  {studentData.studentInfo.name_on_certificate || studentData.studentInfo.full_name}
                </h3>
                <p className="text-xs font-mono text-primary-foreground/85 text-left mt-0.5">
                  Student Index: {studentData.studentInfo.username}
                </p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified</span>
              </Badge>
            </div>

            <p className="text-xs font-semibold text-primary-foreground/90 pt-1 text-left px-1">
              {isSinhala ? 'ප්‍රතිඵල බැලීමට පාඨමාලාව තෝරන්න (Select Enrollment):' : 'Select Enrollment to View Result:'}
            </p>

            {enrollments.map((enrollment) => (
                <Link 
                  key={enrollment.id} 
                  href={`/result-view?CourseCode=${enrollment.course_code}&LoggedUser=${studentUsername}`} 
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-background text-foreground hover:bg-muted transition-all shadow-md hover:shadow-lg group text-left"
                >
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex-grow min-w-0 text-left">
                        <p className="font-headline font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate text-left">
                          {enrollment.parent_course_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono text-left mt-0.5">
                          {enrollment.batch_name} ({enrollment.course_code})
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
            ))}
        </div>
    );
};

// --- Certificate Details Component ---
const CertificateDetails = ({ studentData, enrollment }: { studentData: StudentFullData; enrollment: Enrollment; }) => {
    const { t, language } = useTranslation();
    const isSinhala = language === 'si';

    const getFinalGrade = () => {
        if (!enrollment.certificate_eligibility) return "Not Eligible";
        const averageGrade = parseFloat(enrollment.assignment_grades?.average_grade || "0");
        if (isNaN(averageGrade)) return "Result Not Submitted";
        if (averageGrade >= 90) return "A+";
        if (averageGrade >= 80) return "A";
        if (averageGrade >= 75) return "A-";
        if (averageGrade >= 70) return "B+";
        if (averageGrade >= 65) return "B";
        if (averageGrade >= 60) return "B-";
        if (averageGrade >= 55) return "C+";
        if (averageGrade >= 45) return "C";
        if (averageGrade >= 40) return "C-";
        if (averageGrade >= 35) return "D+";
        if (averageGrade >= 30) return "D";
        return "E";
    };

    const getRating = () => {
        if (!enrollment.certificate_eligibility) return 0;
        const averageGrade = parseFloat(enrollment.assignment_grades?.average_grade || "0");
        if (isNaN(averageGrade)) return 0;
        if (averageGrade >= 75) return 5;
        if (averageGrade >= 65) return 4;
        if (averageGrade >= 55) return 3;
        if (averageGrade >= 45) return 2;
        if (averageGrade >= 35) return 1;
        return 0;
    };
    
    const finalGrade = getFinalGrade();
    const rating = getRating();

    return (
        <Card className="mt-6 bg-background animate-in fade-in-50 text-left border border-border/80 shadow-2xl overflow-hidden rounded-2xl">
            <CardHeader className="bg-primary text-primary-foreground p-5 flex-row items-center gap-4">
                 <GraduationCap className="h-8 w-8 shrink-0" />
                <CardTitle className="font-headline text-xl sm:text-2xl">{t('certResultTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" />{t('studentInfo')}</h3>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('certStudentName')}</span>
                        <span className="font-semibold text-foreground">{studentData.studentInfo.name_on_certificate || studentData.studentInfo.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('certIndexNo')}</span>
                        <span className="font-semibold font-mono text-foreground">{studentData.studentInfo.username}</span>
                    </div>
                </div>
                 <div className="border-t pt-4 space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><Book className="h-5 w-5 text-primary" />{t('courseDetails')}</h3>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('certCourseName')}</span>
                        <span className="font-semibold text-right text-foreground">{enrollment.parent_course_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('certCourseCode')}</span>
                        <span className="font-semibold font-mono text-foreground">{enrollment.course_code}</span>
                    </div>
                </div>
                <div className="border-t pt-4">
                    <GradePaymentGate
                        isLocked={enrollment.is_grade_locked}
                        balance={enrollment.studentBalance}
                        gateSettings={enrollment.payment_gate?.settings || (studentData as any)?.paymentGateSettings}
                        courseCode={enrollment.course_code}
                        title="Result Withheld - Payment Pending"
                    >
                        <div className="space-y-4">
                            <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-primary" />{t('resultsTitle')}</h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t('certFinalGrade')}</span>
                                <span className="font-semibold text-foreground">{finalGrade}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t('certRating')}</span>
                                {rating > 0 ? (
                                    <StarRating rating={rating} />
                                ) : (
                                    <span className="font-semibold text-foreground">{t('certNoGrade')}</span>
                                )}
                            </div>
                        </div>
                    </GradePaymentGate>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Main Verifier Component ---
export default function CertificateVerifier() {
  const [query, setQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { t, language } = useTranslation();
  const isSinhala = language === 'si';

  const [view, setView] = useState<'search' | 'enrollments' | 'details'>('search');
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
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
      // Query Next.js internal search API with resilient multi-strategy resolution
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
          // fallback to LMS directly
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
        setView('enrollments');
    } catch (error: any) {
        console.error("Error fetching student details:", error);
        setDetailsError(error.message || 'Failed to fetch student details. Please try again.');
    } finally {
        setDetailsLoading(false);
    }
  };

  const handleEnrollmentSelect = (enrollment: Enrollment) => {
      setSelectedEnrollment(enrollment);
      setView('details');
  };
  
  const handleBack = () => {
      if (view === 'details') {
          setView('enrollments');
          setSelectedEnrollment(null);
      } else if (view === 'enrollments') {
          setView('search');
          setSelectedStudentData(null);
          setSelectedEnrollment(null);
      }
  };

  return (
    <section id="verify" className="bg-primary py-16 md:py-24 text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
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
            
            <h2 className={`text-3xl md:text-5xl font-headline font-bold ${isSinhala ? 'leading-[1.35]' : 'leading-tight'}`}>
                {t('certVerifierTitle')}
            </h2>
            <p className={`mt-4 text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto ${isSinhala ? 'leading-[1.75]' : 'leading-relaxed'}`}>
                {t('certVerifierSubtitle')}
            </p>

            <div className="mt-8 max-w-xl mx-auto relative">
              {(view === 'enrollments' || view === 'details') && (
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  className="absolute -top-10 left-0 text-primary-foreground hover:bg-primary-foreground/15 h-8 px-2 text-xs font-semibold gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5"/> 
                  <span>{isSinhala ? 'ආපසු (Back)' : 'Back'}</span>
                </Button>
              )}
                
              {view === 'search' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input 
                        name="certificateNumber" 
                        placeholder={isSinhala ? 'ශිෂ්‍ය අංකය (උදා: PA24600), සහතික අංකය හෝ නම' : 'Enter Student Index (e.g. PA24600), Cert ID or Name'} 
                        aria-label={t('certVerifierButton')}
                        className="h-14 w-full rounded-xl border-2 border-primary-foreground/50 bg-primary-foreground/95 pl-14 pr-14 text-base text-primary placeholder:text-primary/65 focus:border-primary-foreground focus:bg-primary-foreground focus:ring-2 focus:ring-primary-foreground/50 uppercase font-mono font-medium shadow-lg"
                        onChange={(e) => setQuery(e.target.value.toUpperCase())}
                        value={query}
                      />
                      <Search className="h-6 w-6 absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none" />
                      {searchLoading && <Loader2 className="h-6 w-6 absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 animate-spin" />}
                    </div>

                    {/* Example Search Hint */}
                    {!query && (
                      <p className="text-xs text-primary-foreground/85 pt-1 text-center font-body">
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
                  </div>
              )}
                
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
                
              {view === 'search' && query.trim().length >= 2 && !detailsLoading && (
                  <SearchResults 
                    students={filteredStudents} 
                    loading={searchLoading} 
                    onStudentSelect={handleStudentSelect}
                    isSinhala={isSinhala}
                  />
              )}
              
              {view === 'enrollments' && selectedStudentData && !detailsLoading && (
                  <EnrollmentList 
                    studentData={selectedStudentData} 
                    isSinhala={isSinhala}
                  />
              )}

              {view === 'details' && selectedStudentData && selectedEnrollment && !detailsLoading && (
                  <CertificateDetails studentData={selectedStudentData} enrollment={selectedEnrollment} />
              )}
            </div>

            <p className="mt-10 max-w-3xl mx-auto text-primary-foreground/80 text-xs sm:text-sm font-body leading-relaxed">
                {t('certVerifierDescription')}
            </p>
        </div>
    </section>
  );
}
