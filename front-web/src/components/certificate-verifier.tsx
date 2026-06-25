"use client";

import { LMS_API_URL } from "@/lib/config";

import { useState, useEffect, useCallback } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Search, User, ChevronRight, Loader2, ArrowLeft, GraduationCap, UserCheck, Book, Award } from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import debounce from 'lodash.debounce';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import StarRating from "./star-rating";

// --- API Response Interfaces ---

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
    studentEnrollments: {
        [key: string]: Enrollment;
    };
}


// --- Search Results Component ---

const SearchResults = ({ students, loading, onStudentSelect }: { students: StudentSearchResult[]; loading: boolean; onStudentSelect: (student: StudentSearchResult) => void; }) => {
    if (loading) {
      return (
        <div className="mt-4 text-center text-primary-foreground/80">
          <p>Loading...</p>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <div className="mt-4 text-center text-primary-foreground/80">
          <p>No students found.</p>
        </div>
      );
    }
    
    return (
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto animate-in fade-in-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {students.map((student) => (
                <button key={student.id} onClick={() => onStudentSelect(student)} className="w-full flex items-center gap-4 p-3 rounded-lg bg-background text-foreground hover:bg-muted transition-colors text-left">
                    <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage src={`https://placehold.co/100x100.png`} alt={student.name_on_certificate} />
                        <AvatarFallback>
                            <User className="text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow flex items-center gap-4">
                        <p className="font-bold w-24">{student.username}</p>
                        <div className="w-px h-6 bg-border"></div>
                        <p className="font-bold">{student.name_on_certificate}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
            ))}
        </div>
    );
};


// --- Enrollment List Component ---
const EnrollmentList = ({ studentData }: { studentData: StudentFullData; }) => {
    const enrollments = Object.values(studentData.studentEnrollments);
    const studentUsername = studentData.studentInfo.username;

    return (
        <div className="mt-4 space-y-3 animate-in fade-in-50">
            <h3 className="text-center text-lg font-semibold text-primary-foreground">Select an Enrollment for {studentData.studentInfo.name_on_certificate}</h3>
            {enrollments.map((enrollment) => (
                <Link key={enrollment.id} href={`/result-view?CourseCode=${enrollment.course_code}&LoggedUser=${studentUsername}`} className="w-full flex items-center gap-4 p-3 rounded-lg bg-background text-foreground hover:bg-muted transition-colors text-left">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-bold">{enrollment.parent_course_name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.batch_name} ({enrollment.course_code})</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
            ))}
        </div>
    );
}

