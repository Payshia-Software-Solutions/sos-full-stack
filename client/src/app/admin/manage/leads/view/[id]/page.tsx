"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLeads, Lead } from "@/lib/actions/leads";
import { 
    ArrowLeft, User, Phone, Mail, Clock, TrendingUp, Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ViewLeadPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();

    const { data: leadData, isLoading: isLoadingLead } = useQuery<Lead>({
        queryKey: ["lead", id],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_LMS_SERVER_URL}/leads/${id}/`);
            if (!response.ok) throw new Error("Failed to fetch lead info");
            return response.json();
        }
    });

    const getStatusStages = (category: string) => {
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
        } else {
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

    const statusStages = getStatusStages(leadData.student_type);
    const currentStatusIdx = statusStages.findIndex(s => s.value === leadData.status);

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 w-full text-foreground bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-border/40 pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                    <Button variant="ghost" onClick={() => router.push("/admin/manage/leads")} className="hover:bg-slate-900 border border-transparent hover:border-slate-800 h-9 -ml-2 sm:ml-0 px-2 sm:px-4">
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to List
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-headline font-semibold text-white">{leadData.full_name}</h1>
                            <div className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
                                {leadData.status}
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">Category: <strong>{leadData.student_type} Student</strong> • Source: <strong>{leadData.source}</strong></p>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white h-9 text-xs" onClick={() => router.push(`/admin/manage/leads/edit/${id}`)}>
                        <Edit className="h-4 w-4 mr-1.5" /> Edit Lead
                    </Button>
                </div>
            </div>

            {/* Read-Only Stepper */}
            <Card className="bg-card border-border shadow-md">
                <CardContent className="p-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <TrendingUp className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">Lifecycle Stepper - {leadData.student_type} Student (Read-Only)</span>
                    </div>
                    <div className="flex overflow-x-auto pb-2 gap-2 snap-x w-full scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {statusStages.map((stage, idx) => {
                            const isCurrent = leadData.status === stage.value;
                            const isPast = currentStatusIdx !== -1 && idx < currentStatusIdx && leadData.status !== "Lost";
                            
                            return (
                                <div
                                    key={stage.value}
                                    className={cn(
                                        "shrink-0 snap-start py-2 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 select-none",
                                        isCurrent 
                                            ? "bg-primary text-white border-primary shadow-sm" 
                                            : isPast
                                                ? "bg-primary/20 text-primary border-primary/30"
                                                : "bg-slate-950/40 border-border text-muted-foreground/70"
                                    )}
                                >
                                    <span className="text-[9px] opacity-60">#{idx + 1}</span>
                                    <span>{stage.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Read-Only Profile */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="border-b border-border/50 py-4 px-5">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" /> Student Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-1">Full Name</span>
                                    <span className="text-slate-100 font-medium">{leadData.full_name}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-1">Registration / PA Number</span>
                                    <span className="text-slate-100">{leadData.student_number || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-1">Phone Number</span>
                                    <div className="flex items-center gap-1.5 text-slate-100">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                        {leadData.phone_number || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-1">Email Address</span>
                                    <div className="flex items-center gap-1.5 text-slate-100 truncate">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                        {leadData.email || "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-1">Inquiry Type</span>
                                    <span className="text-slate-100">{leadData.course_id && leadData.course_id !== 'general' ? 'Course Related' : 'General Inquiry'}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-1">Course / Batch Interest</span>
                                    <span className="text-slate-100">{leadData.course_id === 'general' ? 'N/A' : (leadData.course_id || 'N/A')}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-1">Assigned To</span>
                                    <span className="text-slate-100">{leadData.assigned_to || "Unassigned"}</span>
                                </div>
                                
                                {leadData.student_type === "Old" && (
                                    <>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 block mb-1">Requirement Type</span>
                                            <span className="text-slate-100">{leadData.requirement_type || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 block mb-1">Course Completed</span>
                                            <span className="text-slate-100">{leadData.course_completed ? "Yes" : "No"}</span>
                                        </div>
                                    </>
                                )}
                                {leadData.student_type === "Ongoing" && (
                                    <>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 block mb-1">Issue Type</span>
                                            <span className="text-slate-100">{leadData.issue_type || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 block mb-1">Assigned Department</span>
                                            <span className="text-slate-100">{leadData.assigned_department || "N/A"}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-2">
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Main Inquiry Notes</span>
                                <div className="bg-slate-950/50 border border-border/40 text-xs text-slate-300 min-h-[60px] p-3 rounded-md whitespace-pre-wrap">
                                    {leadData.notes || "No notes provided."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Timeline History */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="bg-card border-border shadow-lg">
                        <CardHeader className="border-b border-border/50 py-4 px-5">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" /> Follow-up Activity History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
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
