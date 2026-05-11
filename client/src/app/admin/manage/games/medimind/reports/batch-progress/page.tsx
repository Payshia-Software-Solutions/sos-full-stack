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
}

export default function BatchProgressReportPage() {
    const router = useRouter();
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    // --- Derived Calculations ---
    const filteredReport = useMemo(() => {
        return reportData.filter(student => 
            `${student.fname} ${student.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
        
        const headers = ["Student Name", "Username", "Total Attempts", "Correct", "Wrong", "Accuracy", "Completion Rate"];
        const csvData = filteredReport.map(s => {
            const accuracy = s.total_attempts > 0 ? ((s.correct_answers / s.total_attempts) * 100).toFixed(1) : "0";
            return [
                `"${s.fname} ${s.lname}"`,
                s.username,
                s.total_attempts,
                s.correct_answers,
                s.wrong_answers,
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
                                            <TableHead className="font-bold text-center">Accuracy</TableHead>
                                            <TableHead className="font-bold text-center">Completion</TableHead>
                                            <TableHead className="font-bold text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReport.map((student) => {
                                            const accuracy = student.total_attempts > 0 
                                                ? (student.correct_answers / student.total_attempts) * 100 
                                                : 0;
                                            
                                            return (
                                                <TableRow key={student.username} className="hover:bg-muted/20">
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
        </div>
    );
}
