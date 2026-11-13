"use client";

import { LMS_API_URL } from "@/lib/config";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
    getConvocationRegistrationsByStudent, 
    getPackagesByCeremony, 
    submitSecondPayment, 
    getConvocationStudentCeremonyNumber,
    getConvocationSlipDownloadUrl,
    downloadConvocationSlipPdf,
    getConvocationCeremonies
} from '@/lib/actions/certificates';
import { getStudentKycStatus } from '@/lib/actions/kyc';
import { getParentCourses } from '@/lib/actions/courses';
import { getStudentFullInfo } from '@/lib/actions/users';
import { getPaymentRequestsByReference } from '@/lib/api';
import type { ConvocationRegistration, ParentCourse, ConvocationPackage, PaymentRequest, ConvocationCeremony, StudentEnrollment, FullStudentData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ListOrdered, PlusCircle, ArrowLeft, ArrowRight, GraduationCap, Banknote, Calendar, Users, Wallet, Upload, CheckCircle, Award, Sparkles, ScrollText, FileText, Video, Coffee, Loader2, ExternalLink, Paperclip, Hourglass, ShieldAlert, QrCode, ChevronDown } from 'lucide-react';

import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';

const CONTENT_PROVIDER_URL = 'https://content-provider.pharmacollege.lk';
const PARENT_SEAT_RATE = 750;

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'pending': return <Badge variant="secondary">Pending</Badge>;
        case 'paid':
        case 'confirmed': 
            return <Badge variant="default" className="bg-green-600">Confirmed</Badge>;
        case 'rejected':
        case 'canceled':
            return <Badge variant="destructive">Rejected</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

