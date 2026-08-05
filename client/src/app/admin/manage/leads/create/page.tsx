"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBatches } from "@/lib/actions/courses";
import { createLead } from "@/lib/actions/leads";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Batch } from "@/lib/types";
import { 
    ArrowLeft, User, Phone, Mail, MessageSquare, Save, 
    Facebook, MessageCircle, Globe, HelpCircle, UserPlus, 
    History, GraduationCap, Check, ChevronsUpDown, BookOpen, Star,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

type SourceType = 'Call' | 'WhatsApp' | 'Facebook' | 'Website' | 'Email' | 'Other';
type StudentCategory = 'New' | 'Old' | 'Ongoing';

export default function CreateLeadPage() {
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

    // Dynamic Extra Fields
    const [requirementType, setRequirementType] = useState("General Inquiry");
    const [courseCompleted, setCourseCompleted] = useState(false);
    const [issueType, setIssueType] = useState("Academic");
    const [assignedDepartment, setAssignedDepartment] = useState("Student Support");

    // Combobox State
    const [openCourseSelect, setOpenCourseSelect] = useState(false);

    // Search Student States
    const [isSearching, setIsSearching] = useState(false);
    const [fetchedStudent, setFetchedStudent] = useState<any | null>(null);

    // Fetch batches
    const { data: batches = [] } = useQuery<Batch[]>({
        queryKey: ["allBatches"],
        queryFn: getBatches,
    });

    // Reset status when category changes to match the corresponding flow
    useEffect(() => {
        if (category === "New") {
            setStatus("Received");
        } else if (category === "Old") {
            setStatus("Verify Details");
        } else if (category === "Ongoing") {
            setStatus("Verify Details");
        }
    }, [category]);

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

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["leadStats"] });
            toast({ title: "Success", description: "Lead logged successfully" });
            router.push("/admin/manage/leads");
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ variant: "destructive", title: "Validation Error", description: "Student name is required" });
            return;
        }

        createMutation.mutate({
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
            creator_name: user?.name || "Staff"
        });
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
    const categoryOptions: { value: StudentCategory; label: string; description: string; icon: any; color: string }[] = [
        { value: 'New', label: 'New Student', description: 'Fresh lead inquiry', icon: UserPlus, color: 'text-sky-500' },
        { value: 'Old', label: 'Old Student', description: 'Past student services', icon: History, color: 'text-amber-500' },
        { value: 'Ongoing', label: 'Ongoing Student', description: 'Active student query', icon: GraduationCap, color: 'text-purple-500' },
    ];

    // Dynamic Status List based on selected Student Category Flow (Initial stages only for Create Lead)
    const getStatusOptions = () => {
        if (category === "New") {
            return [
                { value: "Received", label: "Lead Received" },
                { value: "Course Info Provided", label: "Info Provided" },
                { value: "Follow-up", label: "Follow-up" },
                { value: "Lost", label: "Lost" }
            ];
        } else if (category === "Old") {
            return [
                { value: "Verify Details", label: "Verify Details" },
                { value: "Identify Requirement", label: "Identify Req" },
                { value: "Lost", label: "Lost" }
            ];
        } else { // Ongoing
            return [
                { value: "Verify Details", label: "Verify Details" },
                { value: "Identify Issue", label: "Identify Issue" }
            ];
        }
    };

    const statusOptions = getStatusOptions();

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 w-full text-foreground bg-background min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-border/40 pb-4">
                <Button variant="ghost" onClick={() => router.back()} className="hover:bg-slate-900 border border-transparent hover:border-slate-800 h-9">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
                <div>
                    <h1 className="text-2xl font-headline font-semibold text-white">Log Student Inquiry</h1>
                    <p className="text-muted-foreground text-xs">Add a new student inquiry details into the CRM pipeline.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Student Details, Category & Source */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Information */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="py-4 px-5 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <User className="h-4 w-4 text-primary" /> Step 1: Student Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="full-name" className="text-xs font-semibold text-slate-355">Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="full-name" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="Student's name" 
                                        className="pl-9 bg-slate-950 border-input h-9 text-sm text-foreground"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="student-number" className="text-xs font-semibold text-slate-355">Student Registration / PA Number (Optional)</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Star className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="student-number" 
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
                            )}

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="phone-number" className="text-xs font-semibold text-slate-355">Phone Number (Optional)</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="phone-number" 
                                            value={phone} 
                                            onChange={e => setPhone(e.target.value)} 
                                            placeholder="e.g. 0771234567" 
                                            className="pl-9 bg-slate-950 border-input h-9 text-sm text-foreground"
                                            type="tel"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="email-address" className="text-xs font-semibold text-slate-355">Email Address (Optional)</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="email-address" 
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            placeholder="name@example.com" 
                                            className="pl-9 bg-slate-950 border-input h-9 text-sm text-foreground"
                                            type="email"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Select */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="py-4 px-5 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <GraduationCap className="h-4 w-4 text-primary" /> Step 2: Student Category (Flow Selector)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="grid grid-cols-3 gap-2">
                                {categoryOptions.map((opt) => {
                                    const IconComp = opt.icon;
                                    const isSelected = category === opt.value;
                                    const isNewDisabled = opt.value === "New" && !!studentNumber.trim();
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            disabled={isNewDisabled}
                                            onClick={() => setCategory(opt.value)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-200 cursor-pointer active:scale-95",
                                                isSelected 
                                                    ? "bg-primary/10 border-primary text-white" 
                                                    : "bg-slate-950/20 border-border text-muted-foreground hover:text-white",
                                                isNewDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:border-border text-muted-foreground/60"
                                            )}
                                        >
                                            <IconComp className={cn("h-5 w-5 mb-1.5", opt.color)} />
                                            <span className="font-bold text-[11px]">{opt.label.split(' ')[0]}</span>
                                            {isSelected && (
                                                <span className="text-[8px] bg-primary text-white font-bold px-1.5 py-0.2 mt-1 rounded">Active</span>
                                            )}
                                            {isNewDisabled && (
                                                <span className="text-[8px] bg-rose-500/20 text-rose-400 font-bold px-1 py-0.2 mt-1 rounded">Inactive</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Source Select */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="py-4 px-5 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <Phone className="h-4 w-4 text-primary" /> Step 3: Inquiry Channel / Source
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="grid grid-cols-3 gap-2">
                                {sourceOptions.map((opt) => {
                                    const IconComp = opt.icon;
                                    const isSelected = source === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setSource(opt.value)}
                                            className={cn(
                                                "flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer active:scale-95 text-xs font-semibold",
                                                isSelected 
                                                    ? "bg-primary/10 border-primary text-white" 
                                                    : "bg-slate-950/20 border-border text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            <div className={cn("p-1 rounded", opt.bgColor, opt.color)}>
                                                <IconComp className="h-4 w-4" />
                                            </div>
                                            <span>{opt.label.split(' ')[0]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Academic Details, Status & Submit */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Academic details & Dynamic Category Fields */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="py-4 px-5 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <MessageSquare className="h-4 w-4 text-primary" /> Step 4: Lifecycle & Academic Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            
                            {/* Inquiry Type Toggle Cards */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300">Inquiry Type</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInquiryType("general");
                                            setCourse("");
                                        }}
                                        className={cn(
                                            "py-2 px-3 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5",
                                            inquiryType === "general"
                                                ? "bg-primary/10 border-primary text-white"
                                                : "bg-slate-950/20 border-border text-muted-foreground hover:text-white"
                                        )}
                                    >
                                        <HelpCircle className="h-3.5 w-3.5" />
                                        <span>General Inquiry</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInquiryType("course")}
                                        className={cn(
                                            "py-2 px-3 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5",
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Searchable Course Combobox - Rendered Conditionally */}
                                {inquiryType === "course" ? (
                                    <div className="space-y-1 flex flex-col animate-in fade-in duration-205">
                                        <Label className="text-xs font-semibold text-slate-355 mb-1">Course / Batch Interest</Label>
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
                                    <Label htmlFor="assigned-to" className="text-xs font-semibold text-slate-355">Assign To Staff</Label>
                                    <Input 
                                        id="assigned-to" 
                                        value={assigned} 
                                        onChange={e => setAssigned(e.target.value)} 
                                        placeholder="Staff Name" 
                                        className="bg-slate-950 border-input h-9 text-sm text-foreground"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Fields for OLD STUDENT */}
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

                            {/* Dynamic Fields for ONGOING STUDENT */}
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
                                <Label htmlFor="notes" className="text-xs font-semibold text-slate-355">Conversation Notes</Label>
                                <Textarea 
                                    id="notes" 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    placeholder="Enter conversation details, query context..." 
                                    className="bg-slate-950 border-input text-xs min-h-[80px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pipeline Stage Select */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="py-4 px-5 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <Save className="h-4 w-4 text-primary" /> Step 5: Initial Pipeline Stage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="flex flex-wrap gap-1.5">
                                {statusOptions.map((opt) => {
                                    const isSelected = status === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setStatus(opt.value)}
                                            className={cn(
                                                "px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95",
                                                isSelected 
                                                    ? "bg-primary text-white border-primary shadow-sm" 
                                                    : "bg-slate-950/20 border-border text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 justify-end">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => router.back()} 
                            className="h-10 px-4 border border-border hover:bg-slate-900 text-slate-300 text-xs font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={createMutation.isPending} 
                            className="bg-primary hover:bg-primary/95 text-white h-10 px-6 text-xs font-semibold flex items-center gap-1.5"
                        >
                            {createMutation.isPending ? "Logging..." : (
                                <>
                                    <Save className="h-4 w-4" /> Save Student Lead
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
