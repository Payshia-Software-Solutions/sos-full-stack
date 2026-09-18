"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStudentFullInfo } from "@/lib/actions/users";
import { getConvocationRegistrationsByStudent, getCertificateOrdersByStudent } from "@/lib/actions/certificates";
import type { ConvocationRegistration, CertificateOrder } from "@/lib/types";
import {
    CreditCard, BookOpen, Gamepad2, Package, Award, 
    Calendar, CheckCircle, Clock, AlertCircle, Phone, Mail, 
    Copy, ExternalLink, RefreshCw, Loader2, Sparkles, Heart,
    Target, Truck, CheckCircle2, XCircle, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Student360DrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentNumber: string;
    studentName?: string;
}

export function Student360Drawer({
    open,
    onOpenChange,
    studentNumber,
    studentName,
}: Student360DrawerProps) {
    const [activeTab, setActiveTab] = useState("payments");

    const cleanNumber = studentNumber.trim().toUpperCase();

    // Query 1: Full Info (Balance, Payments, Pending Slips, Enrollments, Games, Deliveries)
    const {
        data: fullInfo,
        isLoading: isLoadingFullInfo,
        refetch: refetchFullInfo,
        isRefetching: isRefetchingFullInfo,
    } = useQuery({
        queryKey: ["student-360-full-info", cleanNumber],
        queryFn: () => getStudentFullInfo(cleanNumber),
        enabled: open && !!cleanNumber,
        staleTime: 1000 * 60 * 3, // 3 minutes cache
    });

    // Query 2: Convocation Bookings
    const {
        data: convocationBookings = [],
        isLoading: isLoadingConvocation,
    } = useQuery<ConvocationRegistration[]>({
        queryKey: ["student-360-convocation", cleanNumber],
        queryFn: () => getConvocationRegistrationsByStudent(cleanNumber),
        enabled: open && !!cleanNumber,
        staleTime: 1000 * 60 * 3,
    });

    // Query 3: Certificate Orders
    const {
        data: certificateOrders = [],
        isLoading: isLoadingCertificates,
    } = useQuery<CertificateOrder[]>({
        queryKey: ["student-360-certificate-orders", cleanNumber],
        queryFn: () => getCertificateOrdersByStudent(cleanNumber),
        enabled: open && !!cleanNumber,
        staleTime: 1000 * 60 * 3,
    });

    const studentInfo = fullInfo?.studentInfo;
    const balance = fullInfo?.studentBalance;
    const pendingSlips = fullInfo?.pendingPaymentRequests || [];
    const enrollments = fullInfo?.studentEnrollments ? Object.values(fullInfo.studentEnrollments) : [];

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: `${label} copied to clipboard.` });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent 
                side="right" 
                className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 bg-slate-950 border-slate-800 text-foreground flex flex-col h-full shadow-2xl"
            >
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
                    <SheetHeader className="text-left space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border border-primary/40 shadow-sm">
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-base">
                                        {(studentInfo?.full_name || studentName || cleanNumber)
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <SheetTitle className="text-lg font-headline font-bold text-white leading-none">
                                            {studentInfo?.full_name || studentName || cleanNumber}
                                        </SheetTitle>
                                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-semibold">
                                            360° Dossier
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono mt-1">
                                        ID: <strong className="text-emerald-400">{cleanNumber}</strong>
                                        {studentInfo?.nic && ` • NIC: ${studentInfo.nic}`}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => refetchFullInfo()}
                                disabled={isRefetchingFullInfo}
                                className="h-8 px-2 text-xs text-slate-400 hover:text-white"
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isRefetchingFullInfo && "animate-spin")} />
                                Refresh
                            </Button>
                        </div>

                        {/* Student Quick Meta */}
                        <div className="flex flex-wrap gap-2 text-xs pt-1">
                            {studentInfo?.telephone_1 && (
                                <a
                                    href={`tel:${studentInfo.telephone_1}`}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-200 hover:border-emerald-500/40"
                                >
                                    <Phone className="h-3 w-3 text-emerald-400" />
                                    <span>{studentInfo.telephone_1}</span>
                                </a>
                            )}
                            {studentInfo?.e_mail && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 truncate max-w-[220px]">
                                    <Mail className="h-3 w-3 text-blue-400 shrink-0" />
                                    <span className="truncate">{studentInfo.e_mail}</span>
                                </div>
                            )}
                            {studentInfo?.city && (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                                    <span>{studentInfo.city}</span>
                                </div>
                            )}
                        </div>
                    </SheetHeader>
                </div>

                {/* Loading Banner */}
                {isLoadingFullInfo ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm">Fetching student 360° academic & financial records...</p>
                        <p className="text-xs text-slate-500">Querying ledger, courses, game metrics, and delivery packs</p>
                    </div>
                ) : (
                    /* Drawer Tabs & Content */
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        {/* Tab Bar */}
                        <div className="px-6 pt-3 border-b border-slate-800/80 bg-slate-950">
                            <TabsList className="bg-slate-900/80 p-1 border border-slate-800/60 w-full justify-start overflow-x-auto custom-scrollbar h-auto gap-1">
                                <TabsTrigger value="payments" className="text-xs gap-1.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <CreditCard className="h-3.5 w-3.5" /> Payments & Slips
                                    {pendingSlips.length > 0 && (
                                        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                            {pendingSlips.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="courses" className="text-xs gap-1.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <BookOpen className="h-3.5 w-3.5" /> Courses ({enrollments.length})
                                </TabsTrigger>
                                <TabsTrigger value="games" className="text-xs gap-1.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <Gamepad2 className="h-3.5 w-3.5" /> Games & Marks
                                </TabsTrigger>
                                <TabsTrigger value="deliveries" className="text-xs gap-1.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <Truck className="h-3.5 w-3.5" /> Study Packs
                                </TabsTrigger>
                                <TabsTrigger value="certificates" className="text-xs gap-1.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                                    <Award className="h-3.5 w-3.5" /> Certs & Convocation
                                    {(convocationBookings.length > 0 || certificateOrders.length > 0) && (
                                        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                            {convocationBookings.length + certificateOrders.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab Contents (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            
                            {/* TAB 1: PAYMENTS & SLIPS */}
                            <TabsContent value="payments" className="m-0 space-y-6">
                                {/* Balance Overview */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Financial Summary
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
                                            <p className="text-[11px] text-muted-foreground">Total Fee</p>
                                            <p className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                                                LKR {(balance?.totalPaymentAmount || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
                                            <p className="text-[11px] text-muted-foreground">Total Paid</p>
                                            <p className="text-base sm:text-lg font-bold text-emerald-400 mt-1">
                                                LKR {(balance?.TotalStudentPaymentRecords || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
                                            <p className="text-[11px] text-muted-foreground">Due Balance</p>
                                            <p className={cn(
                                                "text-base sm:text-lg font-bold mt-1",
                                                (balance?.studentBalance || 0) > 0 ? "text-rose-400" : "text-emerald-400"
                                            )}>
                                                LKR {(balance?.studentBalance || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Payment Slips */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" /> Pending Payment Slips ({pendingSlips.length})
                                        </h4>
                                    </div>
                                    {pendingSlips.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {pendingSlips.map((slip: any, idx: number) => (
                                                <div key={slip.id || idx} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between text-xs">
                                                    <div>
                                                        <p className="font-bold text-amber-300">
                                                            Ref: {slip.payment_reference || slip.unique_number || "No Ref"}
                                                        </p>
                                                        <p className="text-slate-400 text-[11px] mt-0.5">
                                                            Bank: {slip.bank === "1" ? "BOC" : slip.bank || "Online"} • Date: {new Date(slip.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-amber-400 text-sm">
                                                            LKR {parseFloat(slip.paid_amount || 0).toLocaleString()}
                                                        </p>
                                                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 bg-amber-500/10 mt-0.5">
                                                            Pending Verification
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-muted-foreground">
                                            No pending payment slips awaiting review.
                                        </div>
                                    )}
                                </div>

                                {/* Approved Payment Receipts */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Official Payment Receipts
                                    </h4>
                                    {balance?.paymentRecords && Object.values(balance.paymentRecords).length > 0 ? (
                                        <div className="space-y-2">
                                            {Object.values(balance.paymentRecords).map((rec: any) => (
                                                <div key={rec.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
                                                    <div>
                                                        <p className="font-bold text-slate-200">
                                                            {rec.receipt_number || "Receipt"}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            {rec.paid_date} • {rec.payment_type || "Bank Transfer"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-emerald-400">
                                                            LKR {parseFloat(rec.paid_amount || 0).toLocaleString()}
                                                        </p>
                                                        <span className="text-[10px] text-emerald-500">Approved</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-muted-foreground">
                                            No official payment receipts recorded yet.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* TAB 2: COURSES & ACADEMICS */}
                            <TabsContent value="courses" className="m-0 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Enrolled Courses & Batches ({enrollments.length})
                                </h4>
                                {enrollments.length > 0 ? (
                                    <div className="space-y-3">
                                        {enrollments.map((course: any) => (
                                            <div key={course.course_code} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h5 className="font-bold text-white text-sm">
                                                            {course.batch_name || course.course_name || course.course_code}
                                                        </h5>
                                                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                                            Code: <strong className="text-primary">{course.course_code}</strong>
                                                            {course.parent_course_name && ` • ${course.parent_course_name}`}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                                                        Active
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-slate-800 text-slate-400">
                                                    {course.enrollment_key && (
                                                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-[11px]">
                                                            Key: {course.enrollment_key}
                                                        </span>
                                                    )}
                                                    {course.created_at && (
                                                        <span>Enrolled: {new Date(course.created_at).toLocaleDateString()}</span>
                                                    )}
                                                    {course.course_duration && (
                                                        <span>Duration: {course.course_duration}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-muted-foreground">
                                        No course enrollments found for this student.
                                    </div>
                                )}
                            </TabsContent>

                            {/* TAB 3: GAMES & PERFORMANCE */}
                            <TabsContent value="games" className="m-0 space-y-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Learning Games & Academic Metrics
                                </h4>

                                {enrollments.map((course: any) => (
                                    <div key={course.course_code} className="space-y-3">
                                        <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                                            <BookOpen className="h-3.5 w-3.5" /> [{course.course_code}] {course.batch_name || course.course_code}
                                        </h5>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Ceylon Pharmacy */}
                                            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                                        <Heart className="h-3.5 w-3.5 text-rose-500" /> Ceylon Pharmacy
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-400">
                                                        Patients
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Patients Saved: <strong className="text-white text-sm">{course.ceylon_pharmacy?.recoveredCount || 0}</strong>
                                                </p>
                                            </div>

                                            {/* Pharma Hunter */}
                                            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                                        <Target className="h-3.5 w-3.5 text-purple-400" /> Pharma Hunter
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                                                        {course.pharma_hunter?.ProgressValue || 0}%
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Correct Answers: <strong className="text-white text-sm">{course.pharma_hunter?.correctCount || 0}</strong>
                                                </p>
                                            </div>

                                            {/* Pharma Hunter Pro */}
                                            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                                        <Target className="h-3.5 w-3.5 text-emerald-400" /> Pharma Hunter Pro
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                                                        {course.pharma_hunter_pro?.progressValue || 0}%
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Coins / Gems: <strong className="text-white">{course.pharma_hunter_pro?.coinCount || 0} / {course.pharma_hunter_pro?.gemCount || 0}</strong>
                                                </p>
                                            </div>

                                            {/* MediMind */}
                                            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                                        <Gamepad2 className="h-3.5 w-3.5 text-blue-400" /> Medi Mind
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
                                                        {course.medi_mind?.progressPercentage || 0}%
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Tasks: <strong className="text-white">{course.medi_mind?.completedTasks || 0} / {course.medi_mind?.totalTasks || 0}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Assignments */}
                                        {course.assignment_grades?.assignments?.length > 0 && (
                                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                                                <div className="flex justify-between font-bold text-slate-300">
                                                    <span>Assignment Results</span>
                                                    <span className="text-primary">Avg: {course.assignment_grades?.average_grade || "0.00"}%</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {course.assignment_grades.assignments.map((a: any, i: number) => (
                                                        <div key={i} className="flex justify-between text-[11px] text-slate-400">
                                                            <span>{a.assignment_name}</span>
                                                            <strong className="text-slate-200">{a.grade}</strong>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </TabsContent>

                            {/* TAB 4: STUDY PACKS & DELIVERIES */}
                            <TabsContent value="deliveries" className="m-0 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Study Pack Courier Orders
                                </h4>

                                {enrollments.flatMap((c: any) => c.deliveryOrders || []).length > 0 ? (
                                    <div className="space-y-2.5">
                                        {enrollments.flatMap((c: any) => c.deliveryOrders || []).map((order: any) => (
                                            <div key={order.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2 text-xs">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h5 className="font-bold text-white text-sm">{order.delivery_title || "Study Pack"}</h5>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            Order Date: {order.order_date ? new Date(order.order_date).toLocaleDateString() : "-"}
                                                        </p>
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-[10px] uppercase font-bold",
                                                        order.active_status === "Delivered" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                                                        order.active_status === "Processing" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                                    )}>
                                                        {order.active_status || "Pending"}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                                                    {order.tracking_number ? (
                                                        <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-primary">
                                                            Tracking: {order.tracking_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">No tracking number assigned</span>
                                                    )}
                                                    {order.value && <span>Value: LKR {order.value}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-muted-foreground">
                                        No delivery orders or study pack dispatches recorded.
                                    </div>
                                )}
                            </TabsContent>

                            {/* TAB 5: CERTIFICATES & CONVOCATION */}
                            <TabsContent value="certificates" className="m-0 space-y-6">
                                {/* Convocation Bookings */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-primary" /> Convocation Bookings ({convocationBookings.length})
                                    </h4>
                                    {convocationBookings.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {convocationBookings.map((b: any) => (
                                                <div key={b.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 text-xs space-y-1.5">
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-bold text-white">{b.convocation_name || "Annual Convocation"}</h5>
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                                            {b.payment_status || "Booked"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400">
                                                        Ceremony No: <strong>{b.ceremony_number || "-"}</strong> • Package: {b.package_name || "-"}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Booked on: {new Date(b.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-muted-foreground">
                                            No convocation booking registrations for this student.
                                        </div>
                                    )}
                                </div>

                                {/* Certificate Orders */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Award className="h-3.5 w-3.5 text-teal-400" /> Certificate Orders ({certificateOrders.length})
                                    </h4>
                                    {certificateOrders.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {certificateOrders.map((o: any) => (
                                                <div key={o.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 text-xs space-y-1.5">
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-bold text-white">Order #{o.order_number || o.id}</h5>
                                                        <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-[10px]">
                                                            {o.status || "Pending"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400">
                                                        Name on Cert: <strong>{o.name_on_certificate || "-"}</strong>
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Ordered: {new Date(o.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-muted-foreground">
                                            No certificate orders requested.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                )}
            </SheetContent>
        </Sheet>
    );
}
