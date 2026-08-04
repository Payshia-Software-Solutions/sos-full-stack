"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { 
    Search, UserPlus, Phone, Mail, Clock, Filter, Edit2, 
    GraduationCap, CheckCircle, RefreshCw, Star
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
                return <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20">{status}</Badge>;
            case "Course Info Provided":
            case "Follow-up":
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{status}</Badge>;
            case "Registration Link Sent":
                return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">{status}</Badge>;
            case "Registration Completed":
            case "Payment Verified":
            case "Student Registered":
            case "Welcome Message Sent":
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{status}</Badge>;
            case "Study Pack Ordered":
            case "Study Pack Dispatched":
            case "Added to WhatsApp / LMS":
                return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{status}</Badge>;
            case "Enrolled":
            case "Course Started":
            case "Progress Monitoring":
            case "Assessment Verified":
                return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{status}</Badge>;
            case "Certificate Approved":
            case "Certificate Printed":
            case "Certificate Issued":
            case "Alumni Updated":
                return <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20">{status}</Badge>;
            case "Lost":
            case "Closed":
                return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">{status}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getSourceBadge = (source: string) => {
        switch (source) {
            case "WhatsApp":
                return <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">WhatsApp</Badge>;
            case "Facebook":
                return <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/5">Facebook</Badge>;
            case "Call":
                return <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5">Phone Call</Badge>;
            case "Website":
                return <Badge variant="outline" className="text-indigo-500 border-indigo-500/30 bg-indigo-500/5">Website</Badge>;
            case "Email":
                return <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/5">Email</Badge>;
            default:
                return <Badge variant="outline">{source}</Badge>;
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 pb-20 text-foreground bg-background min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-semibold text-white">Student Lead & CRM</h1>
                    <p className="text-muted-foreground text-sm">Log inquiries, follow up with students, and manage lifecycle phases.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => refetchLeads()} variant="outline" size="icon" className="border-border bg-slate-900/30">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Link href="/admin/manage/leads/create" passHref>
                        <Button className="bg-primary hover:bg-primary/95 text-white font-semibold">
                            <UserPlus className="h-4 w-4 mr-2" /> Log New Lead
                        </Button>
                    </Link>
                </div>
            </header>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                            <Search className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Leads</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {isLoadingStats ? "..." : stats?.total_leads || 0}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {isLoadingStats ? "..." : `${stats?.conversion_rate || 0}%`}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Follow-up Pending</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {isLoadingStats ? "..." : stats?.follow_up_count || 0}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ongoing Students</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {isLoadingStats ? "..." : stats?.ongoing_count || 0}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="bg-card border-border shadow-md">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search name, phone, email..." 
                            className="pl-9 bg-slate-950/40 border-input text-foreground placeholder:text-muted-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase">
                            <Filter className="h-3 w-3" /> Filters:
                        </div>
                        
                        <Select value={source} onValueChange={setSource}>
                            <SelectTrigger className="w-[120px] bg-slate-950/40 border-input text-xs text-foreground">
                                <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-border text-slate-100">
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="Call">Phone Call</SelectItem>
                                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                <SelectItem value="Facebook">Facebook</SelectItem>
                                <SelectItem value="Website">Website</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={studentType} onValueChange={setStudentType}>
                            <SelectTrigger className="w-[130px] bg-slate-950/40 border-input text-xs text-foreground">
                                <SelectValue placeholder="Student Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-border text-slate-100">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="New">New Student</SelectItem>
                                <SelectItem value="Old">Old Student</SelectItem>
                                <SelectItem value="Ongoing">Ongoing</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[140px] bg-slate-950/40 border-input text-xs text-foreground">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-border text-slate-100">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Received">Lead Received</SelectItem>
                                <SelectItem value="Follow-up">Follow-up</SelectItem>
                                <SelectItem value="Registration Link Sent">Reg Link Sent</SelectItem>
                                <SelectItem value="Registration Completed">Reg Completed</SelectItem>
                                <SelectItem value="Payment Verified">Payment Verified</SelectItem>
                                <SelectItem value="Enrolled">Enrolled</SelectItem>
                                <SelectItem value="Lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Leads Table */}
            <Card className="bg-card border-border shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-950/20 border-border">
                            <TableRow className="border-border/80 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-bold">Student Name</TableHead>
                                <TableHead className="text-slate-400 font-bold">Contact Info</TableHead>
                                <TableHead className="text-slate-400 font-bold">Source</TableHead>
                                <TableHead className="text-slate-400 font-bold">Type</TableHead>
                                <TableHead className="text-slate-400 font-bold">Status</TableHead>
                                <TableHead className="text-slate-400 font-bold">Interested Course</TableHead>
                                <TableHead className="text-slate-400 font-bold">Created Date</TableHead>
                                <TableHead className="text-right text-slate-400 font-bold pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingLeads ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                        Loading student leads database...
                                    </TableCell>
                                </TableRow>
                            ) : leads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                        No leads found matching current filter criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leads.map((lead) => {
                                    const matchedCourse = batches.find(b => b.id === lead.course_id || b.courseCode === lead.course_id);
                                    return (
                                        <TableRow 
                                            key={lead.id} 
                                            className="border-border/30 hover:bg-slate-900/10 cursor-pointer transition-colors" 
                                            onClick={() => router.push(`/admin/manage/leads/view/${lead.id}`)}
                                        >
                                            <TableCell className="font-semibold text-white">{lead.full_name}</TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-0.5">
                                                    {lead.phone_number && <div className="flex items-center gap-1 text-slate-350"><Phone className="h-3 w-3 text-muted-foreground" /> {lead.phone_number}</div>}
                                                    {lead.email && <div className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3 text-muted-foreground" /> {lead.email}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getSourceBadge(lead.source)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-900/30 text-slate-300 border-border/80">
                                                    {lead.student_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                            <TableCell className="text-sm font-medium text-slate-300">
                                                {matchedCourse ? matchedCourse.name : lead.course_id || "General Inquiry"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                                <Link href={`/admin/manage/leads/view/${lead.id}`} passHref>
                                                    <Button size="sm" variant="ghost" className="hover:bg-slate-900 hover:text-white text-xs">
                                                        <Edit2 className="h-3.5 w-3.5 mr-1" /> View Details
                                                    </Button>
                                                </Link>
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
