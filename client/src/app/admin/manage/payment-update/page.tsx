"use client";

import { LMS_API_URL } from "@/lib/config";
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Mail, Phone, User as UserIcon, CreditCard, Clock, CheckCircle2, History, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// --- Types for this page ---
interface StudentInfo {
    id: string;
    student_id: string;
    full_name: string;
    e_mail: string;
    telephone_1: string;
    nic: string;
}

interface ApiPaymentRecord {
    id: string;
    receipt_number: string;
    course_code: string;
    paid_amount: string;
    payment_status: string;
    payment_type: string;
    paid_date: string;
    discount_amount?: string;
}

interface StudentEnrollment {
    id: string;
    course_code: string;
    batch_name: string;
    parent_course_name: string;
    course_fee: string;
    registration_fee: string;
    course_duration: string;
    studentBalanceDetails: {
        totalPaymentAmount: number;
        TotalStudentPaymentRecords: number;
        studentBalance: number;
        TotalRegistrationFee: number;
        paymentRecords: Record<string, ApiPaymentRecord> | ApiPaymentRecord[];
    };
}

interface PendingPaymentRequest {
    id: string;
    unique_number: string;
    number_type: string;
    payment_reson: string;
    paid_amount: string;
    payment_reference: string;
    bank: string;
    branch: string;
    slip_path: string;
    paid_date: string;
    created_at: string;
    is_active: string;
    hash_value: string;
    payment_status: string;
}

interface FullStudentData {
    studentInfo: StudentInfo;
    studentEnrollments: StudentEnrollment[];
    pendingPaymentRequests: PendingPaymentRequest[];
}

// --- Constants ---
const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

