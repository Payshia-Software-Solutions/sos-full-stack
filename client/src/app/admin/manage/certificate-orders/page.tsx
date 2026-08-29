"use client";

import { LMS_API_URL } from "@/lib/config";
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
    getCertificateOrders, 
    updateCertificateOrderCourses, 
    updateCertificateOrderStatus, 
    deleteCertificateOrder, 
    generateCertificate, 
    getUserCertificatePrintStatus 
} from '@/lib/actions/certificates';
import { getStudentFullInfo, getStudentBalance } from '@/lib/actions/users';
import { getParentCourses, getBatches } from '@/lib/actions/courses';
import type { 
    CertificateOrder, 
    FullStudentData, 
    UserCertificatePrintStatus, 
    GenerateCertificatePayload,
    ParentCourse,
    Batch
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
    AlertTriangle, CheckCircle, Loader2, XCircle, Search, FileDown, Phone, Home, Mail, User, 
    ListOrdered, Award, Copy, Trash2, Printer, Sparkles, ScrollText, FileText, ExternalLink, 
    Eye, Truck, Check, Clock, PackageCheck, AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format } from 'date-fns';

const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

// Helper badge component for order status
const OrderStatusBadge = ({ status }: { status?: string }) => {
    const s = (status || 'Pending').trim();
    if (s === 'Dispatched') {
        return (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 gap-1 font-medium">
                <Truck className="h-3 w-3"/> Dispatched
            </Badge>
        );
    }
    if (s === 'Completed' || s === 'Delivered') {
        return (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 font-medium">
                <Check className="h-3 w-3"/> Completed
            </Badge>
        );
    }
    if (s === 'Processing') {
        return (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1 font-medium">
                <Clock className="h-3 w-3"/> Processing
            </Badge>
        );
    }
    if (s === 'Generated' || s === 'Printed') {
        return (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 gap-1 font-medium">
                <PackageCheck className="h-3 w-3"/> Generated
            </Badge>
        );
    }
    if (s === 'Cancelled') {
        return (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1 font-medium">
                <XCircle className="h-3 w-3"/> Cancelled
            </Badge>
        );
    }
    return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 font-medium">
            <Clock className="h-3 w-3"/> Pending
        </Badge>
    );
};

