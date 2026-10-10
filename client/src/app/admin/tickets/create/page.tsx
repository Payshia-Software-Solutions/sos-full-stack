"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createTicket, sendTicketCreatedSms } from "@/lib/actions/tickets";
import { getStudentDetailsByUsername, getStudentEnrollments, getStudentBalance } from "@/lib/actions/users";
import type { UserFullDetails, StudentEnrollmentInfo, StudentBalanceData, Ticket } from "@/lib/types";
import { 
    Search, Loader2, CheckCircle2, User, Phone, Mail, 
    GraduationCap, LifeBuoy, AlertCircle, ArrowLeft,
    BookOpen, KeyRound, CreditCard, Package, FileText,
    Award, HelpCircle, Paperclip, X, Send, Flame, Clock, 
    Check, MessageCircle, Copy, ExternalLink, RefreshCw, ChevronRight,
    Sparkles, Bell, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { StudentInline360Dossier } from "@/components/admin/StudentInline360Dossier";
import { getActiveTicketCategories, TicketCategoryItem } from "@/lib/actions/ticketCategories";
import { getCategoryIcon } from "@/lib/ticket-category-icons";
import { Settings } from "lucide-react";

// Category Configuration with Icons and Department Theme
const CATEGORIES = [
    { id: "Academic", label: "Academic Support", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    { id: "LMS Access", label: "LMS & App Access", icon: KeyRound, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    { id: "Payment", label: "Payment & Slips", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { id: "Study Pack", label: "Study Pack Courier", icon: Package, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    { id: "Examination", label: "Exams & Quizzes", icon: FileText, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    { id: "Certificate", label: "Certificate & Conv.", icon: Award, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30" },
    { id: "Other", label: "General Support", icon: HelpCircle, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30" },
];

function formatMobileNumber(phone?: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("94") && cleaned.length === 11) {
        cleaned = "0" + cleaned.slice(2);
    } else if (cleaned.length === 9 && !cleaned.startsWith("0")) {
        cleaned = "0" + cleaned;
    }
    return cleaned;
}

function cleanPhoneForWhatsApp(phone?: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
        cleaned = "94" + cleaned.slice(1);
    } else if (cleaned.length === 9 && !cleaned.startsWith("0")) {
        cleaned = "94" + cleaned;
    }
    return cleaned;
}

function CreateTicketPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial values from query parameters for direct links
    const paramStudentNumber = searchParams.get("student_number") || searchParams.get("pa") || "";
    const paramStudentName = searchParams.get("name") || "";
    const paramCategory = searchParams.get("category") || "Academic";
    const paramSubject = searchParams.get("subject") || "";
    const paramNotes = searchParams.get("notes") || "";

    // Form States
    const [studentNumber, setStudentNumber] = useState(paramStudentNumber);
    const [studentName, setStudentName] = useState(paramStudentName);
    const [subject, setSubject] = useState(paramSubject);
    const [category, setCategory] = useState(paramCategory);
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [selectedCourseCode, setSelectedCourseCode] = useState<string>("");
    const [description, setDescription] = useState(paramNotes);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [notifyViaSms, setNotifyViaSms] = useState<boolean>(true);
    const [customSmsPhone, setCustomSmsPhone] = useState<string>("");

    // Fetch dynamic categories from DB
    const { data: dynamicCategories = [], isLoading: isLoadingCategories } = useQuery<TicketCategoryItem[]>({
        queryKey: ["active-ticket-categories"],
        queryFn: getActiveTicketCategories,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    // Fallback list if DB query is still loading or empty
    const displayCategories = dynamicCategories.length > 0 
        ? dynamicCategories.map((c) => ({
            id: c.category_key || c.name,
            label: c.name,
            iconName: c.icon,
            color: c.color || "text-blue-400",
            bg: c.bg_color || "bg-blue-500/10",
            border: c.border_color || "border-blue-500/30",
            description: c.description
        }))
        : CATEGORIES.map(c => ({
            id: c.id,
            label: c.label,
            iconName: undefined,
            staticIcon: c.icon,
            color: c.color,
            bg: c.bg,
            border: c.border,
            description: undefined
        }));

    // Modular Stage-Based Student States
    // Stage 1: Basic Profile (fast lookup ~50ms)
    const [studentProfile, setStudentProfile] = useState<UserFullDetails | null>(null);
    const [isSearchingStudent, setIsSearchingStudent] = useState(false);
    
    // Stage 2: Enrolled Batches / Courses (fast parallel query ~80ms)
    const [enrollments, setEnrollments] = useState<StudentEnrollmentInfo[]>([]);
    
    // Stage 3: Financials / Balance (On-demand lazy load only when requested or Category === "Payment")
    const [balanceData, setBalanceData] = useState<StudentBalanceData | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [showBalanceDetails, setShowBalanceDetails] = useState(false);

    // Auto-lookup if student_number is passed in URL
    useEffect(() => {
        if (paramStudentNumber) {
            lookupStudent(paramStudentNumber);
        }
    }, [paramStudentNumber]);

    // Lazy load balance when Category is Payment & student profile exists
    useEffect(() => {
        if (category === "Payment" && studentProfile && !balanceData && !isLoadingBalance) {
            fetchBalance(studentProfile.username || studentProfile.student_id);
        }
    }, [category, studentProfile]);

    /**
     * Optimized Modular Student Lookup:
     * Executes Stage 1 (Profile) and Stage 2 (Enrollments) in parallel.
     * Skips heavy DB loops & calculations for instant responsiveness (~50-100ms).
     */
    const lookupStudent = async (numberToSearch?: string) => {
        const query = (numberToSearch || studentNumber).trim().toUpperCase();
        if (!query) return;

        setIsSearchingStudent(true);
        setBalanceData(null);
        setShowBalanceDetails(false);

        try {
            const [profileResult, enrollmentsResult] = await Promise.allSettled([
                getStudentDetailsByUsername(query),
                getStudentEnrollments(query),
            ]);

            let loadedProfile: UserFullDetails | null = null;
            let loadedEnrollments: StudentEnrollmentInfo[] = [];

            if (profileResult.status === "fulfilled" && profileResult.value) {
                loadedProfile = profileResult.value;
            }

            if (enrollmentsResult.status === "fulfilled" && Array.isArray(enrollmentsResult.value)) {
                loadedEnrollments = enrollmentsResult.value;
            }

            // Fallback: If profile endpoint didn't find record but enrollments has joined student info
            if (!loadedProfile && loadedEnrollments.length > 0) {
                const first = loadedEnrollments[0];
                loadedProfile = {
                    id: first.student_course_id,
                    student_id: first.student_id,
                    username: first.username || query,
                    full_name: first.full_name || query,
                    name_with_initials: first.full_name || query,
                    name_on_certificate: first.name_on_certificate || query,
                    e_mail: (first as any).e_mail || "",
                    telephone_1: (first as any).telephone_1 || "",
                    telephone_2: (first as any).telephone_2 || "",
                    gender: (first as any).gender || "-",
                    civil_status: (first as any).civil_status || "-",
                    nic: (first as any).nic || "-",
                    birth_day: "",
                    address_line_1: (first as any).address_line_1 || "",
                    address_line_2: "",
                    city: (first as any).city || "",
                    district: (first as any).district || "",
                    postal_code: "",
                    updated_by: "",
                    updated_at: "",
                };
            }

            if (loadedProfile) {
                if (loadedProfile.telephone_1) {
                    loadedProfile.telephone_1 = formatMobileNumber(loadedProfile.telephone_1);
                }
                if (loadedProfile.telephone_2) {
                    loadedProfile.telephone_2 = formatMobileNumber(loadedProfile.telephone_2);
                }
                setStudentProfile(loadedProfile);
                setEnrollments(loadedEnrollments);
                
                const displayName = loadedProfile.full_name || loadedProfile.name_with_initials || query;
                setStudentName(displayName);

                if (loadedProfile.telephone_1) {
                    setCustomSmsPhone(loadedProfile.telephone_1);
                }

                // Auto-select first enrolled course if available and not selected
                if (loadedEnrollments.length > 0 && !selectedCourseCode) {
                    setSelectedCourseCode(loadedEnrollments[0].course_code);
                }

                toast({
                    title: "Student Verified",
                    description: `Loaded account for ${displayName}`,
                });
            } else {
                setStudentProfile(null);
                setEnrollments([]);
                setCustomSmsPhone("");
                toast({
                    variant: "destructive",
                    title: "Student Not Found",
                    description: `No registered student found matching "${query}".`,
                });
            }
        } catch (error: any) {
            setStudentProfile(null);
            setEnrollments([]);
            toast({
                variant: "destructive",
                title: "Lookup Failed",
                description: error.message || "Failed to communicate with student directory.",
            });
        } finally {
            setIsSearchingStudent(false);
        }
    };

    /**
     * Stage 3: On-Demand Balance Fetcher
     * Runs only when explicitly requested or when handling payment-related issues.
     */
    const fetchBalance = async (userNumber?: string) => {
        const query = (userNumber || studentNumber).trim().toUpperCase();
        if (!query) return;

        setIsLoadingBalance(true);
        try {
            const data = await getStudentBalance(query);
            setBalanceData(data);
            setShowBalanceDetails(true);
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Balance Check Failed",
                description: err.message || "Could not retrieve financial ledger.",
            });
        } finally {
            setIsLoadingBalance(false);
        }
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: `${label} copied to clipboard.` });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachedFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const createMutation = useMutation({
        mutationFn: (formData: FormData) => createTicket(formData),
        onSuccess: async (newTicket: Ticket) => {
            queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
            
            // Send SMS notification if requested
            const targetPhone = formatMobileNumber((customSmsPhone || studentProfile?.telephone_1 || "").trim());
            if (notifyViaSms && targetPhone) {
                try {
                    await sendTicketCreatedSms({
                        mobile: targetPhone,
                        studentName: studentProfile?.full_name || studentProfile?.name_with_initials || studentName,
                        studentNumber: studentNumber.trim().toUpperCase(),
                        ticketId: newTicket.id,
                        subject: newTicket.subject || subject.trim(),
                    });
                    toast({
                        title: "Ticket Created & SMS Sent",
                        description: `Ticket #${newTicket.id} opened. SMS notification delivered to ${targetPhone}.`,
                    });
                } catch (smsErr: any) {
                    toast({
                        title: "Ticket Created (SMS Warning)",
                        description: `Ticket #${newTicket.id} created, but SMS could not be sent: ${smsErr.message || 'Error'}`,
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Ticket Created Successfully",
                    description: `Support Ticket #${newTicket.id} has been opened.`,
                });
            }

            router.push(`/admin/tickets/${newTicket.id}`);
        },
        onError: (err: any) => {
            toast({
                variant: "destructive",
                title: "Failed to Create Ticket",
                description: err.message || "An unexpected error occurred",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const sNumber = studentNumber.trim().toUpperCase();
        if (!sNumber) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Student Registration / PA Number is required",
            });
            return;
        }

        if (!subject.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Ticket Subject is required",
            });
            return;
        }

        if (!description.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Issue description / conversation notes are required",
            });
            return;
        }

        // Format subject with course code tag if selected
        let finalSubject = subject.trim();
        if (selectedCourseCode && !finalSubject.includes(selectedCourseCode)) {
            finalSubject = `[${selectedCourseCode}] ${finalSubject}`;
        }

        const formData = new FormData();
        formData.append("subject", finalSubject);
        formData.append("description", description.trim());
        formData.append("category", category);
        formData.append("priority", priority);
        formData.append("student_name", sNumber);
        formData.append("student_number", sNumber);
        formData.append("student_avatar", user?.avatar || "https://placehold.co/40x40.png?text=ST");
        formData.append("status", "Open");
        formData.append("assigned_to", user?.username || "unassigned");

        if (attachedFiles.length > 0) {
            const attachmentMetadata = attachedFiles.map((att) => ({
                type: "image",
                name: att.name,
            }));
            formData.append("attachments", JSON.stringify(attachmentMetadata));
            attachedFiles.forEach((file) => {
                formData.append("attachments[]", file, file.name);
            });
        }

        createMutation.mutate(formData);
    };

    return (
        <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-40 w-full text-foreground bg-background">
            {/* Top Navigation & Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/40 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    <Link href="/admin/tickets" passHref>
                        <Button variant="ghost" size="sm" className="hover:bg-slate-900 border border-border/40 h-8 sm:h-9 px-2.5 sm:px-3 text-xs shrink-0">
                            <ArrowLeft className="h-3.5 w-3.5 sm:mr-1.5" />
                            <span className="hidden xs:inline">Tickets</span>
                        </Button>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg sm:text-2xl font-headline font-bold text-white tracking-tight truncate">
                                Log Support Ticket
                            </h1>
                            <Badge variant="outline" className="text-[9px] sm:text-[10px] font-semibold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0">
                                Desk
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-[11px] sm:text-xs mt-0.5 line-clamp-1 sm:line-clamp-none">
                            Modular student verification with instant 360° academic & financial dossier.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href="/admin/manage/leads/create" passHref className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto text-xs border-border/70 bg-slate-900/50 text-slate-300 h-8 sm:h-9 hover:text-white justify-center">
                            Lead CRM
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Form Layout */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
                
                {/* Left Column: Student Identity & Issue Categorization */}
                <div className="lg:col-span-6 space-y-6">
                    
                    {/* Step 1: Student Verification Card */}
                    <Card className="bg-card border-border/70 shadow-md">
                        <CardHeader className="py-3 px-4 sm:py-4 sm:px-5 border-b border-border/50">
                            <CardTitle className="text-xs sm:text-sm font-bold flex items-center justify-between text-white">
                                <span className="flex items-center gap-1.5 sm:gap-2">
                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> Step 1: Student Verification
                                </span>
                                {studentProfile ? (
                                    <span className="text-[11px] sm:text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Account
                                    </span>
                                ) : (
                                    <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">
                                        Instant ~50ms Lookup
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
                            {/* Search Input */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300">
                                    Student Registration / PA Number *
                                </Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={studentNumber}
                                            onChange={(e) => setStudentNumber(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    lookupStudent();
                                                }
                                            }}
                                            placeholder="Enter PA Number (e.g. PA30001, PA24205)"
                                            className="pl-9 bg-slate-950 border-input h-9 sm:h-10 text-xs sm:text-sm uppercase font-mono tracking-wide text-foreground focus-visible:ring-primary/40"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => lookupStudent()}
                                        disabled={isSearchingStudent || !studentNumber.trim()}
                                        className="h-9 sm:h-10 px-3 sm:px-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-bold shrink-0 transition-all active:scale-95"
                                    >
                                        {isSearchingStudent ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Search className="h-3.5 w-3.5 mr-1" /> Verify
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Verified Student Information Card */}
                            {studentProfile && (
                                <div className="p-3 sm:p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md space-y-2.5 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Header: Avatar, Name, IDs */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border border-emerald-500/40 shrink-0">
                                                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-bold text-xs sm:text-sm">
                                                    {studentProfile.full_name
                                                        ? studentProfile.full_name.substring(0, 2).toUpperCase()
                                                        : "ST"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                                                    {studentProfile.full_name || studentProfile.name_with_initials}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground font-mono mt-0.5">
                                                    <span className="text-emerald-400 font-bold">
                                                        {studentProfile.username || studentProfile.student_id}
                                                    </span>
                                                    {studentProfile.nic && studentProfile.nic !== "-" && (
                                                        <span className="hidden xs:inline">• NIC: {studentProfile.nic}</span>
                                                    )}
                                                    {studentProfile.city && (
                                                        <span>• {studentProfile.city}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setStudentProfile(null);
                                                setEnrollments([]);
                                                setBalanceData(null);
                                                setStudentNumber("");
                                                setStudentName("");
                                            }}
                                            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                                        >
                                            <X className="h-3 w-3 mr-0.5" /> Reset
                                        </Button>
                                    </div>

                                    {/* Quick Contact & Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-emerald-500/20 text-xs">
                                        {studentProfile.telephone_1 && (
                                            <>
                                                <a 
                                                    href={`tel:${studentProfile.telephone_1}`}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/90 border border-border/60 text-[11px] text-slate-200 hover:border-emerald-500/50 hover:bg-slate-900 transition-colors shrink-0"
                                                >
                                                    <Phone className="h-3 w-3 text-emerald-400" />
                                                    <span>{studentProfile.telephone_1}</span>
                                                </a>

                                                {cleanPhoneForWhatsApp(studentProfile.telephone_1) && (
                                                    <a 
                                                        href={`https://wa.me/${cleanPhoneForWhatsApp(studentProfile.telephone_1)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 hover:bg-emerald-500/20 transition-colors shrink-0 font-medium"
                                                    >
                                                        <MessageCircle className="h-3 w-3" />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                )}
                                            </>
                                        )}

                                        {studentProfile.e_mail && (
                                            <a 
                                                href={`mailto:${studentProfile.e_mail}`}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/90 border border-border/60 text-[11px] text-slate-300 hover:border-emerald-500/50 hover:bg-slate-900 truncate max-w-[150px] sm:max-w-[200px]"
                                            >
                                                <Mail className="h-3 w-3 text-emerald-400 shrink-0" />
                                                <span className="truncate">{studentProfile.e_mail}</span>
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleCopy(studentProfile.username || studentProfile.student_id, "Student ID")}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/90 border border-border/60 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                                        >
                                            <Copy className="h-3 w-3" />
                                            <span>Copy ID</span>
                                        </button>
                                    </div>

                                    {/* Inline 360° Academic & Financial Dossier on the Same Screen */}
                                    <div className="pt-2 border-t border-emerald-500/20">
                                        <StudentInline360Dossier
                                            studentNumber={studentProfile.username || studentProfile.student_id}
                                            studentProfile={studentProfile}
                                            enrollments={enrollments}
                                            balanceData={balanceData}
                                            selectedCourseCode={selectedCourseCode}
                                            onSelectCourseCode={(code) => setSelectedCourseCode(code)}
                                            onRefreshBalance={() => fetchBalance()}
                                            isLoadingBalance={isLoadingBalance}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 2: Issue Category Selector */}
                    <Card className="bg-card border-border/70 shadow-md">
                        <CardHeader className="py-3 px-4 sm:py-4 sm:px-5 border-b border-border/50">
                            <CardTitle className="text-xs sm:text-sm font-bold flex items-center justify-between text-white">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span>Step 2: Select Issue Category</span>
                                    {isLoadingCategories && (
                                        <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground font-normal hidden sm:inline">Department Routing</span>
                                    <Link 
                                        href="/admin/tickets/categories" 
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-primary/20 transition-colors"
                                    >
                                        <Settings className="h-3 w-3" />
                                        <span>Manage</span>
                                    </Link>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                                {displayCategories.map((cat: any) => {
                                    const isSelected = category === cat.id;
                                    const Icon = cat.iconName ? getCategoryIcon(cat.iconName) : (cat.staticIcon || HelpCircle);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={cn(
                                                "p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1.5 sm:gap-2 cursor-pointer active:scale-98",
                                                isSelected
                                                    ? "bg-primary/15 border-primary shadow-md shadow-primary/10 text-white ring-1 ring-primary/40"
                                                    : "bg-slate-950/40 border-border/60 hover:bg-slate-900/80 hover:border-border text-muted-foreground hover:text-slate-200"
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", cat.bg, cat.color)}>
                                                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                </div>
                                                {isSelected && (
                                                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
                                                )}
                                            </div>
                                            <span className="text-[11px] sm:text-xs font-bold truncate leading-tight">
                                                {cat.label}
                                            </span>
                                            {cat.description && (
                                                <span className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">
                                                    {cat.description}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Priority & Assignment + Issue Description & Attachments */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Step 3: Priority & Assignment */}
                    <Card className="bg-card border-border/70 shadow-md">
                        <CardHeader className="py-3 px-4 sm:py-4 sm:px-5 border-b border-border/50">
                            <CardTitle className="text-xs sm:text-sm font-bold text-white">
                                Step 3: Priority & Assignment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-xs font-semibold text-slate-300">Priority Level</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "Low", label: "Low", color: "text-slate-300" },
                                        { id: "Medium", label: "Medium", color: "text-amber-400" },
                                        { id: "High", label: "Urgent", color: "text-rose-400" },
                                    ].map((p) => {
                                        const isSel = priority === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setPriority(p.id as any)}
                                                className={cn(
                                                    "py-2 px-1.5 sm:px-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95",
                                                    isSel
                                                        ? p.id === "High"
                                                            ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm"
                                                            : p.id === "Medium"
                                                                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                                                                : "bg-slate-800 border-slate-600 text-white shadow-sm"
                                                        : "bg-slate-950/40 border-border/60 text-muted-foreground hover:text-slate-200"
                                                )}
                                            >
                                                {p.id === "High" && <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-400" />}
                                                {p.id === "Medium" && <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />}
                                                <span>{p.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-xs font-semibold text-slate-300">Assigned Agent</Label>
                                <div className="h-9 sm:h-10 px-3 rounded-xl border border-border/60 bg-slate-950/40 flex items-center justify-between text-xs text-slate-300">
                                    <span className="flex items-center gap-2 truncate">
                                        <User className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span className="truncate">{user?.name || user?.username || "Current Staff"}</span>
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-400 shrink-0">
                                        Me
                                    </Badge>
                                </div>
                            </div>

                            {/* SMS Notification to Student on Ticket Creation */}
                            <div className="sm:col-span-2 pt-3 border-t border-border/40 space-y-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <Smartphone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold text-slate-200 cursor-pointer" onClick={() => setNotifyViaSms(!notifyViaSms)}>
                                                Notify Student via SMS
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Send an SMS notification to the student with the newly generated Ticket Number.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={notifyViaSms}
                                        onClick={() => setNotifyViaSms(!notifyViaSms)}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                            notifyViaSms ? "bg-emerald-500" : "bg-slate-800"
                                        )}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                                notifyViaSms ? "translate-x-4" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                </div>

                                {notifyViaSms && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-emerald-500/20">
                                        <Label className="text-[11px] font-medium text-slate-300 shrink-0 flex items-center gap-1.5">
                                            <Phone className="h-3 w-3 text-emerald-400" />
                                            Target Mobile:
                                        </Label>
                                        <Input
                                            type="text"
                                            value={customSmsPhone}
                                            onChange={(e) => setCustomSmsPhone(e.target.value)}
                                            onBlur={() => setCustomSmsPhone((p) => formatMobileNumber(p))}
                                            placeholder="e.g. 0712345678"
                                            className="h-8 text-xs bg-slate-900 border-border/60 text-slate-100 focus-visible:ring-emerald-500/40"
                                        />
                                        {studentProfile?.telephone_1 && customSmsPhone !== studentProfile.telephone_1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCustomSmsPhone(studentProfile.telephone_1)}
                                                className="h-8 px-2 text-[11px] text-muted-foreground hover:text-emerald-400 shrink-0"
                                            >
                                                Use Profile ({studentProfile.telephone_1})
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 4: Issue Description & Attachments */}
                    <Card className="bg-card border-border/70 shadow-md">
                        <CardHeader className="py-3 px-4 sm:py-4 sm:px-5 border-b border-border/50">
                            <CardTitle className="text-xs sm:text-sm font-bold text-white">
                                Step 4: Issue Description & Attachments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
                            {/* Subject */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300">
                                    Ticket Subject / Summary *
                                </Label>
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Cannot access lecture 4 video recording"
                                    className="bg-slate-950 border-input h-9 sm:h-10 text-xs sm:text-sm text-foreground focus-visible:ring-primary/40"
                                    required
                                />
                            </div>

                            {/* Enrolled Course Tagging (If available) */}
                            {enrollments.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300">
                                        Related Course / Batch (Optional)
                                    </Label>
                                    <select
                                        value={selectedCourseCode}
                                        onChange={(e) => setSelectedCourseCode(e.target.value)}
                                        className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                    >
                                        <option value="">-- General / Not Course-Specific --</option>
                                        {enrollments.map((e) => (
                                            <option key={e.course_code} value={e.course_code}>
                                                [{e.course_code}] {e.course_name || e.course_code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300">
                                    Detailed Description / Conversation Notes *
                                </Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Type the full student issue, call notes, or inquiry context..."
                                    className="bg-slate-950 border-input text-xs sm:text-sm min-h-[120px] sm:min-h-[140px] text-foreground focus-visible:ring-primary/40 leading-relaxed"
                                    required
                                />
                            </div>

                            {/* File Attachments */}
                            <div className="space-y-2 pt-2 border-t border-border/30">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                        <Paperclip className="h-3.5 w-3.5 text-primary" /> Attachments
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-7 sm:h-8 text-xs border-border/60 bg-slate-950 text-slate-200 hover:bg-slate-900 px-2.5"
                                    >
                                        <Paperclip className="h-3.5 w-3.5 mr-1" /> Add Files
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {attachedFiles.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {attachedFiles.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-border text-[11px] text-slate-200"
                                            >
                                                <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                                                <span className="truncate max-w-[120px] sm:max-w-[150px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="ml-1 text-muted-foreground hover:text-rose-400 p-0.5 rounded"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-muted-foreground/70">
                                        Optional: Attach screenshots of WhatsApp chats, errors, or slips.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2 sm:pt-4 pb-10">
                        <Link href="/admin/tickets" passHref className="w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full sm:w-auto h-9 sm:h-10 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-900 justify-center"
                            >
                                Cancel
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Logging...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" /> Open Support Ticket
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Bottom Buffer / Spacer so content never touches screen bottom */}
            <div className="h-20 w-full" />
        </div>
    );
}

export default function CreateTicketPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading ticket form...</div>}>
            <CreateTicketPageContent />
        </Suspense>
    );
}
