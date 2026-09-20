"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Ticket, StaffMember } from "@/lib/types";
import { getAdminTickets } from "@/lib/actions/tickets";
import { getStaffMembers } from "@/lib/actions/users";
import { StudentDeskHeader } from "@/components/admin/student-desk-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    Users, LifeBuoy, CheckCircle2, Clock, AlertTriangle,
    Search, Trophy, Star, ArrowUpRight, ChevronRight,
    TrendingUp, ShieldCheck, UserCheck, BarChart3, Filter,
    Check, ArrowUpDown, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffPerformancePage() {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [timeframe, setTimeframe] = useState<"all" | "30d" | "7d">("all");
    const [sortBy, setSortBy] = useState<"assigned" | "resolved" | "rate" | "open">("resolved");
    const [selectedStaffForModal, setSelectedStaffForModal] = useState<StaffMember | null>(null);

    // Fetch Tickets
    const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<Ticket[]>({
        queryKey: ["admin-tickets"],
        queryFn: getAdminTickets,
    });

    // Fetch Staff Members
    const { data: staffMembers = [], isLoading: isLoadingStaff } = useQuery<StaffMember[]>({
        queryKey: ["staffMembers"],
        queryFn: getStaffMembers,
        staleTime: 1000 * 60 * 5,
    });

    const isLoading = isLoadingTickets || isLoadingStaff;

    // Filter tickets by timeframe
    const filteredTickets = useMemo(() => {
        if (timeframe === "all") return tickets;

        const now = new Date().getTime();
        const days = timeframe === "30d" ? 30 : 7;
        const threshold = now - days * 24 * 60 * 60 * 1000;

        return tickets.filter((t) => {
            if (!t.createdAt) return false;
            return new Date(t.createdAt).getTime() >= threshold;
        });
    }, [tickets, timeframe]);

    // Calculate staff performance metrics
    const staffPerformanceList = useMemo(() => {
        return staffMembers.map((staff) => {
            const assigned = filteredTickets.filter((t) => {
                if (!t.assignedTo) return false;
                const matchUsername = t.assignedTo.toLowerCase() === staff.username.toLowerCase();
                const matchName = t.assignedTo.toLowerCase() === staff.name.toLowerCase();
                const matchId = t.assignedTo === staff.id;
                return matchUsername || matchName || matchId;
            });

            const openTickets = assigned.filter((t) => t.status === "Open");
            const inProgressTickets = assigned.filter((t) => t.status === "In Progress");
            const resolvedTickets = assigned.filter(
                (t) => t.status === "Closed" || (t.status as string) === "Resolved"
            );
            const urgentTickets = assigned.filter(
                (t) => t.priority === "High" && t.status !== "Closed" && (t.status as string) !== "Resolved"
            );

            const activeCount = openTickets.length + inProgressTickets.length;
            const totalAssigned = assigned.length;
            const resolutionRate = totalAssigned > 0 
                ? Math.round((resolvedTickets.length / totalAssigned) * 100) 
                : 0;

            // Rating calculation
            const ratedTickets = resolvedTickets.filter((t) => typeof t.rating === "number" && t.rating > 0);
            const avgRating = ratedTickets.length > 0
                ? +(ratedTickets.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedTickets.length).toFixed(1)
                : null;

            // Workload status badge
            let workloadStatus: { label: string; color: string } = { label: "Available", color: "text-slate-400 bg-slate-800/40 border-border/40" };
            if (activeCount > 8) {
                workloadStatus = { label: "Heavy", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
            } else if (activeCount > 3) {
                workloadStatus = { label: "Moderate", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
            } else if (activeCount > 0) {
                workloadStatus = { label: "Balanced", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
            }

            return {
                staff,
                totalAssigned,
                openCount: openTickets.length,
                inProgressCount: inProgressTickets.length,
                resolvedCount: resolvedTickets.length,
                urgentCount: urgentTickets.length,
                activeCount,
                resolutionRate,
                avgRating,
                workloadStatus,
                assignedTickets: assigned,
            };
        });
    }, [staffMembers, filteredTickets]);

    // Unassigned tickets
    const unassignedTickets = useMemo(() => {
        return filteredTickets.filter(
            (t) => !t.assignedTo || t.assignedTo.toLowerCase() === "unassigned"
        );
    }, [filteredTickets]);

    // Team Summary KPIs
    const teamStats = useMemo(() => {
        const totalTickets = filteredTickets.length;
        const totalResolved = filteredTickets.filter(
            (t) => t.status === "Closed" || (t.status as string) === "Resolved"
        ).length;
        const totalActive = filteredTickets.filter(
            (t) => t.status === "Open" || t.status === "In Progress"
        ).length;
        const totalUrgent = filteredTickets.filter(
            (t) => t.priority === "High" && t.status !== "Closed" && (t.status as string) !== "Resolved"
        ).length;

        const teamResolutionRate = totalTickets > 0 
            ? Math.round((totalResolved / totalTickets) * 100) 
            : 0;

        const activeStaffCount = staffPerformanceList.filter((s) => s.totalAssigned > 0).length;

        // Top Performer
        const topPerformer = [...staffPerformanceList].sort(
            (a, b) => b.resolvedCount - a.resolvedCount || b.resolutionRate - a.resolutionRate
        )[0];

        return {
            totalTickets,
            totalResolved,
            totalActive,
            totalUrgent,
            teamResolutionRate,
            activeStaffCount,
            topPerformer,
        };
    }, [filteredTickets, staffPerformanceList]);

    // Filtered and Sorted Staff List
    const displayedStaffList = useMemo(() => {
        return staffPerformanceList
            .filter((item) => {
                const query = searchTerm.toLowerCase().trim();
                if (!query) return true;
                const matchName = item.staff.name?.toLowerCase().includes(query);
                const matchUsername = item.staff.username?.toLowerCase().includes(query);
                const matchEmail = item.staff.email?.toLowerCase().includes(query);
                return matchName || matchUsername || matchEmail;
            })
            .sort((a, b) => {
                if (sortBy === "resolved") return b.resolvedCount - a.resolvedCount;
                if (sortBy === "assigned") return b.totalAssigned - a.totalAssigned;
                if (sortBy === "rate") return b.resolutionRate - a.resolutionRate;
                if (sortBy === "open") return b.activeCount - a.activeCount;
                return 0;
            });
    }, [staffPerformanceList, searchTerm, sortBy]);

    // Tickets for selected staff modal
    const modalStaffTickets = useMemo(() => {
        if (!selectedStaffForModal) return [];
        const staffItem = staffPerformanceList.find(
            (s) => s.staff.id === selectedStaffForModal.id
        );
        return staffItem?.assignedTickets || [];
    }, [selectedStaffForModal, staffPerformanceList]);

    return (
        <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-32 sm:pb-16 w-full text-foreground bg-background min-h-screen">
            {/* Header Switcher */}
            <StudentDeskHeader activeTab="performance" />

            {/* Top Team Metrics Cards - 2x2 on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
                <Card className="bg-card border-border/70 shadow-sm">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
                        <div className="p-2 sm:p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                Active Staff
                            </p>
                            <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">
                                {isLoading ? "..." : `${teamStats.activeStaffCount} / ${staffMembers.length}`}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/70 shadow-sm">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
                        <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                Team Resolution
                            </p>
                            <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">
                                {isLoading ? "..." : `${teamStats.teamResolutionRate}%`}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/70 shadow-sm">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
                        <div className="p-2 sm:p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                In Progress Workload
                            </p>
                            <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">
                                {isLoading ? "..." : teamStats.totalActive}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border/70 shadow-sm">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
                        <div className="p-2 sm:p-2.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                Pending Urgent
                            </p>
                            <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">
                                {isLoading ? "..." : teamStats.totalUrgent}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performer Banner (Desktop & Mobile) */}
            {teamStats.topPerformer && teamStats.topPerformer.resolvedCount > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <Flame className="h-3 w-3 fill-current text-amber-400" /> Top Support Performer
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                                {teamStats.topPerformer.staff.name}
                                <span className="text-xs text-slate-400 font-normal ml-1.5">
                                    (@{teamStats.topPerformer.staff.username})
                                </span>
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                        <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-border/60 text-center">
                            <span className="text-slate-400 block text-[10px]">Resolved</span>
                            <span className="text-emerald-400 font-bold">{teamStats.topPerformer.resolvedCount}</span>
                        </div>
                        <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-border/60 text-center">
                            <span className="text-slate-400 block text-[10px]">Success Rate</span>
                            <span className="text-amber-400 font-bold">{teamStats.topPerformer.resolutionRate}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Search Staff */}
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search staff name or username..."
                        className="pl-8 bg-slate-950/60 border-input h-9 text-xs text-foreground placeholder:text-muted-foreground w-full"
                    />
                </div>

                {/* Dropdowns Side-by-side */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                    {/* Timeframe Select */}
                    <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
                        <SelectTrigger className="w-full sm:w-[130px] bg-slate-950/60 border-input h-9 text-xs text-foreground">
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort By Select */}
                    <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                        <SelectTrigger className="w-full sm:w-[155px] bg-slate-950/60 border-input h-9 text-xs text-foreground">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-border text-slate-100 text-xs">
                            <SelectItem value="resolved">Most Resolved</SelectItem>
                            <SelectItem value="assigned">Most Assigned</SelectItem>
                            <SelectItem value="rate">Highest Success %</SelectItem>
                            <SelectItem value="open">Active Workload</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Staff Performance List Card */}
            <Card className="bg-card border-border shadow-md overflow-hidden">
                <CardHeader className="p-3.5 sm:p-5 bg-slate-950/60 border-b border-border/50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Staff Performance & Workload Overview
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Individual resolution velocity, assigned ticket queue, and workload distribution.
                        </p>
                    </div>

                    {unassignedTickets.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 shrink-0">
                            {unassignedTickets.length} Unassigned
                        </Badge>
                    )}
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-900/40" />
                            ))}
                        </div>
                    ) : displayedStaffList.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
                            <h4 className="text-sm font-semibold text-white">No staff records found</h4>
                            <p className="text-xs text-muted-foreground">Try clearing search filters.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {displayedStaffList.map((item, index) => {
                                const initials = item.staff.name
                                    ? item.staff.name.substring(0, 2).toUpperCase()
                                    : item.staff.username.substring(0, 2).toUpperCase();

                                return (
                                    <div
                                        key={item.staff.id}
                                        className="p-3.5 sm:px-5 sm:py-4 hover:bg-slate-900/25 transition-colors"
                                    >
                                        {/* MOBILE CARD VIEW (< sm) */}
                                        <div className="flex flex-col gap-2.5 sm:hidden">
                                            {/* Staff Info Row */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="font-mono text-xs font-bold text-slate-500 w-4">
                                                        #{index + 1}
                                                    </span>
                                                    <Avatar className="h-8 w-8 border border-border shrink-0">
                                                        <AvatarImage src={item.staff.avatar} />
                                                        <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{item.staff.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono truncate">@{item.staff.username}</p>
                                                    </div>
                                                </div>

                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-semibold border shrink-0", item.workloadStatus.color)}>
                                                    {item.workloadStatus.label}
                                                </span>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-border/40 text-center">
                                                <div>
                                                    <span className="text-[9px] text-slate-400 block">Assigned</span>
                                                    <span className="text-xs font-bold text-white">{item.totalAssigned}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 block">Active</span>
                                                    <span className="text-xs font-bold text-amber-400">{item.activeCount}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 block">Resolved</span>
                                                    <span className="text-xs font-bold text-emerald-400">{item.resolvedCount}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 block">Rate</span>
                                                    <span className="text-xs font-bold text-indigo-400">{item.resolutionRate}%</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar & Modal Trigger */}
                                            <div className="flex items-center justify-between gap-2 pt-1">
                                                <div className="flex-1">
                                                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${item.resolutionRate}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedStaffForModal(item.staff)}
                                                    className="h-7 px-2.5 text-[11px] font-semibold border-border bg-slate-900/50 hover:bg-slate-900 text-slate-300 cursor-pointer shrink-0"
                                                >
                                                    <span>View Tickets</span>
                                                    <ChevronRight className="h-3 w-3 ml-0.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* DESKTOP ROW VIEW (>= sm) */}
                                        <div className="hidden sm:flex sm:flex-row items-center justify-between gap-4">
                                            {/* Staff details */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <span className="font-mono text-xs font-bold text-slate-500 w-5">
                                                    #{index + 1}
                                                </span>
                                                <Avatar className="h-9 w-9 border border-border shrink-0">
                                                    <AvatarImage src={item.staff.avatar} />
                                                    <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-white truncate">{item.staff.name}</h4>
                                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-semibold border", item.workloadStatus.color)}>
                                                            {item.workloadStatus.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-mono truncate">
                                                        @{item.staff.username} • {item.staff.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Metrics Columns */}
                                            <div className="flex items-center gap-5 shrink-0">
                                                <div className="text-center min-w-[50px]">
                                                    <span className="text-[10px] text-slate-400 block font-medium">Assigned</span>
                                                    <span className="text-sm font-bold text-white">{item.totalAssigned}</span>
                                                </div>

                                                <div className="text-center min-w-[50px]">
                                                    <span className="text-[10px] text-slate-400 block font-medium">Active</span>
                                                    <span className="text-sm font-bold text-amber-400">{item.activeCount}</span>
                                                </div>

                                                <div className="text-center min-w-[55px]">
                                                    <span className="text-[10px] text-slate-400 block font-medium">Resolved</span>
                                                    <span className="text-sm font-bold text-emerald-400">{item.resolvedCount}</span>
                                                </div>

                                                <div className="min-w-[90px] text-right">
                                                    <span className="text-[10px] text-slate-400 block font-medium">
                                                        {item.resolutionRate}% Rate
                                                    </span>
                                                    <div className="w-20 bg-slate-900 rounded-full h-1.5 overflow-hidden ml-auto mt-1">
                                                        <div
                                                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${item.resolutionRate}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedStaffForModal(item.staff)}
                                                    className="h-8 px-3 text-xs font-semibold border-border bg-slate-900/40 hover:bg-slate-900 text-slate-300 cursor-pointer"
                                                >
                                                    <span>Inspect</span>
                                                    <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bottom spacer to prevent touching window edge */}
            <div className="h-8 sm:h-12 w-full shrink-0" aria-hidden="true" />

            {/* Staff Tickets Modal */}
            <Dialog open={!!selectedStaffForModal} onOpenChange={(open) => !open && setSelectedStaffForModal(null)}>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-slate-950 border border-border/80 text-white p-4 sm:p-6 rounded-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader className="pb-3 border-b border-border/50">
                        <DialogTitle className="text-base sm:text-lg font-bold flex items-center justify-between gap-2">
                            <span>
                                Tickets Handled by {selectedStaffForModal?.name}
                            </span>
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                {modalStaffTickets.length} Tickets
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-2.5 py-3 divide-y divide-border/20">
                        {modalStaffTickets.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No tickets currently recorded for this staff member.
                            </div>
                        ) : (
                            modalStaffTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-[11px] font-bold text-slate-400">#{ticket.id}</span>
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.2 rounded font-semibold",
                                                ticket.status === "Closed" || (ticket.status as string) === "Resolved"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : ticket.status === "In Progress"
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : "bg-amber-500/10 text-amber-400"
                                            )}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                                {ticket.category}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-white truncate mt-0.5">
                                            {ticket.subject}
                                        </p>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedStaffForModal(null);
                                            router.push(`/admin/tickets/${ticket.id}`);
                                        }}
                                        className="h-7 px-2.5 text-[11px] font-semibold border-border bg-slate-900/60 hover:bg-slate-900 text-slate-200 cursor-pointer shrink-0"
                                    >
                                        Open
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
