"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStudentFullInfo } from "@/lib/actions/users";
import { getConvocationRegistrationsByStudent, getCertificateOrdersByStudent } from "@/lib/actions/certificates";
import type { UserFullDetails, StudentEnrollmentInfo, StudentBalanceData, ConvocationRegistration, CertificateOrder } from "@/lib/types";
import {
    CreditCard, BookOpen, Gamepad2, Package, Award, 
    Calendar, CheckCircle, Clock, AlertCircle, RefreshCw, 
    Loader2, Heart, Target, Truck, ChevronDown, ChevronUp, Sparkles, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentInline360DossierProps {
    studentNumber: string;
    studentProfile: UserFullDetails;
    enrollments: StudentEnrollmentInfo[];
    balanceData: StudentBalanceData | null;
    selectedCourseCode?: string;
    onSelectCourseCode?: (code: string) => void;
    onRefreshBalance?: () => void;
    isLoadingBalance?: boolean;
}

export function StudentInline360Dossier({
    studentNumber,
    studentProfile,
    enrollments,
    balanceData,
    selectedCourseCode,
    onSelectCourseCode,
    onRefreshBalance,
    isLoadingBalance = false,
}: StudentInline360DossierProps) {
    const [activeTab, setActiveTab] = useState("finance");
    const [isExpanded, setIsExpanded] = useState(true);

    const cleanNumber = studentNumber.trim().toUpperCase();

    // Lazy load deep academic/game/delivery info only if user navigates to those tabs
    const isDeepTabActive = ["games", "deliveries", "certs"].includes(activeTab);

    const {
        data: fullInfo,
        isLoading: isLoadingFullInfo,
        refetch: refetchFullInfo,
        isRefetching: isRefetchingFullInfo,
    } = useQuery({
        queryKey: ["student-inline-full-info", cleanNumber],
        queryFn: () => getStudentFullInfo(cleanNumber),
        enabled: !!cleanNumber && isDeepTabActive,
        staleTime: 1000 * 60 * 3,
    });

    // Convocation & Cert Orders (loaded on-demand when certs tab is opened)
    const {
        data: convocationBookings = [],
        isLoading: isLoadingConvocation,
    } = useQuery<ConvocationRegistration[]>({
        queryKey: ["student-inline-convocation", cleanNumber],
        queryFn: () => getConvocationRegistrationsByStudent(cleanNumber),
        enabled: !!cleanNumber && activeTab === "certs",
        staleTime: 1000 * 60 * 3,
    });

    const {
        data: certificateOrders = [],
        isLoading: isLoadingCertificates,
    } = useQuery<CertificateOrder[]>({
        queryKey: ["student-inline-cert-orders", cleanNumber],
        queryFn: () => getCertificateOrdersByStudent(cleanNumber),
        enabled: !!cleanNumber && activeTab === "certs",
        staleTime: 1000 * 60 * 3,
    });

    // Deep enrollments from fullInfo have game results and deliveries
    const deepEnrollments = fullInfo?.studentEnrollments ? Object.values(fullInfo.studentEnrollments) : [];
    const pendingSlips = fullInfo?.pendingPaymentRequests || [];

    // Use balance from balanceData (fast) or fullInfo (fallback)
    const activeBalance = balanceData || fullInfo?.studentBalance;

    return (
        <div className="border border-emerald-500/25 bg-slate-950/80 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
            {/* Dossier Bar Header with collapse toggle */}
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">Student 360° Dossier</span>
                    </span>
                    <Badge variant="outline" className="hidden sm:inline-flex text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 py-0.5 px-2">
                        Live 360°
                    </Badge>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {onRefreshBalance && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onRefreshBalance();
                                if (isDeepTabActive) refetchFullInfo();
                            }}
                            disabled={isLoadingBalance || isRefetchingFullInfo}
                            className="h-7 px-2 text-xs text-slate-300 hover:text-white"
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5 mr-1", (isLoadingBalance || isRefetchingFullInfo) && "animate-spin")} />
                            <span className="hidden xs:inline">Refresh</span>
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-7 px-2 text-xs text-slate-300 hover:text-white"
                    >
                        {isExpanded ? (
                            <span className="flex items-center gap-1"><ChevronUp className="h-4 w-4" /> <span className="hidden xs:inline">Collapse</span></span>
                        ) : (
                            <span className="flex items-center gap-1"><ChevronDown className="h-4 w-4" /> <span className="hidden xs:inline">Expand</span></span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Collapsible Content Section */}
            {isExpanded && (
                <div className="p-2.5 sm:p-3.5 space-y-3 animate-in fade-in duration-150">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Tab Headers */}
                        <TabsList className="bg-slate-900/90 p-1 border border-slate-800/70 w-full justify-start overflow-x-auto no-scrollbar sm:custom-scrollbar h-auto gap-1">
                            <TabsTrigger value="finance" className="text-xs font-semibold gap-1.5 py-1.5 px-2.5 sm:px-3 data-[state=active]:bg-primary data-[state=active]:text-white shrink-0">
                                <CreditCard className="h-3.5 w-3.5" /> Finance & Slips
                            </TabsTrigger>
                            <TabsTrigger value="courses" className="text-xs font-semibold gap-1.5 py-1.5 px-2.5 sm:px-3 data-[state=active]:bg-primary data-[state=active]:text-white shrink-0">
                                <BookOpen className="h-3.5 w-3.5" /> Courses ({enrollments.length})
                            </TabsTrigger>
                            <TabsTrigger value="games" className="text-xs font-semibold gap-1.5 py-1.5 px-2.5 sm:px-3 data-[state=active]:bg-primary data-[state=active]:text-white shrink-0">
                                <Gamepad2 className="h-3.5 w-3.5" /> Game Marks
                            </TabsTrigger>
                            <TabsTrigger value="deliveries" className="text-xs font-semibold gap-1.5 py-1.5 px-2.5 sm:px-3 data-[state=active]:bg-primary data-[state=active]:text-white shrink-0">
                                <Truck className="h-3.5 w-3.5" /> Study Packs
                            </TabsTrigger>
                            <TabsTrigger value="certs" className="text-xs font-semibold gap-1.5 py-1.5 px-2.5 sm:px-3 data-[state=active]:bg-primary data-[state=active]:text-white shrink-0">
                                <Award className="h-3.5 w-3.5" /> Certs & Conv.
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: FINANCE & SLIPS */}
                        <TabsContent value="finance" className="mt-3 space-y-3">
                            {activeBalance ? (
                                <div className="space-y-3">
                                    {/* 3 Summary Cards */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                            <p className="text-xs font-semibold text-slate-400">Total Fee</p>
                                            <p className="font-bold text-slate-100 mt-1 text-xs sm:text-base">
                                                LKR {(activeBalance.totalPaymentAmount || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                            <p className="text-xs font-semibold text-slate-400">Total Paid</p>
                                            <p className="font-bold text-emerald-400 mt-1 text-xs sm:text-base">
                                                LKR {(activeBalance.TotalStudentPaymentRecords || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                            <p className="text-xs font-semibold text-slate-400">Due Balance</p>
                                            <p className={cn(
                                                "font-bold mt-1 text-xs sm:text-base",
                                                (activeBalance.studentBalance || 0) > 0 ? "text-rose-400" : "text-emerald-400"
                                            )}>
                                                LKR {(activeBalance.studentBalance || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pending Payment Slips */}
                                    {pendingSlips.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <h6 className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Pending Payment Slips ({pendingSlips.length})
                                            </h6>
                                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                                                {pendingSlips.map((slip: any, idx: number) => (
                                                    <div key={slip.id || idx} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[11px]">
                                                        <div>
                                                            <p className="font-semibold text-amber-300">
                                                                Ref: {slip.payment_reference || slip.unique_number || "Pending"}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {slip.bank === "1" ? "BOC" : slip.bank || "Online"} • {new Date(slip.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-amber-400">
                                                                LKR {parseFloat(slip.paid_amount || 0).toLocaleString()}
                                                            </p>
                                                            <span className="text-[9px] text-amber-400">Awaiting Approval</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Approved Official Receipts */}
                                    {activeBalance.paymentRecords && Object.values(activeBalance.paymentRecords).length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <h6 className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3 text-emerald-400" /> Official Receipts
                                            </h6>
                                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                                                {Object.values(activeBalance.paymentRecords).map((rec: any) => (
                                                    <div key={rec.id} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-[11px]">
                                                        <div>
                                                            <p className="font-semibold text-slate-200">{rec.receipt_number || "Official Receipt"}</p>
                                                            <p className="text-[10px] text-slate-400">{rec.paid_date} • {rec.payment_type}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-emerald-400">
                                                                LKR {parseFloat(rec.paid_amount || 0).toLocaleString()}
                                                            </p>
                                                            <span className="text-[9px] text-emerald-500">Paid & Verified</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-xs text-muted-foreground space-y-2">
                                    <p>No financial snapshot loaded yet.</p>
                                    {onRefreshBalance && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={onRefreshBalance}
                                            disabled={isLoadingBalance}
                                            className="h-7 text-xs border-slate-800"
                                        >
                                            {isLoadingBalance ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CreditCard className="h-3 w-3 mr-1" />}
                                            Load Payment Ledger
                                        </Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 2: COURSES & ENROLLMENTS */}
                        <TabsContent value="courses" className="mt-3 space-y-2">
                            {enrollments.length > 0 ? (
                                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                    {enrollments.map((c) => {
                                        const isSelected = selectedCourseCode === c.course_code;
                                        return (
                                            <div
                                                key={c.student_course_id || c.course_code}
                                                onClick={() => onSelectCourseCode && onSelectCourseCode(isSelected ? "" : c.course_code)}
                                                className={cn(
                                                    "p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer",
                                                    isSelected
                                                        ? "bg-primary/15 border-primary text-white"
                                                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                                                )}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        <span className="font-mono text-primary">[{c.course_code}]</span>
                                                        <span className="truncate max-w-[200px]">{c.course_name || c.course_code}</span>
                                                    </div>
                                                    {(c as any).enrollment_key && (
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                                            Key: {(c as any).enrollment_key}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px]",
                                                    isSelected ? "border-primary text-primary bg-primary/10" : "border-slate-800 text-slate-400"
                                                )}>
                                                    {isSelected ? "Tagged to Ticket" : "Tag to Ticket"}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-xs text-muted-foreground">No active course enrollments found.</p>
                            )}
                        </TabsContent>

                        {/* TAB 3: GAMES & MARKS */}
                        <TabsContent value="games" className="mt-3 space-y-3">
                            {isLoadingFullInfo ? (
                                <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span>Fetching live game & exam marks...</span>
                                </div>
                            ) : deepEnrollments.length > 0 ? (
                                <div className="space-y-2.5 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                                    {deepEnrollments.map((c: any) => (
                                        <div key={c.course_code} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                                            <div className="font-bold text-slate-200 border-b border-slate-800/80 pb-1 flex justify-between">
                                                <span>[{c.course_code}] {c.batch_name || c.course_code}</span>
                                                <span className="text-primary text-[11px]">Avg: {c.assignment_grades?.average_grade || "0"}%</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Heart className="h-3 w-3 text-rose-500" /> Ceylon Pharm.
                                                    </span>
                                                    <strong className="text-white">{c.ceylon_pharmacy?.recoveredCount || 0} pts</strong>
                                                </div>
                                                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Target className="h-3 w-3 text-purple-400" /> Pharma Hunter
                                                    </span>
                                                    <strong className="text-white">{c.pharma_hunter?.ProgressValue || 0}%</strong>
                                                </div>
                                                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Target className="h-3 w-3 text-emerald-400" /> Hunter Pro
                                                    </span>
                                                    <strong className="text-white">{c.pharma_hunter_pro?.progressValue || 0}%</strong>
                                                </div>
                                                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex justify-between items-center">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Gamepad2 className="h-3 w-3 text-blue-400" /> Medi Mind
                                                    </span>
                                                    <strong className="text-white">{c.medi_mind?.progressPercentage || 0}%</strong>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-xs text-muted-foreground">No game records or exam grades available.</p>
                            )}
                        </TabsContent>

                        {/* TAB 4: STUDY PACKS & DELIVERIES */}
                        <TabsContent value="deliveries" className="mt-3 space-y-2">
                            {isLoadingFullInfo ? (
                                <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span>Fetching study pack dispatch status...</span>
                                </div>
                            ) : deepEnrollments.flatMap((c: any) => c.deliveryOrders || []).length > 0 ? (
                                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                    {deepEnrollments.flatMap((c: any) => c.deliveryOrders || []).map((order: any) => (
                                        <div key={order.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                                            <div>
                                                <p className="font-bold text-slate-200">{order.delivery_title || "Study Pack"}</p>
                                                <p className="text-[10px] text-primary font-mono mt-0.5">
                                                    Tracking: {order.tracking_number || "Pending dispatch"}
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
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-4 text-xs text-muted-foreground">No study pack dispatches or delivery tracking records found.</p>
                            )}
                        </TabsContent>

                        {/* TAB 5: CERTS & CONVOCATION */}
                        <TabsContent value="certs" className="mt-3 space-y-2.5">
                            {isLoadingConvocation || isLoadingCertificates ? (
                                <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span>Fetching certificate & convocation records...</span>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                    {/* Convocation Bookings */}
                                    {convocationBookings.map((b: any) => (
                                        <div key={b.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                                            <div>
                                                <p className="font-bold text-slate-200">{b.convocation_name || "Convocation Booking"}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Ceremony #{b.ceremony_number || "-"} • Package: {b.package_name || "-"}
                                                </p>
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                                {b.payment_status || "Booked"}
                                            </Badge>
                                        </div>
                                    ))}

                                    {/* Certificate Orders */}
                                    {certificateOrders.map((o: any) => (
                                        <div key={o.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                                            <div>
                                                <p className="font-bold text-slate-200">Cert Order #{o.order_number || o.id}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Name: {o.name_on_certificate || "-"}
                                                </p>
                                            </div>
                                            <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-[10px]">
                                                {o.status || "Ordered"}
                                            </Badge>
                                        </div>
                                    ))}

                                    {convocationBookings.length === 0 && certificateOrders.length === 0 && (
                                        <p className="text-center py-4 text-xs text-muted-foreground">No certificate orders or convocation bookings found.</p>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
