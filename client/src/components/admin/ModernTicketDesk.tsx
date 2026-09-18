"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Ticket, TicketStatus, TicketPriority } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
    Search, Filter, ChevronRight, ChevronLeft, User, Clock, 
    AlertCircle, CheckCircle2, MessageSquare, ArrowUpDown,
    Check, Lock, ExternalLink, LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernTicketDeskProps {
    tickets: Ticket[];
    currentStaffId?: string;
    initialStatusFilter?: string;
    onLogTicketClick?: () => void;
}

export function ModernTicketDesk({
    tickets = [],
    currentStaffId,
    initialStatusFilter = "Active",
    onLogTicketClick
}: ModernTicketDeskProps) {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter === "all" ? "Active" : initialStatusFilter);
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [assignedToMe, setAssignedToMe] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // Dynamic Categories available in tickets list
    const availableCategories = useMemo(() => {
        const set = new Set<string>();
        tickets.forEach((t) => {
            if (t.category && t.category.trim()) {
                set.add(t.category.trim());
            }
        });
        return Array.from(set).sort();
    }, [tickets]);

    // Filter Logic
    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            // Search
            const query = searchTerm.toLowerCase().trim();
            if (query) {
                const matchId = ticket.id?.toString().toLowerCase().includes(query.replace("#", ""));
                const matchSubject = ticket.subject?.toLowerCase().includes(query);
                const matchStudentName = ticket.studentName?.toLowerCase().includes(query);
                const matchStudentNum = ticket.studentNumber?.toLowerCase().includes(query);
                const matchDesc = ticket.description?.toLowerCase().includes(query);
                if (!matchId && !matchSubject && !matchStudentName && !matchStudentNum && !matchDesc) {
                    return false;
                }
            }

            // Status filter: "Active" hides Closed/Resolved tickets
            if (statusFilter !== "all") {
                if (statusFilter === "Active") {
                    if (ticket.status === "Closed" || (ticket.status as string) === "Resolved") return false;
                } else if (statusFilter === "Closed") {
                    if (ticket.status !== "Closed" && (ticket.status as string) !== "Resolved") return false;
                } else if (ticket.status !== statusFilter) {
                    return false;
                }
            }

            // Category filter
            if (categoryFilter !== "all" && ticket.category !== categoryFilter) {
                return false;
            }

            // Priority filter
            if (priorityFilter !== "all" && ticket.priority !== priorityFilter) {
                return false;
            }

            // Assigned to me
            if (assignedToMe && currentStaffId) {
                if (ticket.assignedTo !== currentStaffId) return false;
            }

            return true;
        }).sort((a, b) => {
            // Open/In Progress first, then newest
            const isClosedA = (a.status === "Closed" || (a.status as string) === "Resolved") ? 1 : 0;
            const isClosedB = (b.status === "Closed" || (b.status as string) === "Resolved") ? 1 : 0;
            if (isClosedA !== isClosedB) return isClosedA - isClosedB;

            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });
    }, [tickets, searchTerm, statusFilter, categoryFilter, priorityFilter, assignedToMe, currentStaffId]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTickets.slice(start, start + pageSize);
    }, [filteredTickets, currentPage, pageSize]);

    // Relative Time Helper
    const formatRelativeTime = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffSec < 60) return "Just now";
            if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
            if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
            if (diffSec < 172800) return "Yesterday";
            if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
            return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        } catch {
            return dateStr;
        }
    };

    // Status Pill Helper
    const renderStatusBadge = (status: TicketStatus) => {
        switch (status) {
            case "Open":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Open
                    </span>
                );
            case "In Progress":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        In Progress
                    </span>
                );
            case "Closed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="h-3 w-3" />
                        Resolved
                    </span>
                );
            case "Snooze":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Clock className="h-3 w-3" />
                        Waiting
                    </span>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[11px]">
                        {status}
                    </Badge>
                );
        }
    };

    // Priority Pill Helper
    const renderPriorityBadge = (priority: TicketPriority) => {
        switch (priority) {
            case "High":
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <AlertCircle className="h-3 w-3" /> Urgent
                    </span>
                );
            case "Medium":
                return (
                    <span className="text-[11px] font-medium text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Medium
                    </span>
                );
            case "Low":
                return (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-border/40">
                        Low
                    </span>
                );
            default:
                return <span className="text-xs text-muted-foreground">{priority}</span>;
        }
    };

    return (
        <div className="space-y-4 pb-16 sm:pb-8">
            {/* Control & Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                {/* Status Quick Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-950/60 border border-border/60 rounded-xl overflow-x-auto">
                    {[
                        { 
                            id: "Active", 
                            label: "Active Tickets", 
                            count: tickets.filter(t => t.status !== "Closed" && (t.status as string) !== "Resolved").length 
                        },
                        { 
                            id: "Open", 
                            label: "Open", 
                            count: tickets.filter(t => t.status === "Open").length 
                        },
                        { 
                            id: "In Progress", 
                            label: "In Progress", 
                            count: tickets.filter(t => t.status === "In Progress").length 
                        },
                        { 
                            id: "Closed", 
                            label: "Resolved", 
                            count: tickets.filter(t => t.status === "Closed" || (t.status as string) === "Resolved").length 
                        },
                        { 
                            id: "all", 
                            label: "All History", 
                            count: tickets.length 
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setStatusFilter(tab.id);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                                statusFilter === tab.id
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted-foreground hover:text-white hover:bg-slate-900/60"
                            )}
                        >
                            <span>{tab.label}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                                statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-900 text-slate-400"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}

                    {currentStaffId && (
                        <button
                            type="button"
                            onClick={() => {
                                setAssignedToMe(!assignedToMe);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ml-1 border",
                                assignedToMe
                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                                    : "border-border/40 text-muted-foreground hover:text-white hover:bg-slate-900/60"
                            )}
                        >
                            <User className="h-3 w-3" />
                            <span>My Assigned</span>
                        </button>
                    )}
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search ticket #, subject, PA..."
                            className="pl-8 bg-slate-950/60 border-input h-9 text-xs text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Category Filter */}
                    <Select
                        value={categoryFilter}
                        onValueChange={(val) => {
                            setCategoryFilter(val);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[140px] bg-slate-950/60 border-input h-9 text-xs text-foreground">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                            <SelectItem value="all">All Categories</SelectItem>
                            {availableCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                            {availableCategories.length === 0 && (
                                <>
                                    <SelectItem value="Academic">Academic Support</SelectItem>
                                    <SelectItem value="LMS Access">LMS & App Access</SelectItem>
                                    <SelectItem value="Payment">Payment & Slips</SelectItem>
                                    <SelectItem value="Study Pack">Study Pack Courier</SelectItem>
                                    <SelectItem value="Examination">Exams & Quizzes</SelectItem>
                                    <SelectItem value="Certificate">Certificate & Conv.</SelectItem>
                                    <SelectItem value="Other">General Support</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>

                    {/* Priority Filter */}
                    <Select
                        value={priorityFilter}
                        onValueChange={(val) => {
                            setPriorityFilter(val);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[125px] bg-slate-950/60 border-input h-9 text-xs text-foreground">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="High">Urgent (High)</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Modern Ticket List Card */}
            <Card className="bg-card border-border shadow-md overflow-hidden">
                <CardContent className="p-0">
                    {paginatedTickets.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="p-3 rounded-full bg-slate-900/60 w-fit mx-auto text-muted-foreground border border-border/40">
                                <LifeBuoy className="h-6 w-6" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">No support tickets found</h4>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                No tickets match your current filters. Clear filters or log a new student support inquiry.
                            </p>
                            {onLogTicketClick && (
                                <Button
                                    onClick={onLogTicketClick}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs border-border bg-slate-900/40 text-white mt-2"
                                >
                                    + Log Support Ticket
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {paginatedTickets.map((ticket) => {
                                const paNumber = ticket.studentNumber || ticket.studentName;
                                const staffInitials = ticket.assignedTo
                                    ? ticket.assignedTo.substring(0, 2).toUpperCase()
                                    : null;

                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                                        className="group p-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-900/20 cursor-pointer transition-colors duration-150"
                                    >
                                        {/* Left: Status, ID & Subject */}
                                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                            {/* Status Badge */}
                                            <div className="shrink-0 pt-0.5 sm:pt-0">
                                                {renderStatusBadge(ticket.status)}
                                            </div>

                                            {/* Ticket ID */}
                                            <span className="shrink-0 font-mono text-xs font-semibold text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-border/40">
                                                #{ticket.id}
                                            </span>

                                            {/* Subject & Preview */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                                                        {ticket.subject}
                                                    </h3>
                                                    {ticket.isLocked && (
                                                        <span title="Locked by staff" className="shrink-0 text-amber-400">
                                                            <Lock className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                </div>
                                                {ticket.description && (
                                                    <p className="text-xs text-muted-foreground/80 truncate mt-0.5 max-w-xl">
                                                        {ticket.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Meta Badges, Student PA, Assignee & Time */}
                                        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-border/20">
                                            {/* Category Pill */}
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-normal bg-slate-900/50 text-slate-300 border-border/60"
                                            >
                                                {ticket.category || "General"}
                                            </Badge>

                                            {/* Priority Pill */}
                                            <div>
                                                {renderPriorityBadge(ticket.priority)}
                                            </div>

                                            {/* Student Identity */}
                                            <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <span className="font-medium text-slate-200 truncate max-w-[110px]" title={ticket.studentName}>
                                                    {ticket.studentName || paNumber}
                                                </span>
                                                {paNumber && (
                                                    <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                                        ({paNumber})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Assigned Staff Avatar / Tag */}
                                            <div className="shrink-0" title={ticket.assignedTo ? `Assigned to ${ticket.assignedTo}` : "Unassigned"}>
                                                {ticket.assignedTo ? (
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900/40 px-2 py-0.5 rounded-full border border-border/40">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={ticket.assigneeAvatar} />
                                                            <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                                                                {staffInitials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="max-w-[70px] truncate">{ticket.assignedTo}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/60 border border-dashed border-border/60 px-1.5 py-0.5 rounded">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </div>

                                            {/* Created Time */}
                                            <span className="text-[11px] text-muted-foreground shrink-0 min-w-[50px] text-right">
                                                {formatRelativeTime(ticket.createdAt)}
                                            </span>

                                            {/* Chevron indicator */}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {filteredTickets.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground px-3 py-3 bg-slate-950/60 border border-border/60 rounded-xl">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <span>
                            Showing <strong className="text-white font-medium">{Math.min(filteredTickets.length, (currentPage - 1) * pageSize + 1)}</strong> -{" "}
                            <strong className="text-white font-medium">{Math.min(filteredTickets.length, currentPage * pageSize)}</strong> of{" "}
                            <strong className="text-white font-medium">{filteredTickets.length}</strong> tickets
                        </span>

                        {/* Page Size Selector */}
                        <div className="flex items-center gap-1.5 ml-auto sm:ml-4">
                            <span className="text-[11px] text-muted-foreground hidden sm:inline">Per page:</span>
                            <div className="flex items-center bg-slate-900/80 border border-border/50 rounded-lg p-0.5">
                                {[10, 20, 50].map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => {
                                            setPageSize(size);
                                            setCurrentPage(1);
                                        }}
                                        className={cn(
                                            "px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer",
                                            pageSize === size
                                                ? "bg-primary text-white shadow-xs"
                                                : "text-muted-foreground hover:text-white"
                                        )}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => {
                                setCurrentPage((p) => Math.max(1, p - 1));
                                window.scrollTo({ top: 320, behavior: 'smooth' });
                            }}
                            className="h-8 px-2.5 text-xs border-border bg-slate-950/40 hover:bg-slate-900 cursor-pointer disabled:opacity-35"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                            Prev
                        </Button>
                        <span className="px-2.5 py-1 bg-slate-900/80 border border-border/50 rounded-lg text-xs font-semibold text-white">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => {
                                setCurrentPage((p) => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 320, behavior: 'smooth' });
                            }}
                            className="h-8 px-2.5 text-xs border-border bg-slate-950/40 hover:bg-slate-900 cursor-pointer disabled:opacity-35"
                        >
                            Next
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
