"use client";

import React from "react";
import Link from "next/link";
import { Lock, CreditCard, ShieldAlert, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GradePaymentGateProps {
  children: React.ReactNode;
  /**
   * Whether backend marked the grade locked
   */
  isLocked?: boolean;
  /**
   * Outstanding student balance
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
   * Presentation style: 'card' for sections, 'inline' for badges/table rows
   */
  type?: "card" | "inline" | "banner";
  /**
   * Optional custom title
   */
  title?: string;
  /**
   * Course Code
   */
  courseCode?: string;
  className?: string;
}

export function GradePaymentGate({
  children,
  isLocked,
  balance = 0,
  gateSettings,
  type = "card",
  title = "Complete Payment to View Result",
  courseCode,
  className,
}: GradePaymentGateProps) {
  const numericBalance =
    typeof balance === "number"
      ? balance
      : balance != null
      ? parseFloat(String(balance)) || 0
      : 0;

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
    locked = numericBalance > 0;
  }

  if (!locked) {
    return <>{children}</>;
  }

  const message =
    gateSettings?.custom_message ||
    "Official grades and verification are withheld pending payment clearance. Please complete the pending course payment to view results.";

  if (type === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
          className
        )}
      >
        <Lock className="w-3.5 h-3.5" />
        <span>Payment Required</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-amber-500/30 bg-amber-500/[0.06] p-6 text-center space-y-4 shadow-sm",
        className
      )}
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
        <Lock className="w-6 h-6" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h4 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        {numericBalance > 0 && (
          <div className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs">
            Pending Due: LKR {numericBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md">
          <Link href="/contact">
            <CreditCard className="w-4 h-4 mr-2" /> Contact Accounts to Settle
          </Link>
        </Button>
      </div>
    </div>
  );
}
export default GradePaymentGate;
