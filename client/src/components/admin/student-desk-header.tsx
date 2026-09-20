"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLeadStats } from "@/lib/actions/leads";
import { getAdminTickets } from "@/lib/actions/tickets";
import { 
    UserPlus, LifeBuoy, Users, MessageSquare, ArrowRight, 
    Layers, ChevronRight, PhoneCall, CheckCircle2, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentDeskHeaderProps {
    activeTab: "leads" | "tickets";
    onTicketCreated?: () => void;
}

export function StudentDeskHeader({ activeTab, onTicketCreated }: StudentDeskHeaderProps) {
    const router = useRouter();

    // Live Lead stats
    const { data: leadStats } = useQuery({
        queryKey: ["leadStats"],
        queryFn: getLeadStats,
        staleTime: 30000,
    });

    // Live Ticket stats
    const { data: adminTickets = [] } = useQuery({
        queryKey: ["admin-tickets"],
        queryFn: getAdminTickets,
        staleTime: 30000,
    });

    const openTicketsCount = adminTickets.filter(
        (t) => t.status === "Open" || t.status === "In Progress"
    ).length;

    const followUpLeadsCount = leadStats?.follow_up_count || 0;

    return (
        <div className="space-y-4">
            {/* Top Bar: Title, Subtitle, and Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2 border-b border-border/40">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-headline font-bold text-white tracking-tight leading-tight">
                            Student Support Desk
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-[11px] sm:text-xs md:text-sm mt-0.5 line-clamp-1 sm:line-clamp-none">
                        Centralized communications for prospective inquiries and enrolled student tickets.
                    </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                    <Link href="/admin/tickets/categories" passHref className="flex-1 sm:flex-initial">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto border-border/70 bg-slate-900/50 hover:bg-slate-900 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 h-8 sm:h-9 cursor-pointer px-2.5"
                        >
                            <Settings className="h-3.5 w-3.5 text-primary" />
                            <span>Categories</span>
                        </Button>
                    </Link>

                    <Link href="/admin/tickets/create" passHref className="flex-1 sm:flex-initial">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto border-border bg-slate-900/50 hover:bg-slate-900 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 h-8 sm:h-9 cursor-pointer px-2.5"
                        >
                            <LifeBuoy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                            <span>Log Ticket</span>
                        </Button>
                    </Link>

                    <Link href="/admin/manage/leads/create" passHref className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 h-8 sm:h-9 px-3">
                            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Log New Lead</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Segmented Switcher / Navigation Tabs */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between bg-slate-950/60 p-1.5 rounded-xl border border-border/60">
                <div className="flex items-center gap-1.5 p-0.5 w-full sm:w-auto">
                    {/* Leads Tab */}
                    <Link href="/admin/manage/leads" className="flex-1 sm:flex-initial">
                        <div
                            className={cn(
                                "flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                                activeTab === "leads"
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:text-white hover:bg-slate-900/60"
                            )}
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>Admissions & Leads</span>
                            {followUpLeadsCount > 0 && (
                                <Badge
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                                        activeTab === "leads"
                                            ? "bg-white/20 text-white"
                                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    )}
                                >
                                    {followUpLeadsCount} Follow-up
                                </Badge>
                            )}
                        </div>
                    </Link>

                    {/* Support Tickets Tab */}
                    <Link href="/admin/tickets" className="flex-1 sm:flex-initial">
                        <div
                            className={cn(
                                "flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                                activeTab === "tickets"
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:text-white hover:bg-slate-900/60"
                            )}
                        >
                            <LifeBuoy className="h-4 w-4" />
                            <span>Helpdesk & Support Tickets</span>
                            {openTicketsCount > 0 && (
                                <Badge
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                                        activeTab === "tickets"
                                            ? "bg-white/20 text-white"
                                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    )}
                                >
                                    {openTicketsCount} Open
                                </Badge>
                            )}
                        </div>
                    </Link>
                </div>

                <div className="hidden lg:flex items-center gap-3 pr-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400 inline-block"></span>
                        Leads: Prospects & Inquiries
                    </span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block"></span>
                        Tickets: Enrolled Student Issues
                    </span>
                </div>
            </div>
        </div>
    );
}
