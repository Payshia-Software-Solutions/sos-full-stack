"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWinPharmaGraderPerformance } from '@/lib/actions/games';
import { getBatches } from '@/lib/actions/courses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Banknote, Users, ClipboardCheck, Clock, XCircle, 
    ArrowLeft, BarChart3, Search, GraduationCap,
    FilterX, LayoutList, History, RotateCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function WinPharmaGraderPerformancePage() {
    const router = useRouter();
    const [selectedBatch, setSelectedBatch] = useState<string>("");

    // Fetch batches for the selector
    const { data: batchesData, isLoading: isLoadingBatches } = useQuery({
        queryKey: ['batches'],
        queryFn: getBatches,
    });

    // Fetch performance data only when a batch is selected
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['winPharmaGraderPerformance', selectedBatch],
        queryFn: () => getWinPharmaGraderPerformance(selectedBatch),
        enabled: !!selectedBatch,
    });

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    const performanceData = data?.data || [];
    const batchStats = data?.stats || { total_submissions: 0, total_to_grade: 0, total_completed: 0, total_try_again: 0, total_rejected: 0 };

    return (
        <div className="p-4 md:p-8 space-y-8 pb-20 max-w-7xl mx-auto w-full">
            <header className="space-y-4 text-left">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/admin/manage/games/winpharma')} 
                    className="-ml-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to WinPharma Setup
                </Button>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-1">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            Grading Performance
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">WinPharma task evaluations and payroll summary.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-card p-2 px-3 rounded-2xl border border-border shadow-xs w-full md:w-80">
                         <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <Select onValueChange={(value) => setSelectedBatch(value)} value={selectedBatch}>
                                <SelectTrigger className="bg-transparent border-none text-foreground focus:ring-0 p-0 h-auto font-semibold shadow-none">
                                    <SelectValue placeholder="Select a batch..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {batchesData?.map((batch: any) => (
                                        <SelectItem key={batch.courseCode} value={batch.courseCode} className="cursor-pointer">
                                            {batch.name} ({batch.courseCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </header>

            {!selectedBatch ? (
                <div className="flex flex-col items-center justify-center py-28 text-center space-y-4 bg-muted/20 border border-dashed border-border rounded-3xl">
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                         <Search className="w-12 h-12 text-primary/60" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-foreground">No Batch Selected</h2>
                        <p className="text-muted-foreground max-w-sm text-sm">Please select a course batch from the menu above to generate the performance report.</p>
                    </div>
                </div>
            ) : isLoading ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            ) : isError ? (
                <div className="p-16 text-center space-y-4 bg-destructive/5 rounded-3xl border border-destructive/10">
                    <XCircle className="w-12 h-12 text-destructive mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Error Loading Report</h2>
                    <p className="text-destructive text-sm font-medium">{(error as Error).message}. Check if the API endpoint is functioning.</p>
                    <Button onClick={() => refetch()} variant="outline" className="border-destructive/20 hover:bg-destructive/10 text-destructive font-semibold">Try Again</Button>
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                    <LayoutList className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Submissions</p>
                                    <p className="text-xl font-bold text-foreground">{batchStats.total_submissions}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                                    <History className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">To be Graded</p>
                                    <p className="text-xl font-bold text-foreground">{batchStats.total_to_grade}</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Total Graders</p>
                                    <p className="text-xl font-bold text-foreground">{performanceData.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <ClipboardCheck className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Completed</p>
                                    <p className="text-xl font-bold text-foreground">{batchStats.total_completed || 0}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                                    <RotateCw className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Try Again</p>
                                    <p className="text-xl font-bold text-foreground">{batchStats.total_try_again || 0}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
                            <CardContent className="p-5 flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <Banknote className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Total Payable</p>
                                    <p className="text-lg font-bold text-foreground truncate">
                                        {formatPrice(performanceData.reduce((acc: number, curr: any) => acc + parseFloat(curr.total_earnings), 0))}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs flex flex-col text-left">
                        <CardHeader className="p-6 border-b border-border bg-muted/20">
                            <CardTitle className="text-xl font-bold text-foreground">Staff Statistics for {selectedBatch}</CardTitle>
                            <CardDescription className="text-muted-foreground text-sm">Breakdown of grading activity and earnings per staff member.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow className="border-border">
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Employee</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-center">Pending</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-center">Completed</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-center">Try Again</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-center">Rejected</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-center">Special</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-center">Total</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-right">Rate</TableHead>
                                            <TableHead className="py-4 px-6 text-muted-foreground font-bold uppercase tracking-wider text-[10px] text-right">Payable</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {performanceData.map((row: any) => (
                                            <TableRow key={row.grader_username} className="border-border hover:bg-muted/30 transition-colors group">
                                                <TableCell className="py-4 px-6 font-bold text-foreground">
                                                    <div className="flex flex-col">
                                                        <span>{row.first_name} {row.last_name}</span>
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">@{row.grader_username}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center font-bold text-amber-500">
                                                    {row.pending_count || 0}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                                    {row.completed_count || 0}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center font-bold text-rose-500">
                                                    {row.try_again_count || 0}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center font-bold text-muted-foreground">
                                                    {row.rejected_count || 0}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center font-bold text-amber-600 dark:text-amber-400">
                                                    {row.special_count || 0}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center font-bold text-foreground/70">
                                                    {row.total_graded || 0}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-right font-medium text-muted-foreground text-sm">
                                                    {formatPrice(row.commission_rate)}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-right">
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold text-xs px-3 py-1 rounded-lg transition-colors">
                                                        {formatPrice(row.total_earnings)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {performanceData.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={9} className="py-20 text-center space-y-4">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FilterX className="h-12 w-12 text-muted-foreground/50" />
                                                        <div className="space-y-1">
                                                            <p className="text-base font-bold text-foreground uppercase tracking-tight">No Activity Found</p>
                                                            <p className="text-muted-foreground text-sm font-medium">No one has graded any work in batch "{selectedBatch}" yet.</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-5 bg-muted/30 border border-border rounded-2xl space-y-2 flex flex-col text-left">
                        <div className="flex items-center gap-2.5 text-foreground font-semibold text-sm">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            Data Transparency for Batch {selectedBatch}
                        </div>
                        <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                            This report shows work performed specifically for students in the <span className="text-foreground font-bold">{selectedBatch}</span> batch of the <span className="text-foreground font-semibold">WinPharma</span> game module. 
                            Earnings are derived from the <span className="text-primary font-bold">WinpharmaGrading</span> task reference in the system commission setup.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
