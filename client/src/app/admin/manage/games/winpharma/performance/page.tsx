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
        <div className="p-4 md:p-8 space-y-8 pb-20">
            <header className="space-y-4 text-left">
                <Button 
                    variant="ghost" 
                    onClick={() => router.push('/admin/manage/games/winpharma')} 
                    className="-ml-4 text-zinc-400 hover:text-white"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to WinPharma Setup
                </Button>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-2">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                            <BarChart3 className="w-10 h-10 text-primary" />
                            Grading Performance
                        </h1>
                        <p className="text-zinc-400 font-medium mt-1">WinPharma task evaluations and payroll summary.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 ring-1 ring-white/5 w-full md:w-80">
                         <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <Select onValueChange={(value) => setSelectedBatch(value)} value={selectedBatch}>
                                <SelectTrigger className="bg-transparent border-none text-white focus:ring-0 p-0 h-auto font-bold">
                                    <SelectValue placeholder="Select a batch..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-2xl">
                                    {batchesData?.map((batch: any) => (
                                        <SelectItem key={batch.courseCode} value={batch.courseCode} className="focus:bg-primary/20 focus:text-primary rounded-lg cursor-pointer">
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
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                    <div className="p-8 bg-zinc-900/50 rounded-[3rem] border border-white/5 shadow-2xl animate-pulse">
                         <Search className="w-20 h-20 text-zinc-700" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white">No Batch Selected</h2>
                        <p className="text-zinc-500 max-w-sm font-medium">Please select a course batch from the menu above to generate the performance report.</p>
                    </div>
                </div>
            ) : isLoading ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-28 w-full rounded-[2rem] bg-zinc-900" />
                        ))}
                    </div>
                    <Skeleton className="h-[500px] w-full rounded-[2.5rem] bg-zinc-900" />
                </div>
            ) : isError ? (
                <div className="p-20 text-center space-y-4 bg-red-500/5 rounded-[3rem] border border-red-500/10">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <h1 className="text-3xl font-black text-white tracking-tight">Error Loading Report</h1>
                    <p className="text-red-400/80 font-medium">{(error as Error).message}. Check if the API endpoint is functioning.</p>
                    <Button onClick={() => refetch()} variant="outline" className="border-red-500/20 hover:bg-red-500/10 text-red-400 font-bold">Try Again</Button>
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <LayoutList className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Batch Submissions</p>
                                    <p className="text-2xl font-black text-white">{batchStats.total_submissions}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                    <History className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">To be Graded</p>
                                    <p className="text-2xl font-black text-white">{batchStats.total_to_grade}</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Total Graders</p>
                                    <p className="text-2xl font-black text-white">{performanceData.length}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Completed</p>
                                    <p className="text-2xl font-black text-white">{batchStats.total_completed || 0}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                                    <RotateCw className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Try Again</p>
                                    <p className="text-2xl font-black text-white">{batchStats.total_try_again || 0}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <Banknote className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Total Payable</p>
                                    <p className="text-2xl font-black text-white">
                                        {formatPrice(performanceData.reduce((acc: number, curr: any) => acc + parseFloat(curr.total_earnings), 0))}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-zinc-900/50 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5 flex flex-col text-left">
                        <CardHeader className="p-8 border-b border-white/5 bg-zinc-900/20">
                            <CardTitle className="text-2xl font-black text-white">Staff Statistics for {selectedBatch}</CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">Breakdown of grading activity and earnings per staff member.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Employee</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-center">Pending</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-center">Completed</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-center">Try Again</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-center">Rejected</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-center">Special</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-center">Total</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-right">Rate</TableHead>
                                            <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-right">Payable</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {performanceData.map((row: any) => (
                                            <TableRow key={row.grader_username} className="border-white/5 hover:bg-white/5 transition-colors group">
                                                <TableCell className="py-6 px-8 font-bold text-white">
                                                    <div className="flex flex-col">
                                                        <span>{row.first_name} {row.last_name}</span>
                                                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">@{row.grader_username}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-center font-bold text-yellow-500/80">
                                                    {row.pending_count || 0}
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-center font-bold text-green-500">
                                                    {row.completed_count || 0}
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-center font-bold text-rose-400">
                                                    {row.try_again_count || 0}
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-center font-bold text-zinc-500">
                                                    {row.rejected_count || 0}
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-center font-bold text-amber-500">
                                                    {row.special_count || 0}
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-center font-bold text-white/50">
                                                    {row.total_graded || 0}
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-right font-medium text-zinc-500 text-sm">
                                                    {formatPrice(row.commission_rate)}
                                                </TableCell>
                                                <TableCell className="py-6 px-8 text-right">
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none font-black text-xs px-4 py-1.5 rounded-xl transition-colors">
                                                        {formatPrice(row.total_earnings)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {performanceData.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={9} className="py-24 text-center space-y-4 opacity-50">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <FilterX className="h-16 w-16 text-zinc-600" />
                                                        <div className="space-y-1">
                                                            <p className="text-xl font-bold text-zinc-400 uppercase tracking-tighter">No Activity Found</p>
                                                            <p className="text-zinc-500 text-sm font-medium">No one has graded any work in batch "{selectedBatch}" yet.</p>
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

                    <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-2 flex flex-col text-left">
                        <div className="flex items-center gap-3 text-zinc-100 font-bold text-sm">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            Data Transparency for Batch {selectedBatch}
                        </div>
                        <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                            This report shows work performed specifically for students in the <span className="text-white font-bold">{selectedBatch}</span> batch of the <span className="text-white">WinPharma</span> game module. 
                            Earnings are derived from the <span className="text-primary font-bold">WinpharmaGrading</span> task reference in the system commission setup.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
