"use client";

import { useQuery } from '@tanstack/react-query';
import { getWinPharmaGraderPerformance } from '@/lib/actions/games';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Banknote, Users, ClipboardCheck, Clock, XCircle, ArrowLeft, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WinPharmaGraderPerformancePage() {
    const router = useRouter();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['winPharmaGraderPerformance'],
        queryFn: getWinPharmaGraderPerformance,
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold text-destructive">Error Loading Report</h1>
                <p className="text-muted-foreground">{(error as Error).message}</p>
            </div>
        );
    }

    const performanceData = data?.data || [];

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 pb-20">
            <header className="space-y-4">
                <Button variant="ghost" onClick={() => router.push('/admin/manage/games/winpharma')} className="-ml-4 text-zinc-400 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to WinPharma Setup
                </Button>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                            <BarChart3 className="w-10 h-10 text-primary" />
                            Grading Performance
                        </h1>
                        <p className="text-zinc-400 font-medium mt-1">WinPharma task evaluations and payroll summary.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
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
                        <div>
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Completed</p>
                            <p className="text-2xl font-black text-white">
                                {performanceData.reduce((acc: number, curr: any) => acc + parseInt(curr.completed_count), 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Pending</p>
                            <p className="text-2xl font-black text-white">
                                {performanceData.reduce((acc: number, curr: any) => acc + parseInt(curr.pending_count), 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px]">Total Payable</p>
                            <p className="text-2xl font-black text-white">
                                {formatPrice(performanceData.reduce((acc: number, curr: any) => acc + parseFloat(curr.total_earnings), 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-zinc-900/50 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
                <CardHeader className="p-8 border-b border-white/5 bg-zinc-900/20">
                    <CardTitle className="text-2xl font-black text-white">Staff Statistics</CardTitle>
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
                                    <TableHead className="py-6 px-8 text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-center">Rejected</TableHead>
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
                                            {row.pending_count}
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-center font-bold text-green-500">
                                            {row.completed_count}
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-center font-bold text-rose-500/70">
                                            {row.rejected_count}
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-center font-bold text-zinc-400">
                                            {row.total_graded}
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
                                        <TableCell colSpan={7} className="py-20 text-center space-y-4 opacity-50">
                                            <div className="flex flex-col items-center gap-4">
                                                <XCircle className="h-12 w-12 text-zinc-500" />
                                                <p className="text-xl font-bold text-zinc-400">No grading history found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl space-y-2">
                <div className="flex items-center gap-3 text-zinc-100 font-bold text-sm">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Grading Performance Transparency
                </div>
                <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                    This report shows work performed specifically for the <span className="text-white">WinPharma</span> game module. 
                    Earnings are derived from the <span className="text-primary">WinpharmaGrading</span> task reference in the system commission setup.
                </p>
            </div>
        </div>
    );
}
