"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getBatches } from "@/lib/actions/courses";
import { getLeads, updateLead, deleteLead, addLeadLog, Lead } from "@/lib/actions/leads";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Batch } from "@/lib/types";
import { 
    ArrowLeft, User, Phone, Mail, MessageSquare, Save, Trash2,
    Facebook, MessageCircle, Globe, HelpCircle, UserPlus, 
    History, GraduationCap, Check, Clock, Copy, ExternalLink, 
    TrendingUp, ShieldCheck, ChevronsUpDown, BookOpen, Star, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

type SourceType = 'Call' | 'WhatsApp' | 'Facebook' | 'Website' | 'Email' | 'Other';
type StudentCategory = 'New' | 'Old' | 'Ongoing';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditLeadPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Form States
    const [name, setName] = useState("");
    const [studentNumber, setStudentNumber] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [source, setSource] = useState<SourceType>("Other");
    const [category, setCategory] = useState<StudentCategory>("New");
    const [course, setCourse] = useState("");
    const [status, setStatus] = useState("Received");
    const [assigned, setAssigned] = useState("");
    const [notes, setNotes] = useState("");

    // Inquiry Type State
    const [inquiryType, setInquiryType] = useState<"general" | "course">("general");

    // Dynamic Lifecycle Fields
    const [requirementType, setRequirementType] = useState("General Inquiry");
    const [courseCompleted, setCourseCompleted] = useState(false);
    const [issueType, setIssueType] = useState("Academic");
    const [assignedDepartment, setAssignedDepartment] = useState("Student Support");

    // Combobox State
    const [openCourseSelect, setOpenCourseSelect] = useState(false);

    // Search Student States
    const [isSearching, setIsSearching] = useState(false);
    const [fetchedStudent, setFetchedStudent] = useState<any | null>(null);

    // Log Form State
    const [newLogAction, setNewLogAction] = useState("Call Completed");
    const [newLogNotes, setNewLogNotes] = useState("");

    // Fetch batches
    const { data: batches = [] } = useQuery<Batch[]>({
        queryKey: ["allBatches"],
        queryFn: getBatches,
    });

    // Fetch single lead
    const { data: leadData, isLoading: isLoadingLead } = useQuery<Lead>({
        queryKey: ["lead", id],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_LMS_SERVER_URL}/leads/${id}/`);
            if (!response.ok) throw new Error("Failed to fetch lead info");
            return response.json();
        }
    });

    // Backfill state when data loads
    useEffect(() => {
        if (leadData) {
            setName(leadData.full_name);
            setStudentNumber(leadData.student_number || "");
            setEmail(leadData.email || "");
            setPhone(leadData.phone_number || "");
            setSource(leadData.source);
            setCategory(leadData.student_type);
            setCourse(leadData.course_id || "");
            setStatus(leadData.status);
            setAssigned(leadData.assigned_to || "");
            setNotes(leadData.notes || "");
            setRequirementType(leadData.requirement_type || "General Inquiry");
            setCourseCompleted(leadData.course_completed === 1 || leadData.course_completed === true);
            setIssueType(leadData.issue_type || "Academic");
            setAssignedDepartment(leadData.assigned_department || "Student Support");

            // Determine if it was course related or general inquiry
            if (leadData.course_id && leadData.course_id !== "general") {
                setInquiryType("course");
            } else {
                setInquiryType("general");
            }

            if (leadData.student_number) {
                const fetchOnLoad = async () => {
                    try {
                        const baseUrl = process.env.NEXT_PUBLIC_LMS_SERVER_URL;
                        const response = await fetch(`${baseUrl}/get-student-full-info?loggedUser=${leadData.student_number}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data && data.studentInfo) {
                                setFetchedStudent(data.studentInfo);
                            }
                        }
                    } catch (e) {
                        console.error("Failed to fetch student details on load", e);
                    }
                };
                fetchOnLoad();
            } else {
                setFetchedStudent(null);
            }
        }
    }, [leadData]);

    const handleSearchStudent = async () => {
        const username = studentNumber.trim().toUpperCase();
        if (!username) return;

        setIsSearching(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_LMS_SERVER_URL;
            const response = await fetch(`${baseUrl}/get-student-full-info?loggedUser=${username}`);
            if (!response.ok) {
                throw new Error("Student details not found.");
            }
            const data = await response.json();
            if (data && data.studentInfo) {
                setFetchedStudent(data.studentInfo);
                setName(data.studentInfo.full_name || "");
                setPhone(data.studentInfo.telephone_1 || "");
                setEmail(data.studentInfo.e_mail || "");
                toast({
                    title: "Student Found",
                    description: `Loaded details for ${data.studentInfo.full_name}`,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Not Found",
                    description: "Student details not found.",
                });
            }
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Not Found",
                description: err.message || "Student details not found. Make sure registration number is correct.",
            });
        } finally {
            setIsSearching(false);
        }
    };

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateLead(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["leadStats"] });
            queryClient.invalidateQueries({ queryKey: ["lead", id] });
            toast({ title: "Success", description: "Lead profile updated successfully" });
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteLead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["leadStats"] });
            toast({ title: "Success", description: "Lead profile deleted" });
            router.push("/admin/manage/leads");
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    const addLogMutation = useMutation({
        mutationFn: (data: any) => addLeadLog(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["lead", id] });
            setNewLogNotes("");
            toast({ title: "Success", description: "Activity log recorded" });
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({
            full_name: name,
            student_number: studentNumber.trim() || null,
            email: email || null,
            phone_number: phone || null,
            source: source,
            student_type: category,
            course_id: inquiryType === "general" ? null : (course || null),
            requirement_type: category === "Old" ? requirementType : null,
            course_completed: category === "Old" ? (courseCompleted ? 1 : 0) : null,
            issue_type: category === "Ongoing" ? issueType : null,
            assigned_department: category === "Ongoing" ? assignedDepartment : null,
            status: status,
            assigned_to: assigned || null,
            notes: notes || null,
            editor_name: user?.name || "Staff"
        });
    };

    const handleQuickStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        updateMutation.mutate({
            full_name: name,
            student_number: studentNumber.trim() || null,
            email: email || null,
            phone_number: phone || null,
            source: source,
            student_type: category,
            course_id: inquiryType === "general" ? null : (course || null),
            requirement_type: category === "Old" ? requirementType : null,
            course_completed: category === "Old" ? (courseCompleted ? 1 : 0) : null,
            issue_type: category === "Ongoing" ? issueType : null,
            assigned_department: category === "Ongoing" ? assignedDepartment : null,
            status: newStatus,
            assigned_to: assigned || null,
            notes: notes || null,
            editor_name: user?.name || "Staff"
        });
    };

    const handleAddLogSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addLogMutation.mutate({
            staff_name: user?.name || "Staff",
            action: newLogAction,
            notes: newLogNotes || null
        });
    };

    const handleDeleteLead = () => {
        if (confirm("Are you sure you want to delete this student lead? This cannot be undone.")) {
            deleteMutation.mutate();
        }
    };

    const copyRegistrationLink = () => {
        const regUrl = `${window.location.origin}/register?lead_id=${id}&name=${encodeURIComponent(name)}`;
        navigator.clipboard.writeText(regUrl);
        toast({ title: "Link Copied", description: "Registration link copied to clipboard." });
    };

    // Source Options Config
    const sourceOptions: { value: SourceType; label: string; icon: any; color: string; bgColor: string }[] = [
        { value: 'Call', label: 'Phone Call', icon: Phone, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
        { value: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { value: 'Facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { value: 'Website', label: 'Website', icon: Globe, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
        { value: 'Email', label: 'Email', icon: Mail, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
        { value: 'Other', label: 'Other', icon: HelpCircle, color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
    ];

    // Category Options Config
    const categoryOptions: { value: StudentCategory; label: string; icon: any; color: string }[] = [
        { value: 'New', label: 'New Student', icon: UserPlus, color: 'text-sky-500' },
        { value: 'Old', label: 'Old Student', icon: History, color: 'text-amber-500' },
        { value: 'Ongoing', label: 'Ongoing Student', icon: GraduationCap, color: 'text-purple-500' },
    ];

    // Dynamic Pipeline Status Stepper based on Category Flow
    const getStatusStages = () => {
        if (category === "New") {
            return [
                { value: "Received", label: "Received" },
                { value: "Course Info Provided", label: "Info Provided" },
                { value: "Follow-up", label: "Follow-up" },
                { value: "Registration Link Sent", label: "Reg Sent" },
                { value: "Registration Completed", label: "Reg Completed" },
                { value: "Payment Verified", label: "Paid" },
                { value: "Student Registered", label: "Student Reg" },
                { value: "Welcome Message Sent", label: "Welcome Msg" },
                { value: "Study Pack Ordered", label: "Pack Ord" },
                { value: "Study Pack Dispatched", label: "Pack Disp" },
                { value: "Added to WhatsApp / LMS", label: "WhatsApp/LMS" },
                { value: "Course Started", label: "Started" },
                { value: "Progress Monitoring", label: "Progress Mon." },
                { value: "Assessment Verified", label: "Assessment Ver." },
                { value: "Certificate Approved", label: "Cert. Approved" },
                { value: "Certificate Printed", label: "Cert. Printed" },
                { value: "Certificate Issued", label: "Cert. Issued" },
                { value: "Alumni Updated", label: "Alumni Updated" },
                { value: "Lost", label: "Lost" }
            ];
        } else if (category === "Old") {
            return [
                { value: "Verify Details", label: "Verify Details" },
                { value: "Identify Requirement", label: "Identify Req" },
                { value: "Offer Next Batch", label: "Offer Batch" },
                { value: "Registration Process", label: "Reg Process" },
                { value: "Completed", label: "Service Done" },
                { value: "Lost", label: "Lost" }
            ];
        } else { // Ongoing
            return [
                { value: "Verify Details", label: "Verify Details" },
                { value: "Identify Issue", label: "Identify Issue" },
                { value: "Assign Department", label: "Assign Dept" },
                { value: "Escalate to Manager", label: "Escalated" },
                { value: "Student Confirmation", label: "Confirmation" },
                { value: "Ticket Closed", label: "Closed" }
            ];
        }
    };

    const statusStages = getStatusStages();

    if (isLoadingLead) {
        return (
            <div className="p-10 text-center text-muted-foreground text-sm max-w-5xl mx-auto">
                Loading student lifecycle CRM record...
            </div>
        );
    }

    if (!leadData) {
        return (
            <div className="p-10 text-center text-rose-500 font-semibold max-w-5xl mx-auto space-y-4">
                <p>Student lead record not found.</p>
                <Button onClick={() => router.push("/admin/manage/leads")}>Back to list</Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 w-full text-foreground bg-background min-h-screen">
            {/* Header & Stepper */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-border/40 pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                    <Button variant="ghost" onClick={() => router.push("/admin/manage/leads")} className="hover:bg-slate-900 border border-transparent hover:border-slate-800 h-9 -ml-2 sm:ml-0 px-2 sm:px-4">
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to List
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-headline font-semibold text-white">{name}</h1>
                            <div className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
                                {status}
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">Category: <strong>{category} Student</strong> • Source: <strong>{source}</strong></p>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <Button size="sm" variant="outline" className="border-border bg-slate-900/30 text-rose-500 hover:bg-rose-950/20 h-9 text-xs" onClick={handleDeleteLead}>
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete Lead
                    </Button>
                </div>
            </div>

            {/* Dynamic Stage Stepper */}
            <Card className="bg-card border-border shadow-md">
                <CardContent className="p-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <TrendingUp className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">Lifecycle Stepper - {category} Student</span>
                    </div>
                    <div className="flex overflow-x-auto pb-2 gap-2 snap-x w-full scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {(() => {
                            const currentStatusIdx = statusStages.findIndex(s => s.value === status);
                            return statusStages.map((stage, idx) => {
                                const isCurrent = status === stage.value;
                                const isClickable = currentStatusIdx === -1 || idx <= currentStatusIdx + 1 || stage.value === "Lost";
                                
                                return (
                                    <button
                                        key={stage.value}
                                        type="button"
                                        disabled={!isClickable}
                                        onClick={() => {
                                            if (isClickable) handleQuickStatusChange(stage.value);
                                        }}
                                        className={cn(
                                            "shrink-0 snap-start py-2 px-3 rounded-lg border text-xs font-bold transition-all duration-205 flex items-center gap-1.5",
                                            isCurrent 
                                                ? "bg-primary text-white border-primary shadow-sm cursor-default" 
                                                : isClickable
                                                    ? "bg-slate-950/40 border-border text-muted-foreground hover:text-white cursor-pointer active:scale-95"
                                                    : "bg-slate-950/20 border-border/50 text-muted-foreground/40 cursor-not-allowed"
                                        )}
                                    >
                                        <span className="text-[9px] opacity-60">#{idx + 1}</span>
                                        <span>{stage.label}</span>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Edit Form Profile */}
                <form onSubmit={handleProfileSubmit} className="lg:col-span-5 space-y-6">
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="border-b border-border/50 py-4 px-5">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" /> Edit Student Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-300">Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={name} onChange={e => setName(e.target.value)} required className="pl-9 bg-slate-950 border-input h-9 text-sm text-foreground" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-305">Student Registration / PA Number (Optional)</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Star className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            value={studentNumber} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setStudentNumber(val);
                                                // If student number is typed, automatically switch from "New" to "Old" category
                                                if (val.trim() && category === "New") {
                                                    setCategory("Old");
                                                }
                                            }} 
                                            placeholder="e.g. PA24205"
                                            className="pl-9 bg-slate-950 border-input h-9 text-sm text-foreground w-full" 
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleSearchStudent}
                                        disabled={isSearching || !studentNumber.trim()}
                                        className="h-9 px-4 bg-primary hover:bg-primary/90 text-white text-xs font-semibold shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5"
                                    >
                                        <Search className="h-3.5 w-3.5" />
                                        {isSearching ? "Searching..." : "Search"}
                                    </Button>
                                </div>
                            </div>

                            {/* Verified Student Info Card */}
                            {fetchedStudent && (
                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3 items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-sm">
                                                {fetchedStudent.full_name ? fetchedStudent.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "ST"}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                                    {fetchedStudent.full_name}
                                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Check className="h-3 w-3" /> Verified Student
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-muted-foreground">Student ID / Username: <strong className="text-primary">{fetchedStudent.student_id || fetchedStudent.username}</strong></p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFetchedStudent(null);
                                                setStudentNumber("");
                                                setName("");
                                                setPhone("");
                                                setEmail("");
                                                setCategory("New");
                                            }}
                                            className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer active:scale-95 px-2"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/30 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-primary" />
                                            <span>{fetchedStudent.telephone_1 || "No Phone"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-primary" />
                                            <span className="truncate">{fetchedStudent.e_mail || "No Email"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}                             <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-300">Phone Number (Optional)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={phone} onChange={e => setPhone(e.target.value)} className="pl-9 bg-slate-950 border-input h-9 text-sm text-foreground" />
                                </div>
                             </div>

                             <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-300">Email Address (Optional)</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-9 bg-slate-950 border-input h-9 text-sm text-foreground" />
                                </div>
                             </div>

                            {/* Source select cards */}
                            <div className="space-y-1.5 pt-2 border-t border-border/50">
                                <Label className="text-xs font-semibold text-slate-300">Inquiry Source</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {sourceOptions.map((opt) => {
                                        const isSelected = source === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setSource(opt.value)}
                                                className={cn(
                                                    "py-1.5 px-1 text-xs border rounded-lg transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 font-semibold",
                                                    isSelected 
                                                        ? "bg-primary/10 border-primary text-white" 
                                                        : "bg-slate-950/20 border-border text-muted-foreground hover:text-white"
                                                )}
                                            >
                                                <opt.icon className="h-3.5 w-3.5" />
                                                <span>{opt.label.split(' ')[0]}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Category selector */}
                            <div className="space-y-1.5 pt-2 border-t border-border/50">
                                <Label className="text-xs font-semibold text-slate-300">Student Category (Flow)</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categoryOptions.map((opt) => {
                                        const isSelected = category === opt.value;
                                        const isNewDisabled = opt.value === "New" && !!studentNumber.trim();
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                disabled={isNewDisabled}
                                                onClick={() => setCategory(opt.value)}
                                                className={cn(
                                                    "py-1.5 px-1 text-xs border rounded-lg transition-all duration-200 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-1 font-semibold",
                                                    isSelected 
                                                        ? "bg-primary/10 border-primary text-white" 
                                                        : "bg-slate-950/20 border-border text-muted-foreground hover:text-white",
                                                    isNewDisabled && "opacity-40 cursor-not-allowed text-muted-foreground/60 hover:bg-transparent hover:border-border"
                                                )}
                                            >
                                                <opt.icon className="h-3.5 w-3.5" />
                                                <span>{opt.label.split(' ')[0]}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Inquiry Type Toggle Cards */}
                            <div className="space-y-1.5 pt-2 border-t border-border/50">
                                <Label className="text-xs font-semibold text-slate-300">Inquiry Type</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        key="general"
                                        type="button"
                                        onClick={() => {
                                            setInquiryType("general");
                                            setCourse("");
                                        }}
                                        className={cn(
                                            "py-1.5 px-3 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5",
                                            inquiryType === "general"
                                                ? "bg-primary/10 border-primary text-white"
                                                : "bg-slate-950/20 border-border text-muted-foreground hover:text-white"
                                        )}
                                    >
                                        <HelpCircle className="h-3.5 w-3.5" />
                                        <span>General Inquiry</span>
                                    </button>
                                    <button
                                        key="course"
                                        type="button"
                                        onClick={() => setInquiryType("course")}
                                        className={cn(
                                            "py-1.5 px-3 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5",
                                            inquiryType === "course"
                                                ? "bg-primary/10 border-primary text-white"
                                                : "bg-slate-950/20 border-border text-muted-foreground hover:text-white"
                                        )}
                                    >
                                        <BookOpen className="h-3.5 w-3.5" />
                                        <span>Course Related</span>
                                    </button>
                                </div>
                            </div>

                            {/* Searchable Course Combobox */}
                            {inquiryType === "course" ? (
                                <div className="space-y-1 flex flex-col animate-in fade-in duration-200">
                                    <Label className="text-xs font-semibold text-slate-300 mb-1">Course / Batch Interest</Label>
                                    <Popover open={openCourseSelect} onOpenChange={setOpenCourseSelect}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCourseSelect}
                                                className="w-full justify-between bg-slate-950 border-input h-9 text-xs text-foreground text-left font-normal hover:bg-slate-900"
                                            >
                                                <span className="truncate">
                                                    {course ? (batches.find(b => b.courseCode === course || b.id === course)?.name || "Select Course") : "Select Course / Batch"}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-950 border-border" align="start">
                                            <Command className="bg-slate-950 border-none">
                                                <CommandInput placeholder="Search course/batch..." className="h-9 border-none text-xs text-white" />
                                                <CommandEmpty className="text-[11px] text-muted-foreground p-3 text-center">No course or batch found.</CommandEmpty>
                                                <ScrollArea className="h-60">
                                                    <CommandGroup className="text-slate-100">
                                                        {batches.map((b) => (
                                                            <CommandItem
                                                                key={b.id}
                                                                value={`${b.name} ${b.courseCode}`.toLowerCase()}
                                                                onSelect={() => {
                                                                    setCourse(b.courseCode);
                                                                    setOpenCourseSelect(false);
                                                                }}
                                                                className="text-xs hover:bg-primary/20 cursor-pointer py-2"
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", course === b.courseCode || course === b.id ? "opacity-100" : "opacity-0")} />
                                                                {b.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </ScrollArea>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-slate-355">Course / Batch Interest</Label>
                                    <Input 
                                        value="General / Non-course query" 
                                        disabled 
                                        className="bg-slate-900/40 border-input h-9 text-xs text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-300">Assign To Staff</Label>
                                <Input value={assigned} onChange={e => setAssigned(e.target.value)} className="bg-slate-950 border-input h-9 text-sm text-foreground" />
                            </div>

                            {/* Dynamic Old Student fields */}
                            {category === "Old" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/30">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-300">Requirement Type</Label>
                                        <Select value={requirementType} onValueChange={setRequirementType}>
                                            <SelectTrigger className="bg-slate-950 border-input h-9 text-xs text-foreground">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                                <SelectItem value="Certificate">Certificate</SelectItem>
                                                <SelectItem value="Transcript">Transcript</SelectItem>
                                                <SelectItem value="Recommendation Letter">Recommendation Letter</SelectItem>
                                                <SelectItem value="Next Course Information">Next Course Info</SelectItem>
                                                <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-300">Course Completed?</Label>
                                        <Select value={courseCompleted ? "yes" : "no"} onValueChange={(v) => setCourseCompleted(v === "yes")}>
                                            <SelectTrigger className="bg-slate-950 border-input h-9 text-xs text-foreground">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Ongoing Student fields */}
                            {category === "Ongoing" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/30">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-300">Identify Issue Type</Label>
                                        <Select value={issueType} onValueChange={setIssueType}>
                                            <SelectTrigger className="bg-slate-950 border-input h-9 text-xs text-foreground">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                                <SelectItem value="Academic">Academic Issue</SelectItem>
                                                <SelectItem value="LMS Access">LMS Access</SelectItem>
                                                <SelectItem value="Payment">Payment / Dues</SelectItem>
                                                <SelectItem value="Study Pack">Study Pack / Materials</SelectItem>
                                                <SelectItem value="Examination">Examination</SelectItem>
                                                <SelectItem value="Certificate">Certificate Request</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-300">Assign to Department</Label>
                                        <Select value={assignedDepartment} onValueChange={setAssignedDepartment}>
                                            <SelectTrigger className="bg-slate-950 border-input h-9 text-xs text-foreground">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                                <SelectItem value="Call Center">Call Center</SelectItem>
                                                <SelectItem value="Student Support">Student Support</SelectItem>
                                                <SelectItem value="Operations">Operations Unit</SelectItem>
                                                <SelectItem value="Academic Team">Academic Team</SelectItem>
                                                <SelectItem value="Certificate Unit">Certificate Unit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-300">Main Inquiry Notes</Label>
                                <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-slate-950 border-input text-xs min-h-[60px]" />
                            </div>
                        </CardContent>
                        <CardFooter className="p-5 border-t border-border/50 flex justify-end">
                            <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 text-xs font-semibold h-9 px-4">
                                <Save className="h-4 w-4" /> Save Profile Info
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* Right Column: Follow-up Timeline & Actions */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Log Activity Card */}
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="border-b border-border/50 py-4 px-5">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" /> Log Interaction Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {/* Touch Actions Selection */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-355">Select Activity Type</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { val: "Call Completed", label: "Completed Call", icon: Phone, color: "text-amber-500" },
                                        { val: "Sent WhatsApp", label: "Sent WhatsApp", icon: MessageCircle, color: "text-emerald-500" },
                                        { val: "Sent Email", label: "Sent Email", icon: Mail, color: "text-cyan-500" },
                                        { val: "Follow-up Note", label: "Follow-up Note", icon: Clock, color: "text-indigo-500" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setNewLogAction(opt.val)}
                                            className={cn(
                                                "py-1.5 px-1 text-xs border rounded-lg transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 justify-center font-semibold",
                                                newLogAction === opt.val 
                                                    ? "bg-primary/10 border-primary text-white" 
                                                    : "bg-slate-950/20 border-border text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            <opt.icon className={cn("h-3.5 w-3.5", opt.color)} />
                                            <span>{opt.label.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleAddLogSubmit} className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-slate-355">Activity Log Details</Label>
                                    <Textarea 
                                        value={newLogNotes} 
                                        onChange={e => setNewLogNotes(e.target.value)} 
                                        placeholder="Record call feedback or whatsapp chat details..."
                                        className="bg-slate-950 border-input text-xs min-h-[60px]"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={addLogMutation.isPending} className="bg-primary hover:bg-primary/95 text-white text-xs font-semibold h-8 px-4 flex items-center gap-1">
                                        Log Activity Note
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Integrated Process Flow Actions */}
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="border-b border-border/50 py-4 px-5">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" /> CRM Process Integrations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 flex flex-wrap gap-2">
                            {category === "New" && (
                                <>
                                    <Button size="sm" variant="outline" className="border-border bg-slate-900/30 text-xs font-semibold text-purple-400 hover:bg-purple-950/20" onClick={copyRegistrationLink}>
                                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Reg Link URL
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-border bg-slate-900/30 text-xs font-semibold text-sky-400 hover:bg-sky-950/20" onClick={() => handleQuickStatusChange("Registration Link Sent")}>
                                        <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Trigger "Registration Sent"
                                    </Button>
                                </>
                            )}
                            
                            {category === "Ongoing" && (
                                <Button size="sm" variant="outline" className="border-border bg-slate-900/30 text-xs font-semibold text-sky-400 hover:bg-sky-950/20" onClick={() => router.push('/admin/tickets')}>
                                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Go to Ticketing Desk <ExternalLink className="h-3 w-3 ml-2" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline History logs */}
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="border-b border-border/50 py-4 px-5">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" /> Follow-up Activity History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                {!leadData.logs || leadData.logs.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">No follow-up activity logs recorded.</p>
                                ) : (
                                    leadData.logs.map((log) => (
                                        <div key={log.id} className="relative pl-5 border-l border-border/80 pb-3">
                                            {/* Circular bullet */}
                                            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                            
                                            <div className="flex items-center justify-between text-xs font-bold text-white">
                                                <span>{log.action}</span>
                                                <span className="text-[10px] text-muted-foreground font-normal">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">By {log.staff_name}</div>
                                            {log.notes && (
                                                <p className="text-xs text-slate-300 mt-1.5 bg-slate-950/30 p-2.5 rounded border border-border/40 leading-relaxed">
                                                    {log.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