const ViewSlipDialog = ({ slipPath, title, trigger }: { slipPath: string | null; title: string; trigger: React.ReactNode }) => {
    if (!slipPath) return null;

    const fullSlipUrl = slipPath.startsWith('http') ? slipPath : `${CONTENT_PROVIDER_URL}${slipPath}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(slipPath);

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 max-h-[70vh] overflow-auto border rounded-lg p-2 bg-muted flex items-center justify-center">
                    {isImage ? (
                        <div className="relative w-full aspect-[3/4]">
                            <Image src={fullSlipUrl} alt={title} layout="fill" objectFit="contain" data-ai-hint="payment slip" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-background w-full rounded-md">
                            <FileText className="w-16 h-16 text-muted-foreground mb-4"/>
                            <p className="mb-4 text-sm text-muted-foreground">This file is not an image (e.g. PDF). Open it in a new tab to view.</p>
                            <a href={fullSlipUrl} target="_blank" rel="noopener noreferrer">
                                <Button>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Document
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ConvocationPass = ({ 
    booking, 
    courseNameMap, 
    allPackages,
    ceremonies,
    enrollments,
    parentCourses
}: { 
    booking: ConvocationRegistration; 
    courseNameMap: Map<string, string>; 
    allPackages: ConvocationPackage[];
    ceremonies?: ConvocationCeremony[];
    enrollments: StudentEnrollment[];
    parentCourses: ParentCourse[];
}) => {
    const { user } = useAuth();
    const [isDownloadingPass, setIsDownloadingPass] = useState(false);
    const [qrLoadError, setQrLoadError] = useState(false);

    const handleDownloadPass = async () => {
        try {
            setIsDownloadingPass(true);
            await downloadConvocationSlipPdf(
                booking.registration_id, 
                `Convocation_Admission_${booking.reference_number || booking.registration_id}.pdf`
            );
        } catch (e) {
            console.error(e);
        } finally {
            setIsDownloadingPass(false);
        }
    };
    const { data: ceremonyNumber, isLoading } = useQuery({
        queryKey: ['ceremonyNumber', booking.student_number, booking.convocation_id],
        queryFn: () => getConvocationStudentCeremonyNumber(booking.student_number, booking.convocation_id),
        enabled: !!(booking.student_number && booking.convocation_id),
    });

    const effectiveCeremonyNumber = (ceremonyNumber && ceremonyNumber !== '0')
        ? ceremonyNumber
        : (booking.ceremony_number && booking.ceremony_number !== '0' && booking.ceremony_number.toLowerCase() !== 'not assigned')
            ? booking.ceremony_number
            : null;

    // Show the pass (and its PDF) for every active booking. Ceremony numbers are assigned by the
    // admin later, so a missing number shows "Pending assignment" instead of hiding the ticket.
    if (isLoading) {
        return null;
    }
    const isInactiveBooking = ['rejected', 'canceled'].includes((booking.registration_status || '').trim().toLowerCase());
    if (isInactiveBooking) {
        return null;
    }
    // Closed ceremonies (accept_booking off) keep the record only: no ticket and no admission PDF
    const passCeremony = ceremonies?.find(c => String(c.id) === String(booking.convocation_id));
    if (passCeremony && String(passCeremony.accept_booking) !== '1') {
        return null;
    }

    const resolvedCourses = (booking.course_id || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
        .map(trimmedId => {
            const matched = enrollments.find(e => 
                String(e.parent_course_id) === trimmedId || 
                String(e.id) === trimmedId || 
                String(e.course_code).toLowerCase() === trimmedId.toLowerCase()
            );
            const parentCourse = parentCourses.find(c => String(c.id) === trimmedId);
            const courseName = matched?.parent_course_name || parentCourse?.course_name || courseNameMap.get(trimmedId) || `Course ${trimmedId}`;
            const batchCode = matched?.course_code;
            const batchName = matched?.batch_name;
            return { id: trimmedId, courseName, batchCode, batchName };
        });
        
    const pkg = allPackages.find(p => String(p.package_id) === String(booking.package_id));
    const ceremony = ceremonies?.find(c => String(c.id) === String(booking.convocation_id));

    let convocationDateDisplay = '';
    if (ceremony?.held_on) {
        try {
            const d = new Date(ceremony.held_on);
            if (!isNaN(d.getTime())) {
                convocationDateDisplay = format(d, 'MMM d, yyyy');
            }
        } catch {
            convocationDateDisplay = ceremony.held_on;
        }
    }
    if (!convocationDateDisplay && booking.registered_at) {
        try {
            convocationDateDisplay = format(new Date(booking.registered_at), 'MMM d, yyyy');
        } catch {
            convocationDateDisplay = 'TBA';
        }
    }

    return (
        <div className="w-full relative overflow-hidden rounded-2xl shadow-xl border border-primary/20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-6 transition-all hover:shadow-2xl hover:scale-[1.01] duration-300 animate-in fade-in slide-in-from-bottom-4">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row relative z-10 w-full min-h-[220px]">
                {/* Visual Strip */}
                <div className="sm:w-3 bg-yellow-400 h-2 sm:h-auto" />
                
                {/* Main Pass Content */}
                <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4 opacity-90">
                                <Award className="h-6 w-6 text-yellow-300" />
                                <h3 className="font-headline font-bold text-xl tracking-widest uppercase text-yellow-300">Convocation Pass</h3>
                            </div>
                            {booking.medal_name && (
                                <div className="flex flex-wrap gap-1.5 mb-4 animate-in fade-in">
                                    {booking.medal_name.split(',').map((mName, i) => (
                                        <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 font-black text-xs tracking-wider shadow-md border border-yellow-200">
                                            <Award className="w-3.5 h-3.5 fill-current text-yellow-900 shrink-0" />
                                            <span>HONORS: {mName.trim().toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">Student</p>
                                    <p className="text-2xl font-bold leading-none">{booking.name_on_certificate || user?.name || booking.student_number || 'N/A'}</p>
                                    <p className="text-sm font-mono text-primary-foreground/80 mt-1">{booking.student_number}</p>
                                </div>
                                
                                <div>
                                    <p className="text-primary-foreground/70 text-[10px] font-bold uppercase tracking-wider mb-1 mt-4">Programme(s)</p>
                                    <div className="space-y-1.5">
                                        {resolvedCourses.map((c, idx) => (
                                            <div key={idx} className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-[15px] font-bold leading-tight">{c.courseName}</p>
                                                    {c.batchCode && (
                                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-yellow-300 border border-white/20">
                                                            {c.batchCode}
                                                        </span>
                                                    )}
                                                </div>
                                                {c.batchName && (
                                                    <p className="text-xs text-primary-foreground/80 font-medium">
                                                        {c.batchName}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Desktop QR Code -> Top Right */}
                        <div className="shrink-0 bg-white p-2.5 rounded-xl shadow-inner hidden sm:block mt-8 text-center min-w-[104px]">
                            {!qrLoadError ? (
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(booking.reference_number)}`} 
                                    alt="Booking QR Code" 
                                    className="w-24 h-24 object-contain"
                                    onError={() => setQrLoadError(true)}
                                />
                            ) : (
                                <div className="w-24 h-24 flex flex-col items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300">
                                    <QrCode className="w-12 h-12 text-primary" />
                                    <span className="text-[9px] font-mono font-bold text-gray-600 mt-1">#{booking.reference_number}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-primary-foreground/20 flex flex-wrap gap-x-10 gap-y-6 items-center">
                        <div className="pr-4 border-r border-primary-foreground/20">
                            <p className="text-primary-foreground/80 text-xs uppercase font-bold tracking-[0.2em] mb-1">Session</p>
                            <p className="font-black text-4xl text-yellow-300 drop-shadow-sm">{booking.session || 'TBA'}</p>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <p className="text-primary-foreground/70 text-[10px] uppercase font-bold tracking-wider mb-1">Package</p>
                            <p className="font-semibold text-md leading-tight">{pkg?.package_name || 'Standard'}</p>
                        </div>
                        {pkg?.vip_seat && parseInt(pkg.vip_seat, 10) > 0 && (
                            <div>
                                <p className="text-yellow-300 text-[10px] uppercase font-bold tracking-wider mb-1">VIP Seats</p>
                                <p className="font-semibold text-lg text-yellow-300">{pkg.vip_seat}</p>
                            </div>
                        )}
                        {parseInt(booking.additional_seats || '0', 10) > 0 && (
                            <div>
                                <p className="text-primary-foreground/70 text-[10px] uppercase font-bold tracking-wider mb-1">Guest Seats</p>
                                <p className="font-semibold text-lg">{booking.additional_seats}</p>
                            </div>
                        )}
                        {parseInt(booking.refreshment_tokens || '0', 10) > 0 && (
                            <div>
                                <p className="text-primary-foreground/70 text-[10px] uppercase font-bold tracking-wider mb-1">Refreshments</p>
                                <p className="font-semibold text-lg">{booking.refreshment_tokens} Tokens</p>
                            </div>
                        )}
                        <div>
                            <p className="text-primary-foreground/70 text-[10px] uppercase font-bold tracking-wider mb-1">Convocation Date</p>
                            <p className="font-semibold text-md text-yellow-300 drop-shadow-sm">{convocationDateDisplay}</p>
                        </div>

                        {/* Mobile QR Code -> Bottom Center */}
                        <div className="w-full sm:hidden flex justify-center mt-2">
                            <div className="bg-white p-2.5 rounded-xl shadow-inner text-center">
                                {!qrLoadError ? (
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(booking.reference_number)}`} 
                                        alt="Booking QR Code" 
                                        className="w-20 h-20 object-contain"
                                        onError={() => setQrLoadError(true)}
                                    />
                                ) : (
                                    <div className="w-20 h-20 flex flex-col items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300">
                                        <QrCode className="w-10 h-10 text-primary" />
                                        <span className="text-[9px] font-mono font-bold text-gray-600 mt-0.5">#{booking.reference_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                
                {/* Right side Ceremony Number */}
                <div className="sm:w-64 bg-black/20 p-6 sm:p-8 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-primary-foreground/10 relative overflow-hidden backdrop-blur-sm">
                    {/* Tick cutouts for pass look */}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-background rounded-full hidden sm:block" />
                    
                    <p className="text-primary-foreground/80 text-xs uppercase font-bold tracking-[0.2em] mb-3 text-center">Ceremony No.</p>
                    
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-inner w-full flex items-center justify-center min-h-[120px]">
                        {effectiveCeremonyNumber ? (
                            <span className="font-mono text-7xl font-black text-yellow-300 tracking-tighter drop-shadow-md">
                                {effectiveCeremonyNumber}
                            </span>
                        ) : (
                            <span className="text-base font-semibold text-yellow-200/90 text-center">
                                Pending assignment
                            </span>
                        )}
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-primary-foreground/50 uppercase tracking-widest font-mono">Reference Number</p>
                        <p className="text-sm font-mono font-medium text-primary-foreground/70 tracking-widest mt-1">{booking.reference_number}</p>
                        <Button 
                            onClick={handleDownloadPass}
                            disabled={isDownloadingPass}
                            size="sm"
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-bold text-xs gap-1.5 shadow mt-3"
                        >
                            {isDownloadingPass ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                            {isDownloadingPass ? 'Downloading...' : 'Convocation Admission (PDF)'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BookingDetailCard = ({ 
    booking, 
    courseNameMap, 
    allPackages,
    ceremonies,
    enrollments,
    parentCourses
}: { 
    booking: ConvocationRegistration; 
    courseNameMap: Map<string, string>; 
    allPackages: ConvocationPackage[];
    ceremonies: ConvocationCeremony[];
    enrollments: StudentEnrollment[];
    parentCourses: ParentCourse[];
}) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [bank, setBank] = useState('');
    const [branch, setBranch] = useState('');
    const [slip, setSlip] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloadingDetail, setIsDownloadingDetail] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleDownloadDetail = async () => {
        try {
            setIsDownloadingDetail(true);
            await downloadConvocationSlipPdf(
                booking.registration_id, 
                `Convocation_Admission_${booking.reference_number || booking.registration_id}.pdf`
            );
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Download Failed', description: e.message || 'Could not download PDF' });
        } finally {
            setIsDownloadingDetail(false);
        }
    };

    const { data: banks } = useQuery<{ id: string; bank_name: string }[]>({
        queryKey: ['banks'],
        queryFn: async () => {
            const baseUrl = LMS_API_URL;
            const res = await fetch(`${baseUrl}/banks`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    const { data: portalPayments, isLoading: isLoadingSlips } = useQuery<PaymentRequest[]>({
        queryKey: ['paymentRequests', booking.student_number],
        queryFn: () => getPaymentRequestsByReference(booking.student_number),
        enabled: !!booking.student_number,
    });

    const balanceSlips = useMemo(() => {
        if (!portalPayments) return [];
        const reasonKey = `convocation2nd-${booking.convocation_id}`;
        return portalPayments.filter(p => p.payment_reson === reasonKey);
    }, [portalPayments, booking.convocation_id]);

    const hasPendingSlip = useMemo(() => {
        return balanceSlips.some(p => p.payment_status === 'Pending');
    }, [balanceSlips]);

    const resolvedCourses = useMemo(() => {
        return (booking.course_id || '')
            .split(',')
            .map(id => id.trim())
            .filter(Boolean)
            .map(trimmedId => {
                const matched = enrollments.find(e => 
                    String(e.parent_course_id) === trimmedId || 
                    String(e.id) === trimmedId || 
                    String(e.course_code).toLowerCase() === trimmedId.toLowerCase()
                );
                const parentCourse = parentCourses.find(c => String(c.id) === trimmedId);
                const courseName = matched?.parent_course_name || parentCourse?.course_name || courseNameMap.get(trimmedId) || `Course ${trimmedId}`;
                const batchCode = matched?.course_code;
                const batchName = matched?.batch_name;
                return { id: trimmedId, courseName, batchCode, batchName };
            });
    }, [booking.course_id, enrollments, parentCourses, courseNameMap]);

    const pkg = allPackages.find(p => String(p.package_id) === String(booking.package_id));
    
    const ceremony = useMemo(() => {
        return ceremonies?.find(c => String(c.id) === String(booking.convocation_id));
    }, [ceremonies, booking.convocation_id]);

    // Closed ceremonies (accept_booking off) show the record only, no admission slip download
    const isCeremonyOpen = !ceremony || String(ceremony.accept_booking) === '1';

    const convocationDateDetail = useMemo(() => {
        if (!ceremony?.held_on) return null;
        try {
            const d = new Date(ceremony.held_on);
            if (!isNaN(d.getTime())) {
                return format(d, 'PPP');
            }
        } catch {
            // fallback
        }
        return ceremony.held_on;
    }, [ceremony?.held_on]);

    const seatRate = useMemo(() => {
        if (!ceremony?.parent_seat_price) return PARENT_SEAT_RATE;
        const rate = parseFloat(ceremony.parent_seat_price);
        return isNaN(rate) ? PARENT_SEAT_RATE : rate;
    }, [ceremony]);

    const tokenRate = useMemo(() => {
        if (!ceremony?.refreshment_token_price) return 0;
        const rate = parseFloat(ceremony.refreshment_token_price);
        return isNaN(rate) ? 0 : rate;
    }, [ceremony]);

    const numSeats = parseInt(booking.additional_seats, 10) || 0;
    const numTokens = parseInt(booking.refreshment_tokens || '0', 10) || 0;
    const pkgPrice = pkg ? parseFloat(pkg.price) : 0;
    const seatsTotal = numSeats * seatRate;
    const tokensTotal = numTokens * tokenRate;
    const totalPayable = pkgPrice + seatsTotal + tokensTotal;

    const alreadyPaid = parseFloat(booking.payment_amount) || 0;
    const dueBalance = Math.max(0, totalPayable - alreadyPaid);
    const isFullyPaid = dueBalance <= 0 || booking.payment_status === 'paid' || booking.payment_status === 'confirmed';

    const secondPaymentMutation = useMutation({
        mutationFn: submitSecondPayment,
        onSuccess: () => {
            toast({ title: 'Payment Submitted', description: 'Your balance payment slip has been uploaded for verification.' });
            queryClient.invalidateQueries({ queryKey: ['studentConvocationBookings'] });
            queryClient.invalidateQueries({ queryKey: ['paymentRequests', booking.student_number] });
            setBank('');
            setBranch('');
            setSlip(null);
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Upload Failed', description: err.message })
    });

    const handleUpload = () => {
        if (!bank || !slip || !user?.username) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a bank and upload the payment slip.' });
            return;
        }

        const formData = new FormData();
        formData.append("studentNumber", user.username);
        formData.append("paymentReason", `convocation2nd-${booking.convocation_id}`);
        formData.append("number_type", "student_number");
        formData.append("amount", String(dueBalance));
        formData.append("reference", booking.reference_number);
        formData.append("bank", bank);
        formData.append("branch", branch);
        formData.append("slip", slip);

        setIsSubmitting(true);
        secondPaymentMutation.mutate(formData, { onSettled: () => setIsSubmitting(false) });
    };

    return (
        <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader
                className="bg-muted/30 pb-4 cursor-pointer select-none"
                onClick={() => setIsExpanded(v => !v)}
                aria-expanded={isExpanded}
            >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-lg">
                            {ceremony?.convocation_name ? `${ceremony.convocation_name}` : `Booking ID: #${booking.reference_number}`}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="font-mono text-xs font-semibold text-foreground/80">Ref: #{booking.reference_number}</span>
                            {convocationDateDetail && (
                                <span className="flex items-center gap-1.5 font-semibold text-primary">
                                    <Calendar className="h-3.5 w-3.5 text-primary" /> Convocation: {convocationDateDetail}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                Registered: {format(new Date(booking.registered_at), 'PPP')}
                            </span>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {isFullyPaid && isCeremonyOpen && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); handleDownloadDetail(); }}
                                disabled={isDownloadingDetail}
                                className="h-8 gap-1.5 text-xs border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
                            >
                                {isDownloadingDetail ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" /> : <FileText className="h-3.5 w-3.5 text-blue-500" />}
                                {isDownloadingDetail ? 'Downloading...' : 'Admission Slip'}
                            </Button>
                        )}
                        {getStatusBadge(booking.registration_status)}
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Enrolled Course(s) &amp; Batch</Label>
                                <div className="space-y-2 mt-1">
                                    {resolvedCourses.map((c, idx) => (
                                        <div key={idx} className="flex flex-col gap-0.5 p-2 rounded-lg bg-muted/40 border border-muted-foreground/10">
                                            <div className="flex items-center gap-2 flex-wrap text-sm font-semibold text-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                <span>{c.courseName}</span>
                                                {c.batchCode && (
                                                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                                                        {c.batchCode}
                                                    </Badge>
                                                )}
                                            </div>
                                            {c.batchName && (
                                                <p className="text-xs text-muted-foreground pl-3.5 font-normal">
                                                    {c.batchName}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Session</Label>
                                    <p className="text-sm font-semibold">Session {booking.session}</p>
                                </div>
                                {Number(pkg?.vip_seat ?? 0) > 0 && (
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">VIP Seats</Label>
                                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{pkg?.vip_seat}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Guest Seats</Label>
                                    <p className="text-sm font-semibold">{booking.additional_seats}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Refreshments</Label>
                                    <p className="text-sm font-semibold">{booking.refreshment_tokens || '0'} Tokens</p>
                                </div>
                                {booking.medal_name && (
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Medal Awards</Label>
                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                            {booking.medal_name.split(',').map((mName, i) => (
                                                <Badge key={i} variant="outline" className="text-xs font-bold text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800 flex items-center gap-1">
                                                    <Award className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                                    <span>{mName.trim()}</span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {pkg && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Package Inclusions: {pkg.package_name}</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {pkg.graduation_cloth === '1' && <Badge variant="outline" className="gap-1.5"><Award className="h-3 w-3 text-primary" /> Cloak</Badge>}
                                        {pkg.garland === '1' && <Badge variant="outline" className="gap-1.5"><Sparkles className="h-3 w-3 text-primary" /> Garland</Badge>}
                                        {pkg.scroll === '1' && <Badge variant="outline" className="gap-1.5"><ScrollText className="h-3 w-3 text-primary" /> Scroll</Badge>}
                                        {pkg.photo_package === '1' && <Badge variant="outline" className="gap-1.5"><GraduationCap className="h-3 w-3 text-primary" /> Hat</Badge>}
                                        {pkg.refreshments === '1' && <Badge variant="outline" className="gap-1.5"><Coffee className="h-3 w-3 text-primary" /> Food</Badge>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Slips Section */}
                        <div className="space-y-3 pt-4 border-t">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                                <Paperclip className="h-3 w-3" /> Submitted Payment Documents
                            </Label>
                            <div className="grid grid-cols-1 gap-2">
                                {/* Initial Slip */}
                                {booking.image_path && (
                                    <ViewSlipDialog 
                                        title="Initial Payment Slip"
                                        slipPath={booking.image_path}
                                        trigger={
                                            <Button variant="outline" size="sm" className="justify-start h-auto py-2.5 px-3">
                                                <FileText className="h-4 w-4 mr-3 text-primary" />
                                                <div className="text-left">
                                                    <p className="text-xs font-semibold">Initial Booking Slip</p>
                                                    <p className="text-[10px] text-muted-foreground">Uploaded on registration</p>
                                                </div>
                                            </Button>
                                        }
                                    />
                                )}

                                {/* Balance Slips */}
                                {isLoadingSlips ? (
                                    <Skeleton className="h-10 w-full" />
                                ) : balanceSlips.map((p, idx) => (
                                    <ViewSlipDialog 
                                        key={p.id}
                                        title={`Balance Payment Slip #${idx + 1}`}
                                        slipPath={p.slip_path}
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
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-muted-foreground/10">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Banknote className="h-4 w-4" /> Financial Summary</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Package Fee ({pkg?.package_name || 'Ceremony Package'}):</span>
                                <span className="font-mono text-foreground">LKR {pkgPrice.toLocaleString()}</span>
                            </div>
                            {numSeats > 0 && (
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Guest Seats ({numSeats} &times; LKR {seatRate.toLocaleString()}):</span>
                                    <span className="font-mono text-foreground">LKR {seatsTotal.toLocaleString()}</span>
                                </div>
                            )}
                            {numTokens > 0 && (
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Refreshments ({numTokens} &times; LKR {tokenRate.toLocaleString()}):</span>
                                    <span className="font-mono text-foreground">LKR {tokensTotal.toLocaleString()}</span>
                                </div>
                            )}
                            <Separator className="my-1" />
                            <div className="flex justify-between font-semibold">
                                <span className="text-muted-foreground">Total Required:</span>
                                <span className="font-mono">LKR {totalPayable.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600 font-medium">
                                <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Already Paid:</span>
                                <span className="font-mono">- LKR {alreadyPaid.toLocaleString()}</span>
                            </div>
                            <Separator className="my-1" />
                            <div className="flex justify-between text-base font-bold">
                                <span>Due Balance:</span>
                                <span className={cn(dueBalance > 0 ? "text-destructive" : "text-green-600")}>
                                    LKR {dueBalance.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {dueBalance <= 0 && (
                            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-center mt-2">
                                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-bold text-xs uppercase tracking-wide">
                                    <CheckCircle className="w-4 h-4" />
                                    Payment Settled in Full
                                </div>
                                <p className="text-[11px] text-green-800/80 dark:text-green-300/80 mt-1">
                                    Your convocation registration fee is fully settled.
                                </p>
                            </div>
                        )}

                        {dueBalance > 0 && (
                            <div className="pt-4 border-t border-dashed mt-4 space-y-4">
                                <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Upload className="h-3.5 w-3.5" /> Balance Payment
                                </h5>
                                
                                {hasPendingSlip ? (
                                    <Alert variant="default" className="bg-orange-50 border-orange-200 text-orange-800">
                                        <Hourglass className="h-4 w-4 !text-orange-800" />
                                        <AlertTitle className="text-xs font-bold">Payment Under Review</AlertTitle>
                                        <AlertDescription className="text-[10px] leading-tight">
                                            You have already submitted a balance payment slip. Please wait for the administration to verify it before submitting another.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 animate-in fade-in-50">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Paid Bank</Label>
                                            <Select value={bank} onValueChange={setBank}>
                                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select bank..." /></SelectTrigger>
                                                <SelectContent>
                                                    {banks?.map(b => <SelectItem key={b.id} value={b.id} className="text-xs">{b.bank_name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Branch (Optional)</Label>
                                            <Input value={branch} onChange={e => setBranch(e.target.value)} className="h-8 text-xs" placeholder="Branch name..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Payment Slip</Label>
                                            <Input type="file" onChange={e => setSlip(e.target.files ? e.target.files[0] : null)} className="h-8 text-xs pt-1 file:h-6 file:text-[10px]" />
                                        </div>
                                        <Button onClick={handleUpload} size="sm" disabled={isSubmitting} className="w-full mt-2">
                                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                            Submit Payment
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isFullyPaid && isCeremonyOpen && (
                            <div className="pt-4 border-t border-dashed mt-4 space-y-2">
                                <Button 
                                    onClick={handleDownloadDetail}
                                    disabled={isDownloadingDetail}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-sm h-10"
                                >
                                    {isDownloadingDetail ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                    {isDownloadingDetail ? 'Generating & Downloading...' : 'Download Convocation Admission Slip (PDF)'}
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground leading-tight">
                                    * This document confirms your registered details and full settlement. Official physical entry passes will be issued upon desk verification.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            )}
        </Card>
    );
};

export default function ConvocationBookingHistoryPage() {
    const { user } = useAuth();
    const router = useRouter();

    const { data: previousBookings, isLoading: isLoadingBookings, isError, error } = useQuery<ConvocationRegistration[]>({
        queryKey: ['studentConvocationBookings', user?.username],
        queryFn: () => getConvocationRegistrationsByStudent(user!.username!),
        enabled: !!user?.username,
    });

    const { data: allCourses, isLoading: isLoadingCourses } = useQuery<ParentCourse[]>({
        queryKey: ['parentCoursesForBookingHistory'],
        queryFn: getParentCourses,
        staleTime: Infinity,
    });

    const { data: allPackages, isLoading: isLoadingPackages } = useQuery<ConvocationPackage[]>({
        queryKey: ['allConvocationPackages'],
        queryFn: () => getPackagesByCeremony(''),
        staleTime: 1000 * 60 * 10,
    });

    const { data: ceremonies, isLoading: isLoadingCeremonies } = useQuery<ConvocationCeremony[]>({
        queryKey: ['convocationCeremonies'],
        queryFn: getConvocationCeremonies,
        staleTime: 1000 * 60 * 15,
    });

    const { data: studentFullData, isLoading: isLoadingStudentData } = useQuery<FullStudentData>({
        queryKey: ['studentFullDetails', user?.username],
        queryFn: () => getStudentFullInfo(user!.username!),
        enabled: !!user?.username,
        staleTime: 1000 * 60 * 10,
    });

    const enrollments = useMemo<StudentEnrollment[]>(() => {
        if (!studentFullData?.studentEnrollments) return [];
        return Object.values(studentFullData.studentEnrollments);
    }, [studentFullData]);

    const { data: kycDetails } = useQuery({
        queryKey: ['studentKycStatus', user?.username],
        queryFn: () => getStudentKycStatus(user?.username || ''),
        enabled: !!user?.username,
    });
    const userVer = (user?.verification_status || '').toLowerCase();
    const docStatus = (kycDetails?.status || '').toLowerCase();
    const kycUserVer = (kycDetails?.user_verification_status || '').toLowerCase();
    const isKycVerified = 
      userVer === 'verified' || 
      userVer === 'approved' || 
      docStatus === 'approved' || 
      docStatus === 'verified' ||
      kycUserVer === 'verified' ||
      kycUserVer === 'approved';

    const courseNameMap = useMemo(() => {
        if (!allCourses) return new Map<string, string>();
        const map = new Map<string, string>();
        allCourses.forEach(course => {
            map.set(String(course.id), course.course_name);
        });
        return map;
    }, [allCourses]);

    const isLoading = isLoadingBookings || isLoadingCourses || isLoadingPackages || isLoadingCeremonies;
    
    return (
        <div className="p-4 md:p-8 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                     <Button onClick={() => router.back()} className="mb-4 h-auto p-2 bg-card text-card-foreground shadow-md hover:bg-muted">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-3xl font-headline font-semibold">Convocation Bookings</h1>
                    <p className="text-muted-foreground">View your detailed booking history and manage balance payments.</p>
                </div>
                <Button asChild className="mt-2" variant={isKycVerified ? "default" : "secondary"}>
                    <Link href={isKycVerified ? "/dashboard/convocation-booking/create" : "/dashboard/kyc"}>
                        {isKycVerified ? (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create New Booking
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="mr-2 h-4 w-4 text-amber-600" />
                                Complete KYC to Book
                            </>
                        )}
                    </Link>
                </Button>
            </header>

            {!isKycVerified && (
                <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 via-amber-50/90 to-amber-100/60 dark:from-amber-950/40 dark:via-amber-950/30 dark:to-amber-900/20 p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="p-3 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-100 tracking-tight">
                                    Convocation Booking Locked: KYC Verification Required
                                </h3>
                                <p className="text-sm sm:text-base text-amber-900/80 dark:text-amber-200/80 mt-1">
                                    Identity verification (KYC) must be approved by the administration before you can register for a convocation ceremony.
                                </p>
                            </div>
                        </div>
                        <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 h-12 px-6 text-sm shadow-md">
                            <Link href="/dashboard/kyc" className="flex items-center gap-2">
                                Complete KYC Now <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-[220px] w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                )}
                {isError && (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Bookings</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                )}
                {!isLoading && !isError && previousBookings && previousBookings.length > 0 && (
                    <div className="space-y-8">
                        <div className="space-y-6">
                            {previousBookings.map(booking => (
                                <ConvocationPass 
                                    key={`pass-${booking.registration_id}`} 
                                    booking={booking} 
                                    courseNameMap={courseNameMap} 
                                    allPackages={allPackages || []} 
                                    ceremonies={ceremonies || []}
                                    enrollments={enrollments}
                                    parentCourses={allCourses || []}
                                />
                            ))}
                        </div>
                        <div className="space-y-6">
                            {previousBookings.map(booking => (
                                <BookingDetailCard 
                                    key={`detail-${booking.registration_id}`} 
                                    booking={booking} 
                                    courseNameMap={courseNameMap} 
                                    allPackages={allPackages || []} 
                                    ceremonies={ceremonies || []}
                                    enrollments={enrollments}
                                    parentCourses={allCourses || []}
                                />
                            ))}
                        </div>
                    </div>
                )}
                 {!isLoading && !isError && (!previousBookings || previousBookings.length === 0) && (
                    !isKycVerified ? (
                        <div className="text-center py-16 px-6 border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-2xl bg-amber-50/30 dark:bg-amber-950/15 flex flex-col items-center max-w-3xl mx-auto shadow-xs my-4">
                            <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center mb-5 text-amber-600 dark:text-amber-400">
                                <ShieldAlert className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                                Convocation Booking is Locked
                            </h2>
                            <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-xl leading-relaxed">
                                You must complete your <strong className="font-bold text-foreground">Student Identity Verification (KYC)</strong> and receive administration approval before you can register for a convocation ceremony.
                            </p>

                            <div className="mt-5 mb-8">
                                <Badge variant="outline" className="text-sm px-4 py-1.5 font-bold bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200">
                                    {kycDetails?.status === 'pending' ? 'Verification Under Review' : kycDetails?.status === 'rejected' ? 'Verification Rejected - Action Required' : 'Verification Documents Not Submitted'}
                                </Badge>
                            </div>

                            <Button asChild size="lg" className="h-13 px-8 font-bold text-base sm:text-lg bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
                                <Link href="/dashboard/kyc" className="flex items-center gap-2.5">
                                    {kycDetails?.status === 'pending' ? 'View Submitted Documents' : 'Complete KYC Verification Now'}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground flex flex-col items-center border rounded-xl bg-muted/10">
                            <GraduationCap className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="font-semibold text-lg">You haven't made any convocation bookings yet.</h3>
                            <p className="text-sm mt-1">When you book for a ceremony, it will appear here.</p>
                        </div>
                    )
                 )}
            </div>
        </div>
    );
}