export default function PaymentUpdatePage() {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialStudentId = searchParams?.get('student_id') || '';
    
    const [studentId, setStudentId] = useState(initialStudentId);
    const [studentData, setStudentData] = useState<FullStudentData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>(0);

    // Form state for new payment
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [paymentType, setPaymentType] = useState('Bank Transfer');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [customPayingAmount, setCustomPayingAmount] = useState<string>('');
    const [selectedPaymentRequestId, setSelectedPaymentRequestId] = useState<string>('');

    useEffect(() => {
        if (initialStudentId) {
            handleSearch(undefined, initialStudentId);
        }
    }, []);

    const handleSearch = async (e?: React.FormEvent, searchId?: string) => {
        if (e) e.preventDefault();
        const idToSearch = searchId || studentId;
        if (!idToSearch.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a student ID.' });
            return;
        }

        setIsLoading(true);
        setError(null);
        setStudentData(null);
        setSelectedCourseIndex(0);

        try {
            const baseUrl = LMS_API_URL;
            const response = await fetch(`${baseUrl}/get-student-full-info?loggedUser=${idToSearch.trim().toUpperCase()}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Student not found or server error. Status: ${response.status}` }));
                throw new Error(errorData.message || 'Student not found or API response is invalid.');
            }
            const data = await response.json();
            if (data && data.studentInfo && data.studentEnrollments) {
                const enrollments = Array.isArray(data.studentEnrollments) 
                    ? data.studentEnrollments 
                    : Object.values(data.studentEnrollments);
                
                setStudentData({
                    studentInfo: data.studentInfo,
                    studentEnrollments: enrollments as StudentEnrollment[],
                    pendingPaymentRequests: Array.isArray(data.pendingPaymentRequests) ? data.pendingPaymentRequests : []
                });
            } else {
                 throw new Error('Student data is incomplete or invalid in the API response.');
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            toast({ variant: 'destructive', title: 'Search Failed', description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedCourse = studentData?.studentEnrollments[selectedCourseIndex];
    const dueAmount = selectedCourse ? selectedCourse.studentBalanceDetails.studentBalance : 0;
    
    const discountAmount = useMemo(() => {
        if (!discountPercentage) return 0;
        return (dueAmount * (discountPercentage / 100));
    }, [dueAmount, discountPercentage]);

    const finalPayAmount = useMemo(() => {
        if (customPayingAmount !== '') {
            return parseFloat(customPayingAmount) || 0;
        }
        return dueAmount - discountAmount;
    }, [dueAmount, discountAmount, customPayingAmount]);

    const handleAddPayment = async () => {
        if (!selectedCourse) return;
        
        if (finalPayAmount <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Final Pay Amount must be greater than 0.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                student_id: studentData!.studentInfo.student_id,
                course_code: selectedCourse.course_code,
                paid_amount: finalPayAmount,
                discount_amount: discountAmount,
                receipt_number: receiptNumber || `REC-${Date.now()}`,
                payment_type: paymentType,
                paid_date: new Date().toISOString().split('T')[0],
                created_by: 'Admin',
                reason: 'Course Fee',
                payment_status: 'Approved',
                payment_request_id: selectedPaymentRequestId || null
            };

            const response = await fetch(`${LMS_API_URL}/student-payment-with-status-update/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to record payment' }));
                throw new Error(errorData.error || errorData.message || 'Failed to record payment');
            }

            toast({
                title: "Payment Successful",
                description: `Payment of LKR ${finalPayAmount.toLocaleString()} has been recorded.`,
            });

            handleSearch(undefined, studentData!.studentInfo.student_id);
            setDiscountPercentage(0);
            setReceiptNumber('');
            setCustomPayingAmount('');
            setSelectedPaymentRequestId('');
            
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePayment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) return;

        try {
            const res = await fetch(`${LMS_API_URL}/student-payments-new/${id}/`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete payment');

            toast({
                title: "Payment Deleted",
                description: "The payment record has been deleted successfully.",
            });

            // Refresh student data
            handleSearch(undefined, studentData!.studentInfo.student_id);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        }
    };

    return (
        <div className="p-4 md:p-8 w-full max-w-full space-y-8 animate-in fade-in duration-500 bg-background text-foreground min-h-screen">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur-xl p-6 rounded-2xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Payment Gateway</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage student course fees and transactions professionally.</p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Student ID (e.g. PA34001)"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="pl-9 h-11 bg-background border-input shadow-sm transition-all focus:ring-2 focus:ring-blue-500 rounded-xl"
                            autoFocus
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search
                    </Button>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-3">
                    <div className="bg-destructive/20 p-2 rounded-full"><Search className="h-4 w-4" /></div>
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {studentData && selectedCourse && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Profile & Payment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Student Profile Card */}
                        <Card className="border shadow-sm bg-card overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                    <Avatar className="w-20 h-20 border-4 border-background shadow-md">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.studentInfo.full_name)}&background=random`} />
                                        <AvatarFallback><UserIcon className="h-8 w-8 text-muted-foreground"/></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-center sm:text-left space-y-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-bold text-foreground">{studentData.studentInfo.full_name}</h2>
                                            <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400">{studentData.studentInfo.student_id}</Badge>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground pt-2">
                                            <span className="flex items-center justify-center sm:justify-start gap-1.5"><Mail className="h-4 w-4" /> {studentData.studentInfo.e_mail}</span>
                                            <span className="flex items-center justify-center sm:justify-start gap-1.5"><Phone className="h-4 w-4" /> {studentData.studentInfo.telephone_1}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Selector (If multiple) */}
                        {studentData.studentEnrollments.length > 1 && (
                            <Card className="border shadow-sm bg-card">
                                <CardContent className="p-6 border-l-4 border-indigo-500 rounded-xl">
                                    <label className="text-sm font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Select Enrolled Course</label>
                                        <Select 
                                        value={selectedCourseIndex.toString()} 
                                        onValueChange={(val) => {
                                            setSelectedCourseIndex(parseInt(val));
                                            setDiscountPercentage(0);
                                            setCustomPayingAmount('');
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-12 text-md font-medium bg-background border-input">
                                            <SelectValue placeholder="Select a course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {studentData.studentEnrollments.map((course, idx) => (
                                                <SelectItem key={idx} value={idx.toString()} className="font-medium">
                                                    {course.batch_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Processing Form */}
                        {dueAmount > 0 ? (
                            <Card className="border shadow-xl bg-card rounded-2xl overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                <CardHeader className="pb-4 pt-8 px-8">
                                    <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
                                        <CreditCard className="h-6 w-6 text-blue-500" />
                                        Process Payment
                                    </CardTitle>
                                    <CardDescription className="text-base">Enter payment details to settle the outstanding balance.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Payment Type</label>
                                            <Select value={paymentType} onValueChange={setPaymentType}>
                                                <SelectTrigger className="h-11 bg-muted/50 border-input">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="Card">Card</SelectItem>
                                                    <SelectItem value="Online">Online Checkout</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Receipt / Reference No.</label>
                                            <Input 
                                                value={receiptNumber} 
                                                onChange={(e) => setReceiptNumber(e.target.value)} 
                                                placeholder="e.g. REC-98765432"
                                                className="h-11 bg-muted/50 border-input"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 pt-4">
                                            <Separator />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Discount Applied (%)</label>
                                            <div className="relative">
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    max="100" 
                                                    value={discountPercentage || ''} 
                                                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                                                    className="h-12 pl-4 pr-10 text-lg bg-muted/50 border-input" 
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Discount Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">LKR</span>
                                                <Input 
                                                    readOnly 
                                                    value={discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} 
                                                    className="h-12 pl-14 text-lg bg-muted text-muted-foreground font-medium border-transparent" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Paying Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">LKR</span>
                                                <Input 
                                                    type="number"
                                                    value={customPayingAmount !== '' ? customPayingAmount : (dueAmount - discountAmount)}
                                                    onChange={(e) => setCustomPayingAmount(e.target.value)}
                                                    placeholder={(dueAmount - discountAmount).toString()}
                                                    className="h-12 pl-14 text-lg bg-background border-input font-bold" 
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 bg-indigo-500/10 p-6 rounded-xl border border-indigo-500/20 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Final Payment Amount</p>
                                                <h3 className="text-4xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
                                                    LKR {finalPayAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </h3>
                                            </div>
                                            <Button 
                                                size="lg" 
                                                onClick={handleAddPayment} 
                                                disabled={isSubmitting || finalPayAmount <= 0}
                                                className="w-full sm:w-auto px-10 h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all rounded-xl"
                                            >
                                                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                                Confirm Payment
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border shadow-sm bg-green-500/10 border-green-500/20">
                                <CardContent className="p-10 text-center flex flex-col items-center justify-center space-y-4">
                                    <div className="h-20 w-20 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">Course Fully Paid</h3>
                                    <p className="text-green-600 dark:text-green-500 max-w-md mx-auto">There are no outstanding balances for this course. The student has successfully settled all fees.</p>
                                </CardContent>
                            </Card>
                        )}

                    </div>

                    {/* Right Column: Financial Overview & History */}
                    <div className="space-y-6">
                        
                        {/* Financial Overview Card */}
                        <Card className="border shadow-md bg-card overflow-hidden">
                            <div className="bg-muted/50 p-6 border-b border-border">
                                <h3 className="font-bold text-foreground mb-1 leading-tight">{selectedCourse.batch_name}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 font-medium">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{selectedCourse.course_duration || 'Duration Not Specified'}</span>
                                </div>
                            </div>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    <div className="p-5 flex justify-between items-center">
                                        <span className="text-muted-foreground font-medium">Course Fee</span>
                                        <span className="font-bold text-foreground">LKR {parseFloat(selectedCourse.course_fee || '0').toLocaleString()}</span>
                                    </div>
                                    <div className="p-5 flex justify-between items-center">
                                        <span className="text-muted-foreground font-medium">Reg. Fee</span>
                                        <span className="font-bold text-foreground">LKR {parseFloat(selectedCourse.registration_fee || '0').toLocaleString()}</span>
                                    </div>
                                    <div className="p-5 flex justify-between items-center bg-muted/20">
                                        <span className="text-muted-foreground font-medium">Total Paid</span>
                                        <span className="font-bold text-green-600 dark:text-green-500">LKR {selectedCourse.studentBalanceDetails.TotalStudentPaymentRecords.toLocaleString()}</span>
                                    </div>
                                    <div className="p-6 bg-card flex flex-col items-center justify-center border-t-2 border-border">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Outstanding</span>
                                        <span className={`text-3xl font-black tracking-tight ${dueAmount > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                                            LKR {dueAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Uploaded Slips */}
                        {studentData.pendingPaymentRequests && studentData.pendingPaymentRequests.length > 0 && (
                            <Card className="border shadow-md bg-card overflow-hidden border-indigo-500/20">
                                <CardHeader className="p-5 border-b border-border pb-4 bg-indigo-500/5">
                                    <CardTitle className="text-base flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                        <CreditCard className="h-4 w-4" />
                                        Pending Uploaded Slips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                                        {studentData.pendingPaymentRequests.map((req, idx) => (
                                            <div key={idx} className={`p-4 flex flex-col gap-3 transition-colors ${selectedPaymentRequestId === req.id ? 'bg-indigo-500/10' : 'hover:bg-muted/30'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">LKR {parseFloat(req.paid_amount || '0').toLocaleString()}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Ref: {req.payment_reference || 'N/A'}</p>
                                                        <p className="text-xs text-muted-foreground">{req.bank} - {req.branch}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{req.paid_date}</p>
                                                    </div>
                                                    {req.slip_path && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <button className="text-xs text-blue-600 hover:underline bg-blue-500/10 px-2 py-1 rounded">
                                                                    View Slip
                                                                </button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-3xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Payment Slip Preview</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="flex justify-center items-center p-4">
                                                                    {req.slip_path.toLowerCase().endsWith('.pdf') ? (
                                                                        <iframe 
                                                                            src={`${CONTENT_PROVIDER_URL}${req.slip_path}`} 
                                                                            className="w-full h-[70vh] rounded-md border shadow-sm"
                                                                            title="Payment Slip PDF"
                                                                        />
                                                                    ) : (
                                                                        <img 
                                                                            src={`${CONTENT_PROVIDER_URL}${req.slip_path}`} 
                                                                            alt="Payment Slip" 
                                                                            className="max-h-[70vh] object-contain rounded-md border shadow-sm"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant={selectedPaymentRequestId === req.id ? "default" : "outline"}
                                                    className={selectedPaymentRequestId === req.id ? "bg-indigo-600 hover:bg-indigo-700 w-full" : "w-full"}
                                                    onClick={() => {
                                                        setSelectedPaymentRequestId(req.id);
                                                        setReceiptNumber(req.payment_reference || '');
                                                        setCustomPayingAmount(req.paid_amount || '');
                                                        setPaymentType('Bank Transfer');
                                                    }}
                                                >
                                                    {selectedPaymentRequestId === req.id ? 'Selected for Processing' : 'Process this slip'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent History Mini-Table */}
                        <Card className="border shadow-md bg-card">
                            <CardHeader className="p-5 border-b border-border pb-4">
                                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                                    <History className="h-4 w-4 text-muted-foreground" />
                                    Recent Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {Object.values(selectedCourse.studentBalanceDetails.paymentRecords || {}).length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        No payment history for this course.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                                        {Object.values(selectedCourse.studentBalanceDetails.paymentRecords)
                                            .sort((a: any, b: any) => new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime())
                                            .map((record: ApiPaymentRecord, idx: number) => (
                                            <div key={idx} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{record.receipt_number || 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">{record.paid_date} &bull; {record.payment_type}</p>
                                                </div>
                                                    <div className="text-right flex flex-col justify-between items-end gap-2">
                                                        <div>
                                                            <p className="text-sm font-bold text-green-600 dark:text-green-500">+{parseFloat(record.paid_amount || '0').toLocaleString()}</p>
                                                            {parseFloat(record.discount_amount || '0') > 0 && (
                                                                <p className="text-[10px] text-muted-foreground">Disc: {parseFloat(record.discount_amount!).toLocaleString()}</p>
                                                            )}
                                                        </div>
                                                        <button 
                                                            title="Delete Payment"
                                                            onClick={() => handleDeletePayment(record.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            )}
        </div>
    );
}
