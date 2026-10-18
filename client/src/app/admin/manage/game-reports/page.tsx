"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getParentCourses, getBatches } from '@/lib/actions/courses';
import { 
    getWinPharmaReport, 
    getDpadReport, 
    getQuizReport,
    getPharmaHunterReport,
    getPharmaHunterProReport,
    getCourseAssignmentReport,
    getCeylonPharmacyReport,
    getPharmaReaderReport,
    getAssignmentReport,
    saveAssignmentGradeAction,
    WinPharmaReportResponse, 
    DpadReportResponse,
    QuizReportResponse,
    QuizReportTopic,
    QuizReportStudent,
    PharmaHunterReportResponse,
    PharmaHunterStudentRow,
    CourseAssignmentReportResponse,
    CourseAssignmentStudentRow,
    CourseAssignmentItem,
    CeylonPharmacyReportResponse,
    CeylonPharmacyStudentRow,
    PharmaReaderReportResponse,
    PharmaReaderStudentRow,
    AssignmentReportResponse,
    AssignmentStudentRow,
    AssignmentItem,
} from '@/lib/actions/reports';
import type { ParentCourse, Batch } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { WinPharmaIcon, DPadIcon } from "@/components/icons/module-icons";
import { 
    ArrowLeft, 
    Search, 
    FileText, 
    FileSpreadsheet,
    Printer, 
    Loader2, 
    Users, 
    AlertCircle, 
    Award,
    TrendingUp,
    Gamepad2,
    BookOpen,
    ClipboardList,
    X,
    Eye,
    CheckCircle2,
    HelpCircle,
    Trophy,
    Sparkles,
    PenSquare,
    Crosshair,
    HeartPulse,
    ScanText,
    RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type GameReportType = 
    | 'winpharma' 
    | 'quiz' 
    | 'dpad' 
    | 'hunter' 
    | 'hunter_pro' 
    | 'course_assignment' 
    | 'ceylon_pharmacy' 
    | 'pharma_reader' 
    | 'assignment';

interface GradingCellProps {
    assignmentId: string;
    studentNumber: string;
    currentGrade: string;
    isSaving: boolean;
    onSave: (asgnId: string, stuNum: string, grade: string) => void;
}

function GradingCell({
    assignmentId,
    studentNumber,
    currentGrade,
    isSaving,
    onSave
}: GradingCellProps) {
    const [value, setValue] = useState(currentGrade);

    useEffect(() => {
        setValue(currentGrade);
    }, [currentGrade]);

    const handleBlur = () => {
        if (value.trim() !== currentGrade.trim()) {
            onSave(assignmentId, studentNumber, value.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className="relative flex items-center justify-center">
            <Input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="-"
                disabled={isSaving}
                className={`h-8 w-20 text-center font-mono text-xs font-semibold rounded-lg transition-all ${
                    value.trim() !== ''
                        ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200' 
                        : 'border-muted-foreground/30'
                } focus-visible:ring-primary focus-visible:border-primary`}
            />
            {isSaving && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}

function GameReportsContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Query parameters from URL (Dynamic Routing)
    const selectedBatchCode = searchParams.get('batch') || '';
    const selectedGame = (searchParams.get('game') || 'winpharma') as GameReportType;

    // State for filtering
    const [selectedParentCourseId, setSelectedParentCourseId] = useState<string>('ALL');
    const [batchSearchTerm, setBatchSearchTerm] = useState<string>('');
    const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');

    // State for Grading Modal (Edit Grading & View Grading)
    const [gradingModalOpen, setGradingModalOpen] = useState<boolean>(false);
    const [gradingModalMode, setGradingModalMode] = useState<'edit' | 'view'>('view');
    const [gradingBatchCode, setGradingBatchCode] = useState<string | null>(null);
    const [gradingSearchTerm, setGradingSearchTerm] = useState<string>('');
    const [isSavingGrade, setIsSavingGrade] = useState<string | null>(null);

    // URL Navigation Handlers
    const openBatchReport = (batchCode: string, game: GameReportType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('batch', batchCode);
        params.set('game', game);
        router.push(`${pathname}?${params.toString()}`);
        setStudentSearchTerm('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const handleBackToBatches = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('batch');
        params.delete('game');
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
        setStudentSearchTerm('');
    };

    // Load parent courses and batches
    const { data: parentCourses, isLoading: isLoadingParentCourses } = useQuery<ParentCourse[]>({
        queryKey: ['parentCoursesForGameReports'],
        queryFn: getParentCourses,
        staleTime: Infinity,
    });

    const { data: allBatches, isLoading: isLoadingBatches } = useQuery<Batch[]>({
        queryKey: ['allBatchesForGameReports'],
        queryFn: getBatches,
        staleTime: Infinity,
    });

    // Helper to resolve category name for a batch
    const getCategoryNameForBatch = (b: Batch) => {
        if (b.parent_course_id && parentCourses) {
            const found = parentCourses.find(pc => String(pc.id) === String(b.parent_course_id));
            if (found) return found.course_name;
        }
        if (b.name && parentCourses) {
            const lower = b.name.toLowerCase();
            for (const pc of parentCourses) {
                if (lower.includes(pc.course_name.toLowerCase())) {
                    return pc.course_name;
                }
            }
        }
        return 'General Course';
    };

    // Batches count per parent course (with smart name matching)
    const batchCountsByCourse = useMemo(() => {
        const counts: Record<string, number> = {};
        allBatches?.forEach(b => {
            let pid = String(b.parent_course_id || '');
            if (!pid && b.name && parentCourses) {
                const lower = b.name.toLowerCase();
                for (const pc of parentCourses) {
                    if (lower.includes(pc.course_name.toLowerCase())) {
                        pid = String(pc.id);
                        break;
                    }
                }
            }
            if (pid) {
                counts[pid] = (counts[pid] || 0) + 1;
            }
        });
        return counts;
    }, [allBatches, parentCourses]);

    // Filtered Batches for the Batches List view (Sorted newest first)
    const filteredBatches = useMemo(() => {
        if (!allBatches) return [];
        let list = [...allBatches];

        // Sort descending so newest batches (CPCC36, CPCC35, CPCC34...) appear first
        list.sort((a, b) => {
            const numA = parseInt((a.courseCode || '').replace(/\D/g, ''), 10) || 0;
            const numB = parseInt((b.courseCode || '').replace(/\D/g, ''), 10) || 0;
            if (numB !== numA) return numB - numA;
            return (Number(b.id) || 0) - (Number(a.id) || 0);
        });

        // Filter by course category if not ALL (matches ID or course name)
        if (selectedParentCourseId !== 'ALL') {
            const activeParent = parentCourses?.find(pc => String(pc.id) === String(selectedParentCourseId));
            const activeCourseName = activeParent?.course_name?.toLowerCase() || '';

            list = list.filter(b => {
                const matchesId = String(b.parent_course_id || '') === String(selectedParentCourseId);
                const matchesName = activeCourseName && b.name?.toLowerCase().includes(activeCourseName);
                return matchesId || matchesName;
            });
        }

        // Filter by search term
        if (batchSearchTerm.trim()) {
            const term = batchSearchTerm.toLowerCase().trim();
            list = list.filter(b => 
                (b.courseCode && b.courseCode.toLowerCase().includes(term)) ||
                (b.name && b.name.toLowerCase().includes(term))
            );
        }

        return list;
    }, [allBatches, parentCourses, selectedParentCourseId, batchSearchTerm]);

    // WinPharma Report Query (when batch is selected)
    const { 
        data: winpharmaData, 
        isLoading: isLoadingWinpharma, 
        error: winpharmaError 
    } = useQuery<WinPharmaReportResponse>({
        queryKey: ['winpharmaReport', selectedBatchCode],
        queryFn: () => getWinPharmaReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'winpharma',
    });

    // D-Pad Report Query (when batch is selected)
    const { 
        data: dpadData, 
        isLoading: isLoadingDpad, 
        error: dpadError 
    } = useQuery<DpadReportResponse>({
        queryKey: ['dpadReport', selectedBatchCode],
        queryFn: () => getDpadReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'dpad',
    });

    // Quiz Report Query (when batch is selected)
    const { 
        data: quizData, 
        isLoading: isLoadingQuiz, 
        error: quizError 
    } = useQuery<QuizReportResponse>({
        queryKey: ['quizReport', selectedBatchCode],
        queryFn: () => getQuizReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'quiz',
    });

    // Pharma Hunter Report Query (when batch is selected)
    const { 
        data: hunterData, 
        isLoading: isLoadingHunter, 
        error: hunterError 
    } = useQuery<PharmaHunterReportResponse>({
        queryKey: ['hunterReport', selectedBatchCode],
        queryFn: () => getPharmaHunterReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'hunter',
    });

    // Pharma Hunter Pro Report Query (when batch is selected)
    const { 
        data: hunterProData, 
        isLoading: isLoadingHunterPro, 
        error: hunterProError 
    } = useQuery<PharmaHunterReportResponse>({
        queryKey: ['hunterProReport', selectedBatchCode],
        queryFn: () => getPharmaHunterProReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'hunter_pro',
    });

    // Course Assignment Report Query (when batch is selected)
    const { 
        data: courseAssignmentData, 
        isLoading: isLoadingCourseAssignment, 
        error: courseAssignmentError 
    } = useQuery<CourseAssignmentReportResponse>({
        queryKey: ['courseAssignmentReport', selectedBatchCode],
        queryFn: () => getCourseAssignmentReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'course_assignment',
    });

    // Ceylon Pharmacy Report Query (when batch is selected)
    const { 
        data: ceylonPharmacyData, 
        isLoading: isLoadingCeylonPharmacy, 
        error: ceylonPharmacyError 
    } = useQuery<CeylonPharmacyReportResponse>({
        queryKey: ['ceylonPharmacyReport', selectedBatchCode],
        queryFn: () => getCeylonPharmacyReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'ceylon_pharmacy',
    });

    // Pharma Reader Report Query (when batch is selected)
    const { 
        data: pharmaReaderData, 
        isLoading: isLoadingPharmaReader, 
        error: pharmaReaderError 
    } = useQuery<PharmaReaderReportResponse>({
        queryKey: ['pharmaReaderReport', selectedBatchCode],
        queryFn: () => getPharmaReaderReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'pharma_reader',
    });

    // Assignment Report Query (when batch is selected)
    const { 
        data: assignmentData, 
        isLoading: isLoadingAssignment, 
        error: assignmentError 
    } = useQuery<AssignmentReportResponse>({
        queryKey: ['assignmentReport', selectedBatchCode],
        queryFn: () => getAssignmentReport(selectedBatchCode),
        enabled: !!selectedBatchCode && selectedGame === 'assignment',
    });

    // Query for Grading Modal (when opened)
    const {
        data: gradingBatchData,
        isLoading: isLoadingGradingData,
        refetch: refetchGradingData,
    } = useQuery<AssignmentReportResponse>({
        queryKey: ['gradingReport', gradingBatchCode],
        queryFn: () => getAssignmentReport(gradingBatchCode || ''),
        enabled: !!gradingBatchCode && gradingModalOpen,
    });

    // Active batch details
    const activeBatchInfo = useMemo(() => {
        if (!selectedBatchCode || !allBatches) return null;
        return allBatches.find(b => b.courseCode === selectedBatchCode) || null;
    }, [selectedBatchCode, allBatches]);

    // Filtered students for WinPharma
    const filteredWinpharmaStudents = useMemo(() => {
        if (!winpharmaData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return winpharmaData.students;
        return winpharmaData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [winpharmaData, studentSearchTerm]);

    // Filtered students for D-Pad
    const filteredDpadStudents = useMemo(() => {
        if (!dpadData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return dpadData.students;
        return dpadData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [dpadData, studentSearchTerm]);

    // Filtered students for Quiz
    const filteredQuizStudents = useMemo(() => {
        if (!quizData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return quizData.students;
        return quizData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [quizData, studentSearchTerm]);

    // Filtered students for Pharma Hunter
    const filteredHunterStudents = useMemo(() => {
        if (!hunterData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return hunterData.students;
        return hunterData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [hunterData, studentSearchTerm]);

    // Filtered students for Pharma Hunter Pro
    const filteredHunterProStudents = useMemo(() => {
        if (!hunterProData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return hunterProData.students;
        return hunterProData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [hunterProData, studentSearchTerm]);

    // Filtered students for Course Assignment
    const filteredCourseAssignmentStudents = useMemo(() => {
        if (!courseAssignmentData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return courseAssignmentData.students;
        return courseAssignmentData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [courseAssignmentData, studentSearchTerm]);

    // Filtered students for Ceylon Pharmacy
    const filteredCeylonPharmacyStudents = useMemo(() => {
        if (!ceylonPharmacyData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return ceylonPharmacyData.students;
        return ceylonPharmacyData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [ceylonPharmacyData, studentSearchTerm]);

    // Filtered students for Pharma Reader
    const filteredPharmaReaderStudents = useMemo(() => {
        if (!pharmaReaderData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return pharmaReaderData.students;
        return pharmaReaderData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [pharmaReaderData, studentSearchTerm]);

    // Filtered students for Assignment Report
    const filteredAssignmentStudents = useMemo(() => {
        if (!assignmentData?.students) return [];
        const term = studentSearchTerm.toLowerCase().trim();
        if (!term) return assignmentData.students;
        return assignmentData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [assignmentData, studentSearchTerm]);

    // Filtered students for Grading Modal
    const filteredGradingStudents = useMemo(() => {
        if (!gradingBatchData?.students) return [];
        const term = gradingSearchTerm.toLowerCase().trim();
        if (!term) return gradingBatchData.students;
        return gradingBatchData.students.filter(s => 
            s.index_number.toLowerCase().includes(term) ||
            s.student_name.toLowerCase().includes(term)
        );
    }, [gradingBatchData, gradingSearchTerm]);

    // Stats calculations
    const stats = useMemo(() => {
        if (selectedGame === 'winpharma' && winpharmaData) {
            const total = winpharmaData.students.length;
            const avg = total > 0 
                ? (winpharmaData.students.reduce((acc, s) => acc + s.percentage, 0) / total).toFixed(1) 
                : '0.0';
            const completedCount = winpharmaData.students.filter(s => s.percentage >= 100).length;
            return {
                totalStudents: total,
                avgScore: `${avg}%`,
                completedCount,
                subMetricLabel: 'Full Completion (100%)',
                subMetricValue: completedCount,
                metricCount: winpharmaData.levels?.length || 0,
                metricLabel: 'Levels'
            };
        } else if (selectedGame === 'dpad' && dpadData) {
            const total = dpadData.students.length;
            const avg = total > 0 
                ? (dpadData.students.reduce((acc, s) => acc + s.overall_grade, 0) / total).toFixed(1) 
                : '0.0';
            const passingCount = dpadData.students.filter(s => s.overall_grade >= 50).length;
            return {
                totalStudents: total,
                avgScore: `${avg}%`,
                completedCount: passingCount,
                subMetricLabel: 'Passed (>= 50%)',
                subMetricValue: passingCount,
                metricCount: dpadData.prescription_count || 0,
                metricLabel: 'Prescriptions'
            };
        } else if (selectedGame === 'quiz' && quizData) {
            const total = quizData.students.length;
            const avg = total > 0 
                ? (quizData.students.reduce((acc, s) => acc + s.overall_grade, 0) / total).toFixed(1) 
                : '0.0';
            const passingCount = quizData.students.filter(s => s.overall_grade >= 50).length;
            const totalQuestions = quizData.topics.reduce((acc, t) => acc + (t.question_count || 0), 0);
            return {
                totalStudents: total,
                avgScore: `${avg}%`,
                completedCount: passingCount,
                subMetricLabel: 'Passed (>= 50%)',
                subMetricValue: passingCount,
                metricCount: quizData.topics.length,
                metricLabel: `Topics (${totalQuestions} Qs)`
            };
        } else if (selectedGame === 'hunter' && hunterData) {
            const total = hunterData.students.length;
            const totalGems = hunterData.students.reduce((acc, s) => acc + s.gem_count, 0);
            const totalCoins = hunterData.students.reduce((acc, s) => acc + s.coin_count, 0);
            const totalCorrect = hunterData.students.reduce((acc, s) => acc + s.correct_count, 0);
            const avg = total > 0 ? (totalCorrect / total).toFixed(1) : '0.0';
            return {
                totalStudents: total,
                avgScore: `${avg} / student`,
                completedCount: totalGems,
                subMetricLabel: 'Gems Collected',
                subMetricValue: `${totalGems} Gems (${totalCoins} Coins)`,
                metricCount: hunterData.medicine_count || 0,
                metricLabel: 'Active Medicines'
            };
        } else if (selectedGame === 'hunter_pro' && hunterProData) {
            const total = hunterProData.students.length;
            const totalGems = hunterProData.students.reduce((acc, s) => acc + s.gem_count, 0);
            const totalCoins = hunterProData.students.reduce((acc, s) => acc + s.coin_count, 0);
            const totalCorrect = hunterProData.students.reduce((acc, s) => acc + s.correct_count, 0);
            const avg = total > 0 ? (totalCorrect / total).toFixed(1) : '0.0';
            return {
                totalStudents: total,
                avgScore: `${avg} / student`,
                completedCount: totalGems,
                subMetricLabel: 'Gems Collected',
                subMetricValue: `${totalGems} Gems (${totalCoins} Coins)`,
                metricCount: hunterProData.medicine_count || 0,
                metricLabel: 'Course Medicines'
            };
        } else if (selectedGame === 'course_assignment' && courseAssignmentData) {
            const total = courseAssignmentData.students.length;
            const totalSubmissions = courseAssignmentData.students.reduce((acc, s) => acc + s.submitted_count, 0);
            const totalGraded = courseAssignmentData.students.reduce((acc, s) => acc + s.graded_count, 0);
            const assignmentCount = courseAssignmentData.assignments.length;
            return {
                totalStudents: total,
                avgScore: `${totalSubmissions} Submitted`,
                completedCount: totalGraded,
                subMetricLabel: 'Graded Submissions',
                subMetricValue: `${totalGraded} Graded`,
                metricCount: assignmentCount,
                metricLabel: 'Course Assignments'
            };
        } else if (selectedGame === 'ceylon_pharmacy' && ceylonPharmacyData) {
            const total = ceylonPharmacyData.students.length;
            const totalRecovered = ceylonPharmacyData.students.reduce((acc, s) => acc + s.recovered_count, 0);
            const totalDied = ceylonPharmacyData.students.reduce((acc, s) => acc + s.died_count, 0);
            return {
                totalStudents: total,
                avgScore: `${totalRecovered} Recovered`,
                completedCount: totalRecovered,
                subMetricLabel: 'Died Cases',
                subMetricValue: `${totalDied} Died`,
                metricCount: ceylonPharmacyData.total_patients || 0,
                metricLabel: 'Patients'
            };
        } else if (selectedGame === 'pharma_reader' && pharmaReaderData) {
            const total = pharmaReaderData.students.length;
            const totalReads = pharmaReaderData.students.reduce((acc, s) => acc + s.read_count, 0);
            const totalCorrect = pharmaReaderData.students.reduce((acc, s) => acc + s.correct_count, 0);
            return {
                totalStudents: total,
                avgScore: `${totalReads} Total Reads`,
                completedCount: totalCorrect,
                subMetricLabel: 'Correct Reads',
                subMetricValue: `${totalCorrect} Correct`,
                metricCount: pharmaReaderData.total_prescriptions || 0,
                metricLabel: 'Prescriptions'
            };
        } else if (selectedGame === 'assignment' && assignmentData) {
            const total = assignmentData.students.length;
            const totalSubmissions = assignmentData.students.reduce((acc, s) => acc + s.submitted_count, 0);
            const totalGraded = assignmentData.students.reduce((acc, s) => acc + s.graded_count, 0);
            const assignmentCount = assignmentData.assignments.length;
            return {
                totalStudents: total,
                avgScore: `${totalSubmissions} Submitted`,
                completedCount: totalGraded,
                subMetricLabel: 'Graded Submissions',
                subMetricValue: `${totalGraded} Graded`,
                metricCount: assignmentCount,
                metricLabel: 'Assignments'
            };
        }
        return null;
    }, [selectedGame, winpharmaData, dpadData, quizData, hunterData, hunterProData, courseAssignmentData, ceylonPharmacyData, pharmaReaderData, assignmentData]);


    // ─────────────────────────────────────────────────────────────────────────────
    // PROFESSIONAL EXCEL (.xlsx) EXPORT USING SHEETJS
    // Fixes the issue where Excel auto-converts "1/20" into dates like "20-Jan"
    // ─────────────────────────────────────────────────────────────────────────────
    const handleExportExcel = () => {
        if (!selectedBatchCode) return;

        if (selectedGame === 'winpharma') {
            if (!winpharmaData?.students?.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const levels = winpharmaData.levels || [];
            
            // Build Worksheet Data with Title Banner & Metadata
            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                ['WINPHARMA ASSESSMENT EVALUATION REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${winpharmaData.students.length}`, `Average Score: ${stats?.avgScore || '0%'}`],
                [], // Empty row separator
                [
                    'Index No',
                    'Student Name',
                    'Last Completed Level',
                    ...levels.map(l => `${l.level_name} (${l.task_count || 0})`),
                    'Total Completed',
                    'Total Tasks',
                    'Percentage (%)'
                ]
            ];

            filteredWinpharmaStudents.forEach(stu => {
                const row: (string | number)[] = [
                    stu.index_number,
                    stu.student_name || '-',
                    stu.last_completed_level || '-',
                    ...levels.map(l => {
                        const score = stu.level_scores[l.level_id];
                        const comp = score ? score.completed : 0;
                        const tot = score ? score.total : 0;
                        return `${comp}/${tot}`;
                    }),
                    stu.total_completed,
                    stu.total_tasks,
                    `${stu.percentage.toFixed(1)}%`
                ];
                wsData.push(row);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Force Level score cells to strict STRING type 's' with explicit text format '@'
            // This guarantees Excel NEVER parses "1/20" as "20-Jan"!
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = 5; R <= range.e.r; ++R) {
                for (let C = 3; C < 3 + levels.length; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cellAddress]) {
                        ws[cellAddress].t = 's'; // Force STRING data type
                        ws[cellAddress].z = '@'; // Explicit text number-format
                    }
                }
            }

            // Auto-fit column widths
            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 12) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'WinPharma Report');
            XLSX.writeFile(wb, `WinPharma_Report_${selectedBatchCode}.xlsx`);

            toast({ title: 'Excel Export Successful', description: `WinPharma_Report_${selectedBatchCode}.xlsx downloaded.` });
        } else if (selectedGame === 'quiz') {
            // Quiz Assessment Report Excel
            if (!quizData?.students?.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const topics = quizData.topics || [];

            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                ['QUIZ ASSESSMENT EVALUATION REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${quizData.students.length}`, `Average Score: ${stats?.avgScore || '0%'}`],
                [], // Empty row separator
                [
                    'Index No',
                    'Student Name',
                    ...topics.map(t => `${t.topic_name} (${t.question_count} Qs)`),
                    'Overall Score (%)'
                ]
            ];

            filteredQuizStudents.forEach(stu => {
                wsData.push([
                    stu.index_number,
                    stu.student_name || '-',
                    ...topics.map(t => {
                        const sc = stu.topic_scores[t.topic_id];
                        return typeof sc === 'number' ? `${sc.toFixed(2)}%` : '0.00%';
                    }),
                    `${stu.overall_grade.toFixed(2)}%`
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Force percentage cells to string type 's'
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = 5; R <= range.e.r; ++R) {
                for (let C = 2; C <= range.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cellAddress]) {
                        ws[cellAddress].t = 's';
                        ws[cellAddress].z = '@';
                    }
                }
            }

            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 14) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Quiz Report');
            XLSX.writeFile(wb, `Quiz_Assessment_Report_${selectedBatchCode}.xlsx`);

            toast({ title: 'Excel Export Successful', description: `Quiz_Assessment_Report_${selectedBatchCode}.xlsx downloaded.` });
        } else if (selectedGame === 'dpad') {
            // D-Pad Report Excel
            if (!dpadData?.students?.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                ['D-PAD ASSESSMENT EVALUATION REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${dpadData.students.length}`, `Average Grade: ${stats?.avgScore || '0%'}`],
                [], // Empty row separator
                [
                    'Index No',
                    'Student Name',
                    'Correct Answers (+10)',
                    'Incorrect Answers (-1)',
                    'D-Pad Grade (%)'
                ]
            ];

            filteredDpadStudents.forEach(stu => {
                wsData.push([
                    stu.index_number,
                    stu.student_name || '-',
                    stu.correct_count,
                    stu.incorrect_count,
                    `${stu.overall_grade.toFixed(2)}%`
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 14) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'D-Pad Report');
            XLSX.writeFile(wb, `DPad_Report_${selectedBatchCode}.xlsx`);

            toast({ title: 'Excel Export Successful', description: `DPad_Report_${selectedBatchCode}.xlsx downloaded.` });
        } else if (selectedGame === 'hunter' || selectedGame === 'hunter_pro') {
            const isHunter = selectedGame === 'hunter';
            const repStudents = isHunter ? filteredHunterStudents : filteredHunterProStudents;

            if (!repStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                [isHunter ? 'PHARMA HUNTER ASSESSMENT REPORT' : 'PHARMA HUNTER PRO ASSESSMENT REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${repStudents.length}`],
                [],
                [
                    'Index No',
                    'Student Name',
                    'Correct',
                    'Pending',
                    'Wrong',
                    'Gem',
                    'Coin'
                ]
            ];

            repStudents.forEach(stu => {
                wsData.push([
                    stu.index_number,
                    stu.student_name || '-',
                    stu.correct_count,
                    stu.pending_count,
                    stu.wrong_count,
                    stu.gem_count,
                    stu.coin_count
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = 5; R <= range.e.r; ++R) {
                const indexCell = XLSX.utils.encode_cell({ r: R, c: 0 });
                if (ws[indexCell]) {
                    ws[indexCell].t = 's';
                    ws[indexCell].z = '@';
                }
            }

            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 14) };
            });
            ws['!cols'] = colWidths;

            const fileName = isHunter ? `Pharma_Hunter_Report_${selectedBatchCode}.xlsx` : `Pharma_Hunter_Pro_Report_${selectedBatchCode}.xlsx`;
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, isHunter ? 'Pharma Hunter' : 'Pharma Hunter Pro');
            XLSX.writeFile(wb, fileName);

            toast({ title: 'Excel Export Successful', description: `${fileName} downloaded.` });
        } else if (selectedGame === 'course_assignment' && courseAssignmentData) {
            if (!filteredCourseAssignmentStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const assignments = courseAssignmentData.assignments || [];

            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                ['COURSE ASSIGNMENT EVALUATION REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${courseAssignmentData.students.length}`, `Total Assignments: ${assignments.length}`],
                [],
                [
                    'Index No',
                    'Student Name',
                    ...assignments.map(a => a.assignment_name),
                    'Submitted Count',
                    'Graded Count'
                ]
            ];

            filteredCourseAssignmentStudents.forEach(stu => {
                const row: (string | number)[] = [
                    stu.index_number,
                    stu.student_name || '-',
                    ...assignments.map(a => {
                        const gradeInfo = stu.assignment_grades[a.id];
                        return gradeInfo ? gradeInfo.grade : 'Not Submitted';
                    }),
                    stu.submitted_count,
                    stu.graded_count
                ];
                wsData.push(row);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Format string cells to avoid date auto-formatting
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = 5; R <= range.e.r; ++R) {
                for (let C = 0; C < 2 + assignments.length; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cellAddress]) {
                        ws[cellAddress].t = 's';
                        ws[cellAddress].z = '@';
                    }
                }
            }

            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 14) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Course Assignments');
            XLSX.writeFile(wb, `Course_Assignment_Report_${selectedBatchCode}.xlsx`);

            toast({ title: 'Excel Export Successful', description: `Course_Assignment_Report_${selectedBatchCode}.xlsx downloaded.` });
        } else if (selectedGame === 'ceylon_pharmacy' && ceylonPharmacyData) {
            if (!filteredCeylonPharmacyStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                ['CEYLON PHARMACY ASSESSMENT REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${ceylonPharmacyData.students.length}`, `Total Patients: ${ceylonPharmacyData.total_patients}`],
                [],
                [
                    'Index No',
                    'Student Name',
                    'Recovered',
                    'Died',
                    'Pending'
                ]
            ];

            filteredCeylonPharmacyStudents.forEach(stu => {
                wsData.push([
                    stu.index_number,
                    stu.student_name || '-',
                    stu.recovered_count,
                    stu.died_count,
                    stu.pending_count
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = 5; R <= range.e.r; ++R) {
                const indexCell = XLSX.utils.encode_cell({ r: R, c: 0 });
                if (ws[indexCell]) {
                    ws[indexCell].t = 's';
                    ws[indexCell].z = '@';
                }
            }

            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 14) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Ceylon Pharmacy');
            XLSX.writeFile(wb, `Ceylon_Pharmacy_Report_${selectedBatchCode}.xlsx`);

            toast({ title: 'Excel Export Successful', description: `Ceylon_Pharmacy_Report_${selectedBatchCode}.xlsx downloaded.` });
        } else if (selectedGame === 'pharma_reader' && pharmaReaderData) {
            if (!filteredPharmaReaderStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                ['PHARMA READER ASSESSMENT REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${pharmaReaderData.students.length}`, `Total Prescriptions: ${pharmaReaderData.total_prescriptions}`],
                [],
                [
                    'Index No',
                    'Student Name',
                    'Read Count',
                    'Correct',
                    'Incorrect'
                ]
            ];

            filteredPharmaReaderStudents.forEach(stu => {
                wsData.push([
                    stu.index_number,
                    stu.student_name || '-',
                    stu.read_count,
                    stu.correct_count,
                    stu.incorrect_count
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = 5; R <= range.e.r; ++R) {
                const indexCell = XLSX.utils.encode_cell({ r: R, c: 0 });
                if (ws[indexCell]) {
                    ws[indexCell].t = 's';
                    ws[indexCell].z = '@';
                }
            }

            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 14) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Pharma Reader');
            XLSX.writeFile(wb, `Pharma_Reader_Report_${selectedBatchCode}.xlsx`);

            toast({ title: 'Excel Export Successful', description: `Pharma_Reader_Report_${selectedBatchCode}.xlsx downloaded.` });
        } else if (selectedGame === 'assignment' && assignmentData) {
            if (!filteredAssignmentStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const assignments = assignmentData.assignments || [];

            const wsData: (string | number)[][] = [
                ['CEYLON PHARMA COLLEGE'],
                ['ASSIGNMENT EVALUATION REPORT'],
                [`Batch Code: ${selectedBatchCode}`, `Batch Name: ${activeBatchInfo?.name || selectedBatchCode}`],
                [`Generated On: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, `Total Students: ${assignmentData.students.length}`, `Total Assignments: ${assignments.length}`],
                [],
                [
                    'Index No',
                    'Student Name',
                    ...assignments.map(a => a.assignment_name || a.assignment_id),
                    'Submitted Count',
                    'Graded Count'
                ]
            ];

            filteredAssignmentStudents.forEach(stu => {
                const row: (string | number)[] = [
                    stu.index_number,
                    stu.student_name || '-',
                    ...assignments.map(a => {
                        const gradeInfo = stu.assignment_grades[a.assignment_id];
                        return gradeInfo ? gradeInfo.grade : 'Not Set';
                    }),
                    stu.submitted_count,
                    stu.graded_count
                ];
                wsData.push(row);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = 5; R <= range.e.r; ++R) {
                for (let C = 0; C < 2 + assignments.length; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cellAddress]) {
                        ws[cellAddress].t = 's';
                        ws[cellAddress].z = '@';
                    }
                }
            }

            const colWidths = wsData[5].map((header, colIndex) => {
                let maxLen = String(header).length;
                for (let r = 5; r < wsData.length; r++) {
                    const val = wsData[r][colIndex];
                    if (val !== undefined && val !== null) {
                        maxLen = Math.max(maxLen, String(val).length);
                    }
                }
                return { wch: Math.max(maxLen + 3, 14) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Assignments');
            XLSX.writeFile(wb, `Assignment_Report_${selectedBatchCode}.xlsx`);

            toast({ title: 'Excel Export Successful', description: `Assignment_Report_${selectedBatchCode}.xlsx downloaded.` });
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // GRADING MANAGEMENT HANDLERS (Auto-save on change & Excel export)
    // ─────────────────────────────────────────────────────────────────────────────
    const handleSaveGrade = async (assignmentId: string, studentNumber: string, grade: string) => {
        try {
            setIsSavingGrade(`${studentNumber}_${assignmentId}`);
            const res = await saveAssignmentGradeAction(assignmentId, studentNumber, grade);
            if (res.status === 'success') {
                toast({
                    title: 'Grade Saved',
                    description: res.message || `Grade updated to ${grade}`,
                });
                queryClient.invalidateQueries({ queryKey: ['gradingReport', gradingBatchCode] });
                queryClient.invalidateQueries({ queryKey: ['assignmentReport', gradingBatchCode] });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to Save Grade',
                    description: res.message || 'An error occurred',
                });
            }
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Save Error',
                description: err.message || 'Could not save grade',
            });
        } finally {
            setIsSavingGrade(null);
        }
    };

    const handleExportGradingExcel = () => {
        if (!gradingBatchData || !gradingBatchData.students.length) {
            toast({ variant: 'destructive', title: 'No grading data available to export' });
            return;
        }
        const assignments = gradingBatchData.assignments || [];
        const header = [
            'Index Number',
            'Student Name',
            ...assignments.map(a => a.title || `Assignment ${a.id}`),
            'Total Submitted',
            'Total Graded'
        ];
        const rows = gradingBatchData.students.map(stu => {
            const asgnCols = assignments.map(a => {
                const g = stu.assignment_grades[a.id]?.grade;
                return g !== undefined && g !== null && g !== '' ? String(g) : '-';
            });
            return [
                stu.index_number,
                stu.student_name,
                ...asgnCols,
                stu.submitted_count,
                stu.graded_count
            ];
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        for (let R = 1; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = ws[cellAddress];
                if (cell && typeof cell.v === 'string') {
                    cell.t = 's';
                    cell.z = '@';
                }
            }
        }
        ws['!cols'] = [
            { wch: 18 },
            { wch: 30 },
            ...assignments.map(() => ({ wch: 18 })),
            { wch: 16 },
            { wch: 16 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Grades');
        XLSX.writeFile(wb, `Assignment_Grades_${gradingBatchCode}.xlsx`);
        toast({ title: 'Excel Export Successful', description: `Assignment_Grades_${gradingBatchCode}.xlsx downloaded.` });
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // PROFESSIONAL PDF GENERATOR (A4 Landscape using jsPDF & autoTable)
    // ─────────────────────────────────────────────────────────────────────────────
    const handleExportPDF = () => {
        if (!selectedBatchCode) return;

        if (selectedGame === 'winpharma') {
            if (!winpharmaData?.students?.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const levels = winpharmaData.levels || [];

            // Title Header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42); // slate-900
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105); // slate-600
            doc.text(`WinPharma Assessment Report  —  Batch: ${selectedBatchCode}`, 40, 58);
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${winpharmaData.students.length}  |  Average Score: ${stats?.avgScore || '0%'}`, 
                40, 
                74
            );

            // Table Headers
            const tableHeaders = [
                'Index No',
                'Name',
                'Last Level',
                ...levels.map(l => `${l.level_name} (${l.task_count || 0})`),
                'Total',
                'Marks',
                'Grade (%)'
            ];

            // Table Rows
            const tableRows = filteredWinpharmaStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                stu.last_completed_level || '-',
                ...levels.map(l => {
                    const s = stu.level_scores[l.level_id];
                    return s ? `${s.completed}/${s.total}` : '0/0';
                }),
                `${stu.total_completed}/${stu.total_tasks}`,
                stu.total_completed,
                `${stu.percentage.toFixed(1)}%`
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: {
                    fontSize: 8,
                    cellPadding: 4,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [15, 23, 42],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' },
                    2: { halign: 'center' }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            doc.save(`WinPharma_Report_${selectedBatchCode}.pdf`);
            toast({ title: 'PDF Export Successful', description: `WinPharma_Report_${selectedBatchCode}.pdf downloaded.` });
        } else if (selectedGame === 'quiz') {
            // Quiz Assessment Report PDF
            if (!quizData?.students?.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const topics = quizData.topics || [];

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(`Quiz Assessment Report  —  Batch: ${selectedBatchCode}`, 40, 58);
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${quizData.students.length}  |  Active Topics: ${topics.length}  |  Average Score: ${stats?.avgScore || '0%'}`, 
                40, 
                74
            );

            const tableHeaders = [
                'Index No',
                'Student Name',
                ...topics.map(t => `${t.topic_name} (${t.question_count})`),
                'Overall Score (%)'
            ];

            const tableRows = filteredQuizStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                ...topics.map(t => {
                    const sc = stu.topic_scores[t.topic_id];
                    return typeof sc === 'number' ? `${sc.toFixed(2)}%` : '0.00%';
                }),
                `${stu.overall_grade.toFixed(2)}%`
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: {
                    fontSize: 8,
                    cellPadding: 4,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [14, 116, 144], // cyan-700
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            doc.save(`Quiz_Report_${selectedBatchCode}.pdf`);
            toast({ title: 'PDF Export Successful', description: `Quiz_Report_${selectedBatchCode}.pdf downloaded.` });
        } else if (selectedGame === 'dpad') {
            // D-Pad Report PDF
            if (!dpadData?.students?.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });


            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(`D-Pad Assessment Report  —  Batch: ${selectedBatchCode}`, 40, 58);
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${dpadData.students.length}  |  Average Grade: ${stats?.avgScore || '0%'}`, 
                40, 
                74
            );

            const tableHeaders = [
                'Index No',
                'Student Name',
                'Correct Answers (+10)',
                'Incorrect Answers (-1)',
                'D-Pad Grade (%)'
            ];

            const tableRows = filteredDpadStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                stu.correct_count,
                stu.incorrect_count,
                `${stu.overall_grade.toFixed(2)}%`
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: {
                    fontSize: 9,
                    cellPadding: 5,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [5, 150, 105], // emerald-600
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' },
                    2: { halign: 'center', textColor: [5, 150, 105] },
                    3: { halign: 'center', textColor: [220, 38, 38] },
                    4: { halign: 'center', fontStyle: 'bold' }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            doc.save(`DPad_Report_${selectedBatchCode}.pdf`);
            toast({ title: 'PDF Export Successful', description: `DPad_Report_${selectedBatchCode}.pdf downloaded.` });
        } else if (selectedGame === 'hunter' || selectedGame === 'hunter_pro') {
            const isHunter = selectedGame === 'hunter';
            const repStudents = isHunter ? filteredHunterStudents : filteredHunterProStudents;

            if (!repStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(
                isHunter 
                    ? `Pharma Hunter Assessment Report — Batch: ${selectedBatchCode}` 
                    : `Pharma Hunter Pro Assessment Report — Batch: ${selectedBatchCode}`, 
                40, 
                58
            );
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${repStudents.length}`, 
                40, 
                74
            );

            const tableHeaders = [
                'Index No',
                'Student Name',
                'Correct',
                'Pending',
                'Wrong',
                'Gem',
                'Coin'
            ];

            const tableRows = repStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                stu.correct_count,
                stu.pending_count,
                stu.wrong_count,
                stu.gem_count,
                stu.coin_count
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: {
                    fontSize: 9,
                    cellPadding: 5,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: isHunter ? [217, 119, 6] : [147, 51, 234], // amber-600 or purple-600
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' },
                    2: { halign: 'center', textColor: [5, 150, 105] },
                    3: { halign: 'center', textColor: [100, 116, 139] },
                    4: { halign: 'center', textColor: [220, 38, 38] },
                    5: { halign: 'center', textColor: [126, 34, 206], fontStyle: 'bold' },
                    6: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold' }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            const fileName = isHunter ? `Pharma_Hunter_Report_${selectedBatchCode}.pdf` : `Pharma_Hunter_Pro_Report_${selectedBatchCode}.pdf`;
            doc.save(fileName);
            toast({ title: 'PDF Export Successful', description: `${fileName} downloaded.` });
        } else if (selectedGame === 'course_assignment' && courseAssignmentData) {
            if (!filteredCourseAssignmentStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const assignments = courseAssignmentData.assignments || [];
            const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(`Course Assignment Assessment Report — Batch: ${selectedBatchCode}`, 40, 58);
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${courseAssignmentData.students.length}  |  Assignments: ${assignments.length}`, 
                40, 
                74
            );

            const tableHeaders = [
                'Index No',
                'Student Name',
                ...assignments.map(a => a.assignment_name),
                'Submitted',
                'Graded'
            ];

            const tableRows = filteredCourseAssignmentStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                ...assignments.map(a => {
                    const gradeInfo = stu.assignment_grades[a.id];
                    return gradeInfo ? gradeInfo.grade : 'Not Submitted';
                }),
                stu.submitted_count,
                stu.graded_count
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: {
                    fontSize: 8,
                    cellPadding: 4,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [37, 99, 235], // blue-600
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            doc.save(`Course_Assignment_Report_${selectedBatchCode}.pdf`);
            toast({ title: 'PDF Export Successful', description: `Course_Assignment_Report_${selectedBatchCode}.pdf downloaded.` });
        } else if (selectedGame === 'ceylon_pharmacy' && ceylonPharmacyData) {
            if (!filteredCeylonPharmacyStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(`Ceylon Pharmacy Assessment Report — Batch: ${selectedBatchCode}`, 40, 58);
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${ceylonPharmacyData.students.length}  |  Total Patients: ${ceylonPharmacyData.total_patients}`, 
                40, 
                74
            );

            const tableHeaders = ['Index No', 'Student Name', 'Recovered', 'Died', 'Pending'];
            const tableRows = filteredCeylonPharmacyStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                stu.recovered_count,
                stu.died_count,
                stu.pending_count
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: { fontSize: 9, cellPadding: 5, valign: 'middle' },
                headStyles: {
                    fillColor: [13, 148, 136], // teal-600
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' },
                    2: { halign: 'center', textColor: [5, 150, 105], fontStyle: 'bold' },
                    3: { halign: 'center', textColor: [220, 38, 38], fontStyle: 'bold' },
                    4: { halign: 'center', textColor: [217, 119, 6] }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            doc.save(`Ceylon_Pharmacy_Report_${selectedBatchCode}.pdf`);
            toast({ title: 'PDF Export Successful', description: `Ceylon_Pharmacy_Report_${selectedBatchCode}.pdf downloaded.` });
        } else if (selectedGame === 'pharma_reader' && pharmaReaderData) {
            if (!filteredPharmaReaderStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(`Pharma Reader Assessment Report — Batch: ${selectedBatchCode}`, 40, 58);
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${pharmaReaderData.students.length}  |  Prescriptions: ${pharmaReaderData.total_prescriptions}`, 
                40, 
                74
            );

            const tableHeaders = ['Index No', 'Student Name', 'Read Count', 'Correct', 'Incorrect'];
            const tableRows = filteredPharmaReaderStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                stu.read_count,
                stu.correct_count,
                stu.incorrect_count
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: { fontSize: 9, cellPadding: 5, valign: 'middle' },
                headStyles: {
                    fillColor: [79, 70, 229], // indigo-600
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' },
                    2: { halign: 'center', fontStyle: 'bold' },
                    3: { halign: 'center', textColor: [5, 150, 105], fontStyle: 'bold' },
                    4: { halign: 'center', textColor: [220, 38, 38] }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            doc.save(`Pharma_Reader_Report_${selectedBatchCode}.pdf`);
            toast({ title: 'PDF Export Successful', description: `Pharma_Reader_Report_${selectedBatchCode}.pdf downloaded.` });
        } else if (selectedGame === 'assignment' && assignmentData) {
            if (!filteredAssignmentStudents.length) {
                toast({ variant: 'destructive', title: 'No student data available to export' });
                return;
            }

            const assignments = assignmentData.assignments || [];
            const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('CEYLON PHARMA COLLEGE', 40, 40);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(`Assignment Assessment Report — Batch: ${selectedBatchCode}`, 40, 58);
            doc.text(
                `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}  |  Total Students: ${assignmentData.students.length}  |  Assignments: ${assignments.length}`, 
                40, 
                74
            );

            const tableHeaders = [
                'Index No',
                'Student Name',
                ...assignments.map(a => a.assignment_name || a.assignment_id),
                'Submitted',
                'Graded'
            ];

            const tableRows = filteredAssignmentStudents.map(stu => [
                stu.index_number,
                stu.student_name || '-',
                ...assignments.map(a => {
                    const gradeInfo = stu.assignment_grades[a.assignment_id];
                    return gradeInfo ? gradeInfo.grade : 'Not Set';
                }),
                stu.submitted_count,
                stu.graded_count
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: 90,
                styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
                headStyles: {
                    fillColor: [51, 65, 85], // slate-700
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    1: { halign: 'left' }
                },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount} — Ceylon Pharma College Confidential Assessment Report`,
                        40,
                        doc.internal.pageSize.height - 20
                    );
                }
            });

            doc.save(`Assignment_Report_${selectedBatchCode}.pdf`);
            toast({ title: 'PDF Export Successful', description: `Assignment_Report_${selectedBatchCode}.pdf downloaded.` });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const isLoading = selectedGame === 'winpharma' 
        ? isLoadingWinpharma 
        : (selectedGame === 'quiz' 
            ? isLoadingQuiz 
            : (selectedGame === 'hunter' 
                ? isLoadingHunter 
                : (selectedGame === 'hunter_pro' 
                    ? isLoadingHunterPro 
                    : (selectedGame === 'course_assignment'
                        ? isLoadingCourseAssignment
                        : (selectedGame === 'ceylon_pharmacy'
                            ? isLoadingCeylonPharmacy
                            : (selectedGame === 'pharma_reader'
                                ? isLoadingPharmaReader
                                : (selectedGame === 'assignment'
                                    ? isLoadingAssignment
                                    : isLoadingDpad)))))));

    const currentError = selectedGame === 'winpharma' 
        ? winpharmaError 
        : (selectedGame === 'quiz' 
            ? quizError 
            : (selectedGame === 'hunter' 
                ? hunterError 
                : (selectedGame === 'hunter_pro' 
                    ? hunterProError 
                    : (selectedGame === 'course_assignment'
                        ? courseAssignmentError
                        : (selectedGame === 'ceylon_pharmacy'
                            ? ceylonPharmacyError
                            : (selectedGame === 'pharma_reader'
                                ? pharmaReaderError
                                : (selectedGame === 'assignment'
                                    ? assignmentError
                                    : dpadError)))))));

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER: VIEW 2 - DETAILED ASSESSMENT REPORT TABLE (When batch is selected)
    // ─────────────────────────────────────────────────────────────────────────────
    if (selectedBatchCode) {
        const isWinPharma = selectedGame === 'winpharma';
        const isQuiz = selectedGame === 'quiz';
        const isDpad = selectedGame === 'dpad';
        const isHunter = selectedGame === 'hunter';
        const isHunterPro = selectedGame === 'hunter_pro';
        const isCourseAssignment = selectedGame === 'course_assignment';
        const isCeylonPharmacy = selectedGame === 'ceylon_pharmacy';
        const isPharmaReader = selectedGame === 'pharma_reader';
        const isAssignment = selectedGame === 'assignment';

        const reportTitle = isWinPharma 
            ? 'WinPharma Assessment Report' 
            : isQuiz 
            ? 'Quiz Assessment Report' 
            : isHunter 
            ? 'Pharma Hunter Assessment Report' 
            : isHunterPro 
            ? 'Pharma Hunter Pro Assessment Report' 
            : isCourseAssignment
            ? 'Course Assignment Assessment Report'
            : isCeylonPharmacy
            ? 'Ceylon Pharmacy Assessment Report'
            : isPharmaReader
            ? 'Pharma Reader Assessment Report'
            : isAssignment
            ? 'Assignment Assessment Report'
            : 'D-Pad Assessment Report';

        const reportSubtitle = isWinPharma
            ? 'Simulation & Dispensing Assessment'
            : isQuiz
            ? 'Topic-by-topic Multiple Choice Evaluation'
            : isHunter
            ? 'Medicine Hunting & Identification Evaluation'
            : isHunterPro
            ? 'Advanced Clinical Medicine Identification Assessment'
            : isCourseAssignment
            ? 'Module Submissions & Assessment Grading'
            : isCeylonPharmacy
            ? 'Virtual Clinical Patient Care Evaluation'
            : isPharmaReader
            ? 'Prescription Reading & Speed Evaluation'
            : isAssignment
            ? 'Coursework & Submission Marks Evaluation'
            : 'Prescription Reading & Scoring';

        const reportThemeColor = isWinPharma
            ? 'bg-indigo-600'
            : isQuiz
            ? 'bg-sky-600'
            : isHunter
            ? 'bg-amber-600'
            : isHunterPro
            ? 'bg-purple-600'
            : isCourseAssignment
            ? 'bg-blue-600'
            : isCeylonPharmacy
            ? 'bg-teal-600'
            : isPharmaReader
            ? 'bg-indigo-600'
            : isAssignment
            ? 'bg-slate-700'
            : 'bg-emerald-600';

        const reportHoverTheme = isWinPharma
            ? 'hover:bg-indigo-700'
            : isQuiz
            ? 'hover:bg-sky-700'
            : isHunter
            ? 'hover:bg-amber-700'
            : isHunterPro
            ? 'hover:bg-purple-700'
            : isCourseAssignment
            ? 'hover:bg-blue-700'
            : isCeylonPharmacy
            ? 'hover:bg-teal-700'
            : isPharmaReader
            ? 'hover:bg-indigo-700'
            : isAssignment
            ? 'hover:bg-slate-800'
            : 'hover:bg-emerald-700';

        return (
            <div className="p-4 md:p-8 space-y-6 pb-20">
                {/* Print-Only Header */}
                <div className="hidden print:block mb-6 border-b pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">CEYLON PHARMA COLLEGE</h2>
                            <h3 className="text-lg font-semibold text-gray-700 mt-1 uppercase">
                                {reportTitle}
                            </h3>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                            <p><span className="font-semibold">Batch Code:</span> {selectedBatchCode}</p>
                            <p><span className="font-semibold">Generated On:</span> {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
                        </div>
                    </div>
                </div>

                {/* Back to Batches & Top Actions */}
                <div className="print:hidden space-y-4">
                    <div className="flex items-center justify-between">
                        <Button 
                            variant="ghost" 
                            onClick={handleBackToBatches} 
                            className="-ml-4 text-muted-foreground hover:text-foreground font-medium"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Batches List
                        </Button>
                    </div>

                    {/* Dedicated Report Header (Clean & Professional) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl text-white shadow-md ${reportThemeColor}`}>
                                {isWinPharma && <WinPharmaIcon className="w-8 h-8" />}
                                {isQuiz && <BookOpen className="w-8 h-8" />}
                                {isDpad && <DPadIcon className="w-8 h-8" />}
                                {isHunter && <Crosshair className="w-8 h-8" />}
                                {isHunterPro && <Sparkles className="w-8 h-8" />}
                                {isCourseAssignment && <ClipboardList className="w-8 h-8" />}
                                {isCeylonPharmacy && <HeartPulse className="w-8 h-8" />}
                                {isPharmaReader && <ScanText className="w-8 h-8" />}
                                {isAssignment && <FileSpreadsheet className="w-8 h-8" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge className={`${reportThemeColor} text-white text-xs font-mono px-2.5 py-0.5`}>
                                        {selectedBatchCode}
                                    </Badge>
                                    <h1 className="text-2xl font-headline font-bold">
                                        {reportTitle}
                                    </h1>
                                </div>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    {activeBatchInfo?.name || selectedBatchCode} • {reportSubtitle}
                                </p>
                            </div>
                        </div>

                        {/* Export & Action Buttons */}
                        <div className="flex items-center flex-wrap gap-2">
                            {isAssignment && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                        setGradingBatchCode(selectedBatchCode);
                                        setGradingModalMode('edit');
                                        setGradingSearchTerm('');
                                        setGradingModalOpen(true);
                                    }}
                                    className="rounded-xl border-slate-400 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                                >
                                    <PenSquare className="mr-2 h-4 w-4" /> Edit Grading
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleExportExcel} 
                                disabled={isLoading}
                                className="rounded-xl border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel (.xlsx)
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleExportPDF} 
                                disabled={isLoading}
                                className="rounded-xl border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                                <FileText className="mr-2 h-4 w-4" /> Export PDF (.pdf)
                            </Button>
                            <Button 
                                variant="default" 
                                size="sm" 
                                onClick={handlePrint}
                                className={`rounded-xl text-white ${reportThemeColor} ${reportHoverTheme}`}
                            >
                                <Printer className="mr-2 h-4 w-4" /> Print Report
                            </Button>
                        </div>
                    </div>
                </div>


                {/* Quick Stats Cards */}
                {stats && !isLoading && (
                    <div className="print:hidden grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="shadow-sm rounded-2xl">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Total Students</p>
                                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm rounded-2xl">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Average Score</p>
                                    <p className="text-2xl font-bold">{stats.avgScore}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm rounded-2xl">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 rounded-xl">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">{stats.subMetricLabel}</p>
                                    <p className="text-2xl font-bold">{stats.subMetricValue}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Controls Bar: Search Filter */}
                <div className="print:hidden flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by Index No (e.g. PA36593) or Name..." 
                            className="pl-9 pr-8 rounded-xl"
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                        />
                        {studentSearchTerm && (
                            <button
                                onClick={() => setStudentSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Detailed Table */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Generating {reportTitle} for batch {selectedBatchCode}...</p>
                    </div>
                ) : currentError ? (
                    <Card className="border-destructive/50 bg-destructive/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertCircle className="w-6 h-6" />
                            <div>
                                <h3 className="font-semibold text-base">Failed to load report</h3>
                                <p className="text-xs mt-1 text-destructive/80">{(currentError as Error).message || 'Something went wrong while fetching report data.'}</p>
                            </div>
                        </div>
                    </Card>
                ) : isQuiz ? (
                    /* ── Quiz Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Quiz Assessment Table</CardTitle>
                                <CardDescription className="text-xs">
                                    Topic evaluation scores (+10 for Correct, -5 for Incorrect) • {quizData?.topics?.length || 0} Active Topics
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {filteredQuizStudents.length} Students
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground whitespace-nowrap">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[200px]">Name</TableHead>
                                            {quizData?.topics?.map((topic) => (
                                                <TableHead key={topic.topic_id} className="font-semibold text-foreground text-center whitespace-nowrap px-3">
                                                    <div className="flex flex-col items-center">
                                                        <span>{topic.topic_name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-normal">
                                                            ({topic.question_count} Qs)
                                                        </span>
                                                    </div>
                                                </TableHead>
                                            ))}
                                            <TableHead className="font-semibold text-foreground text-center whitespace-nowrap min-w-[120px]">
                                                Overall Score
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredQuizStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell 
                                                    colSpan={3 + (quizData?.topics?.length || 0)} 
                                                    className="text-center py-10 text-muted-foreground"
                                                >
                                                    No student records found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredQuizStudents.map((stu) => {
                                                const isPassed = stu.overall_grade >= 50;
                                                const isHigh = stu.overall_grade >= 75;
                                                return (
                                                    <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium whitespace-nowrap font-mono text-xs">
                                                            {stu.index_number}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {stu.student_name || '-'}
                                                        </TableCell>

                                                        {/* Dynamic Topic Columns */}
                                                        {quizData?.topics?.map((topic) => {
                                                            const score = stu.topic_scores[topic.topic_id] ?? 0;
                                                            return (
                                                                <TableCell key={topic.topic_id} className="text-center font-mono text-xs whitespace-nowrap px-3">
                                                                    <span className={`inline-block font-semibold px-2 py-0.5 rounded ${
                                                                        score >= 75 
                                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
                                                                            : score >= 50 
                                                                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400' 
                                                                            : score > 0 
                                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                                                            : 'text-muted-foreground'
                                                                    }`}>
                                                                        {score.toFixed(1)}%
                                                                    </span>
                                                                </TableCell>
                                                            );
                                                        })}

                                                        <TableCell className="text-center whitespace-nowrap">
                                                            <Badge 
                                                                variant={isHigh ? "default" : isPassed ? "secondary" : "destructive"}
                                                                className={isHigh ? "bg-emerald-600 hover:bg-emerald-600 font-semibold" : "font-semibold"}
                                                            >
                                                                {stu.overall_grade.toFixed(2)}%
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : isWinPharma ? (
                    /* ── WinPharma Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">WinPharma Assessment Table</CardTitle>
                                <CardDescription className="text-xs">Individual student task evaluations and level completions</CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {filteredWinpharmaStudents.length} Students
                            </span>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[200px]">Name</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Last Completed Level</TableHead>
                                            
                                            {/* Dynamic Level Columns */}
                                            {winpharmaData?.levels?.map((lvl) => (
                                                <TableHead key={lvl.level_id} className="font-semibold text-foreground text-center whitespace-nowrap min-w-[95px]">
                                                    <div>{lvl.level_name}</div>
                                                    <span className="text-[10px] text-muted-foreground font-normal">({lvl.task_count || 0})</span>
                                                </TableHead>
                                            ))}

                                            <TableHead className="font-semibold text-foreground text-center">Total</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Marks</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Percentage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredWinpharmaStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6 + (winpharmaData?.levels?.length || 0)} className="text-center py-10 text-muted-foreground">
                                                    No student records found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredWinpharmaStudents.map((stu) => {
                                                const isCompleted = stu.percentage >= 100;
                                                return (
                                                    <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium whitespace-nowrap font-mono text-xs">{stu.index_number}</TableCell>
                                                        <TableCell className="font-medium">{stu.student_name || '-'}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="text-xs font-normal">
                                                                {stu.last_completed_level}
                                                            </Badge>
                                                        </TableCell>
                                                        
                                                        {winpharmaData?.levels?.map((lvl) => {
                                                            const score = stu.level_scores[lvl.level_id];
                                                            const comp = score ? score.completed : 0;
                                                            const tot = score ? score.total : 0;
                                                            const isLevelFull = tot > 0 && comp === tot;
                                                            return (
                                                                <TableCell 
                                                                    key={lvl.level_id} 
                                                                    className={`text-center font-mono text-xs ${isLevelFull ? 'text-emerald-600 font-semibold dark:text-emerald-400' : ''}`}
                                                                >
                                                                    {comp}/{tot}
                                                                </TableCell>
                                                            );
                                                        })}

                                                        <TableCell className="text-center font-mono font-medium text-xs whitespace-nowrap">
                                                            {stu.total_completed}/{stu.total_tasks}
                                                        </TableCell>
                                                        <TableCell className="text-center font-mono font-medium text-xs">
                                                            {stu.total_completed}
                                                        </TableCell>
                                                        <TableCell className="text-center whitespace-nowrap">
                                                            <Badge 
                                                                variant={isCompleted ? "default" : stu.percentage >= 50 ? "secondary" : "destructive"}
                                                                className={isCompleted ? "bg-emerald-600 hover:bg-emerald-600 font-semibold" : "font-semibold"}
                                                            >
                                                                {stu.percentage.toFixed(1)}%
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : isHunter || isHunterPro ? (
                    /* ── Pharma Hunter & Pharma Hunter Pro Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    {isHunter ? 'Pharma Hunter Assessment Table' : 'Pharma Hunter Pro Assessment Table'}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {isHunter 
                                        ? `Medicine identification and hunting evaluation • ${(hunterData?.medicine_count || 0)} Total Medicines (10 attempts each)`
                                        : `Advanced clinical medicine assessment • ${(hunterProData?.medicine_count || 0)} Total Medicines (10 attempts each)`}
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {(isHunter ? filteredHunterStudents : filteredHunterProStudents).length} Students
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground whitespace-nowrap">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[200px]">Name</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Correct</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Pending</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Wrong</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Gem</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Coin</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(isHunter ? filteredHunterStudents : filteredHunterProStudents).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                                    No student records found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            (isHunter ? filteredHunterStudents : filteredHunterProStudents).map((stu) => {
                                                return (
                                                    <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium whitespace-nowrap font-mono text-xs">
                                                            {stu.index_number}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {stu.student_name || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-center font-mono text-emerald-600 font-semibold dark:text-emerald-400">
                                                            {stu.correct_count}
                                                        </TableCell>
                                                        <TableCell className="text-center font-mono text-muted-foreground">
                                                            {stu.pending_count}
                                                        </TableCell>
                                                        <TableCell className="text-center font-mono text-red-500 font-medium">
                                                            {stu.wrong_count}
                                                        </TableCell>
                                                        <TableCell className="text-center whitespace-nowrap">
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-mono font-semibold gap-1 px-2.5">
                                                                <Sparkles className="w-3 h-3 text-purple-500" />
                                                                {stu.gem_count}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center whitespace-nowrap">
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-mono font-semibold gap-1 px-2.5">
                                                                <Award className="w-3 h-3 text-amber-500" />
                                                                {stu.coin_count}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : isCourseAssignment ? (
                    /* ── Course Assignment Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Course Assignment Assessment Table</CardTitle>
                                <CardDescription className="text-xs">
                                    Module submissions and graded evaluation • {courseAssignmentData?.assignments?.length || 0} Assignments
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {filteredCourseAssignmentStudents.length} Students
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground whitespace-nowrap">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[200px]">Name</TableHead>
                                            {courseAssignmentData?.assignments?.map((a) => (
                                                <TableHead key={a.id} className="font-semibold text-foreground text-center whitespace-nowrap px-3">
                                                    <div className="flex flex-col items-center">
                                                        <span>{a.assignment_name}</span>
                                                        {a.due_date && (
                                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                                Due: {a.due_date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableHead>
                                            ))}
                                            <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                                                Submitted
                                            </TableHead>
                                            <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                                                Graded
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCourseAssignmentStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell 
                                                    colSpan={4 + (courseAssignmentData?.assignments?.length || 0)} 
                                                    className="text-center py-10 text-muted-foreground"
                                                >
                                                    No student records found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredCourseAssignmentStudents.map((stu) => (
                                                <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                    <TableCell className="font-medium whitespace-nowrap font-mono text-xs">
                                                        {stu.index_number}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {stu.student_name || '-'}
                                                    </TableCell>

                                                    {/* Dynamic Assignment Columns */}
                                                    {courseAssignmentData?.assignments?.map((a) => {
                                                        const gradeInfo = stu.assignment_grades[a.id];
                                                        const isSubmitted = gradeInfo && gradeInfo.grade !== 'Not Submitted';
                                                        const isGraded = isSubmitted && gradeInfo.grade !== 'Not graded';

                                                        return (
                                                            <TableCell key={a.id} className="text-center px-3 whitespace-nowrap">
                                                                {!isSubmitted ? (
                                                                    <span className="text-xs text-muted-foreground/50 italic">Not Submitted</span>
                                                                ) : isGraded ? (
                                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-mono font-semibold">
                                                                        {gradeInfo.grade}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-medium text-xs">
                                                                        Not graded
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}

                                                    <TableCell className="text-center font-mono font-semibold text-primary">
                                                        {stu.submitted_count}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {stu.graded_count}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : isCeylonPharmacy ? (
                    /* ── Ceylon Pharmacy Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Ceylon Pharmacy Assessment Table</CardTitle>
                                <CardDescription className="text-xs">
                                    Virtual clinical patient care and treatment evaluation • {ceylonPharmacyData?.total_patients || 0} Total Patients
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {filteredCeylonPharmacyStudents.length} Students
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground whitespace-nowrap">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[200px]">Name</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Recovered</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Died</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Pending</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCeylonPharmacyStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                    No student records found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredCeylonPharmacyStudents.map((stu) => (
                                                <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                    <TableCell className="font-medium whitespace-nowrap font-mono text-xs">
                                                        {stu.index_number}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {stu.student_name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center whitespace-nowrap">
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-mono font-semibold">
                                                            {stu.recovered_count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center whitespace-nowrap">
                                                        <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-mono font-semibold">
                                                            {stu.died_count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center whitespace-nowrap">
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-mono font-semibold">
                                                            {stu.pending_count}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : isPharmaReader ? (
                    /* ── Pharma Reader Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Pharma Reader Assessment Table</CardTitle>
                                <CardDescription className="text-xs">
                                    Prescription reading speed and correctness evaluation • {pharmaReaderData?.total_prescriptions || 0} Total Prescriptions
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {filteredPharmaReaderStudents.length} Students
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground whitespace-nowrap">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[200px]">Name</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Read Count</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Correct</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Incorrect</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPharmaReaderStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                    No student records found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredPharmaReaderStudents.map((stu) => (
                                                <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                    <TableCell className="font-medium whitespace-nowrap font-mono text-xs">
                                                        {stu.index_number}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {stu.student_name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono font-bold text-foreground">
                                                        {stu.read_count}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {stu.correct_count}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono font-medium text-red-500">
                                                        {stu.incorrect_count}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : isAssignment ? (
                    /* ── Assignment Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Assignment Assessment Table</CardTitle>
                                <CardDescription className="text-xs">
                                    Coursework submissions and grading records • {assignmentData?.assignments?.length || 0} Assignments
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {filteredAssignmentStudents.length} Students
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground whitespace-nowrap">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[200px]">Name</TableHead>
                                            {assignmentData?.assignments?.map((a) => (
                                                <TableHead key={a.id} className="font-semibold text-foreground text-center whitespace-nowrap px-3">
                                                    <div className="flex flex-col items-center">
                                                        <span>{a.assignment_name || a.assignment_id}</span>
                                                        {a.due_date && (
                                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                                Due: {a.due_date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableHead>
                                            ))}
                                            <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                                                Submitted
                                            </TableHead>
                                            <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">
                                                Graded
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAssignmentStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell 
                                                    colSpan={4 + (assignmentData?.assignments?.length || 0)} 
                                                    className="text-center py-10 text-muted-foreground"
                                                >
                                                    No student records found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAssignmentStudents.map((stu) => (
                                                <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                    <TableCell className="font-medium whitespace-nowrap font-mono text-xs">
                                                        {stu.index_number}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {stu.student_name || '-'}
                                                    </TableCell>

                                                    {/* Dynamic Assignment Columns */}
                                                    {assignmentData?.assignments?.map((a) => {
                                                        const gradeInfo = stu.assignment_grades[a.assignment_id];
                                                        const hasGrade = gradeInfo && gradeInfo.grade !== 'Not Set';

                                                        return (
                                                            <TableCell key={a.id} className="text-center px-3 whitespace-nowrap">
                                                                {hasGrade ? (
                                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-mono font-semibold">
                                                                        {gradeInfo.grade}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground/50 italic">Not Set</span>
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}

                                                    <TableCell className="text-center font-mono font-semibold text-primary">
                                                        {stu.submitted_count}
                                                    </TableCell>
                                                    <TableCell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {stu.graded_count}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* ── D-Pad Detailed Table ── */
                    <Card className="shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">D-Pad Assessment Table</CardTitle>
                                <CardDescription className="text-xs">Prescription evaluation grades (+10 for correct, -1 for incorrect)</CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {filteredDpadStudents.length} Students
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold text-foreground">Index No</TableHead>
                                            <TableHead className="font-semibold text-foreground min-w-[220px]">Name</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Correct Answers</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">Incorrect Answers</TableHead>
                                            <TableHead className="font-semibold text-foreground text-center">D-Pad Grade</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDpadStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                    No student records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDpadStudents.map((stu) => {
                                                const isPassed = stu.overall_grade >= 50;
                                                return (
                                                    <TableRow key={stu.index_number} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium whitespace-nowrap font-mono text-xs">{stu.index_number}</TableCell>
                                                        <TableCell className="font-medium">{stu.student_name || '-'}</TableCell>
                                                        <TableCell className="text-center font-mono text-emerald-600 font-semibold dark:text-emerald-400">
                                                            {stu.correct_count}
                                                        </TableCell>
                                                        <TableCell className="text-center font-mono text-red-500 font-medium">
                                                            {stu.incorrect_count}
                                                        </TableCell>
                                                        <TableCell className="text-center whitespace-nowrap">
                                                            <Badge 
                                                                variant={isPassed ? (stu.overall_grade >= 80 ? "default" : "secondary") : "destructive"}
                                                                className={stu.overall_grade >= 80 ? "bg-emerald-600 hover:bg-emerald-600 font-semibold" : "font-semibold"}
                                                            >
                                                                {stu.overall_grade.toFixed(2)}%
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER: VIEW 1 - ALL BATCHES ASSESSMENT HUB (Professional Card Grid)
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => router.push('/admin/manage')} className="-ml-4 text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Management
                </Button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
                            <Gamepad2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-headline font-bold">Course Assessment Reports</h1>
                            <p className="text-muted-foreground text-sm">
                                View, search, export, and print student game evaluation reports across all batches.
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search batch code (e.g. CPCC35) or name..." 
                            className="pl-9 pr-8 rounded-xl h-10 border-border/80 shadow-xs"
                            value={batchSearchTerm}
                            onChange={(e) => setBatchSearchTerm(e.target.value)}
                        />
                        {batchSearchTerm && (
                            <button
                                onClick={() => setBatchSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizontal Course Category Filter Bar (No ugly scrollbar - wraps cleanly!) */}
            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* All Batches Pill */}
                    <button
                        onClick={() => setSelectedParentCourseId('ALL')}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-2 border ${
                            selectedParentCourseId === 'ALL'
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
                                : 'bg-card hover:bg-muted text-muted-foreground border-border/80 hover:text-foreground'
                        }`}
                    >
                        <span>All Batches</span>
                        <Badge variant={selectedParentCourseId === 'ALL' ? 'secondary' : 'outline'} className="text-[11px] font-mono px-1.5 py-0">
                            {allBatches?.length || 0}
                        </Badge>
                    </button>

                    {/* Course Category Pills */}
                    {parentCourses?.map(pc => {
                        const isSelected = String(selectedParentCourseId) === String(pc.id);
                        const count = batchCountsByCourse[String(pc.id)] || 0;
                        return (
                            <button
                                key={pc.id}
                                onClick={() => setSelectedParentCourseId(isSelected ? 'ALL' : String(pc.id))}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-2 border ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
                                        : 'bg-card hover:bg-muted text-muted-foreground border-border/80 hover:text-foreground'
                                }`}
                            >
                                <span>{pc.course_name}</span>
                                <Badge variant={isSelected ? 'secondary' : 'outline'} className="text-[11px] font-mono px-1.5 py-0">
                                    {count}
                                </Badge>
                            </button>
                        );
                    })}

                    {selectedParentCourseId !== 'ALL' && (
                        <button
                            onClick={() => setSelectedParentCourseId('ALL')}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 px-2 underline"
                        >
                            Reset filter
                        </button>
                    )}
                </div>

                {/* Filter / Result Summary Strip */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-1">
                    <div>
                        Showing <span className="font-semibold text-foreground">{filteredBatches.length}</span> of <span className="font-semibold text-foreground">{allBatches?.length || 0}</span> batches
                        {batchSearchTerm && <span> matching "{batchSearchTerm}"</span>}
                    </div>
                </div>
            </div>

            {/* ── CONTENT AREA: PROFESSIONAL CARD GRID ── */}
            {isLoadingBatches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="h-64 bg-muted/40 animate-pulse rounded-2xl border" />
                    ))}
                </div>
            ) : filteredBatches.length === 0 ? (
                <Card className="p-12 text-center border-dashed rounded-2xl">
                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-semibold text-base text-foreground">No Batches Found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        {batchSearchTerm 
                            ? `No batches matching "${batchSearchTerm}". Try clearing your search term.` 
                            : 'No batches found in the selected category.'}
                    </p>
                    {(batchSearchTerm || selectedParentCourseId !== 'ALL') && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4 text-xs rounded-xl"
                            onClick={() => {
                                setBatchSearchTerm('');
                                setSelectedParentCourseId('ALL');
                            }}
                        >
                            Show All Batches
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    {filteredBatches.map(batch => {
                        const code = batch.courseCode || '';

                        const reportsConfig: { id: GameReportType; name: string; isReady: boolean }[] = [
                            { id: 'winpharma', name: 'Winpharma Report', isReady: true },
                            { id: 'quiz', name: 'Quiz Report', isReady: true },
                            { id: 'dpad', name: 'D Pad Report', isReady: true },
                            { id: 'hunter', name: 'Pharma Hunter Report', isReady: true },
                            { id: 'hunter_pro', name: 'Pharma Hunter Pro Report', isReady: true },
                            { id: 'course_assignment', name: 'Course Assignment Report', isReady: true },
                            { id: 'ceylon_pharmacy', name: 'Ceylon Pharmacy Report', isReady: true },
                            { id: 'pharma_reader', name: 'Pharma Reader Report', isReady: true },
                            { id: 'assignment', name: 'Assignment Report', isReady: true },
                        ];

                        return (
                            <div 
                                key={batch.id || code} 
                                className="group relative rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden p-5"
                            >
                                {/* Card Header */}
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge className="bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border border-slate-700/80 shadow-xs">
                                            {code}
                                        </Badge>
                                    </div>

                                    <h3 
                                        className="font-headline font-bold text-sm text-foreground mt-2.5 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[38px]"
                                        title={batch.name || `Batch ${code}`}
                                    >
                                        {batch.name || `Batch ${code}`}
                                    </h3>

                                    <hr className="border-border/60 my-3" />
                                </div>

                                {/* List of 9 Reports (Legacy Rows) */}
                                <div className="space-y-1 my-1">
                                    {reportsConfig.map(rep => {
                                        return (
                                            <div 
                                                key={rep.id} 
                                                className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-muted/60 transition-colors group/row"
                                            >
                                                <span 
                                                    className="text-xs font-medium text-foreground/90 group-hover/row:text-foreground cursor-pointer truncate"
                                                    onClick={() => openBatchReport(code, rep.id)}
                                                >
                                                    {rep.name}
                                                </span>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-[11px] font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-md gap-1 cursor-pointer"
                                                        onClick={() => openBatchReport(code, rep.id)}
                                                    >
                                                        <Eye className="w-3 h-3" /> View
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 p-0 rounded-md border-border/80 bg-background hover:bg-muted cursor-pointer"
                                                        title={`Print ${rep.name}`}
                                                        onClick={() => {
                                                            openBatchReport(code, rep.id);
                                                            setTimeout(() => window.print(), 800);
                                                        }}
                                                    >
                                                        <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bottom Action Buttons: Edit Grading & View Grading */}
                                <div className="space-y-1.5 mt-4 pt-3 border-t border-border/60">
                                    <Button
                                        className="w-full h-8 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                        onClick={() => {
                                            setGradingBatchCode(code);
                                            setGradingModalMode('edit');
                                            setGradingSearchTerm('');
                                            setGradingModalOpen(true);
                                        }}
                                    >
                                        <PenSquare className="w-3.5 h-3.5" /> Edit Grading
                                    </Button>
                                    <Button
                                        className="w-full h-8 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                        onClick={() => {
                                            setGradingBatchCode(code);
                                            setGradingModalMode('view');
                                            setGradingSearchTerm('');
                                            setGradingModalOpen(true);
                                        }}
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View Grading
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ───────────────────────────────────────────────────────────────────────────── */}
            {/* GRADING DIALOG MODAL (Edit Grading & View Grading) */}
            {/* ───────────────────────────────────────────────────────────────────────────── */}
            <Dialog open={gradingModalOpen} onOpenChange={setGradingModalOpen}>
                <DialogContent className="max-w-6xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border shadow-2xl">
                    <DialogHeader className="p-5 border-b bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-slate-900 text-white font-mono text-xs px-2.5 py-0.5">
                                        {gradingBatchCode}
                                    </Badge>
                                    <DialogTitle className="text-xl font-bold tracking-tight">
                                        {gradingModalMode === 'edit' ? 'Edit Assignment Grading' : 'View Saved Grades'}
                                    </DialogTitle>
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground mt-1">
                                    {gradingModalMode === 'edit'
                                        ? 'Enter or modify marks directly in each student cell. Changes save automatically on blur or Enter.'
                                        : 'Read-only assessment marks overview and student submission status.'}
                                </DialogDescription>
                            </div>

                            {/* Toolbar Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setGradingModalMode(gradingModalMode === 'edit' ? 'view' : 'edit')}
                                    className="h-8 text-xs font-semibold rounded-lg gap-1.5"
                                >
                                    {gradingModalMode === 'edit' ? (
                                        <>
                                            <Eye className="w-3.5 h-3.5" /> Switch to View Mode
                                        </>
                                    ) : (
                                        <>
                                            <PenSquare className="w-3.5 h-3.5" /> Switch to Edit Mode
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportGradingExcel}
                                    disabled={isLoadingGradingData || !gradingBatchData?.students?.length}
                                    className="h-8 text-xs font-semibold rounded-lg border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => refetchGradingData()}
                                    disabled={isLoadingGradingData}
                                    className="h-8 w-8 p-0 rounded-lg"
                                    title="Refresh Data"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGradingData ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        {/* Search & Meta strip */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-border/60">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by student name or index number..."
                                    value={gradingSearchTerm}
                                    onChange={e => setGradingSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-xs rounded-xl"
                                />
                                {gradingSearchTerm && (
                                    <button
                                        onClick={() => setGradingSearchTerm('')}
                                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                    <strong className="text-foreground font-mono">{gradingBatchData?.assignments?.length || 0}</strong> Assignments
                                </span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                    <strong className="text-foreground font-mono">{filteredGradingStudents.length}</strong> of{' '}
                                    <strong className="text-foreground font-mono">{gradingBatchData?.students?.length || 0}</strong> Students
                                </span>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Table Area */}
                    <div className="flex-1 overflow-y-auto max-h-[58vh] p-0">
                        {isLoadingGradingData ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-xs text-muted-foreground">Loading assignment grading data...</p>
                            </div>
                        ) : !gradingBatchData?.assignments?.length ? (
                            <div className="text-center p-12 space-y-3">
                                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                                <h4 className="font-bold text-sm">No Assignments Found</h4>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    There are currently no coursework assignments created for batch <strong className="font-mono">{gradingBatchCode}</strong> in the LMS. Create assignments to record student grades.
                                </p>
                            </div>
                        ) : filteredGradingStudents.length === 0 ? (
                            <div className="text-center p-12 space-y-2">
                                <p className="text-xs text-muted-foreground">No students match your search filter.</p>
                                <Button size="sm" variant="outline" onClick={() => setGradingSearchTerm('')} className="text-xs">
                                    Clear search
                                </Button>
                            </div>
                        ) : (
                            <Table className="border-collapse">
                                <TableHeader className="sticky top-0 bg-card z-10 shadow-xs border-b">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-12 text-center text-xs font-bold">#</TableHead>
                                        <TableHead className="w-28 text-xs font-bold">Index No</TableHead>
                                        <TableHead className="min-w-[180px] text-xs font-bold">Student Name</TableHead>
                                        {gradingBatchData.assignments.map(asgn => (
                                            <TableHead key={asgn.id} className="text-center text-xs font-bold min-w-[110px] px-2">
                                                <div className="flex flex-col items-center">
                                                    <span className="truncate max-w-[130px] font-semibold" title={asgn.title}>
                                                        {asgn.title}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        ID: {asgn.id}
                                                    </span>
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-center text-xs font-bold w-24">Submissions</TableHead>
                                        <TableHead className="text-center text-xs font-bold w-24">Graded</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGradingStudents.map((stu, idx) => (
                                        <TableRow key={stu.index_number} className="hover:bg-muted/40 transition-colors">
                                            <TableCell className="text-center text-xs text-muted-foreground font-mono py-2.5">
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono font-semibold py-2.5">
                                                {stu.index_number}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium py-2.5">
                                                {stu.student_name}
                                            </TableCell>

                                            {gradingBatchData.assignments.map(asgn => {
                                                const record = stu.assignment_grades[asgn.id];
                                                const currentGrade = record?.grade ?? '';
                                                const isSaving = isSavingGrade === `${stu.index_number}_${asgn.id}`;

                                                return (
                                                    <TableCell key={asgn.id} className="text-center py-2 px-2">
                                                        {gradingModalMode === 'edit' ? (
                                                            <GradingCell
                                                                assignmentId={String(asgn.id)}
                                                                studentNumber={stu.index_number}
                                                                currentGrade={currentGrade}
                                                                isSaving={isSaving}
                                                                onSave={handleSaveGrade}
                                                            />
                                                        ) : (
                                                            currentGrade !== '' ? (
                                                                <Badge className="font-mono bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-2 py-0.5">
                                                                    {currentGrade}
                                                                </Badge>
                                                            ) : record?.status === 'Submitted' ? (
                                                                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-[11px] px-2 py-0.5">
                                                                    Submitted
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground font-mono">-</span>
                                                            )
                                                        )}
                                                    </TableCell>
                                                );
                                            })}

                                            <TableCell className="text-center py-2.5">
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                    {stu.submitted_count} / {gradingBatchData.assignments.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center py-2.5">
                                                <Badge 
                                                    className={`font-mono text-xs ${
                                                        stu.graded_count === gradingBatchData.assignments.length && gradingBatchData.assignments.length > 0
                                                            ? 'bg-emerald-600 text-white' 
                                                            : stu.graded_count > 0 
                                                            ? 'bg-blue-600 text-white' 
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {stu.graded_count} / {gradingBatchData.assignments.length}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row items-center justify-between sm:justify-between">
                        <p className="text-[11px] text-muted-foreground">
                            {gradingModalMode === 'edit' 
                                ? '💡 Click outside an input or press Enter to auto-save.' 
                                : 'Switch to Edit Mode to update grades in real time.'}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setGradingModalOpen(false)} className="rounded-lg text-xs">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function GameReportsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading Course Assessment Reports...</p>
            </div>
        }>
            <GameReportsContent />
        </Suspense>
    );
}