export default function CertificateOrdersPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [isExporting, setIsExporting] = useState(false);

    // Selected order for full modal view
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<CertificateOrder | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<CertificateOrder | null>(null);

    // Form state inside modal for status & tracking updates
    const [editStatus, setEditStatus] = useState<string>('Pending');
    const [editCourierService, setEditCourierService] = useState<string>('Pronto');
    const [editTrackingNumber, setEditTrackingNumber] = useState<string>('');

    const [rangeFrom, setRangeFrom] = useState('');
    const [rangeTo, setRangeTo] = useState('');

    // Fetch parent courses for dropdown filter
    const { data: parentCourses } = useQuery<ParentCourse[]>({
        queryKey: ['parentCourses'],
        queryFn: getParentCourses,
        staleTime: 1000 * 60 * 15,
    });

    // Fetch all batch courses
    const { data: batches } = useQuery<Batch[]>({
        queryKey: ['allBatches'],
        queryFn: getBatches,
        staleTime: 1000 * 60 * 15,
    });

    // Fetch certificate orders
    const { data: orders, isLoading: isLoadingOrders, isError, error } = useQuery<CertificateOrder[]>({
        queryKey: ['certificateOrders'],
        queryFn: getCertificateOrders,
        staleTime: 1000 * 60 * 2,
    });

    const courseNameMap = useMemo(() => {
        const map = new Map<string, string>();
        const parentNameById = new Map<string, string>();

        parentCourses?.forEach(course => {
            parentNameById.set(String(course.id), course.course_name);
            map.set(String(course.id), course.course_name);
            if (course.course_code) {
                map.set(course.course_code.trim(), course.course_name);
            }
        });

        batches?.forEach(batch => {
            if (batch.courseCode) {
                const parentName = batch.parent_course_id ? parentNameById.get(String(batch.parent_course_id)) : null;
                map.set(batch.courseCode.trim(), parentName || batch.name);
            }
        });

        // Ensure parent courses always retain their canonical name for numeric ID keys
        parentCourses?.forEach(course => {
            map.set(String(course.id), course.course_name);
        });

        return map;
    }, [parentCourses, batches]);

    const courseCodeMap = useMemo(() => {
        const map = new Map<string, string>();
        const parentCodeById = new Map<string, string>();

        parentCourses?.forEach(course => {
            if (course.course_code) {
                parentCodeById.set(String(course.id), course.course_code.trim());
                map.set(String(course.id), course.course_code.trim());
                map.set(course.course_code.trim(), course.course_code.trim());
            }
        });

        batches?.forEach(batch => {
            const parentCode = batch.parent_course_id ? parentCodeById.get(String(batch.parent_course_id)) : null;
            if (batch.courseCode) {
                map.set(batch.courseCode.trim(), parentCode || batch.courseCode.trim());
            }
        });

        parentCourses?.forEach(course => {
            if (course.course_code) {
                map.set(String(course.id), course.course_code.trim());
            }
        });

        return map;
    }, [parentCourses, batches]);

    const uniqueCourseOptions = useMemo(() => {
        const seen = new Set<string>();
        const options: { id: string; name: string; courseCode: string }[] = [];
        
        parentCourses?.forEach(course => {
            if (!seen.has(course.course_name)) {
                seen.add(course.course_name);
                options.push({ 
                    id: String(course.id), 
                    name: course.course_name, 
                    courseCode: course.course_code ? course.course_code.trim() : String(course.id) 
                });
            }
        });

        return options;
    }, [parentCourses]);

    // Mutation to update status & tracking
    const updateStatusMutation = useMutation({
        mutationFn: updateCertificateOrderStatus,
        onSuccess: () => {
            toast({ title: "Status Updated", description: "Order status & tracking details saved successfully." });
            queryClient.invalidateQueries({ queryKey: ['certificateOrders'] });
            if (selectedOrderDetails) {
                setSelectedOrderDetails(prev => prev ? {
                    ...prev,
                    certificate_status: editStatus as any,
                    status: editStatus,
                    tracking_number: editTrackingNumber,
                    courier_service: editCourierService
                } : null);
            }
        },
        onError: (err: Error) => {
            toast({ variant: 'destructive', title: 'Update Failed', description: err.message });
        }
    });

    // Mutation to delete order
    const deleteMutation = useMutation({
        mutationFn: (orderId: string) => deleteCertificateOrder(orderId),
        onSuccess: () => {
            toast({ title: 'Order Deleted', description: 'The certificate order has been removed.' });
            queryClient.invalidateQueries({ queryKey: ['certificateOrders'] });
            setOrderToDelete(null);
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Deletion Failed', description: err.message }),
    });

    // Sync form state when modal opens
    useEffect(() => {
        if (selectedOrderDetails) {
            setEditStatus(selectedOrderDetails.certificate_status || selectedOrderDetails.status || 'Pending');
            setEditCourierService(selectedOrderDetails.courier_service || 'Pronto');
            setEditTrackingNumber(selectedOrderDetails.tracking_number || '');
        }
    }, [selectedOrderDetails]);

    // Lazy load student & cert details ONLY when modal opens
    const { data: modalStudentData, isLoading: isLoadingModalStudent } = useQuery({
        queryKey: ['modalStudentInfo', selectedOrderDetails?.created_by],
        queryFn: async () => {
            if (!selectedOrderDetails?.created_by) return null;
            const [studentData, balanceData] = await Promise.all([
                getStudentFullInfo(selectedOrderDetails.created_by).catch(() => null),
                getStudentBalance(selectedOrderDetails.created_by).catch(() => null),
            ]);
            return { studentData, balanceData };
        },
        enabled: !!selectedOrderDetails?.created_by,
        staleTime: 1000 * 60 * 5
    });

    const { data: modalCertStatus, refetch: refetchModalCertStatus } = useQuery<{ certificateStatus: UserCertificatePrintStatus[] }>({
        queryKey: ['modalCertStatus', selectedOrderDetails?.created_by],
        queryFn: () => getUserCertificatePrintStatus(selectedOrderDetails!.created_by),
        enabled: !!selectedOrderDetails?.created_by,
        staleTime: 1000 * 60 * 2
    });

    const generateCertMutation = useMutation({
        mutationFn: (payload: GenerateCertificatePayload) => generateCertificate(payload),
        onSuccess: () => {
            toast({ title: "Certificate Generated", description: "Document record created & status updated to Generated." });
            refetchModalCertStatus();
            if (selectedOrderDetails) {
                setEditStatus('Generated');
                updateStatusMutation.mutate({
                    orderId: selectedOrderDetails.id,
                    status: 'Generated',
                    tracking_number: editTrackingNumber
                });
            }
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Generation Failed', description: err.message })
    });

    const handleSaveStatus = () => {
        if (!selectedOrderDetails) return;

        // Mandatory tracking number validation if status is Dispatched
        if (editStatus === 'Dispatched' && (!editTrackingNumber || editTrackingNumber.trim() === '')) {
            toast({
                variant: 'destructive',
                title: 'Tracking Number Required',
                description: 'A tracking number is mandatory when changing status to Dispatched!'
            });
            return;
        }

        updateStatusMutation.mutate({
            orderId: selectedOrderDetails.id,
            status: editStatus,
            courier_service: editCourierService,
            tracking_number: editTrackingNumber
        });
    };

    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        const lowercasedFilter = searchTerm.toLowerCase();
        
        let result = orders;
        if (lowercasedFilter) {
            result = orders.filter(order =>
                order.created_by.toLowerCase().includes(lowercasedFilter) ||
                (order.name_on_certificate && order.name_on_certificate.toLowerCase().includes(lowercasedFilter)) ||
                String(order.id).toLowerCase().includes(lowercasedFilter) ||
                (order.tracking_number && order.tracking_number.toLowerCase().includes(lowercasedFilter))
            );
        }

        if (courseFilter !== 'all') {
            const matchingCodes = new Set<string>();
            matchingCodes.add(courseFilter);
            
            // Add all batch codes belonging to this parent course filter
            batches?.forEach(b => {
                if (String(b.parent_course_id) === courseFilter) {
                    if (b.courseCode) matchingCodes.add(b.courseCode.trim());
                    if (b.id) matchingCodes.add(String(b.id));
                }
            });

            const selectedOpt = uniqueCourseOptions.find(o => o.id === courseFilter || o.courseCode === courseFilter);
            if (selectedOpt) {
                if (selectedOpt.id) matchingCodes.add(selectedOpt.id);
                if (selectedOpt.courseCode) matchingCodes.add(selectedOpt.courseCode);
            }

            result = result.filter(order => {
                const orderCodes = order.course_code.split(',').map(s => s.trim());
                return orderCodes.some(cCode => matchingCodes.has(cCode));
            });
        }

        if (statusFilter !== 'all') {
            result = result.filter(order => {
                const s = (order.certificate_status || order.status || 'Pending').trim().toLowerCase();
                return s === statusFilter.toLowerCase();
            });
        }

        return [...result].sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
    }, [orders, searchTerm, courseFilter, statusFilter, uniqueCourseOptions, batches]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, courseFilter, statusFilter, itemsPerPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const handleExport = () => {
        if (!filteredOrders.length) return;
        setIsExporting(true);
        try {
            const headers = "Order ID,Student Number,Student Name,Courses,Mobile,Address,City,District,Payment,Status,Tracking Number,Courier Service,Date\n";
            const rows = filteredOrders.map(o => 
                `"${o.id}","${o.created_by}","${o.name_on_certificate || ''}","${o.course_code}","${o.mobile}","${o.address_line1 || ''}","${o.city_id || ''}","${o.district || ''}","${o.payment || '0'}","${o.certificate_status || o.status || 'Pending'}","${o.tracking_number || ''}","${o.courier_service || ''}","${o.created_at}"`
            ).join("\n");
            
            const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Certificate_Orders_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Export Successful" });
        } catch {
            toast({ variant: 'destructive', title: "Export Failed" });
        } finally {
            setIsExporting(false);
        }
    };

    const getBulkPrintBaseUrl = () => 'https://admin.pharmacollege.lk/assets/content/lms-management/certification/print-view/courier-list-certificate';
    const getBulkTranscriptPrintBaseUrl = (courseId: string) => {
        if (courseId === '1') return 'https://admin.pharmacollege.lk/assets/content/lms-management/certification/print-view/courier-print-all-transcript';
        return 'https://admin.pharmacollege.lk/assets/content/lms-management/certification/print-view/courier-print-all-transcript-advanced';
    };

    if (isLoadingOrders) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;
    if (isError) return <div className="p-8 text-red-400">Failed to load certificate orders: {(error as Error).message}</div>;

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 text-gray-100">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Certificate Orders</h1>
                    <p className="text-sm text-muted-foreground">Manage certificate requests, verify details, update tracking, and issue documents.</p>
                </div>
                <Button onClick={handleExport} disabled={isExporting || filteredOrders.length === 0} className="bg-primary hover:bg-primary-hover text-white">
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                    Export to CSV
                </Button>
            </header>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
                <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This will permanently delete Certificate Order #{orderToDelete?.id}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending} className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(orderToDelete!.id)} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Printing Actions Toolbar */}
            <Card className={cn("border-primary/20 bg-primary/5 shadow-md transition-all", courseFilter === 'all' && "opacity-60")}>
                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Printer className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Bulk Printing{courseFilter !== 'all' ? `: ${courseNameMap.get(courseFilter)}` : ''}</p>
                                <p className="text-xs text-muted-foreground">Select a course filter to enable batch printing.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor="rangeFrom" className="text-[10px] font-bold uppercase text-muted-foreground">From ID</Label>
                                <Input 
                                    id="rangeFrom" 
                                    type="number" 
                                    placeholder="Start ID" 
                                    className="h-8 w-20 text-xs px-2 bg-gray-950 border-gray-800 text-white" 
                                    value={rangeFrom} 
                                    onChange={(e) => setRangeFrom(e.target.value)} 
                                    disabled={courseFilter === 'all'} 
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor="rangeTo" className="text-[10px] font-bold uppercase text-muted-foreground">To ID</Label>
                                <Input 
                                    id="rangeTo" 
                                    type="number" 
                                    placeholder="End ID" 
                                    className="h-8 w-20 text-xs px-2 bg-gray-950 border-gray-800 text-white" 
                                    value={rangeTo} 
                                    onChange={(e) => setRangeTo(e.target.value)} 
                                    disabled={courseFilter === 'all'} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Button asChild variant="outline" size="sm" className="h-8 text-[11px]" disabled={courseFilter === 'all'}>
                            <a href={courseFilter !== 'all' ? `${getBulkPrintBaseUrl()}?courseCode=${courseFilter}&tableMode=1${rangeFrom ? `&rangeFrom=${rangeFrom}` : ''}${rangeTo ? `&rangeTo=${rangeTo}` : ''}` : '#'} target="_blank" rel="noopener noreferrer">
                                <ListOrdered className="mr-1.5 h-3 w-3 text-primary" /> List Table
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-[11px]" disabled={courseFilter === 'all'}>
                            <a href={courseFilter !== 'all' ? `${getBulkPrintBaseUrl()}?courseCode=${courseFilter}&tableMode=0${rangeFrom ? `&rangeFrom=${rangeFrom}` : ''}${rangeTo ? `&rangeTo=${rangeTo}` : ''}` : '#'} target="_blank" rel="noopener noreferrer">
                                <Award className="mr-1.5 h-3 w-3 text-primary" /> Batch Certs
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-[11px]" disabled={courseFilter === 'all'}>
                            <a href={courseFilter !== 'all' ? `${getBulkTranscriptPrintBaseUrl(courseFilter)}?courseCode=${courseFilter}&tableMode=1${rangeFrom ? `&rangeFrom=${rangeFrom}` : ''}${rangeTo ? `&rangeTo=${rangeTo}` : ''}` : '#'} target="_blank" rel="noopener noreferrer">
                                <ListOrdered className="mr-1.5 h-3 w-3 text-blue-400" /> Trans Table
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 text-[11px]" disabled={courseFilter === 'all'}>
                            <a href={courseFilter !== 'all' ? `${getBulkTranscriptPrintBaseUrl(courseFilter)}?courseCode=${courseFilter}&tableMode=0${rangeFrom ? `&rangeFrom=${rangeFrom}` : ''}${rangeTo ? `&rangeTo=${rangeTo}` : ''}` : '#'} target="_blank" rel="noopener noreferrer">
                                <FileText className="mr-1.5 h-3 w-3 text-blue-400" /> Batch Trans
                            </a>
                        </Button>
                        <Button asChild variant="default" size="sm" className="h-8 text-[11px]" disabled={courseFilter === 'all'}>
                            <Link href={courseFilter !== 'all' ? `/print/certificate-address-list?courseCode=${courseFilter}${rangeFrom ? `&rangeFrom=${rangeFrom}` : ''}${rangeTo ? `&rangeTo=${rangeTo}` : ''}` : '#'} target="_blank">
                                <Home className="mr-1.5 h-3 w-3" /> Address List
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Orders Table Card */}
            <Card className="shadow-lg bg-gray-950 border-gray-850">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl">Orders ({filteredOrders.length})</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">Fast, real-time list of all student certificate orders.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Select value={String(itemsPerPage)} onValueChange={(val) => setItemsPerPage(Number(val))}>
                                <SelectTrigger className="w-full sm:w-[110px] bg-gray-900 border-gray-800 text-xs">
                                    <SelectValue placeholder="25 / page" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                    <SelectItem value="10">10 / page</SelectItem>
                                    <SelectItem value="25">25 / page</SelectItem>
                                    <SelectItem value="50">50 / page</SelectItem>
                                    <SelectItem value="100">100 / page</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[140px] bg-gray-900 border-gray-800 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                    <SelectItem value="Pending">Pending Only</SelectItem>
                                    <SelectItem value="Generated">Generated</SelectItem>
                                    <SelectItem value="Dispatched">Dispatched</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger className="w-full sm:w-[220px] bg-gray-900 border-gray-800 text-xs">
                                    <SelectValue placeholder="Filter by Course" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {uniqueCourseOptions.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="relative w-full sm:w-auto sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search student, order or tracking..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="pl-9 h-9 bg-gray-900 border-gray-800 text-xs text-white"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto border border-gray-850 rounded-lg">
                        <Table>
                            <TableHeader className="bg-gray-900/60">
                                <TableRow className="border-gray-850 hover:bg-transparent">
                                    <TableHead className="w-[90px]">Order ID</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course(s)</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Order Status</TableHead>
                                    <TableHead>Courier / Tracking</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedOrders.map(order => (
                                    <TableRow key={order.id} className="border-gray-850 hover:bg-gray-900/40 transition-colors">
                                        <TableCell className="font-mono text-xs font-semibold">
                                            #{order.id}
                                        </TableCell>
                                        <TableCell className="font-medium text-xs">
                                            <strong className="text-white">{order.created_by}</strong>
                                            <br/>
                                            <span className="text-gray-400 text-[11px]">{order.name_on_certificate || 'N/A'}</span>
                                        </TableCell>
                                        <TableCell className="min-w-[180px]">
                                            <div className="flex flex-col gap-1">
                                                {order.course_code.split(',').map(id => (
                                                    <Badge key={id} variant="secondary" className="justify-start h-auto py-0.5 px-2 text-[10px] font-medium border-gray-800 bg-gray-900 text-gray-300">
                                                        {courseNameMap.get(id.trim()) || `Course ${id}`}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-emerald-400 font-semibold">
                                            LKR {parseFloat(order.payment || '0').toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge status={order.certificate_status || order.status} />
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {order.tracking_number ? (
                                                <span className="font-mono text-primary font-bold text-[11px]">
                                                    #{order.tracking_number}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-500 italic">Not Dispatched</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button 
                                                variant="default" 
                                                size="sm" 
                                                onClick={() => setSelectedOrderDetails(order)}
                                                className="h-7 text-[11px] bg-primary hover:bg-primary-hover text-white font-semibold"
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-1" /> View Order
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild 
                                                className="h-7 text-[11px] bg-gray-900 border-gray-800 text-gray-200 hover:bg-gray-800"
                                            >
                                                <a href={`/print/certificate-address-list?courseCode=${order.course_code.split(',')[0].trim()}&rangeFrom=${order.id}&rangeTo=${order.id}`} target="_blank" rel="noopener noreferrer">
                                                    <Printer className="h-3.5 w-3.5 mr-1 text-primary" /> Label
                                                </a>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                                                onClick={() => setOrderToDelete(order)}
                                                title="Delete Order"
                                            >
                                                <Trash2 className="h-3.5 w-3.5"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {paginatedOrders.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-sm">No certificate orders found matching the filter.</p>
                        </div>
                    )}
                </CardContent>

                {totalPages > 1 && (
                    <CardFooter className="flex items-center justify-between border-t border-gray-850 pt-4">
                        <span className="text-xs text-gray-400 font-mono">
                            Page {currentPage} of {totalPages} ({filteredOrders.length} records)
                        </span>
                        <div className="flex items-center space-x-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                                disabled={currentPage === 1}
                                className="h-8 text-xs bg-gray-900 border-gray-800 text-white"
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                                disabled={currentPage === totalPages}
                                className="h-8 text-xs bg-gray-900 border-gray-800 text-white"
                            >
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            {/* SINGLE COMPREHENSIVE VIEW ORDER MODAL DIALOG */}
            {selectedOrderDetails && (
                <Dialog open={!!selectedOrderDetails} onOpenChange={(open) => !open && setSelectedOrderDetails(null)}>
                    <DialogContent className="sm:max-w-[780px] bg-gray-950 border-gray-850 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary"/> Certificate Order #{selectedOrderDetails.id}
                                </span>
                                <OrderStatusBadge status={selectedOrderDetails.certificate_status || selectedOrderDetails.status} />
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-400">
                                Student Details, Courier Tracking, and Document Generation
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 py-2">
                            {/* SECTION 1: Student & Shipping Info */}
                            <Card className="bg-gray-900/70 border-gray-800 text-white">
                                <CardHeader className="py-3 px-4 border-b border-gray-800">
                                    <CardTitle className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-primary"/> Student & Delivery Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-1.5">
                                        <div>
                                            <span className="text-gray-400">Candidate Name:</span>
                                            <p className="font-bold text-sm text-white">{selectedOrderDetails.name_on_certificate || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Student Index / Username:</span>
                                            <p className="font-mono text-primary font-bold">{selectedOrderDetails.created_by}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Contact Telephone:</span>
                                            <p className="font-mono text-gray-200">{selectedOrderDetails.mobile} {selectedOrderDetails.telephone_1 ? `/ ${selectedOrderDetails.telephone_1}` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 bg-gray-950 p-3 rounded-md border border-gray-850">
                                        <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1">
                                            <Home className="h-3 w-3 text-primary"/> Shipping Address:
                                        </span>
                                        <p className="font-medium text-gray-300 leading-relaxed">
                                            {selectedOrderDetails.address_line1}
                                            {selectedOrderDetails.address_line2 && <><br/>{selectedOrderDetails.address_line2}</>}
                                            <br/>
                                            <span className="text-white font-semibold">{selectedOrderDetails.city_id}, {selectedOrderDetails.district}</span>
                                        </p>
                                        <div className="pt-2 flex justify-end">
                                            <Button asChild variant="outline" size="sm" className="h-7 text-xs bg-gray-900 border-gray-800 text-white hover:bg-gray-800">
                                                <a href={`/print/certificate-address-list?courseCode=${selectedOrderDetails.course_code.split(',')[0].trim()}&rangeFrom=${selectedOrderDetails.id}&rangeTo=${selectedOrderDetails.id}`} target="_blank" rel="noopener noreferrer">
                                                    <Printer className="h-3.5 w-3.5 mr-1.5 text-primary"/> Print Delivery Label
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SECTION 2: Order Status & Courier Tracking Update */}
                            <Card className="bg-gray-900/70 border-gray-800 text-white">
                                <CardHeader className="py-3 px-4 border-b border-gray-800">
                                    <CardTitle className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <Truck className="h-3.5 w-3.5 text-orange-400"/> Courier & Status Management
                                        </span>
                                        {editStatus === 'Dispatched' && (
                                            <span className="text-[10px] text-amber-400 font-normal">
                                                * Tracking No. Required
                                            </span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] text-gray-400">Order Status</Label>
                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                <SelectTrigger className="h-8 bg-gray-950 border-gray-800 text-xs text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Generated">Generated</SelectItem>
                                                    <SelectItem value="Dispatched">Dispatched</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] text-gray-400">Tracking Number {editStatus === 'Dispatched' && <span className="text-red-400">*</span>}</Label>
                                            <Input 
                                                value={editTrackingNumber} 
                                                onChange={(e) => setEditTrackingNumber(e.target.value)}
                                                className="h-8 bg-gray-950 border-gray-800 text-xs font-mono text-white"
                                                placeholder="e.g. WAYBILL-982347"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button 
                                            onClick={handleSaveStatus} 
                                            disabled={updateStatusMutation.isPending}
                                            size="sm"
                                            className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4"
                                        >
                                            {updateStatusMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin"/>}
                                            Update Order Status & Tracking
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SECTION 3: Document Issuance & Vector Printing */}
                            <Card className="bg-gray-900/70 border-gray-800 text-white">
                                <CardHeader className="py-3 px-4 border-b border-gray-800">
                                    <CardTitle className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5">
                                        <Award className="h-3.5 w-3.5 text-primary"/> Document Issuance & Printing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    {selectedOrderDetails.course_code.split(',').map(courseId => {
                                        const cId = courseId.trim();
                                        const parentCourseCode = courseCodeMap.get(cId) || cId;
                                        const courseName = courseNameMap.get(cId) || `Course ${cId}`;
                                        
                                        const genDoc = modalCertStatus?.certificateStatus?.find(
                                            s => String(s.parent_course_id) === String(cId) || String(s.course_code) === String(cId) || String(s.parent_course_id) === String(parentCourseCode)
                                        );

                                        const enrollmentsList = modalStudentData?.studentData?.studentEnrollments 
                                            ? (Array.isArray(modalStudentData.studentData.studentEnrollments) 
                                                ? modalStudentData.studentData.studentEnrollments 
                                                : Object.values(modalStudentData.studentData.studentEnrollments))
                                            : [];

                                        const courseEnrollment: any = enrollmentsList.find(
                                            (e: any) => String(e.parent_course_id) === String(cId) || String(e.course_code) === String(cId) || String(e.id) === String(cId)
                                        );

                                        const courseBalance = courseEnrollment?.studentBalance !== undefined 
                                            ? Number(courseEnrollment.studentBalance) 
                                            : (modalStudentData?.balanceData?.studentBalance !== undefined ? Number(modalStudentData.balanceData.studentBalance) : 0);

                                        const hasDueBalance = courseBalance > 0;

                                        return (
                                            <div key={cId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-950 border border-gray-850 rounded-md">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-bold text-xs text-white">{courseName}</p>
                                                        {genDoc?.certificate_id && (
                                                            <Badge variant="outline" className="text-[10px] font-mono bg-purple-500/15 text-purple-400 border-purple-500/30 font-bold py-0 px-2">
                                                                Cert ID: #{genDoc.certificate_id}
                                                            </Badge>
                                                        )}
                                                        {isLoadingModalStudent ? (
                                                            <Badge variant="outline" className="text-[10px] font-mono bg-gray-800 text-gray-400 py-0 px-2 animate-pulse">
                                                                Checking Balance...
                                                            </Badge>
                                                        ) : hasDueBalance ? (
                                                            <Badge variant="destructive" className="text-[10px] font-mono bg-red-500/20 text-red-400 border-red-500/30 font-bold py-0 px-2 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" /> Due: LKR {courseBalance.toLocaleString()}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold py-0 px-2 flex items-center gap-1">
                                                                <CheckCircle className="h-3 w-3" /> Paid (LKR 0 Due)
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Course Code / ID: {cId}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {genDoc ? (
                                                        <>
                                                            <Button asChild size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                                                <a 
                                                                    href={`/print/certificate/${genDoc.certificate_id}?doc_type=Certificate&course_code=${encodeURIComponent(genDoc.course_code || selectedOrderDetails.course_code.split(',')[0].trim())}&student_number=${encodeURIComponent(genDoc.student_number || selectedOrderDetails.created_by)}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Award className="h-3 w-3 mr-1"/> Print Certificate
                                                                </a>
                                                            </Button>
                                                            <Button asChild size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                                                <a 
                                                                    href={`/print/certificate/${genDoc.certificate_id}?doc_type=Transcript&course_code=${encodeURIComponent(genDoc.course_code || selectedOrderDetails.course_code.split(',')[0].trim())}&student_number=${encodeURIComponent(genDoc.student_number || selectedOrderDetails.created_by)}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <FileText className="h-3 w-3 mr-1"/> Print Transcript
                                                                </a>
                                                            </Button>
                                                        </>
                                                    ) : hasDueBalance ? (
                                                        <Button 
                                                            size="sm"
                                                            disabled={true}
                                                            className="h-7 text-[11px] bg-red-950/60 border border-red-800/80 text-red-300 font-semibold cursor-not-allowed opacity-80"
                                                            title={`Cannot generate certificate: Student has an outstanding balance of LKR ${courseBalance.toLocaleString()}`}
                                                        >
                                                            <AlertTriangle className="h-3 w-3 mr-1 text-red-400"/>
                                                            Payment Due (LKR {courseBalance.toLocaleString()})
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            size="sm"
                                                            disabled={generateCertMutation.isPending || isLoadingModalStudent}
                                                            onClick={() => {
                                                                if (hasDueBalance) {
                                                                    toast({
                                                                        variant: "destructive",
                                                                        title: "Payment Due",
                                                                        description: `Cannot generate certificate. Student has an unpaid balance of LKR ${courseBalance.toLocaleString()} for this course.`
                                                                    });
                                                                    return;
                                                                }
                                                                generateCertMutation.mutate({
                                                                    student_number: selectedOrderDetails.created_by,
                                                                    print_status: "0",
                                                                    print_by: user?.username || "Admin",
                                                                    type: "Online Verification",
                                                                    parentCourseCode: Number(cId) || 0,
                                                                    referenceId: Number(cId) || 0,
                                                                    course_code: String(cId),
                                                                    source: "Manual Generation"
                                                                });
                                                            }}
                                                            className="h-7 text-[11px] bg-primary hover:bg-primary-hover text-white font-semibold"
                                                        >
                                                            {generateCertMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Sparkles className="h-3 w-3 mr-1"/>}
                                                            Generate Certificate Record
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* SECTION 4: Payment Verification Slip */}
                            {selectedOrderDetails.payment_slip && (
                                <Card className="bg-gray-900/70 border-gray-800 text-white">
                                    <CardHeader className="py-3 px-4 border-b border-gray-800">
                                        <CardTitle className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center justify-between">
                                            <span>Payment Receipt Document</span>
                                            <span className="font-mono text-emerald-400 font-bold text-sm">
                                                LKR {parseFloat(selectedOrderDetails.payment || '0').toLocaleString()}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="relative aspect-[16/9] w-full max-w-sm rounded-lg overflow-hidden border border-gray-800 bg-gray-950 mx-auto">
                                            <Image 
                                                src={`${CONTENT_PROVIDER_URL}/content-provider/uploads/certificate-payment-slips/${selectedOrderDetails.payment_slip}`} 
                                                alt="Payment Slip" 
                                                layout="fill" 
                                                objectFit="contain" 
                                            />
                                            <a 
                                                href={`${CONTENT_PROVIDER_URL}/content-provider/uploads/certificate-payment-slips/${selectedOrderDetails.payment_slip}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="absolute bottom-2 right-2"
                                            >
                                                <Button size="sm" variant="secondary" className="h-7 text-[11px] bg-gray-900/90 text-white hover:bg-gray-800">
                                                    <ExternalLink className="h-3 w-3 mr-1"/> View Full Image
                                                </Button>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
