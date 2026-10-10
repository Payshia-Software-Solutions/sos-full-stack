"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createTicket, sendTicketCreatedSms } from "@/lib/actions/tickets";
import { getStudentFullInfo } from "@/lib/actions/users";
import { 
    Search, Loader2, CheckCircle, User, Phone, Mail, 
    GraduationCap, LifeBuoy, AlertCircle, MessageSquare,
    BookOpen, KeyRound, CreditCard, Package, FileText,
    Award, HelpCircle, Paperclip, X, Send,
    Flame, Clock, Check, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/types";

interface CreateStaffTicketDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultStudentNumber?: string;
    defaultStudentName?: string;
    defaultCategory?: string;
    defaultNotes?: string;
    onSuccess?: (newTicket: Ticket) => void;
}

// Category Configuration with Icons and Themes
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

export function CreateStaffTicketDialog({
    open,
    onOpenChange,
    defaultStudentNumber = "",
    defaultStudentName = "",
    defaultCategory = "Academic",
    defaultNotes = "",
    onSuccess
}: CreateStaffTicketDialogProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [studentNumber, setStudentNumber] = useState(defaultStudentNumber);
    const [studentName, setStudentName] = useState(defaultStudentName);
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState(defaultCategory || "Academic");
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [description, setDescription] = useState(defaultNotes);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [notifyViaSms, setNotifyViaSms] = useState<boolean>(true);
    const [customSmsPhone, setCustomSmsPhone] = useState<string>("");

    // Student Lookup State
    const [isSearchingStudent, setIsSearchingStudent] = useState(false);
    const [verifiedStudent, setVerifiedStudent] = useState<any | null>(null);

    useEffect(() => {
        if (open) {
            setStudentNumber(defaultStudentNumber);
            setStudentName(defaultStudentName);
            setCategory(defaultCategory || "Academic");
            setDescription(defaultNotes || "");
            setAttachedFiles([]);
            if (defaultStudentNumber) {
                lookupStudent(defaultStudentNumber);
            }
        } else {
            setVerifiedStudent(null);
            setSubject("");
            setAttachedFiles([]);
        }
    }, [open, defaultStudentNumber, defaultStudentName, defaultCategory, defaultNotes]);

    const lookupStudent = async (numberToSearch?: string) => {
        const query = (numberToSearch || studentNumber).trim();
        if (!query) return;

        setIsSearchingStudent(true);
        try {
            const data = await getStudentFullInfo(query);
            if (data && data.studentInfo) {
                if (data.studentInfo.telephone_1) {
                    data.studentInfo.telephone_1 = formatMobileNumber(data.studentInfo.telephone_1);
                }
                if (data.studentInfo.telephone_2) {
                    data.studentInfo.telephone_2 = formatMobileNumber(data.studentInfo.telephone_2);
                }
                setVerifiedStudent(data);
                const fullName = data.studentInfo.full_name || data.studentInfo.name_with_initials || query;
                setStudentName(fullName);
                if (data.studentInfo.telephone_1) {
                    setCustomSmsPhone(data.studentInfo.telephone_1);
                }
                toast({
                    title: "Student Verified",
                    description: `Loaded account for ${fullName}`,
                });
            } else {
                setVerifiedStudent(null);
                setCustomSmsPhone("");
            }
        } catch (error: any) {
            setVerifiedStudent(null);
            toast({
                variant: "destructive",
                title: "Student Not Found",
                description: error.message || "Could not find active student with this PA number.",
            });
        } finally {
            setIsSearchingStudent(false);
        }
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
            const targetPhone = formatMobileNumber((customSmsPhone || verifiedStudent?.studentInfo?.telephone_1 || "").trim());
            if (notifyViaSms && targetPhone) {
                try {
                    await sendTicketCreatedSms({
                        mobile: targetPhone,
                        studentName: verifiedStudent?.studentInfo?.full_name || verifiedStudent?.studentInfo?.name_with_initials || studentName,
                        studentNumber: studentNumber.trim().toUpperCase(),
                        ticketId: newTicket.id,
                        subject: newTicket.subject || subject.trim(),
                    });
                    toast({
                        title: "Ticket Logged & SMS Sent",
                        description: `Ticket #${newTicket.id} opened. SMS notification sent to ${targetPhone}.`,
                    });
                } catch (smsErr: any) {
                    toast({
                        title: "Ticket Logged (SMS Warning)",
                        description: `Ticket #${newTicket.id} created, but SMS could not be sent: ${smsErr.message || 'Error'}`,
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Ticket Logged Successfully",
                    description: `Support Ticket #${newTicket.id} has been opened.`,
                });
            }

            onOpenChange(false);
            if (onSuccess) {
                onSuccess(newTicket);
            } else {
                router.push(`/admin/tickets/${newTicket.id}`);
            }
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

        const sNumber = studentNumber.trim();
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

        const formData = new FormData();
        formData.append("subject", subject.trim());
        formData.append("description", description.trim());
        formData.append("category", category);
        formData.append("priority", priority);
        formData.append("student_name", sNumber.toUpperCase());
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border-border bg-slate-950/95 backdrop-blur-xl text-foreground shadow-2xl">
                
                {/* Header with Title & Quick Close */}
                <DialogHeader className="p-4 sm:p-5 border-b border-border/50 bg-slate-900/40 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <LifeBuoy className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    Log Student Support Ticket
                                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                                        Helpdesk
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Record inquiries from calls, WhatsApp, or email directly into the support pipeline.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Form Body - Smoothly Scrollable on Mobile & Desktop */}
                <form id="create-ticket-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
                    
                    {/* Section 1: Student Lookup & Identity */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-primary" /> Student PA Number *
                            </Label>
                            {verifiedStudent && (
                                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Account Active
                                </span>
                            )}
                        </div>

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
                                    className="pl-9 bg-slate-900/60 border-input h-10 text-xs sm:text-sm uppercase font-mono tracking-wide text-foreground focus-visible:ring-primary/40"
                                    required
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => lookupStudent()}
                                disabled={isSearchingStudent || !studentNumber.trim()}
                                className="h-10 px-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-bold shrink-0 transition-all active:scale-95"
                            >
                                {isSearchingStudent ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="h-3.5 w-3.5 mr-1.5" /> Verify
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Interactive Verified Student Profile Box */}
                        {verifiedStudent?.studentInfo ? (
                            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-emerald-500/40">
                                            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                                                {verifiedStudent.studentInfo.full_name
                                                    ? verifiedStudent.studentInfo.full_name.substring(0, 2).toUpperCase()
                                                    : "ST"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                                                {verifiedStudent.studentInfo.full_name}
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground font-mono">
                                                ID: <strong className="text-emerald-400">{verifiedStudent.studentInfo.username || verifiedStudent.studentInfo.student_id}</strong>
                                                {verifiedStudent.studentInfo.nic && ` • NIC: ${verifiedStudent.studentInfo.nic}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action to Clear */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setVerifiedStudent(null);
                                            setStudentNumber("");
                                            setStudentName("");
                                        }}
                                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" /> Change
                                    </Button>
                                </div>

                                {/* Contact & Batch Tags */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                                    {verifiedStudent.studentInfo.telephone_1 && (
                                        <a 
                                            href={`tel:${verifiedStudent.studentInfo.telephone_1}`}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/60 border border-border/40 text-[11px] text-slate-200 hover:border-emerald-500/40"
                                        >
                                            <Phone className="h-3 w-3 text-emerald-400" />
                                            <span>{verifiedStudent.studentInfo.telephone_1}</span>
                                        </a>
                                    )}
                                    {verifiedStudent.studentInfo.e_mail && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/60 border border-border/40 text-[11px] text-slate-300 truncate max-w-[200px]">
                                            <Mail className="h-3 w-3 text-emerald-400 shrink-0" />
                                            <span className="truncate">{verifiedStudent.studentInfo.e_mail}</span>
                                        </div>
                                    )}
                                    {verifiedStudent.studentEnrollments && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] text-primary">
                                            <GraduationCap className="h-3 w-3" />
                                            <span>Enrolled in Courses</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Section 2: Interactive Category Selector (Touch-Friendly Chips Grid) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                            <span>Issue Category *</span>
                            <span className="text-[10px] text-muted-foreground font-normal lowercase">Select category to route issue</span>
                        </Label>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {CATEGORIES.map((cat) => {
                                const isSelected = category === cat.id;
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={cn(
                                            "p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 flex flex-col gap-1.5 cursor-pointer active:scale-98",
                                            isSelected
                                                ? "bg-primary/15 border-primary shadow-md shadow-primary/10 text-white"
                                                : "bg-slate-900/40 border-border/60 hover:bg-slate-900/80 hover:border-border text-muted-foreground hover:text-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className={cn("p-1.5 rounded-lg shrink-0", cat.bg, cat.color)}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            {isSelected && (
                                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>
                                        <span className="text-xs font-bold truncate leading-tight">
                                            {cat.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 3: Subject & Quick Preset Suggestions */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                Ticket Subject *
                            </Label>
                            <span className="text-[11px] text-muted-foreground font-normal">
                                Concise title of the problem
                            </span>
                        </div>

                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Cannot access lecture 4 video recording"
                            className="bg-slate-900/60 border-input h-10 text-xs sm:text-sm text-foreground focus-visible:ring-primary/40"
                            required
                        />
                    </div>

                    {/* Section 4: Priority & Assign Staff */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Priority Selector Pills */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                Priority Level
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "Low", label: "Low", color: "text-slate-300", bg: "hover:bg-slate-800" },
                                    { id: "Medium", label: "Medium", color: "text-amber-400", bg: "hover:bg-amber-950/30" },
                                    { id: "High", label: "Urgent", color: "text-rose-400", bg: "hover:bg-rose-950/30" },
                                ].map((p) => {
                                    const isSel = priority === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPriority(p.id as any)}
                                            className={cn(
                                                "py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95",
                                                isSel
                                                    ? p.id === "High"
                                                        ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm"
                                                        : p.id === "Medium"
                                                            ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                                                            : "bg-slate-800 border-slate-600 text-white shadow-sm"
                                                    : "bg-slate-900/40 border-border/60 text-muted-foreground hover:text-slate-200"
                                            )}
                                        >
                                            {p.id === "High" && <Flame className="h-3.5 w-3.5 text-rose-400" />}
                                            {p.id === "Medium" && <Clock className="h-3.5 w-3.5 text-amber-400" />}
                                            <span>{p.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Assign to Logging Agent */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                Assigned Agent
                            </Label>
                            <div className="h-10 px-3 rounded-xl border border-border/60 bg-slate-900/40 flex items-center justify-between text-xs text-slate-300">
                                <span className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-primary" />
                                    {user?.name || user?.username || "Current Staff"}
                                </span>
                                <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-400">
                                    Me
                                </Badge>
                            </div>
                        </div>

                        {/* SMS Notification to Student on Ticket Creation */}
                        <div className="sm:col-span-2 pt-2 border-t border-border/40 space-y-2">
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
                                            Send SMS with ticket number to student phone.
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
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-emerald-500/20">
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
                                        className="h-8 text-xs bg-slate-950 border-border/60 text-slate-100 focus-visible:ring-emerald-500/40"
                                    />
                                    {verifiedStudent?.studentInfo?.telephone_1 && customSmsPhone !== verifiedStudent.studentInfo.telephone_1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCustomSmsPhone(verifiedStudent.studentInfo.telephone_1)}
                                            className="h-8 px-2 text-[11px] text-muted-foreground hover:text-emerald-400 shrink-0"
                                        >
                                            Use Profile ({verifiedStudent.studentInfo.telephone_1})
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 5: Description & Notes */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                            <span>Issue Description / Notes *</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Details shared by the student</span>
                        </Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Type the full message or call summary from the student..."
                            className="bg-slate-900/60 border-input text-xs sm:text-sm min-h-[95px] text-foreground focus-visible:ring-primary/40 leading-relaxed"
                            required
                        />
                    </div>

                    {/* Section 6: File & Screenshot Attachments */}
                    <div className="space-y-2 pt-1 border-t border-border/30">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <Paperclip className="h-3.5 w-3.5 text-primary" /> Attachments / Slip Screenshots
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-7 text-[11px] border-border/60 bg-slate-900/40 text-slate-200 hover:bg-slate-850"
                            >
                                <Paperclip className="h-3 w-3 mr-1" /> Add Files
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
                            <div className="flex flex-wrap gap-2 pt-1">
                                {attachedFiles.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-border text-xs text-slate-200"
                                    >
                                        <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                                        <span className="truncate max-w-[130px] text-[11px]">{file.name}</span>
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
                                Optional: Attach screenshots of WhatsApp messages, error screens, or payment slips.
                            </p>
                        )}
                    </div>
                </form>

                {/* Sticky Touch-Friendly Footer on Mobile & Desktop */}
                <DialogFooter className="p-3 sm:p-4 bg-slate-900/80 border-t border-border/50 shrink-0 flex flex-row items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-10 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-800/60"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="create-ticket-form"
                        disabled={createMutation.isPending}
                        className="h-10 px-5 sm:px-6 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-all active:scale-98"
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
