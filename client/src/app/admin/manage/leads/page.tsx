"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getBatches } from "@/lib/actions/courses";
import { getLeads, getLeadStats, Lead, LeadStats } from "@/lib/actions/leads";
import type { Batch } from "@/lib/types";
import { StudentDeskHeader } from "@/components/admin/student-desk-header";
import { 
    Search, UserPlus, Phone, Mail, Clock, Filter, Edit2, 
    GraduationCap, CheckCircle, RefreshCw, MessageCircle, ExternalLink,
    Sparkles
} from "lucide-react";
import Link from "next/link";

export default function LeadManagementPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Filters & Search State
    const [search, setSearch] = useState("");
    const [source, setSource] = useState("all");
    const [studentType, setStudentType] = useState("all");
    const [status, setStatus] = useState("all");

    // Queries
    const filters = {
        source: source === "all" ? undefined : source,
        student_type: studentType === "all" ? undefined : studentType,
        status: status === "all" ? undefined : status,
        search: search ? search : undefined,
    };

    const { data: leads = [], isLoading: isLoadingLeads, refetch: refetchLeads } = useQuery<Lead[]>({
        queryKey: ["leads", filters],
        queryFn: () => getLeads(filters),
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery<LeadStats>({
        queryKey: ["leadStats"],
        queryFn: getLeadStats,
    });

    const { data: batches = [] } = useQuery<Batch[]>({
        queryKey: ["allBatches"],
        queryFn: getBatches,
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Received":
            case "Lead Received":
                return <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 font-medium">New Inquiry</Badge>;
            case "Course Info Provided":
                return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-medium">Info Provided</Badge>;
            case "Follow-up":
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">Follow-up</Badge>;
            case "Registration Link Sent":
                return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-medium">Reg Link Sent</Badge>;
            case "Registration Completed":
            case "Payment Verified":
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">Paid / Pending LMS</Badge>;
            case "Enrolled":
            case "Course Started":
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">Enrolled (Won)</Badge>;
            case "Lost":
            case "Closed":
                return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-medium">Lost</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getSourceBadge = (source: string) => {
        switch (source) {
            case "WhatsApp":
                return <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[11px]">WhatsApp</Badge>;
            case "Facebook":
                return <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/10 text-[11px]">Facebook</Badge>;
            case "Call":
                return <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[11px]">Phone Call</Badge>;
            case "Website":
                return <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 bg-indigo-500/10 text-[11px]">Website</Badge>;
            case "Email":
                return <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 bg-cyan-500/10 text-[11px]">Email</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-400 border-border text-[11px]">{source}</Badge>;
        }
    };

    const getCleanWaUrl = (phone: string | null, name: string) => {
        if (!phone) return null;
        let clean = phone.replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) clean = '94' + clean.slice(1);
        if (clean.length < 9) return null;
        const msg = encodeURIComponent(`Hello ${name}, thank you for inquiring about our courses at Pharmacollege.`);
        return `https://wa.me/${clean}?text=${msg}`;
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 text-foreground bg-background min-h-screen">
            {/* Unified Hub Header Switcher */}
            <StudentDeskHeader activeTab="leads" onTicketCreated={() => refetchLeads()} />

            {/* Admissions & Leads KPI Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Inquiries</p>
                            <h3 className="text-xl font-bold text-white mt-0.5">
                                {isLoadingStats ? "..." : stats?.total_leads || 0}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Follow-up Pending</p>
                            <h3 className="text-xl font-bold text-white mt-0.5">
                                {isLoadingStats ? "..." : stats?.follow_up_count || 0}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enrolled / Won</p>
                            <h3 className="text-xl font-bold text-white mt-0.5">
                                {isLoadingStats ? "..." : stats?.converted_count || 0}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                            <h3 className="text-xl font-bold text-white mt-0.5">
                                {isLoadingStats ? "..." : `${stats?.conversion_rate || 0}%`}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="bg-card border-border shadow-md">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search name, phone, email..." 
                            className="pl-9 bg-slate-950/50 border-input text-xs text-foreground placeholder:text-muted-foreground h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase">
                            <Filter className="h-3 w-3" /> Filters:
                        </div>
                        
                        <Select value={source} onValueChange={setSource}>
                            <SelectTrigger className="w-[125px] bg-slate-950/50 border-input text-xs text-foreground h-9">
                                <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="Call">Phone Call</SelectItem>
                                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                <SelectItem value="Facebook">Facebook</SelectItem>
                                <SelectItem value="Website">Website</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[150px] bg-slate-950/50 border-input text-xs text-foreground h-9">
                                <SelectValue placeholder="Pipeline Stage" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                                <SelectItem value="all">All Stages</SelectItem>
                                <SelectItem value="Received">New Inquiry</SelectItem>
                                <SelectItem value="Course Info Provided">Info Provided</SelectItem>
                                <SelectItem value="Follow-up">Follow-up</SelectItem>
                                <SelectItem value="Registration Link Sent">Reg Link Sent</SelectItem>
                                <SelectItem value="Enrolled">Enrolled (Won)</SelectItem>
                                <SelectItem value="Lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button 
                            onClick={() => refetchLeads()} 
                            variant="outline" 
                            size="icon" 
                            className="border-border bg-slate-900/30 h-9 w-9"
                            title="Refresh List"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Leads Table */}
            <Card className="bg-card border-border shadow-md overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-950/40 border-border">
                            <TableRow className="border-border/80 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-bold text-xs">Student Prospect</TableHead>
                                <TableHead className="text-slate-400 font-bold text-xs">Contact Info</TableHead>
                                <TableHead className="text-slate-400 font-bold text-xs">Channel</TableHead>
                                <TableHead className="text-slate-400 font-bold text-xs">Pipeline Stage</TableHead>
                                <TableHead className="text-slate-400 font-bold text-xs">Interested Course</TableHead>
                                <TableHead className="text-slate-400 font-bold text-xs">Inquiry Date</TableHead>
                                <TableHead className="text-right text-slate-400 font-bold pr-6 text-xs">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingLeads ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                                        Loading admissions inquiries database...
                                    </TableCell>
                                </TableRow>
                            ) : leads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                                        No prospective inquiries found matching current filter criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leads.map((lead) => {
                                    const matchedCourse = batches.find(b => b.id === lead.course_id || b.courseCode === lead.course_id);
                                    const waUrl = getCleanWaUrl(lead.phone_number, lead.full_name);

                                    return (
                                        <TableRow 
                                            key={lead.id} 
                                            className="border-border/30 hover:bg-slate-900/20 cursor-pointer transition-colors" 
                                            onClick={() => router.push(`/admin/manage/leads/edit/${lead.id}`)}
                                        >
                                            <TableCell className="font-semibold text-white text-xs">
                                                {lead.full_name}
                                                {lead.assigned_to && (
                                                    <span className="block text-[10px] text-muted-foreground font-normal">
                                                        Assigned: {lead.assigned_to}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-0.5">
                                                    {lead.phone_number ? (
                                                        <div className="flex items-center gap-1.5 text-slate-200">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            <span>{lead.phone_number}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-[11px]">No phone</span>
                                                    )}
                                                    {lead.email && (
                                                        <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[150px]">
                                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                                            <span>{lead.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getSourceBadge(lead.source)}</TableCell>
                                            <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                            <TableCell className="text-xs font-medium text-slate-300">
                                                {matchedCourse ? matchedCourse.name : (lead.course_id && lead.course_id !== 'general' ? lead.course_id : "General Inquiry")}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* WhatsApp Trigger */}
                                                    {waUrl && (
                                                        <a 
                                                            href={waUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-400 border border-border/40 hover:border-emerald-500/30 transition-colors"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            <MessageCircle className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}

                                                    {/* Phone Call Trigger */}
                                                    {lead.phone_number && (
                                                        <a 
                                                            href={`tel:${lead.phone_number}`}
                                                            className="p-1.5 rounded-md hover:bg-amber-500/10 text-amber-400 border border-border/40 hover:border-amber-500/30 transition-colors"
                                                            title="Call Student"
                                                        >
                                                            <Phone className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}

                                                    {/* Manage / Edit Lead */}
                                                    <Link href={`/admin/manage/leads/edit/${lead.id}`} passHref>
                                                        <Button size="sm" variant="ghost" className="hover:bg-slate-900 hover:text-white text-xs h-7 px-2">
                                                            <Edit2 className="h-3 w-3 mr-1" /> Manage
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
