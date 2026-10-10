"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import Link from "next/link";
import { 
    ArrowLeft, User, Phone, Mail, MessageSquare, Save, 
    Facebook, MessageCircle, Globe, HelpCircle, UserPlus, 
    LifeBuoy, Check, ChevronsUpDown, BookOpen, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type SourceType = 'Call' | 'WhatsApp' | 'Facebook' | 'Website' | 'Email' | 'Other';

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
    const [source, setSource] = useState<SourceType>("WhatsApp");
    const [course, setCourse] = useState("");
    const [status, setStatus] = useState("Received");
    const [assigned, setAssigned] = useState("");
    const [notes, setNotes] = useState("");

    // Inquiry Type State
    const [inquiryType, setInquiryType] = useState<"general" | "course">("course");

    // Combobox State
    const [openCourseSelect, setOpenCourseSelect] = useState(false);

    // Fetch batches
    const { data: batches = [] } = useQuery<Batch[]>({
        queryKey: ["allBatches"],
        queryFn: getBatches,
    });

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            queryClient.invalidateQueries({ queryKey: ["leadStats"] });
            toast({ title: "Inquiry Logged", description: "Student lead added to admissions pipeline." });
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
            student_type: "New",
            course_id: inquiryType === "general" ? null : (course || null),
            status: status,
            assigned_to: assigned || user?.username || null,
            notes: notes || null,
            creator_name: user?.name || "Staff"
        });
    };

    // Source Options Config
    const sourceOptions: { value: SourceType; label: string; icon: any; color: string }[] = [
        { value: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500' },
        { value: 'Call', label: 'Phone Call', icon: Phone, color: 'text-amber-500' },
        { value: 'Facebook', label: 'Facebook / Social', icon: Facebook, color: 'text-blue-500' },
        { value: 'Website', label: 'Website Inquiry', icon: Globe, color: 'text-indigo-500' },
        { value: 'Email', label: 'Email', icon: Mail, color: 'text-cyan-500' },
        { value: 'Other', label: 'Other', icon: HelpCircle, color: 'text-slate-400' },
    ];

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 w-full text-foreground bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => router.back()} className="hover:bg-slate-900 border border-border/40 h-9">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Desk
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-headline font-bold text-white">Log Prospective Student Inquiry</h1>
                        <p className="text-muted-foreground text-xs">Add a new admissions lead into the enrollment pipeline.</p>
                    </div>
                </div>

                {/* Switch to Ticket Desk Option */}
                <Link href={`/admin/tickets/create?name=${encodeURIComponent(name)}&notes=${encodeURIComponent(notes)}`}>
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold h-9"
                    >
                        <LifeBuoy className="h-4 w-4 mr-1.5" /> Is this an Enrolled Student? (Log Ticket)
                    </Button>
                </Link>
            </div>

            {/* Smart Notice for Existing Students */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                        <strong className="text-white">Note:</strong> This form is for <strong>New Course Inquiries & Admissions</strong>. For existing students needing help with LMS, Payments, or Exams, please use the Support Desk.
                    </span>
                </div>
                <Link href={`/admin/tickets/create?name=${encodeURIComponent(name)}&notes=${encodeURIComponent(notes)}`}>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary/90 text-xs font-semibold p-0 h-auto underline underline-offset-4"
                    >
                        Switch to Support Desk &rarr;
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Prospect Contact Info */}
                <div className="lg:col-span-6 space-y-6">
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="py-4 px-5 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <User className="h-4 w-4 text-primary" /> Prospect Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="full-name" className="text-xs font-semibold text-slate-300">Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="full-name" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        placeholder="e.g. Kasun Perera" 
                                        className="pl-9 bg-slate-950 border-input h-9 text-xs text-foreground"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Phone & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-300">Phone / WhatsApp Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="phone" 
                                            value={phone} 
                                            onChange={e => setPhone(e.target.value)} 
                                            placeholder="e.g. 0771234567" 
                                            className="pl-9 bg-slate-950 border-input h-9 text-xs text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email Address (Optional)</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="email" 
                                            type="email"
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            placeholder="name@example.com" 
                                            className="pl-9 bg-slate-950 border-input h-9 text-xs text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Channel Source */}
                            <div className="space-y-1.5 pt-2 border-t border-border/30">
                                <Label className="text-xs font-semibold text-slate-300">Inquiry Channel / Source</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {sourceOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setSource(opt.value)}
                                            className={cn(
                                                "p-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer text-left",
                                                source === opt.value
                                                    ? "bg-primary/10 border-primary text-white"
                                                    : "bg-slate-950/40 border-border text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            <opt.icon className={cn("h-4 w-4", opt.color)} />
                                            <span>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Course Interest & Pipeline */}
                <div className="lg:col-span-6 space-y-6">
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="py-4 px-5 border-b border-border/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                                <BookOpen className="h-4 w-4 text-primary" /> Course Interest & Pipeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {/* Inquiry Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300">Inquiry Type</Label>
                                    <Select value={inquiryType} onValueChange={(v: any) => setInquiryType(v)}>
                                        <SelectTrigger className="bg-slate-950 border-input h-9 text-xs text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                            <SelectItem value="course">Specific Course / Batch</SelectItem>
                                            <SelectItem value="general">General Program Inquiry</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300">Initial Pipeline Stage</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="bg-slate-950 border-input h-9 text-xs text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                            <SelectItem value="Received">New Inquiry Received</SelectItem>
                                            <SelectItem value="Course Info Provided">Course Info Provided</SelectItem>
                                            <SelectItem value="Follow-up">Follow-up Scheduled</SelectItem>
                                            <SelectItem value="Registration Link Sent">Reg Link Sent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Course Selector Combobox */}
                            {inquiryType === "course" && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300">Select Interested Course / Batch</Label>
                                    <Popover open={openCourseSelect} onOpenChange={setOpenCourseSelect}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCourseSelect}
                                                className="w-full justify-between bg-slate-950 border-input h-9 text-xs text-foreground text-left font-normal hover:bg-slate-900"
                                            >
                                                <span className="truncate">
                                                    {course ? (batches.find(b => b.courseCode === course || b.id === course)?.name || "Select Course") : "Select Course / Batch..."}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-950 border-border" align="start">
                                            <Command className="bg-slate-950 border-none">
                                                <CommandInput placeholder="Search course or batch..." className="h-9 border-none text-xs text-white" />
                                                <CommandEmpty className="text-[11px] text-muted-foreground p-3 text-center">No batch found.</CommandEmpty>
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
                            )}

                            {/* Assigned Staff */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300">Assign To Staff / Agent</Label>
                                <Input 
                                    value={assigned} 
                                    onChange={e => setAssigned(e.target.value)} 
                                    placeholder={user?.username || "e.g. staff.chamari"} 
                                    className="bg-slate-950 border-input h-9 text-xs text-foreground"
                                />
                            </div>

                            {/* Conversation / Inquiry Notes */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-300">Inquiry Notes / Questions Asked</Label>
                                <Textarea 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    placeholder="Record what the student asked, preferred schedule, budget, etc..." 
                                    className="bg-slate-950 border-input text-xs min-h-[85px] text-foreground"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Submit Actions */}
                    <div className="flex items-center gap-3 justify-end pt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => router.push("/admin/manage/leads")} 
                            className="h-9 px-4 border border-border/40 hover:bg-slate-900 text-xs font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={createMutation.isPending}
                            className="bg-primary hover:bg-primary/95 text-white h-9 px-5 text-xs font-semibold flex items-center gap-1.5"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {createMutation.isPending ? "Logging..." : "Log Admissions Lead"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
