"use client";

import React from "react";
import Link from "next/link";
import { Lock, CreditCard, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GradePaymentGateProps {
  children: React.ReactNode;
  /**
   * Whether the backend already marked this grade as locked
   */
  isLocked?: boolean;
  /**
   * Outstanding student balance for the course / overall
   */
  balance?: number | string | null;
  /**
   * Optional payment gate settings object
   */
  gateSettings?: {
    is_active?: boolean;
    restriction_mode?: string;
    minimum_due_amount?: number;
    custom_message?: string;
  } | null;
  /**
   * Presentation style: 'card' for whole sections, 'inline' for text/badges, 'banner' for alerts
   */
  type?: "card" | "inline" | "banner";
  /**
   * Course code to route to payment if relevant
   */
  courseCode?: string;
  /**
   * Custom payment URL (defaults to /dashboard/payments)
   */
  payUrl?: string;
  /**
   * Custom title
   */
  title?: string;
  /**
   * Optional custom classes
   */
  className?: string;
}

export function GradePaymentGate({
  children,
  isLocked,
  balance = 0,
  gateSettings,
  type = "card",
  courseCode,
  payUrl = "/dashboard/payments",
  title = "Complete Payment to View Grades",
  className,
}: GradePaymentGateProps) {
  const numericBalance =
    typeof balance === "number"
      ? balance
      : balance != null
      ? parseFloat(String(balance)) || 0
      : 0;

  // Determine if locked
  let locked = false;

  if (typeof isLocked === "boolean") {
    locked = isLocked;
  } else if (gateSettings) {
    if (gateSettings.is_active === false) {
      locked = false;
    } else if (gateSettings.restriction_mode === "fully_paid") {
      locked = numericBalance > 0;
    } else {
      const minDue = Number(gateSettings.minimum_due_amount) || 0;
      locked = numericBalance > minDue;
    }
  } else {
    // Default safe fallback if settings aren't loaded yet: any positive balance locks
    locked = numericBalance > 0;
  }

  // If not locked, render normal children
  if (!locked) {
    return <>{children}</>;
  }

  const message =
    gateSettings?.custom_message ||
    "Please complete your pending course payments to view your assignment grades and performance.";

  if (type === "inline") {
    return (
      <Link
        href={payUrl}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer",
          className
        )}
        title="Complete payment to view grade"
      >
        <Lock className="w-3 h-3" />
        <span>Pay to View</span>
      </Link>
    );
  }

  if (type === "banner") {
    return (
      <div
        className={cn(
          "p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{message}</p>
            {numericBalance > 0 && (
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Pending Due: LKR {numericBalance.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
          <Link href={payUrl}>
            <CreditCard className="w-4 h-4 mr-1.5" /> Complete Payment
          </Link>
        </Button>
      </div>
    );
  }

  // Card type (full section fallback)
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/[0.07] via-background to-amber-500/[0.03] p-6 text-center space-y-4 shadow-sm",
        className
      )}
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h4 className="text-base font-bold text-card-foreground flex items-center justify-center gap-1.5">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        {numericBalance > 0 && (
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs font-mono">
            Outstanding Due: LKR {numericBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-center">
        <Button
          asChild
          className="bg-amber-600 hover:bg-amber-700 text-white shadow-md font-semibold text-xs px-6 py-2 h-auto"
        >
          <Link href={payUrl}>
            <CreditCard className="w-4 h-4 mr-2" /> Make Payment Now
          </Link>
        </Button>
      </div>
    </div>
  );
}
export default GradePaymentGate;
