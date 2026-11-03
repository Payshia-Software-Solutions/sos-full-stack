"use client";

import { LMS_API_URL } from "@/lib/config";

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    updateConvocationBooking, 
    updateConvocationPayment,
    updateCeremonyNumber,
    getConvocationSessionCounts, 
    getConvocationRegistrationsByStudent,
    getCertificateOrdersByStudent,
    getTcPayments,
    deleteConvocationPayment,
    getConvocationMedalTypes,
    deleteConvocationRegistration,
    getConvocationCeremonies,
    getConvocationSlipDownloadUrl,
    downloadConvocationSlipPdf
} from '@/lib/actions/certificates';
import { getStudentFullInfo } from '@/lib/actions/users';
import type { 
    ConvocationRegistration, 
    ConvocationPackage, 
    ConvocationCeremony,
    FullStudentData, 
    SessionCount,
    CertificateOrder,
    StudentEnrollment,
    TcPaymentRecord,
    UserFullDetails,
    StudentBalanceData,
    ConvocationMedalType
} from '@/lib/types';
import Image from 'next/image';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { 
    Loader2, Save, Edit2, X, ChevronDown, CheckCircle, Banknote, UserCheck, 
    ListOrdered, Calculator, FileText, Paperclip, AlertTriangle, Trash2, 
    Award, Users, Coffee, Plus, Minus, Check, Sparkles, BookOpen 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnrollmentDetailAccordion } from './EnrollmentDetailAccordion';
import { ViewSlipDialog } from './ViewSlipDialog';

const PARENT_SEAT_RATE = 750;

export const getMedalBadgeClass = (color?: string | null) => {
    switch (color?.toLowerCase()) {
        case 'silver':
            return 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700';
        case 'bronze':
            return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800';
        case 'purple':
            return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800';
        case 'blue':
            return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800';
        case 'emerald':
            return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800';
        case 'gold':
        default:
            return 'bg-yellow-100 text-yellow-900 border-yellow-400 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800';
    }
};

export const parseMedalIds = (val: string | number | null | undefined): string[] => {
    if (!val || val === 'none') return [];
    return String(val).split(',').map(s => s.trim()).filter(Boolean);
};

function TempUserInfo({ user }: { user: any }) {
    return (
        <div className="space-y-2 text-muted-foreground text-sm">
            <p className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary shrink-0" /><strong className="text-card-foreground">{user.full_name}</strong></p>
            <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary shrink-0" /><span className="truncate">{user.email_address}</span></p>
            {user.phone_number && (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-card-foreground">{user.phone_number}</span>
                </div>
            )}
        </div>
    );
}

