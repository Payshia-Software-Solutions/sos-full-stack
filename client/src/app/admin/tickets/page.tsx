"use client";

import { useQuery } from '@tanstack/react-query';
import { ModernTicketDesk } from "@/components/admin/ModernTicketDesk";
import type { Ticket } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdminTickets } from '@/lib/actions/tickets';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StudentDeskHeader } from '@/components/admin/student-desk-header';
import { Card, CardContent } from "@/components/ui/card";
import { LifeBuoy, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

function TicketsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get('status') || 'Active';
  const { user } = useAuth();

  const { data: tickets = [], isLoading, isError, error, refetch } = useQuery<Ticket[]>({
    queryKey: ['admin-tickets'],
    queryFn: getAdminTickets,
  });

  const kpis = useMemo(() => {
    const total = tickets.length;
    const openCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const urgentCount = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved' && t.status !== 'Closed').length;

    return { total, openCount, resolvedCount, urgentCount };
  }, [tickets]);

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-32 sm:pb-16 w-full text-foreground bg-background min-h-screen">
      {/* Unified Switcher Header */}
      <StudentDeskHeader activeTab="tickets" onTicketCreated={() => refetch()} />

      {/* Support KPI Metrics Cards - 2x2 Compact Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        <Card className="bg-card border-border/70 shadow-sm">
          <CardContent className="p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <LifeBuoy className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Total Tickets</p>
              <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">{isLoading ? "..." : kpis.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-sm">
          <CardContent className="p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Active / In Prog</p>
              <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">{isLoading ? "..." : kpis.openCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-sm">
          <CardContent className="p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Resolved</p>
              <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">{isLoading ? "..." : kpis.resolvedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/70 shadow-sm">
          <CardContent className="p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Urgent / High</p>
              <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-none">{isLoading ? "..." : kpis.urgentCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3 pt-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-900/40" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center p-12 text-center border border-dashed rounded-xl border-border">
          <p className="text-rose-500 text-sm">Error: {error?.message || "Failed to load support tickets."}</p>
        </div>
      ) : (
        <div className="w-full">
          <ModernTicketDesk 
            tickets={tickets} 
            currentStaffId={user?.username}
            initialStatusFilter={initialStatusFilter}
            onLogTicketClick={() => router.push('/admin/tickets/create')}
          />
        </div>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Support Desk...</div>}>
      <TicketsPageContent />
    </Suspense>
  );
}
