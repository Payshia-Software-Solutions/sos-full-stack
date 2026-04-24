"use client";

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    getAllWinPharmaSubmissionsAdmin, 
    getWinpharmaCommonReasons,
    QA_API_BASE_URL 
} from '@/lib/actions/games';
import { getBatches } from '@/lib/actions/courses';
import type { WinPharmaSubmission, Batch } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    Eye, 
    RefreshCw, 
    Filter,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

// Removing hardcoded ITEMS_PER_PAGE to use state instead

export default function WinPharmaCourseSubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const courseCode = params.courseCode as string;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Reset to page 1 when filters or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, itemsPerPage]);

    // Fetch batch details to get course name
    const { data: batches = [] } = useQuery<Batch[]>({
        queryKey: ['adminBatches'],
        queryFn: getBatches,
    });

    const selectedCourse = useMemo(() => {
        return batches.find(b => b.courseCode === courseCode);
    }, [batches, courseCode]);

    // Fetch submissions for selected course
    const { data: submissions = [], isLoading, isError } = useQuery({
        queryKey: ['adminWinPharmaSubmissions', courseCode],
        queryFn: () => getAllWinPharmaSubmissionsAdmin(courseCode),
        enabled: !!courseCode,
    });

    // Fetch common reasons
    const { data: commonReasons = [] } = useQuery({
        queryKey: ['winpharmaCommonReasons'],
        queryFn: getWinpharmaCommonReasons,
    });

    // Auto-sync: Refetch when window is focused
    useEffect(() => {
        const onFocus = () => {
            if (courseCode) {
                queryClient.invalidateQueries({ queryKey: ['adminWinPharmaSubmissions', courseCode] });
            }
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [courseCode, queryClient]);

    // Helper to resolve reason IDs to text
    const resolveReasonText = (reasonCodes: string) => {
        if (!reasonCodes) return '-';
        const ids = reasonCodes.split(',').map(id => id.trim());
        const resolved = ids.map(id => {
            const match = commonReasons.find((r: any) => String(r.id) === id);
            return match ? match.reason : id;
        });
        return resolved.join(', ');
    };

    // Statistics Calculation
    const stats = useMemo(() => {
        return {
            total: submissions.length,
            pending: submissions.filter(s => s.grade_status === 'Pending').length,
            spPending: submissions.filter(s => s.grade_status === 'Sp-Pending').length,
            reCorrection: submissions.filter(s => Number(s.recorrection_count) > 0).length,
            completed: submissions.filter(s => s.grade_status === 'Completed').length,
            tryAgain: submissions.filter(s => s.grade_status === 'Try Again').length,
        };
    }, [submissions]);

    // Filtering & Pagination
    const filteredSubmissions = useMemo(() => {
        let result = [...submissions];

        // 1. Filter by Status
        if (statusFilter !== 'all') {
            if (statusFilter === 'Re-correction') {
                result = result.filter(s => Number(s.recorrection_count) > 0);
            } else {
                result = result.filter(s => s.grade_status === statusFilter);
            }
        }

        // 2. Filter by Search Term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(s => 
                s.index_number.toLowerCase().includes(lowerTerm) || 
                (s as any).resource_title?.toLowerCase().includes(lowerTerm) ||
                String(s.submission_id).includes(lowerTerm)
            );
        }

        // 3. Apply consistent sorting
        result.sort((a, b) => {
            const statusOrder = (status: string) => {
                const s = (status || '').trim().toLowerCase();
                if (s === 'pending') return 0;
                if (s === 'sp-pending') return 1;
                return 2;
            };

            const orderA = statusOrder(a.grade_status);
            const orderB = statusOrder(b.grade_status);

            if (orderA !== orderB) return orderA - orderB;

            // Same status group:
            if (orderA === 0 || orderA === 1) {
                // Pending: FIFO (Oldest first)
                return (a.date_time || '').localeCompare(b.date_time || '');
            } else {
                // Graded: LIFO (Recently updated first)
                const timeA = a.update_at || a.date_time || '';
                const timeB = b.update_at || b.date_time || '';
                return timeB.localeCompare(timeA);
            }
        });

        return result;
    }, [submissions, statusFilter, searchTerm]);

    const paginatedSubmissions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSubmissions.slice(start, start + itemsPerPage);
    }, [filteredSubmissions, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

    if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-20 w-full rounded-2xl" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}</div></div>;

    return (
        <div className="p-3 md:p-8 space-y-6 md:space-y-8 pb-32 w-full">
            <header className="space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/admin/manage/winpharma-submissions')} className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 text-white shrink-0">
                        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                    <div className="bg-[#00ADC8] text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] w-full shadow-2xl">
                        <h1 className="text-lg md:text-2xl font-bold tracking-tight">
                            <span className="md:inline hidden">{courseCode} - {selectedCourse?.name || 'Loading Name...'}</span>
                            <span className="md:hidden block text-base truncate">{courseCode}</span>
                            <span className="md:hidden block text-xs opacity-80 truncate">{selectedCourse?.name}</span>
                        </h1>
                    </div>
                </div>

                {/* STATS BOXES */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {[
                        { label: 'All', value: stats.total, color: 'bg-black', active: statusFilter === 'all', filter: 'all' },
                        { label: 'Pending', value: stats.pending, color: 'bg-[#FFB700]', active: statusFilter === 'Pending', filter: 'Pending' },
                        { label: 'Sp-Pending', value: stats.spPending, color: 'bg-[#DE3E44]', active: statusFilter === 'Sp-Pending', filter: 'Sp-Pending' },
                        { label: 'Re-correction', value: stats.reCorrection, color: 'bg-[#00D0FF]', active: statusFilter === 'Re-correction', filter: 'Re-correction' },
                        { label: 'Completed', value: stats.completed, color: 'bg-[#1D794D]', active: statusFilter === 'Completed', filter: 'Completed' },
                        { label: 'Try Again', value: stats.tryAgain, color: 'bg-[#6D757D]', active: statusFilter === 'Try Again', filter: 'Try Again' },
                    ].map((s) => (
                        <div 
                            key={s.label}
                            onClick={() => setStatusFilter(s.filter)}
                            className={cn(
                                "p-4 md:p-6 rounded-2xl md:rounded-[1.2rem] flex flex-col justify-between h-32 md:h-40 cursor-pointer transition-all duration-300 shadow-xl",
                                s.color,
                                s.active ? "ring-2 md:ring-4 ring-white/50 scale-[1.03] md:scale-105 z-10" : "opacity-90 hover:opacity-100 hover:scale-[1.02]"
                            )}
                        >
                            <span className="text-white text-sm md:text-lg font-medium">{s.label}</span>
                            <span className="text-white text-2xl md:text-4xl font-black">{s.value}</span>
                        </div>
                    ))}
                </div>
            </header>

            <Card className="border-none shadow-2xl rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-950 ring-1 ring-black/5">
                <CardHeader className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Show</span>
                                <Select value={String(itemsPerPage)} onValueChange={(val) => setItemsPerPage(Number(val))}>
                                    <SelectTrigger className="w-16 md:w-20 h-9 md:h-10 rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest md:block hidden">entries</span>
                            <Badge variant="outline" className="md:hidden px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border-none rounded-full text-[10px] font-bold">
                                {filteredSubmissions.length} Results
                            </Badge>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search index or task..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-11 md:h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-none">
                                    <TableHead className="px-8 font-black uppercase text-[11px] tracking-widest text-[#444]">ID</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Index Number</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Level</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Action</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Time</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Grade</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Status</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Reason</TableHead>
                                    <TableHead className="font-black uppercase text-[11px] tracking-widest text-[#444]">Checked By</TableHead>
                                    <TableHead className="px-8 font-black uppercase text-[11px] tracking-widest text-[#444]">Updated at</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSubmissions.map((s) => (
                                    <TableRow key={s.submission_id} className="group border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors h-16">
                                        <TableCell className="px-8 font-medium">{s.submission_id}</TableCell>
                                        <TableCell className="font-bold">{s.index_number}</TableCell>
                                        <TableCell className="font-medium">{(s as any).resource_title}</TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                onClick={() => router.push(`/admin/manage/winpharma-submissions/${courseCode}/grade/${s.submission_id}`)} 
                                                className="bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white rounded-lg h-9 px-4 flex items-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" /> View
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-muted-foreground">{s.date_time}</TableCell>
                                        <TableCell className="font-bold">{s.grade || '0.00'}%</TableCell>
                                        <TableCell>
                                            <Badge 
                                                className={cn(
                                                    "rounded-[4px] px-3 py-1 font-bold shadow-sm",
                                                    s.grade_status === 'Pending' ? "bg-[#FFB700] text-white" :
                                                    s.grade_status === 'Completed' ? "bg-[#198754] text-white" :
                                                    "bg-[#6D757D] text-white"
                                                )}
                                            >
                                                {s.grade_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[150px] truncate text-[10px] font-bold text-zinc-400" title={resolveReasonText(s.reason)}>
                                                {resolveReasonText(s.reason)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm opacity-60">{(s as any).update_by}</TableCell>
                                        <TableCell className="px-8 text-xs opacity-60">{(s as any).update_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* MOBILE CARD LIST */}
                    <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-900">
                        {paginatedSubmissions.map((s) => (
                            <div key={s.submission_id} className="p-5 space-y-4 active:bg-zinc-50 dark:active:bg-zinc-900/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">#{s.submission_id}</span>
                                            <Badge 
                                                className={cn(
                                                    "rounded-[4px] px-2 py-0.5 font-bold text-[9px] uppercase",
                                                    s.grade_status === 'Pending' ? "bg-[#FFB700] text-white" :
                                                    s.grade_status === 'Completed' ? "bg-[#198754] text-white" :
                                                    "bg-[#6D757D] text-white"
                                                )}
                                            >
                                                {s.grade_status}
                                            </Badge>
                                        </div>
                                        <p className="font-black text-base">{s.index_number}</p>
                                        <p className="text-xs font-medium text-zinc-500">{(s as any).resource_title}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xl text-primary">{s.grade || '0.00'}<span className="text-[10px] ml-0.5">%</span></p>
                                        <p className="text-[9px] font-medium text-zinc-400 mt-1">{s.date_time?.split(' ')[0]}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => router.push(`/admin/manage/winpharma-submissions/${courseCode}/grade/${s.submission_id}`)} 
                                        className="flex-1 bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white rounded-xl h-11 font-bold text-sm gap-2"
                                    >
                                        <Eye className="h-4 w-4" /> Review Submission
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {paginatedSubmissions.length === 0 && (
                        <div className="py-20 text-center space-y-4 opacity-50">
                            <FileText className="h-12 w-12 mx-auto" />
                            <p className="font-bold">No submissions found for this filter.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PAGINATION */}
            <div className="flex items-center justify-between mt-8 md:mt-12 bg-white dark:bg-zinc-900 p-4 rounded-2xl md:rounded-[2rem] shadow-xl ring-1 ring-black/5">
                <p className="text-[10px] md:text-sm text-muted-foreground font-bold hidden sm:block">
                    Showing <span className="text-foreground">{paginatedSubmissions.length}</span> of <span className="text-foreground">{filteredSubmissions.length}</span> entries
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex-1 sm:flex-none h-11 md:h-12 w-11 md:w-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none font-bold p-0"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 md:gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                // Show first, last, and pages around current
                                if (totalPages <= 5) return true;
                                if (page === 1 || page === totalPages) return true;
                                return Math.abs(page - currentPage) <= 1;
                            })
                            .map((page, index, array) => (
                                <div key={page} className="flex items-center">
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                        <span className="text-muted-foreground px-1 md:px-2">...</span>
                                    )}
                                    <Button
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={cn(
                                            "h-11 md:h-12 min-w-[2.75rem] md:min-w-[3rem] rounded-xl border-none font-black text-xs md:text-sm transition-all duration-200",
                                            currentPage === page 
                                                ? "bg-primary text-white shadow-lg scale-105" 
                                                : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        {page}
                                    </Button>
                                </div>
                            ))
                        }
                        {totalPages === 0 && (
                            <div className="h-11 md:h-12 min-w-[3rem] rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center font-black text-sm opacity-50">
                                0
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="flex-1 sm:flex-none h-11 md:h-12 w-11 md:w-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none font-bold p-0"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