// --- Certificate Details Component ---
const CertificateDetails = ({ studentData, enrollment }: { studentData: StudentFullData; enrollment: Enrollment; }) => {
    const { t } = useTranslation();

    const getFinalGrade = () => {
        if (!enrollment.certificate_eligibility) return "Not Eligible";
        const averageGrade = parseFloat(enrollment.assignment_grades.average_grade);
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
        const averageGrade = parseFloat(enrollment.assignment_grades.average_grade);
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
        <Card className="mt-6 bg-background animate-in fade-in-50">
            <CardHeader className="bg-primary text-primary-foreground p-4 flex-row items-center gap-4">
                 <GraduationCap className="h-8 w-8" />
                <CardTitle className="font-headline text-2xl">{t('certResultTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" />{t('studentInfo')}</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('certStudentName')}</span>
                        <span className="font-semibold">{studentData.studentInfo.name_on_certificate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('certIndexNo')}</span>
                        <span className="font-semibold">{studentData.studentInfo.username}</span>
                    </div>
                </div>
                 <div className="border-t pt-4 space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><Book className="h-5 w-5 text-primary" />{t('courseDetails')}</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('certCourseName')}</span>
                        <span className="font-semibold text-right">{enrollment.parent_course_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('certCourseCode')}</span>
                        <span className="font-semibold">{enrollment.course_code}</span>
                    </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-primary" />{t('resultsTitle')}</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('certFinalGrade')}</span>
                        <span className="font-semibold">{finalGrade}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('certRating')}</span>
                        {rating > 0 ? (
                            <StarRating rating={rating} />
                        ) : (
                            <span className="font-semibold">{t('certNoGrade')}</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


// --- Main Verifier Component ---
export default function CertificateVerifier() {
  const [query, setQuery] = useState('');
  const [allStudents, setAllStudents] = useState<StudentSearchResult[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const [view, setView] = useState<'search' | 'enrollments' | 'details'>('search');
  const [selectedStudentData, setSelectedStudentData] = useState<StudentFullData | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    async function fetchAllStudents() {
        try {
            const response = await fetch(`${LMS_API_URL}/userFullDetails`);
            const data: StudentSearchResult[] = await response.json();
            setAllStudents(data);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchAllStudents();
  }, []);

  const filterStudents = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setFilteredStudents([]);
      return;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results: StudentSearchResult[] = [];
    const reversedStudents = [...allStudents].reverse();

    for (const student of reversedStudents) {
        if (results.length >= 10) {
            break;
        }
        const nameOnCert = (student.name_on_certificate || '').toLowerCase();
        const username = (student.username || '').toLowerCase();

        if (nameOnCert.includes(lowerCaseQuery) || username.includes(lowerCaseQuery)) {
            results.push(student);
        }
    }
    setFilteredStudents(results);
  }, [allStudents]);
  
  const debouncedFilterStudents = useCallback(debounce(filterStudents, 300), [filterStudents]);

  useEffect(() => {
    debouncedFilterStudents(query);
    return () => {
      debouncedFilterStudents.cancel();
    };
  }, [query, debouncedFilterStudents]);

  const handleStudentSelect = async (student: StudentSearchResult) => {
    try {
        setDetailsLoading(true);
        const response = await fetch(`${LMS_API_URL}/get-student-full-info?loggedUser=${student.username}`);
        if (!response.ok) {
            throw new Error('Student not found');
        }
        const data: StudentFullData = await response.json();
        setSelectedStudentData(data);
        setView('enrollments');
    } catch (error) {
        console.error("Error fetching student details:", error);
        // Handle error display here
    } finally {
        setDetailsLoading(false);
    }
  };

  const handleEnrollmentSelect = (enrollment: Enrollment) => {
      setSelectedEnrollment(enrollment);
      setView('details');
  };
  
  const handleBack = () => {
      if (view === 'details' || view === 'enrollments') {
          setView('search');
          setQuery('');
          setFilteredStudents([]);
          setSelectedStudentData(null);
          setSelectedEnrollment(null);
      }
  }


  return (
    <section id="verify" className="bg-primary py-16 md:py-24 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
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
            <h2 className="text-4xl md:text-5xl font-headline font-bold">
                {t('certVerifierTitle')}
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                {t('certVerifierSubtitle')}
            </p>

            <div className="mt-8 max-w-xl mx-auto relative">
              {(view === 'enrollments' || view === 'details') && (
                <Button variant="ghost" onClick={handleBack} className="absolute -top-8 left-0 text-primary-foreground hover:bg-primary-foreground/10">
                  <ArrowLeft className="mr-2 h-4 w-4"/> Back
                </Button>
              )}
                
                {view === 'search' && (
                    <div className="relative">
                      <Input 
                        name="certificateNumber" 
                        placeholder={t('certVerifierInputPlaceholder')} 
                        aria-label={t('certVerifierButton')}
                        className="h-14 w-full rounded-lg border-2 border-primary-foreground/50 bg-primary-foreground/90 pl-14 pr-14 text-base text-primary placeholder:text-primary/70 focus:border-primary-foreground focus:bg-primary-foreground focus:ring-2 focus:ring-primary-foreground/50 uppercase"
                        onChange={(e) => setQuery(e.target.value.toUpperCase())}
                        value={query}
                        disabled={loading}
                      />
                      <Search className="h-6 w-6 absolute left-5 top-1/2 -translate-y-1/2 text-primary/70" />
                      {loading && <Loader2 className="h-6 w-6 absolute right-5 top-1/2 -translate-y-1/2 text-primary/70 animate-spin" />}
                    </div>
                )}
                
                {detailsLoading && (
                    <div className="mt-4 flex justify-center items-center gap-2 text-primary-foreground/80">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p>Loading student details...</p>
                    </div>
                )}
                
                {view === 'search' && query && !detailsLoading && <SearchResults students={filteredStudents} loading={false} onStudentSelect={handleStudentSelect} />}
                
                {view === 'enrollments' && selectedStudentData && !detailsLoading && (
                    <EnrollmentList studentData={selectedStudentData} />
                )}

                {view === 'details' && selectedStudentData && selectedEnrollment && !detailsLoading && (
                    <CertificateDetails studentData={selectedStudentData} enrollment={selectedEnrollment} />
                )}
            </div>

            <p className="mt-8 max-w-3xl mx-auto text-primary-foreground/80 text-sm font-body leading-relaxed">
                {t('certVerifierDescription')}
            </p>
        </div>
    </section>
  );
}