function RegisteredStudentInfo({ user, studentNumber }: { user: UserFullDetails, studentNumber: string }) {
    const { data: balanceData, isLoading: isLoadingBalance } = useQuery<StudentBalanceData>({
        queryKey: ['studentBalance', studentNumber],
        queryFn: () => getStudentFullInfo(studentNumber),
        enabled: !!studentNumber,
    });

    return (
        <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Student Details</TabsTrigger>
                <TabsTrigger value="payment">Payment History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-4 space-y-2 text-muted-foreground text-sm">
                <p className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary shrink-0" /><strong className="text-card-foreground">{user.full_name}</strong></p>
                <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary shrink-0" /><span className="truncate">{user.e_mail}</span></p>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-card-foreground">{user.telephone_1}</span>
                </div>
            </TabsContent>
            <TabsContent value="payment">
                {isLoadingBalance ? <Skeleton className="h-40"/> : balanceData && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <Card><CardHeader className="p-2"><CardTitle className="text-xs">Total Paid</CardTitle></CardHeader><CardContent className="p-2 pt-0"><p className="text-sm font-bold">LKR {balanceData.totalPaymentAmount.toLocaleString()}</p></CardContent></Card>
                            <Card><CardHeader className="p-2"><CardTitle className="text-xs">Outstanding</CardTitle></CardHeader><CardContent className="p-2 pt-0"><p className="text-sm font-bold text-destructive">LKR {balanceData.studentBalance.toLocaleString()}</p></CardContent></Card>
                        </div>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}

function DuplicateSlipCheck({ hashValue, currentRegistrationId }: { hashValue: string, currentRegistrationId: string }) {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const { data: duplicateRecords, isLoading, isError } = useQuery<any[]>({
        queryKey: ['duplicateCheck', hashValue],
        queryFn: async () => {
            if (!hashValue) return [];
            const baseUrl = LMS_API_URL;
            const response = await fetch(`${baseUrl}/payment-portal-requests/check-hash?hashValue=${hashValue}`);
            if (response.status === 404) return [];
            if (!response.ok) throw new Error('Failed check');
            return response.json();
        },
        enabled: !!hashValue,
    });

    if (isLoading) return <div className="text-[10px] text-muted-foreground animate-pulse flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Verifying...</div>;
    
    if (isError || !hashValue) return null;

    const otherRecords = duplicateRecords?.filter(r => 
        (r.registration_id && String(r.registration_id) !== String(currentRegistrationId)) || 
        (r.id && String(r.id) !== String(currentRegistrationId))
    ) || [];

    const isDuplicate = otherRecords.length > 0;

    if (isDuplicate) {
        return (
            <div className="mt-1">
                <div className="flex items-center gap-2 text-destructive font-bold text-[10px] bg-destructive/10 p-1 px-2 rounded w-fit border border-destructive/20">
                    <AlertTriangle className="h-3 w-3" />
                    DUPLICATE DETECTED
                    <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                        <DialogTrigger asChild>
                            <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-destructive underline ml-1 font-bold">
                                View Records
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Conflicting Records</DialogTitle>
                                <DialogDescription>
                                    The following records were found sharing the same payment slip hash.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Student ID</TableHead>
                                            <TableHead className="text-xs">Ref #</TableHead>
                                            <TableHead className="text-xs">Amount</TableHead>
                                            <TableHead className="text-xs">Status</TableHead>
                                            <TableHead className="text-xs">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {duplicateRecords?.map((record, idx) => (
                                            <TableRow key={idx} className={cn(String(record.registration_id || record.id) === String(currentRegistrationId) && "bg-muted/50 font-bold")}>
                                                <TableCell className="text-xs">{record.unique_number || record.student_number}</TableCell>
                                                <TableCell className="text-xs">{record.reference_number || record.payment_reference || record.id}</TableCell>
                                                <TableCell className="text-xs">LKR {record.payment_amount || record.paid_amount}</TableCell>
                                                <TableCell className="text-xs">
                                                    <Badge variant="outline" className="text-[10px] uppercase h-4">{record.payment_status || record.registration_status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {record.registered_at ? format(new Date(record.registered_at), 'yyyy-MM-dd') : 
                                                     record.paid_date ? format(new Date(record.paid_date), 'yyyy-MM-dd') : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-1 flex items-center gap-1 text-green-600 font-bold text-[10px] bg-green-50 p-1 px-2 rounded w-fit border border-green-200">
            <CheckCircle className="h-3 w-3" />
            NO DUPLICATES
        </div>
    );
}

export const RegistrationDetailDialog = ({ registration, open, onOpenChange, packages }: { 
    registration: ConvocationRegistration | null, 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    packages?: ConvocationPackage[]
}) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    // Dedicated action modals state
    const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
    const [isAddonsDialogOpen, setIsAddonsDialogOpen] = useState(false);
    const [isMedalsDialogOpen, setIsMedalsDialogOpen] = useState(false);
    const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isConfirmAttendanceDialogOpen, setIsConfirmAttendanceDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const handleDownloadPdf = async () => {
        if (!registration) return;
        try {
            setIsDownloadingPdf(true);
            await downloadConvocationSlipPdf(
                registration.registration_id, 
                `Convocation_Admission_${registration.reference_number || registration.registration_id}.pdf`
            );
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Download Failed', description: e.message || 'Could not download PDF' });
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // Edit form states
    const [editPackageId, setEditPackageId] = useState('');
    const [editSession, setEditSession] = useState<'1' | '2'>('1');
    const [editSeats, setEditSeats] = useState('0');
    const [editTokens, setEditTokens] = useState('0');
    const [editMedalTypeIds, setEditMedalTypeIds] = useState<string[]>([]);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editCourseIds, setEditCourseIds] = useState<string[]>([]);

    const toggleMedal = (idStr: string) => {
        setEditMedalTypeIds(prev => 
            prev.includes(idStr) ? prev.filter(m => m !== idStr) : [...prev, idStr]
        );
    };

    // Payment & attendance form states
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [ceremonyNumber, setCeremonyNumber] = useState('');

    const { data: medalTypes } = useQuery<ConvocationMedalType[]>({
        queryKey: ['convocationMedalTypes'],
        queryFn: () => getConvocationMedalTypes(false),
    });

    const selectedMedalsInView = useMemo(() => {
        if (!registration) return [];
        const ids = parseMedalIds(registration.medal_type_id);
        if (ids.length > 0 && medalTypes && medalTypes.length > 0) {
            return medalTypes.filter(m => ids.includes(String(m.id)));
        }
        if (registration.medal_name) {
            const colors = (registration.medal_color || '').split(',');
            return registration.medal_name.split(',').map((name, idx) => ({
                id: idx,
                name: name.trim(),
                color: colors[idx]?.trim() || 'gold'
            }));
        }
        return [];
    }, [registration, medalTypes]);

    const { data: studentInfo, isLoading: isLoadingStudentData } = useQuery<FullStudentData>({
        queryKey: ['studentFullInfoForConvocationDetail', registration?.student_number],
        queryFn: () => getStudentFullInfo(registration!.student_number),
        enabled: !!registration?.student_number,
    });

    const { data: allTcPayments, isLoading: isLoadingTcPayments } = useQuery<TcPaymentRecord[]>({
        queryKey: ['tcPayments', registration?.student_number],
        queryFn: () => getTcPayments(registration!.student_number),
        enabled: !!registration?.student_number,
    });

    const tcPayments = useMemo(() => {
        if (!allTcPayments || !registration) return [];
        const referKey = `covocation-payment-${registration.convocation_id}`;
        return allTcPayments.filter(p => p.reference_key === referKey);
    }, [allTcPayments, registration]);

    const { data: portalPayments, isLoading: isLoadingPortalSlips } = useQuery<any[]>({
        queryKey: ['paymentRequests', registration?.student_number],
        queryFn: () => {
            if (!registration?.student_number) return Promise.resolve([]);
            const baseUrl = LMS_API_URL;
            return fetch(`${baseUrl}/payment-portal-requests/by-reference/${registration.student_number}`).then(res => res.status === 404 ? [] : res.json());
        },
        enabled: !!registration?.student_number,
    });

    const { data: otherBookings } = useQuery<ConvocationRegistration[]>({
        queryKey: ['convocationRegistrationsByStudent', registration?.student_number],
        queryFn: () => getConvocationRegistrationsByStudent(registration!.student_number),
        enabled: !!registration?.student_number,
    });

    const { data: certOrders } = useQuery<CertificateOrder[]>({
        queryKey: ['certificateOrdersByStudent', registration?.student_number],
        queryFn: () => getCertificateOrdersByStudent(registration!.student_number),
        enabled: !!registration?.student_number,
    });

    const { data: sessionCounts } = useQuery<SessionCount[]>({
        queryKey: ['convocationSessionCounts', registration?.convocation_id],
        queryFn: () => getConvocationSessionCounts(registration!.convocation_id),
        enabled: !!registration?.convocation_id,
    });

    const { data: ceremonies } = useQuery<ConvocationCeremony[]>({
        queryKey: ['convocationCeremonies'],
        queryFn: getConvocationCeremonies,
    });

    const currentCeremony = useMemo(() => {
        if (!ceremonies || !registration) return null;
        return ceremonies.find(c => String(c.id) === String(registration.convocation_id)) || null;
    }, [ceremonies, registration]);

    const sessionInfo = useMemo(() => {
        const hasMultiple = currentCeremony ? parseInt(currentCeremony.session_count, 10) >= 2 : false;
        const s1Booked = sessionCounts ? parseInt(sessionCounts.find(s => s.session === '1')?.sessionCounts || '0', 10) : 0;
        const s2Booked = sessionCounts ? parseInt(sessionCounts.find(s => s.session === '2')?.sessionCounts || '0', 10) : 0;
        
        const s1Cap = currentCeremony?.student_seats ? parseInt(currentCeremony.student_seats, 10) : null;
        const s2Cap = currentCeremony?.session_2 ? parseInt(currentCeremony.session_2, 10) : null;

        const s1Text = s1Cap ? `S1: ${s1Booked}/${s1Cap}` : `S1: ${s1Booked}`;
        const s2Text = s2Cap ? `S2: ${s2Booked}/${s2Cap}` : `S2: ${s2Booked}`;

        return {
            hasMultipleSessions: hasMultiple,
            s1Booked,
            s2Booked,
            label: hasMultiple ? `Session (${s1Text} | ${s2Text})` : `Session (${s1Text})`,
        };
    }, [currentCeremony, sessionCounts]);

    const ceremonyParentSeatRate = currentCeremony?.parent_seat_price ? parseFloat(currentCeremony.parent_seat_price) : PARENT_SEAT_RATE;
    const ceremonyRefreshTokenRate = currentCeremony?.refreshment_token_price ? parseFloat(currentCeremony.refreshment_token_price) : 0;

    const balanceSlips = useMemo(() => {
        if (!portalPayments || !registration) return [];
        const reasonKey = `convocation2nd-${registration.convocation_id}`;
        return portalPayments.filter(p => p.payment_reson === reasonKey);
    }, [portalPayments, registration]);

    const refreshAllData = () => {
        queryClient.invalidateQueries({ queryKey: ['convocationRegistrations'] });
        if (registration?.student_number) {
            queryClient.invalidateQueries({ queryKey: ['studentFullInfoForConvocationDetail', registration.student_number] });
            queryClient.invalidateQueries({ queryKey: ['tcPayments', registration.student_number] });
            queryClient.invalidateQueries({ queryKey: ['paymentRequests', registration.student_number] });
        }
    };

    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            return updateConvocationBooking(registration!.registration_id, payload);
        },
        onSuccess: () => {
            toast({ title: 'Success', description: 'Booking updated successfully.' });
            refreshAllData();
            setIsEditBookingOpen(false);
            setIsAddonsDialogOpen(false);
            setIsMedalsDialogOpen(false);
            setIsCoursesDialogOpen(false);
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Update Failed', description: err.message })
    });

    const updatePaymentMutation = useMutation({
        mutationFn: (payload: { payment_status: string; payment_amount: number; created_by: string }) => 
            updateConvocationPayment(registration!.registration_id, payload),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Payment details verified and updated.' });
            refreshAllData();
            setIsPaymentDialogOpen(false);
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        },
    });

    const updateCeremonyMutation = useMutation({
        mutationFn: (ceremonyNum: string) => updateCeremonyNumber(registration!.registration_id, ceremonyNum),
        onSuccess: () => {
            toast({ title: 'Attendance Confirmed', description: 'Ceremony number assigned successfully.' });
            refreshAllData();
            setIsConfirmAttendanceDialogOpen(false);
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Confirmation Failed', description: error.message });
        },
    });

    const deletePaymentMutation = useMutation({
        mutationFn: (paymentId: string) => deleteConvocationPayment(registration!.registration_id, paymentId),
        onSuccess: () => {
            toast({ title: 'Payment Deleted', description: 'The verified payment record has been removed.' });
            refreshAllData();
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Deletion Failed', description: err.message })
    });

    const deleteRegistrationMutation = useMutation({
        mutationFn: () => deleteConvocationRegistration(registration!.registration_id),
        onSuccess: () => {
            toast({ title: 'Booking Deleted', description: 'The convocation booking has been permanently deleted.' });
            queryClient.invalidateQueries({ queryKey: ['convocationRegistrations'] });
            setIsDeleteDialogOpen(false);
            onOpenChange(false);
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Deletion Failed', description: err.message || 'Failed to delete booking' })
    });

    const totalPaidFromRecords = useMemo(() => {
        if (!tcPayments) return 0;
        return tcPayments.reduce((acc, rec) => acc + (parseFloat(rec.payment_amount) || 0), 0);
    }, [tcPayments]);

    // View total payable (based on actual registered values)
    const viewTotalPayable = useMemo(() => {
        if (!registration) return 0;
        const pkg = packages?.find(p => String(p.package_id) === String(registration.package_id));
        const packagePrice = pkg ? parseFloat(pkg.price) : 0;
        const numSeats = parseInt(String(registration.additional_seats ?? 0), 10) || 0;
        const numTokens = parseInt(String(registration.refreshment_tokens ?? 0), 10) || 0;
        return packagePrice + (numSeats * ceremonyParentSeatRate) + (numTokens * ceremonyRefreshTokenRate);
    }, [registration, packages, ceremonyParentSeatRate, ceremonyRefreshTokenRate]);

    // Edit total payable (based on live input fields in edit modal)
    const editTotalPayable = useMemo(() => {
        const pkg = packages?.find(p => String(p.package_id) === String(editPackageId));
        const packagePrice = pkg ? parseFloat(pkg.price) : 0;
        const numSeats = parseInt(editSeats, 10) || 0;
        const numTokens = parseInt(editTokens, 10) || 0;
        return packagePrice + (numSeats * ceremonyParentSeatRate) + (numTokens * ceremonyRefreshTokenRate);
    }, [editPackageId, editSeats, editTokens, packages, ceremonyParentSeatRate, ceremonyRefreshTokenRate]);

    const bookedElsewhereIds = useMemo(() => {
        if (!otherBookings || !registration) return new Set<string>();
        const ids = new Set<string>();
        otherBookings
            .filter(b => String(b.registration_id) !== String(registration.registration_id) && b.registration_status !== 'Rejected' && b.registration_status !== 'Canceled')
            .forEach(b => (b.course_id || '').split(',').forEach(id => ids.add(id.trim())));
        return ids;
    }, [otherBookings, registration]);

    const orderedElsewhereIds = useMemo(() => {
        if (!certOrders) return new Set<string>();
        const ids = new Set<string>();
        certOrders
            .filter(o => o.certificate_status !== 'Delivered')
            .forEach(o => (o.course_code || '').split(',').forEach(id => ids.add(id.trim())));
        return ids;
    }, [certOrders]);

    const allEnrollmentsList = useMemo(() => {
        if (!studentInfo) return [];
        return Object.values(studentInfo.studentEnrollments);
    }, [studentInfo]);

    const courseGrouping = useMemo(() => {
        if (!studentInfo || !registration) return { included: [], others: [] };
        
        const allEnrollments = Object.values(studentInfo.studentEnrollments);
        const currentBookingIds = (registration.course_id || '').split(',').map(s => s.trim()).filter(Boolean);
        
        const included: StudentEnrollment[] = [];
        const others: StudentEnrollment[] = [];

        allEnrollments.forEach(enrollment => {
            const isMatch = currentBookingIds.some(
                id => id === String(enrollment.parent_course_id) || id === String(enrollment.id) || id === String(enrollment.course_code)
            );
            if (isMatch) {
                included.push(enrollment);
            } else {
                others.push(enrollment);
            }
        });

        return { included, others };
    }, [studentInfo, registration]);

    const initEditState = () => {
        if (!registration) return;
        setEditPackageId(String(registration.package_id || ''));
        const hasMultiple = currentCeremony ? parseInt(currentCeremony.session_count, 10) >= 2 : false;
        setEditSession(hasMultiple ? (String(registration.session || '1') as '1' | '2') : '1');
        setEditSeats(String(registration.additional_seats ?? '0'));
        setEditTokens(String(registration.refreshment_tokens ?? '0'));
        setEditMedalTypeIds(parseMedalIds(registration.medal_type_id));
        setEditName(registration.name_on_certificate || studentInfo?.studentInfo.name_on_certificate || studentInfo?.studentInfo.full_name || '');
        setEditPhone(registration.telephone_1 || studentInfo?.studentInfo.telephone_1 || '');
        setEditCourseIds(registration.course_id ? registration.course_id.split(',').map(s => s.trim()).filter(Boolean) : []);
    };

    const openEditModal = () => { initEditState(); setIsEditBookingOpen(true); };
    const openAddonsModal = () => { initEditState(); setIsAddonsDialogOpen(true); };
    const openMedalsModal = () => { initEditState(); setIsMedalsDialogOpen(true); };
    const openCoursesModal = () => { initEditState(); setIsCoursesDialogOpen(true); };

    const openPaymentModal = () => {
        if (!registration) return;
        setPaymentAmount('');
        setPaymentStatus(registration.payment_status || 'Pending');
        setIsPaymentDialogOpen(true);
    };

    const openAttendanceModal = () => {
        if (!registration) return;
        setCeremonyNumber(registration.ceremony_number || '');
        setIsConfirmAttendanceDialogOpen(true);
    };

    const handleVerifiedAmountChange = (val: string) => {
        setPaymentAmount(val);
        const verifiedInput = parseFloat(val) || 0;
        const totalVerifiedSoFar = totalPaidFromRecords + verifiedInput;

        if (totalVerifiedSoFar >= viewTotalPayable && viewTotalPayable > 0) {
            setPaymentStatus('Paid');
        } else if (totalVerifiedSoFar > 0 && totalVerifiedSoFar < viewTotalPayable) {
            setPaymentStatus('Partially Paid');
        } else if (totalVerifiedSoFar === 0) {
            setPaymentStatus('Pending');
        }
    };

    const handleUpdate = async () => {
        if (!registration) return;
        
        const fullPayload = {
            ...registration,
            package_id: editPackageId,
            session: editSession,
            additional_seats: editSeats,
            refreshment_tokens: editTokens,
            medal_type_id: editMedalTypeIds.length > 0 ? editMedalTypeIds.join(',') : null,
            name_on_certificate: editName,
            telephone_1: editPhone,
            course_id: editCourseIds.join(','),
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };

        updateMutation.mutate(fullPayload);
    };

    const handlePaymentUpdate = () => {
        if (!paymentAmount) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter the verified payment amount.' });
            return;
        }

        let statusToSubmit = paymentStatus;
        if (paymentStatus === 'Partially Paid' || paymentStatus.toLowerCase() === 'partially-paid') {
            statusToSubmit = 'partially-paid';
        } else {
            statusToSubmit = paymentStatus.toLowerCase();
        }

        updatePaymentMutation.mutate({
            payment_status: statusToSubmit,
            payment_amount: parseFloat(paymentAmount),
            created_by: user?.username || 'admin',
        });
    };

    const handleAttendanceConfirmation = () => {
        if (!ceremonyNumber) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a ceremony number.' });
            return;
        }
        updateCeremonyMutation.mutate(ceremonyNumber);
    };

    const handleDeletePayment = (paymentId: string) => {
        if (confirm('Are you sure you want to delete this payment record? This will affect the student balance.')) {
            deletePaymentMutation.mutate(paymentId);
        }
    };

    if (!open || !registration) return null;

    const currentPackage = packages?.find(p => String(p.package_id) === String(registration.package_id));
    const remainingToVerify = viewTotalPayable - totalPaidFromRecords;
    const balanceAfterCurrentCheck = remainingToVerify - (parseFloat(paymentAmount) || 0);

    return (
        <>
        {/* ========================================================================= */}
        {/* MAIN DIALOG: PURE VIEW-ONLY DETAILS DASHBOARD                            */}
        {/* ========================================================================= */}
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-[95vw] md:w-full max-h-[90vh] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 sm:p-6 pb-3 shrink-0 border-b flex flex-row items-center justify-between gap-4">
                    <div>
                        <DialogTitle className="text-lg sm:text-xl font-bold">Booking Details: #{registration.reference_number}</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Detailed overview for student {registration.student_number}.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        <Button size="sm" variant="outline" onClick={openEditModal} className="h-8 gap-1.5 text-xs">
                            <Edit2 className="h-3.5 w-3.5" /> Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={openAddonsModal} className="h-8 gap-1.5 text-xs">
                            <Sparkles className="h-3.5 w-3.5" /> Add-ons
                        </Button>
                        <Button size="sm" variant="outline" onClick={openMedalsModal} className="h-8 gap-1.5 text-xs">
                            <Award className="h-3.5 w-3.5" /> Medals
                        </Button>
                        <Button size="sm" variant="outline" onClick={openCoursesModal} className="h-8 gap-1.5 text-xs">
                            <BookOpen className="h-3.5 w-3.5" /> Courses
                        </Button>
                        <Button size="sm" variant="outline" onClick={openPaymentModal} className="h-8 gap-1.5 text-xs border-green-600/30 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 font-medium">
                            <Banknote className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> Update Payment
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                            className="h-8 gap-1.5 text-xs border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
                            title="Download Convocation Admission PDF"
                        >
                            {isDownloadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" /> : <FileText className="h-3.5 w-3.5 text-blue-500" />}
                            {isDownloadingPdf ? 'Downloading...' : 'Admission PDF'}
                        </Button>
                    </div>
                </DialogHeader>
                
                <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-4 sm:p-6 space-y-6">
                        
                        {/* 1. BOOKING & ADD-ONS OVERVIEW (READ-ONLY) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                    Booking Information
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost" onClick={openEditModal} className="h-7 gap-1 text-[11px]">
                                        <Edit2 className="h-3 w-3" /> Details
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={openAddonsModal} className="h-7 gap-1 text-[11px]">
                                        <Sparkles className="h-3 w-3" /> Add-ons
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={openMedalsModal} className="h-7 gap-1 text-[11px]">
                                        <Award className="h-3 w-3" /> Medals
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 animate-in fade-in-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Selected Package</p>
                                        <p className="text-sm font-semibold truncate">{currentPackage?.package_name || 'N/A'}</p>
                                        {currentPackage && (
                                            <p className="text-xs text-muted-foreground font-mono">
                                                LKR {parseFloat(currentPackage.price).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1 sm:col-span-2 md:col-span-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Session & Passes</p>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant="outline" className="text-xs font-semibold">Session {registration.session}</Badge>
                                            {currentPackage?.vip_seat && parseInt(currentPackage.vip_seat, 10) > 0 && (
                                                <Badge variant="outline" className="text-xs font-semibold bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700">
                                                    {currentPackage.vip_seat} VIP Seats
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="text-xs font-semibold">{registration.additional_seats || '0'} Guest Seats</Badge>
                                            <Badge variant="outline" className="text-xs font-semibold bg-orange-50 text-orange-700 border-orange-200">{registration.refreshment_tokens || '0'} Refreshments</Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Certificate Details</p>
                                        <p className="text-sm font-semibold break-words leading-tight">{registration.name_on_certificate || studentInfo?.studentInfo.name_on_certificate || studentInfo?.studentInfo.full_name || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{registration.telephone_1 || studentInfo?.studentInfo.telephone_1 || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 sm:col-span-2 md:col-span-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Awards & Medals</p>
                                        {selectedMedalsInView.length > 0 ? (
                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                {selectedMedalsInView.map((m, idx) => (
                                                    <Badge 
                                                        key={m.id ?? idx} 
                                                        variant="outline" 
                                                        className={cn("text-xs font-bold gap-1.5 inline-flex items-center", getMedalBadgeClass(m.color))}
                                                    >
                                                        <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                        <span>{m.name}</span>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">None</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Calculated Payable</p>
                                        <p className="text-base font-bold text-primary font-mono">
                                            LKR {viewTotalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                {/* Included Courses Section */}
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Included in this Booking
                                        </Label>
                                        <Button size="sm" variant="ghost" onClick={openCoursesModal} className="h-6 px-2 text-[11px] text-muted-foreground hover:text-primary">
                                            Manage Courses
                                        </Button>
                                    </div>
                                    {isLoadingStudentData ? <Skeleton className="h-20 w-full" /> : studentInfo && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {courseGrouping.included.length > 0 ? (
                                                courseGrouping.included.map(enrollment => (
                                                    <div key={enrollment.id} className="border rounded-md p-3 bg-primary/5 border-primary/20 flex items-start gap-3">
                                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-xs font-bold leading-tight text-foreground">{enrollment.parent_course_name}</p>
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                                                <span className="font-semibold text-foreground">Batch:</span>
                                                                <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-muted/60">{enrollment.course_code}</Badge>
                                                                {enrollment.batch_name && <span className="truncate max-w-[200px]">({enrollment.batch_name})</span>}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                <Badge variant="default" className="text-[9px] h-4 px-1.5 bg-green-100 text-green-700 border-green-200">Included</Badge>
                                                                {!enrollment.certificate_eligibility && <Badge variant="destructive" className="text-[9px] h-4 px-1">Academic Pending</Badge>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic col-span-2 p-3 border border-dashed rounded-md text-center">
                                                    No courses are currently assigned to this booking. Click "Edit Booking & Add-ons" to assign courses.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {courseGrouping.others.length > 0 && (
                                    <div className="space-y-2 pt-3 border-t">
                                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Other Enrollments Available ({courseGrouping.others.length})
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {courseGrouping.others.map(enrollment => (
                                                <div key={enrollment.id} className="text-xs px-2.5 py-1.5 rounded border bg-muted/20 flex items-center gap-2">
                                                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="font-medium text-foreground">{enrollment.parent_course_name}</span>
                                                    <Badge variant="outline" className="text-[10px] font-mono">{enrollment.course_code}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. FINANCIAL OVERVIEW & VERIFICATION DOCUMENTS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            {/* Financial Overview Card */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                        Financial Overview
                                    </CardTitle>
                                    <Button size="sm" variant="outline" onClick={openPaymentModal} className="h-8 gap-1.5 text-xs">
                                        <Banknote className="h-3.5 w-3.5 text-primary" /> Update Payment
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* 1. Convocation Booking Financials */}
                                    <div className="space-y-2 p-3 bg-muted/40 rounded-lg border">
                                        <div className="flex items-center justify-between pb-1 border-b">
                                            <span className="text-xs font-bold text-foreground">Convocation Booking Fees</span>
                                            <Badge className={cn(
                                                "uppercase text-[9px] font-bold",
                                                registration.payment_status?.toLowerCase() === 'paid' ? 'bg-green-600 text-white' : 
                                                (registration.payment_status?.toLowerCase() === 'partially-paid' || registration.payment_status?.toLowerCase() === 'partially paid') ? 'bg-orange-500 text-white' : 
                                                'bg-destructive text-white'
                                            )}>{registration.payment_status || 'Pending'}</Badge>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Total Required Fee:</span>
                                            <span className="font-mono font-semibold">LKR {viewTotalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-green-600 font-medium">
                                            <span>Verified Booking Paid:</span>
                                            <span className="font-mono font-semibold">LKR {totalPaidFromRecords.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-dashed">
                                            <span>Booking Due Balance:</span>
                                            <span className={cn("font-mono", (viewTotalPayable - totalPaidFromRecords) > 0 ? "text-destructive" : "text-green-600")}>
                                                LKR {Math.max(0, viewTotalPayable - totalPaidFromRecords).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Academic / Tuition Balance from LMS (Student Profile) */}
                                    {isLoadingStudentData ? <Skeleton className="h-16 w-full" /> : studentInfo && (
                                        <div className="space-y-1.5 p-3 rounded-lg border bg-background/50 text-xs">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Student LMS Academic Balance
                                            </p>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Course Fee:</span>
                                                <span className="font-mono font-medium text-foreground">LKR {studentInfo.studentBalance.TotalRegistrationFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Course Paid:</span>
                                                <span className="font-mono font-medium text-green-600">LKR {studentInfo.studentBalance.totalPaymentAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold pt-1 border-t border-dashed">
                                                <span>Academic Balance:</span>
                                                <span className={cn("font-mono", studentInfo.studentBalance.studentBalance > 0 ? "text-destructive" : "text-green-600")}>
                                                    LKR {studentInfo.studentBalance.studentBalance.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="pt-4 border-t space-y-3">
                                        <h4 className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-2">
                                            <ListOrdered className="h-3.5 w-3.5" /> Verified Transaction Trail
                                        </h4>
                                        {isLoadingTcPayments ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-8 w-full" />
                                                <Skeleton className="h-8 w-full" />
                                            </div>
                                        ) : tcPayments && tcPayments.length > 0 ? (
                                            <div className="border rounded-md overflow-hidden overflow-x-auto bg-muted/10">
                                                <Table>
                                                    <TableHeader className="bg-muted/50">
                                                        <TableRow className="h-8">
                                                            <TableHead className="text-[10px] h-8">Date</TableHead>
                                                            <TableHead className="text-[10px] h-8">Transaction ID</TableHead>
                                                            <TableHead className="text-[10px] h-8 text-right">Amount</TableHead>
                                                            <TableHead className="text-[10px] h-8 text-right">Action</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {tcPayments.map(payment => (
                                                            <TableRow key={payment.id} className="h-8">
                                                                <TableCell className="text-[10px] py-1">{format(new Date(payment.created_at), 'yyyy-MM-dd')}</TableCell>
                                                                <TableCell className="text-[10px] py-1 font-mono">{payment.transaction_id || 'N/A'}</TableCell>
                                                                <TableCell className="text-[10px] py-1 text-right font-semibold">LKR {parseFloat(payment.payment_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                                                <TableCell className="text-[10px] py-1 text-right">
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                                        onClick={() => handleDeletePayment(payment.id)}
                                                                        disabled={deletePaymentMutation.isPending}
                                                                    >
                                                                        {deletePaymentMutation.isPending && deletePaymentMutation.variables === payment.id ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        )}
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground italic p-2 text-center border border-dashed rounded-md">No transaction records found for this student.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Verification Documents Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                        Verification Documents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                                            <Paperclip className="h-3 w-3" /> All Submitted Slips
                                        </Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {/* Initial Slip */}
                                            {registration.image_path ? (
                                                <div className="flex flex-col gap-1">
                                                    <ViewSlipDialog 
                                                        title="Initial Booking Slip"
                                                        slipPath={registration.image_path}
                                                        studentName={registration.student_number}
                                                        trigger={
                                                            <Button variant="outline" size="sm" className="justify-start h-auto py-2.5 px-3">
                                                                <FileText className="h-4 w-4 mr-3 text-primary" />
                                                                <div className="text-left">
                                                                    <p className="text-xs font-semibold">Initial Registration Slip</p>
                                                                    <p className="text-[10px] text-muted-foreground">Main verification</p>
                                                                </div>
                                                            </Button>
                                                        }
                                                    />
                                                    {registration.hash_value && (
                                                        <DuplicateSlipCheck 
                                                            hashValue={registration.hash_value} 
                                                            currentRegistrationId={registration.registration_id} 
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-16 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground italic text-xs">No initial slip</div>
                                            )}

                                            {/* Balance Slips */}
                                            {isLoadingPortalSlips ? (
                                                <Skeleton className="h-10 w-full" />
                                            ) : balanceSlips.map((p, idx) => (
                                                <div key={p.id} className="flex flex-col gap-1">
                                                    <ViewSlipDialog 
                                                        title={`Balance Payment Slip #${idx + 1}`}
                                                        slipPath={p.slip_path}
                                                        studentName={registration.student_number}
                                                        trigger={
                                                            <Button variant="outline" size="sm" className="justify-start h-auto py-2.5 px-3 border-dashed">
                                                                <FileText className="h-4 w-4 mr-3 text-orange-500" />
                                                                <div className="text-left">
                                                                    <p className="text-xs font-semibold">Balance Slip ({format(new Date(p.created_at), 'MMM d')})</p>
                                                                    <p className="text-[10px] text-muted-foreground">Status: {p.payment_status}</p>
                                                                </div>
                                                            </Button>
                                                        }
                                                    />
                                                    {p.hash_value && (
                                                        <DuplicateSlipCheck 
                                                            hashValue={p.hash_value} 
                                                            currentRegistrationId={p.id} 
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 3. COURSE PERFORMANCE & ELIGIBILITY */}
                        <div className="space-y-4 pb-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold font-headline">Course Performance & Eligibility</h3>
                                {isLoadingStudentData ? <Skeleton className="h-5 w-16" /> : studentInfo && <Badge variant="secondary" className="font-mono text-xs">{Object.keys(studentInfo.studentEnrollments).length} Total Enrollments</Badge>}
                            </div>
                            <div className="space-y-4">
                                {isLoadingStudentData ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                ) : studentInfo ? (
                                    Object.values(studentInfo.studentEnrollments).map(enrollment => (
                                        <EnrollmentDetailAccordion key={enrollment.id} enrollment={enrollment} />
                                    ))
                                ) : null}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* MAIN DIALOG FOOTER */}
                <DialogFooter className="p-4 bg-muted/20 border-t shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-8 uppercase font-semibold">Registration: {registration.registration_status}</Badge>
                        {registration.ceremony_number && <Badge variant="default" className="h-8 bg-blue-600 font-bold">Attendance #: {registration.ceremony_number}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            disabled={isDownloadingPdf}
                            className="border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
                            onClick={handleDownloadPdf}
                        >
                            {isDownloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" /> : <FileText className="mr-2 h-4 w-4 text-blue-500" />}
                            {isDownloadingPdf ? 'Downloading...' : 'Admission Slip'}
                        </Button>
                        <Button 
                            variant="outline" 
                            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Booking
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90" onClick={openAttendanceModal}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Confirm & Assign Ceremony #
                        </Button>
                        <DialogClose asChild>
                            <Button variant="secondary">Close</Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 1: EDIT BOOKING DETAILS DIALOG                                      */}
        {/* ========================================================================= */}
        <Dialog open={isEditBookingOpen} onOpenChange={setIsEditBookingOpen}>
            <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 sm:p-6 pb-3 shrink-0 border-b">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Edit2 className="h-5 w-5 text-primary" />
                        Edit Booking Details (#{registration.reference_number})
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Update ceremony package, session, student certificate name, and phone number.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Package</Label>
                            <Select 
                                value={String(editPackageId)} 
                                onValueChange={(val) => setEditPackageId(val)}
                            >
                                <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Select package" /></SelectTrigger>
                                <SelectContent>
                                    {packages?.filter(p => String(p.convocation_id) === String(registration.convocation_id)).sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)).map(p => (
                                        <SelectItem key={p.package_id} value={String(p.package_id)} className="text-xs font-medium">
                                            {p.package_name} - LKR {parseFloat(p.price).toLocaleString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">{sessionInfo.label}</Label>
                            {sessionInfo.hasMultipleSessions ? (
                                <Select value={String(editSession)} onValueChange={(v) => setEditSession(v as '1' | '2')}>
                                    <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Select session" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Session 1</SelectItem>
                                        <SelectItem value="2">Session 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">Session 1</span>
                                    <Badge variant="outline" className="text-[9px] font-mono">Single Session</Badge>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Name on Certificate</Label>
                            <input 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)} 
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={studentInfo?.studentInfo.name_on_certificate || "Enter name..."}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Phone Number</Label>
                            <input 
                                value={editPhone} 
                                onChange={e => setEditPhone(e.target.value)} 
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={studentInfo?.studentInfo.telephone_1 || "Enter phone..."}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-muted/20 border-t shrink-0 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setIsEditBookingOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 2: MANAGE ADD-ONS (SEATS & REFRESHMENTS) DIALOG                      */}
        {/* ========================================================================= */}
        <Dialog open={isAddonsDialogOpen} onOpenChange={setIsAddonsDialogOpen}>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 sm:p-6 pb-3 shrink-0 border-b">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Manage Add-ons (#{registration.reference_number})
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Adjust guest seats and refreshment tokens for this booking pass.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Additional Guest Seats Card */}
                                <div className="p-4 rounded-lg border bg-card space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs font-bold">Additional Guest Seats</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                            LKR {ceremonyParentSeatRate.toLocaleString()} / seat
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-md"
                                                onClick={() => setEditSeats(String(Math.max(0, (parseInt(editSeats, 10) || 0) - 1)))}
                                                disabled={parseInt(editSeats, 10) <= 0}
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </Button>
                                            <div className="w-14 text-center font-bold text-sm font-mono border rounded-md py-1 bg-background">
                                                {editSeats}
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-md"
                                                onClick={() => setEditSeats(String(Math.min(10, (parseInt(editSeats, 10) || 0) + 1)))}
                                                disabled={parseInt(editSeats, 10) >= 10}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {/* Quick Pills */}
                                        <div className="flex items-center gap-1">
                                            {[0, 1, 2, 3, 4, 5].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setEditSeats(String(num))}
                                                    className={cn(
                                                        "px-2 py-1 text-xs rounded border transition-colors font-medium",
                                                        editSeats === String(num) 
                                                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm" 
                                                            : "bg-background hover:bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t">
                                        <span>Seats Subtotal:</span>
                                        <span className="font-mono font-bold text-foreground">
                                            LKR {(parseInt(editSeats, 10) * ceremonyParentSeatRate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Refreshment Tokens Card */}
                                <div className="p-4 rounded-lg border bg-card space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Coffee className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs font-bold">Refreshment Tokens</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                            LKR {ceremonyRefreshTokenRate.toLocaleString()} / token
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-md"
                                                onClick={() => setEditTokens(String(Math.max(0, (parseInt(editTokens, 10) || 0) - 1)))}
                                                disabled={parseInt(editTokens, 10) <= 0}
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </Button>
                                            <div className="w-14 text-center font-bold text-sm font-mono border rounded-md py-1 bg-background">
                                                {editTokens}
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-md"
                                                onClick={() => setEditTokens(String(Math.min(20, (parseInt(editTokens, 10) || 0) + 1)))}
                                                disabled={parseInt(editTokens, 10) >= 20}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {/* Quick Pills */}
                                        <div className="flex items-center gap-1">
                                            {[0, 1, 2, 3, 4, 5, 10].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setEditTokens(String(num))}
                                                    className={cn(
                                                        "px-2 py-1 text-xs rounded border transition-colors font-medium",
                                                        editTokens === String(num) 
                                                            ? "bg-orange-500 text-white border-orange-500 font-bold shadow-sm" 
                                                            : "bg-background hover:bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t">
                                        <span>Tokens Subtotal:</span>
                                        <span className="font-mono font-bold text-foreground">
                                            LKR {(parseInt(editTokens, 10) * ceremonyRefreshTokenRate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                        </div>

                    {/* Live Payment Summary Strip */}
                    <div className="p-3.5 rounded-lg border bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="font-medium text-foreground">Package: LKR {(packages?.find(p => String(p.package_id) === String(editPackageId)) ? parseFloat(packages.find(p => String(p.package_id) === String(editPackageId))!.price) : 0).toLocaleString()}</span>
                            {parseInt(editSeats, 10) > 0 && (
                                <span>+ Seats ({editSeats}): LKR {(parseInt(editSeats, 10) * ceremonyParentSeatRate).toLocaleString()}</span>
                            )}
                            {parseInt(editTokens, 10) > 0 && (
                                <span>+ Refreshments ({editTokens}): LKR {(parseInt(editTokens, 10) * ceremonyRefreshTokenRate).toLocaleString()}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Total Payable:</span>
                            <span className="text-base font-mono font-bold text-primary">
                                LKR {editTotalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-muted/20 border-t shrink-0 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setIsAddonsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Add-ons
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 3: HONORS & MEDALS DIALOG                                           */}
        {/* ========================================================================= */}
        <Dialog open={isMedalsDialogOpen} onOpenChange={setIsMedalsDialogOpen}>
            <DialogContent className="max-w-xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 sm:p-6 pb-3 shrink-0 border-b">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        Honors & Medals (#{registration.reference_number})
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Assign or remove convocation honors, awards, and medals for this pass.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                    <div className="p-4 rounded-lg border bg-card space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                <div>
                                    <span className="text-xs font-bold">Select Medals to Award</span>
                                    <p className="text-[11px] text-muted-foreground">Click medals to toggle assignment for this booking pass.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={editMedalTypeIds.length > 0 ? "default" : "outline"} className="text-[10px]">
                                    {editMedalTypeIds.length} Selected
                                </Badge>
                                {editMedalTypeIds.length > 0 && (
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                                        onClick={() => setEditMedalTypeIds([])}
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {medalTypes && medalTypes.length > 0 ? (
                                medalTypes.map((medal) => {
                                    const isSelected = editMedalTypeIds.includes(String(medal.id));
                                    return (
                                        <button
                                            key={medal.id}
                                            type="button"
                                            onClick={() => toggleMedal(String(medal.id))}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold transition-all cursor-pointer",
                                                isSelected
                                                    ? cn(getMedalBadgeClass(medal.color), "shadow-sm ring-2 ring-primary/40 scale-[1.02]")
                                                    : "bg-background/80 hover:bg-muted text-muted-foreground border-dashed hover:border-solid"
                                            )}
                                        >
                                            <Award className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                                            <span>{medal.name}</span>
                                            {isSelected ? (
                                                <Check className="w-3.5 h-3.5 ml-1 text-primary stroke-[3]" />
                                            ) : (
                                                <Plus className="w-3 h-3 ml-1 text-muted-foreground opacity-50" />
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No medal types configured yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-muted/20 border-t shrink-0 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setIsMedalsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Honors
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 4: ASSIGN STUDENT COURSES DIALOG                                    */}
        {/* ========================================================================= */}
        <Dialog open={isCoursesDialogOpen} onOpenChange={setIsCoursesDialogOpen}>
            <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 sm:p-6 pb-3 shrink-0 border-b">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Assign Student Courses (#{registration.reference_number})
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Select which enrolled courses and batches are represented in this convocation booking.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-4 sm:p-6 space-y-4">
                        {/* Included Courses Checkbox Selector */}
                        <div className="space-y-3 p-4 rounded-lg border bg-card">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Assign Student Courses to this Booking
                                </Label>
                                <span className="text-[11px] text-muted-foreground">Toggle courses included in this ceremony</span>
                            </div>

                            {isLoadingStudentData ? <Skeleton className="h-20 w-full" /> : allEnrollmentsList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                    {allEnrollmentsList.map(enrollment => {
                                        const parentId = String(enrollment.parent_course_id);
                                        const isChecked = editCourseIds.includes(parentId);
                                        const isBookedElsewhere = bookedElsewhereIds.has(parentId) || bookedElsewhereIds.has(String(enrollment.course_code));
                                        const isOrderedElsewhere = orderedElsewhereIds.has(parentId) || orderedElsewhereIds.has(String(enrollment.course_code));
                                        const isDisabled = isBookedElsewhere || isOrderedElsewhere;

                                        return (
                                            <div 
                                                key={enrollment.id}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 rounded-md border transition-colors",
                                                    isChecked ? "bg-primary/5 border-primary/30" : "bg-background hover:bg-muted/40",
                                                    isDisabled && !isChecked && "opacity-60 bg-muted/40"
                                                )}
                                            >
                                                <Checkbox 
                                                    id={`modal-course-${enrollment.id}`} 
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onCheckedChange={(checked) => {
                                                        setEditCourseIds(prev => 
                                                            checked ? [...prev, parentId] : prev.filter(id => id !== parentId)
                                                        );
                                                    }}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <Label htmlFor={`modal-course-${enrollment.id}`} className="text-xs font-bold leading-tight block cursor-pointer">
                                                        {enrollment.parent_course_name}
                                                    </Label>
                                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-semibold text-foreground">Batch:</span>
                                                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-muted/60">{enrollment.course_code}</Badge>
                                                        {enrollment.batch_name && <span className="truncate max-w-[200px]">({enrollment.batch_name})</span>}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {isChecked && <Badge variant="default" className="text-[9px] h-4 px-1 bg-green-100 text-green-700 border-green-200">Included</Badge>}
                                                        {isBookedElsewhere && <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-purple-100 text-purple-800">Booked Elsewhere</Badge>}
                                                        {isOrderedElsewhere && <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-amber-100 text-amber-800 border-amber-200">Already Ordered</Badge>}
                                                        {!enrollment.certificate_eligibility && <Badge variant="destructive" className="text-[9px] h-4 px-1">Not Eligible</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No student enrollments found.</p>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 bg-muted/20 border-t shrink-0 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setIsCoursesDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Course Assignments
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 2: UPDATE PAYMENT DIALOG                                            */}
        {/* ========================================================================= */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary" />
                        Update Payment Details
                    </DialogTitle>
                    <DialogDescription>Manually verify and record a verified payment amount for this booking.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Total Required Amount:</span>
                            <div className="font-bold font-mono">
                                LKR {viewTotalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-green-600 border-t pt-2 border-dashed">
                            <div className="flex items-center gap-2">
                                <ListOrdered className="h-3.5 w-3.5" />
                                <span>Already Verified:</span>
                            </div>
                            <div className="font-bold font-mono">
                                LKR {totalPaidFromRecords.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm font-bold border-t pt-2 mt-2">
                            <span className="text-muted-foreground">Remaining to Verify:</span>
                            <div className="font-mono text-primary">
                                LKR {remainingToVerify.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-lg flex justify-between items-center text-sm border border-primary/20">
                        <div className="flex items-center gap-2 font-semibold">
                            <Calculator className="h-4 w-4" />
                            <span>Due Balance (Final):</span>
                        </div>
                        <div className={cn(
                            "font-bold font-mono text-lg",
                            balanceAfterCurrentCheck > 0 ? "text-destructive" : "text-green-600"
                        )}>
                            LKR {balanceAfterCurrentCheck.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label className="text-xs font-semibold">Verified Amount in CURRENT Slip (LKR)</Label>
                        <input 
                            type="number" 
                            value={paymentAmount} 
                            onChange={e => handleVerifiedAmountChange(e.target.value)} 
                            placeholder="Type verified amount..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">New Payment Status</Label>
                        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                                <SelectItem value="Partially Paid" className="text-xs">Partially Paid</SelectItem>
                                <SelectItem value="Paid" className="text-xs">Paid</SelectItem>
                                <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handlePaymentUpdate} disabled={updatePaymentMutation.isPending} className="bg-primary hover:bg-primary/90">
                        {updatePaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Financials
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 3: CONFIRM ATTENDANCE & CEREMONY # DIALOG                           */}
        {/* ========================================================================= */}
        <Dialog open={isConfirmAttendanceDialogOpen} onOpenChange={setIsConfirmAttendanceDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" />
                        Confirm Convocation Attendance
                    </DialogTitle>
                    <DialogDescription>
                        Assign a ceremony number to this student. This will automatically update their registration status to <strong>Confirmed</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label className="text-xs font-semibold">Ceremony Number</Label>
                    <input 
                        placeholder="Enter ceremony number (e.g., 402)" 
                        value={ceremonyNumber} 
                        onChange={e => setCeremonyNumber(e.target.value)} 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsConfirmAttendanceDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAttendanceConfirmation} disabled={updateCeremonyMutation.isPending} className="bg-primary hover:bg-primary/90">
                        {updateCeremonyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Attendance
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 4: DELETE BOOKING ALERT DIALOG                                      */}
        {/* ========================================================================= */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Convocation Booking?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 text-sm text-muted-foreground pt-2">
                            <div>
                                Are you sure you want to delete the booking for{' '}
                                <strong className="text-foreground">
                                    {studentInfo?.studentInfo?.full_name || registration.name_on_certificate || registration.student_number}
                                </strong>
                                {registration.reference_number && (
                                    <> (Ref: <span className="font-mono font-bold text-foreground">#{registration.reference_number}</span>)</>
                                )}?
                            </div>
                            <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 space-y-1">
                                <p className="font-bold">Warning: This action is permanent and cannot be undone.</p>
                                <p>This will permanently delete this booking registration from the database and remove the student's assigned ceremony pass.</p>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteRegistrationMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            deleteRegistrationMutation.mutate();
                        }}
                        disabled={deleteRegistrationMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteRegistrationMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Booking
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
};
