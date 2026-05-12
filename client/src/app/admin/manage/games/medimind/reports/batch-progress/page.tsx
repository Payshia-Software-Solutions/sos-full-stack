"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, GraduationCap, Loader2, Download, Search, TrendingUp, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from "@/components/ui/accordion";
import { getMediMindStudentAnswersByStudent, getMediMindLevelsByCourse } from '@/lib/actions/games';
import { format } from 'date-fns';

import { getMediMindBatchReport } from '@/lib/actions/games';
import { getBatches } from '@/lib/actions/courses';
import type { Batch } from '@/lib/types';

interface StudentProgress {
    fname: string;
    lname: string;
    username: string;
    course_code: string;
    total_attempts: number;
    correct_answers: number;
    wrong_answers: number;
    unique_correct_medicines: number;
    total_medicines_in_batch: number;
    completion_rate: number;
    total_questions_in_batch: number;
}

export default function BatchProgressReportPage() {
    const router = useRouter();
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

    // --- Data Fetching ---
    const { data: batches = [], isLoading: isLoadingBatches } = useQuery<Batch[]>({
        queryKey: ['batches'],
        queryFn: getBatches,
    });

    const { data: reportData = [], isLoading: isLoadingReport, isError } = useQuery<StudentProgress[]>({
        queryKey: ['mediMindBatchReport', selectedCourseCode],
        queryFn: () => getMediMindBatchReport(selectedCourseCode!),
        enabled: !!selectedCourseCode,
    });

    const { data: studentHistory = [], isLoading: isLoadingHistory } = useQuery<MediMindStudentAnswer[]>({
        queryKey: ['studentHistory', selectedStudent?.username],
        queryFn: () => getMediMindStudentAnswersByStudent(selectedStudent!.username),
        enabled: !!selectedStudent?.username,
    });

    const { data: courseLevels = [] } = useQuery<MediMindLevel[]>({
        queryKey: ['courseLevels', selectedCourseCode],
        queryFn: () => getMediMindLevelsByCourse(selectedCourseCode!),
        enabled: !!selectedCourseCode,
    });

    // --- Grouped History ---
    const groupedHistory = useMemo(() => {
        const groups: Record<string, {
            id: string;
            name: string;
            entries: MediMindStudentAnswer[];
            correct: number;
            wrong: number;
            balance: number;
            maxScore: number;
            accuracy_rate: number;
            completion_rate: number;
        }> = {};

        studentHistory.forEach(ans => {
            const levelId = String(ans.level_id);
            const levelName = ans.level_name || 'Uncategorized';
            
            if (!groups[levelId]) {
                // Find level info for max score by ID
                const levelInfo = courseLevels.find(l => String(l.id) === levelId);
                const medicineCount = Number(levelInfo?.medicine_count || 0);
                const questionCount = Number(levelInfo?.question_count || 0);
                const maxLevelScore = medicineCount * questionCount * 10;

                groups[levelId] = { 
                    id: levelId,
                    name: levelName, 
                    entries: [], 
                    correct: 0, 
                    wrong: 0, 
                    balance: 0,
                    maxScore: maxLevelScore,
                    accuracy_rate: 0,
                    completion_rate: 0
                };
            }
            groups[levelId].entries.push(ans);
            if (ans.correct_status === 'Correct') groups[levelId].correct++;
            else groups[levelId].wrong++;
        });

        // Finalize stats for each group
        Object.values(groups).forEach(g => {
            const totalAttempts = g.correct + g.wrong;
            g.accuracy_rate = totalAttempts > 0 ? (g.correct / totalAttempts) * 100 : 0;
            g.balance = (g.correct * 10) - (g.wrong * 2);

            // Level Completion: unique medicines with correct answers in this level
            const levelInfo = courseLevels.find(l => String(l.id) === g.id);
            const totalMedicinesInLevel = Number(levelInfo?.medicine_count || 0);
            
            if (totalMedicinesInLevel > 0) {
                const uniqueCorrectMedicines = new Set(
                    g.entries
                        .filter(e => e.correct_status === 'Correct')
                        .map(e => e.medicine_id)
                ).size;
                g.completion_rate = (uniqueCorrectMedicines / totalMedicinesInLevel) * 100;
            }
        });

        return Object.values(groups);
    }, [studentHistory, courseLevels]);

    // --- Derived Calculations ---
    const filteredReport = useMemo(() => {
        const filtered = reportData.filter(student => 
            `${student.fname} ${student.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.username.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            const aEarned = (Number(a.correct_answers) * 10) - (Number(a.wrong_answers) * 2);
            const aPossible = (Number(a.total_questions_in_batch || 0) * 10);
            const aRate = aPossible > 0 ? aEarned / aPossible : -1;

            const bEarned = (Number(b.correct_answers) * 10) - (Number(b.wrong_answers) * 2);
            const bPossible = (Number(b.total_questions_in_batch || 0) * 10);
            const bRate = bPossible > 0 ? bEarned / bPossible : -1;

            return bRate - aRate;
        });
    }, [reportData, searchTerm]);

    const stats = useMemo(() => {
        if (reportData.length === 0) return null;
        const totalAttempts = reportData.reduce((acc, curr) => acc + Number(curr.total_attempts), 0);
        const totalCorrect = reportData.reduce((acc, curr) => acc + Number(curr.correct_answers), 0);
        const totalWrong = reportData.reduce((acc, curr) => acc + Number(curr.wrong_answers), 0);
        const avgAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
        
        // Completion stats
        const avgCompletion = reportData.reduce((acc, curr) => acc + Number(curr.completion_rate), 0) / reportData.length;
        
        return { totalAttempts, totalCorrect, totalWrong, avgAccuracy, avgCompletion };
    }, [reportData]);

    const handleExport = () => {
        if (filteredReport.length === 0) return;
        
        const headers = ["Student Name", "Username", "Total Attempts", "Correct", "Wrong", "Balance", "Max Possible", "Grade Score Rate", "Accuracy", "Completion Rate"];
        const csvData = filteredReport.map(s => {
            const accuracy = s.total_attempts > 0 ? ((s.correct_answers / s.total_attempts) * 100).toFixed(1) : "0";
            const balance = (Number(s.correct_answers) * 10) - (Number(s.wrong_answers) * 2);
            const maxScore = Number(s.total_questions_in_batch) * 10;
            const gradeRate = maxScore > 0 ? ((balance / maxScore) * 100).toFixed(1) : "0.0";
            return [
                `"${s.fname} ${s.lname}"`,
                s.username,
                s.total_attempts,
                s.correct_answers,
                s.wrong_answers,
                balance,
                maxScore,
                `"${gradeRate}% (${balance}/${maxScore})"`,
                `"${accuracy}%"`,
                `"${s.completion_rate.toFixed(1)}%"`
            ].join(",");
        });
        
        const csvContent = [headers.join(","), ...csvData].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `MediMind_Progress_${selectedCourseCode}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button variant="ghost" onClick={() => router.push('/admin/manage/games/medimind')} className="-ml-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to MediMind Setup
                    </Button>
                    <h1 className="text-3xl font-headline font-semibold mt-2 flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Batch Progress Report
                    </h1>
                    <p className="text-muted-foreground">Monitor performance analytics for students in a specific batch.</p>
                </div>
                {selectedCourseCode && reportData.length > 0 && (
                    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters */}
                <Card className="lg:col-span-1 shadow-md h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Report Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Batch</label>
                            {isLoadingBatches ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select value={selectedCourseCode || ""} onValueChange={setSelectedCourseCode}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a batch..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(batch => (
                                            <SelectItem key={batch.id} value={batch.courseCode}>
                                                {batch.name} ({batch.courseCode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Name or Username..." 
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={!selectedCourseCode}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Summary Cards */}
                    {selectedCourseCode && stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            <Card className="bg-primary/5 border-primary/10">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase">Total Attempts</p>
                                        <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-500/5 border-green-500/10">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase">Correct Answers</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.totalCorrect}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-amber-500/5 border-amber-500/10">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <BarChart3 className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase">Avg. Accuracy</p>
                                        <p className="text-2xl font-bold text-amber-600">{stats.avgAccuracy.toFixed(1)}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-blue-500/5 border-blue-500/10">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase">Avg. Completion</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.avgCompletion.toFixed(1)}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Card className="shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle>Batch Performance Details</CardTitle>
                            <CardDescription>
                                Individual student breakdown for batch: <span className="font-bold text-foreground">{selectedCourseCode || 'None Selected'}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!selectedCourseCode ? (
                                <div className="p-20 text-center text-muted-foreground">
                                    <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                    <p className="italic text-lg">Select a batch to generate the progress report.</p>
                                </div>
                            ) : isLoadingReport ? (
                                <div className="p-8 space-y-4">
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            ) : isError ? (
                                <div className="p-20 text-center text-red-500">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                                    <p>Failed to load report data. Please try again.</p>
                                </div>
                            ) : filteredReport.length === 0 ? (
                                <div className="p-20 text-center text-muted-foreground">
                                    <Search className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                    <p>No student progress found for this batch.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-bold">Student Name</TableHead>
                                            <TableHead className="font-bold text-center">Total Attempts</TableHead>
                                            <TableHead className="font-bold text-center">Correct</TableHead>
                                            <TableHead className="font-bold text-center">Balance</TableHead>
                                            <TableHead className="font-bold text-center">Accuracy</TableHead>
                                            <TableHead className="font-bold text-center">Completion</TableHead>
                                            <TableHead className="font-bold text-center text-primary">Grade Score Rate</TableHead>
                                            <TableHead className="font-bold text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReport.map((student) => {
                                            const accuracy = student.total_attempts > 0 
                                                ? (student.correct_answers / student.total_attempts) * 100 
                                                : 0;
                                            
                                            return (
                                                <TableRow 
                                                    key={student.username} 
                                                    className="hover:bg-muted/20 cursor-pointer"
                                                    onClick={() => setSelectedStudent(student)}
                                                >
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <p className="font-bold text-base">{student.fname} {student.lname}</p>
                                                            <p className="text-xs text-muted-foreground">{student.username}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="font-bold">
                                                            {student.total_attempts}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-green-600 font-bold">
                                                        {student.correct_answers}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center justify-center gap-0.5">
                                                            <div className="flex items-center gap-1.5 font-black text-yellow-600">
                                                                <TrendingUp className="h-3 w-3" />
                                                                {(Number(student.correct_answers) * 10) - (Number(student.wrong_answers) * 2)}
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-bold">
                                                                Max: {(Number(student.total_questions_in_batch || 0) * 10) || 0}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="font-bold">{accuracy.toFixed(1)}%</span>
                                                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full ${accuracy > 75 ? 'bg-green-500' : accuracy > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                                    style={{ width: `${accuracy}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-primary">{student.completion_rate.toFixed(1)}%</span>
                                                                <span className="text-[10px] text-muted-foreground">({student.unique_correct_medicines}/{student.total_medicines_in_batch})</span>
                                                            </div>
                                                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-primary" 
                                                                    style={{ width: `${student.completion_rate}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {(() => {
                                                            const earned = (Number(student.correct_answers) * 10) - (Number(student.wrong_answers) * 2);
                                                            const possible = (Number(student.total_questions_in_batch || 0) * 10);
                                                            const rate = possible > 0 ? (earned / possible) * 100 : 0;
                                                            return (
                                                                <div className="flex flex-col items-center">
                                                                    <span className="font-black text-primary text-sm">{rate.toFixed(1)}%</span>
                                                                    <span className="text-[10px] text-muted-foreground font-medium">({earned}/{possible})</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {student.completion_rate >= 100 ? (
                                                            <Badge className="bg-green-600">Completed</Badge>
                                                        ) : student.total_attempts > 0 ? (
                                                            <Badge variant="secondary">In Progress</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Not Started</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Student Breakdown Modal */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-primary/10 to-transparent">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="flex items-center gap-2 text-3xl font-headline font-bold">
                                    <GraduationCap className="h-8 w-8 text-primary" />
                                    Performance Breakdown
                                </DialogTitle>
                                <DialogDescription className="text-lg">
                                    Detailed results for <span className="font-bold text-foreground underline decoration-primary/30">{selectedStudent?.fname} {selectedStudent?.lname}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto p-6 pt-2">
                        {selectedStudent && (
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                                    <TabsTrigger value="overview" className="text-base font-bold">Overview & Calculation</TabsTrigger>
                                    <TabsTrigger value="history" className="text-base font-bold">Full Submission History</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-8 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-2xl bg-green-500/5 border-2 border-green-500/10 flex items-center justify-between group hover:border-green-500/30 transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-green-600 uppercase mb-1 tracking-widest">Correct Answers</p>
                                                <p className="text-4xl font-black text-green-700">{selectedStudent.correct_answers}</p>
                                            </div>
                                            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-red-500/5 border-2 border-red-500/10 flex items-center justify-between group hover:border-red-500/30 transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-red-600 uppercase mb-1 tracking-widest">Wrong Attempts</p>
                                                <p className="text-4xl font-black text-red-700">{selectedStudent.wrong_answers}</p>
                                            </div>
                                            <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <XCircle className="h-8 w-8 text-red-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Calculation Details */}
                                        <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border-2 border-muted/50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <TrendingUp className="h-24 w-24" />
                                            </div>
                                            <h4 className="text-base font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5" />
                                                Balance Formula
                                            </h4>
                                            
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between items-center py-3 border-b border-muted/50">
                                                    <span className="text-base">Points from Correct ({selectedStudent.correct_answers} × 10)</span>
                                                    <span className="text-xl font-bold text-green-600">+{Number(selectedStudent.correct_answers) * 10}</span>
                                                </div>

                                                <div className="flex justify-between items-center py-3 border-b border-muted/50">
                                                    <span className="text-base">Deductions ({selectedStudent.wrong_answers} × 2)</span>
                                                    <span className="text-xl font-bold text-red-600">-{Number(selectedStudent.wrong_answers) * 2}</span>
                                                </div>

                                                <div className="flex justify-between items-center pt-4">
                                                    <span className="text-lg font-black uppercase tracking-tight">Net Earned Balance</span>
                                                    <span className="text-4xl font-black text-yellow-600 drop-shadow-sm">
                                                        {(Number(selectedStudent.correct_answers) * 10) - (Number(selectedStudent.wrong_answers) * 2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mastery Progress */}
                                        <div className="space-y-6 flex flex-col justify-center">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <h4 className="text-base font-bold uppercase tracking-wider text-muted-foreground">Medicine Mastery</h4>
                                                        <p className="text-3xl font-black text-primary">
                                                            {selectedStudent.unique_correct_medicines} <span className="text-lg text-muted-foreground font-medium">/ {selectedStudent.total_medicines_in_batch} Mastered</span>
                                                        </p>
                                                    </div>
                                                    <Badge className="h-8 px-4 text-sm bg-primary/20 text-primary hover:bg-primary/30 border-none">
                                                        {selectedStudent.completion_rate.toFixed(1)}%
                                                    </Badge>
                                                </div>
                                                <div className="h-4 w-full bg-muted rounded-full overflow-hidden p-1 border shadow-inner">
                                                    <div 
                                                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-lg" 
                                                        style={{ width: `${selectedStudent.completion_rate}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">
                                                    Student has mastered {selectedStudent.unique_correct_medicines} unique medicine-level tasks assigned to this batch.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="rounded-2xl border-2 overflow-hidden h-[500px] flex flex-col bg-card">
                                        {isLoadingHistory ? (
                                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="h-12 w-12 animate-spin text-primary" /> 
                                                <p className="text-muted-foreground font-medium animate-pulse">Retrieving submission logs...</p>
                                            </div>
                                        ) : groupedHistory.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                                <Search className="h-16 w-16 mb-4 opacity-10" />
                                                <p className="text-xl font-medium">No submission records found</p>
                                                <p className="text-sm italic">This student hasn't started the game for this batch yet.</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-auto p-4">
                                                <Accordion type="multiple" className="space-y-4">
                                                    {groupedHistory.map((group) => (
                                                        <AccordionItem key={group.name} value={group.name} className="border rounded-2xl overflow-hidden bg-muted/20">
                                                            <AccordionTrigger className="hover:no-underline px-4 py-4 hover:bg-muted/50 transition-all">
                                                                <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 text-left pr-4">
                                                                    <div className="space-y-1">
                                                                        <h3 className="text-xl font-black text-primary leading-none">{group.name}</h3>
                                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                                            {group.entries.length} Submissions
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex flex-col items-center px-4 border-r border-muted-foreground/20">
                                                                            <span className="text-[8px] font-bold text-green-600 uppercase">Correct</span>
                                                                            <span className="text-lg font-black">{group.correct}</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-4 border-r border-muted-foreground/20">
                                                                            <span className="text-[8px] font-bold text-red-600 uppercase">Wrong</span>
                                                                            <span className="text-lg font-black">{group.wrong}</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-4 border-r border-muted-foreground/20">
                                                                            <span className="text-[8px] font-bold text-muted-foreground uppercase">Level Max</span>
                                                                            <span className="text-lg font-black text-muted-foreground">{group.maxScore}</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-4 border-r border-muted-foreground/20">
                                                                            <span className="text-[8px] font-bold text-blue-600 uppercase">Completion</span>
                                                                            <span className="text-lg font-black text-blue-600">{group.completion_rate.toFixed(0)}%</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center px-4 border-r border-muted-foreground/20">
                                                                            <span className="text-[8px] font-bold text-purple-600 uppercase">Accuracy</span>
                                                                            <span className="text-lg font-black text-purple-600">{group.accuracy_rate.toFixed(0)}%</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 px-2">
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-[8px] font-bold text-yellow-600 uppercase">Net Balance</span>
                                                                                <span className="text-xl font-black text-yellow-600 leading-none">{group.balance}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="p-4 pt-0">
                                                                <div className="rounded-xl border bg-card overflow-hidden mt-2">
                                                                    <Table>
                                                                        <TableHeader className="bg-muted">
                                                                            <TableRow>
                                                                                <TableHead className="w-[180px] font-bold text-xs uppercase">Medicine</TableHead>
                                                                                <TableHead className="font-bold text-xs uppercase">Question Detail</TableHead>
                                                                                <TableHead className="w-[100px] text-center font-bold text-xs uppercase">Status</TableHead>
                                                                                <TableHead className="w-[150px] text-right font-bold text-xs uppercase">Time</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {group.entries.map((ans) => (
                                                                                <TableRow key={ans.id} className="hover:bg-muted/30 transition-colors">
                                                                                    <TableCell>
                                                                                        <p className="font-bold text-sm text-primary">{ans.medicine_name || 'Medicine'}</p>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-xs font-medium line-clamp-1" title={ans.question}>{ans.question || '...'}</p>
                                                                                            <p className="text-[10px] text-muted-foreground italic">Answered: <span className="text-foreground">{ans.answer || 'N/A'}</span></p>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                    <TableCell className="text-center">
                                                                                        <Badge 
                                                                                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                                                                                                ans.correct_status === 'Correct' 
                                                                                                ? 'bg-green-500/20 text-green-700 border-green-500/30' 
                                                                                                : 'bg-red-500/20 text-red-700 border-red-500/30'
                                                                                            }`}
                                                                                        >
                                                                                            {ans.correct_status}
                                                                                        </Badge>
                                                                                    </TableCell>
                                                                                    <TableCell className="text-right whitespace-nowrap">
                                                                                        <div className="text-[10px] font-bold">
                                                                                            {format(new Date(ans.created_at), 'p')}
                                                                                        </div>
                                                                                        <div className="text-[8px] text-muted-foreground">
                                                                                            {format(new Date(ans.created_at), 'MMM dd, yyyy')}
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>

                    <div className="p-6 bg-muted/30 border-t flex justify-end">
                        <Button className="px-8 h-12 text-lg font-bold rounded-xl shadow-lg" onClick={() => setSelectedStudent(null)}>
                            Close Breakdown
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
