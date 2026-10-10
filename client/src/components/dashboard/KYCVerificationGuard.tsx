'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentKycStatus } from '@/lib/actions/kyc';
import type { StudentDocumentVerification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Clock, XCircle, ArrowRight, FileCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface KYCVerificationGuardProps {
  children: React.ReactNode;
}

export function KYCVerificationGuard({ children }: KYCVerificationGuardProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const [kycDetails, setKycDetails] = useState<StudentDocumentVerification | null>(null);

  const isStudent = user?.role === 'student';
  const isVerified = user?.verification_status === 'Verified' || kycDetails?.status === 'approved';

  useEffect(() => {
    let isMounted = true;
    if (isStudent && !isVerified) {
      getStudentKycStatus(user.username || '')
        .then((data) => {
          if (isMounted) setKycDetails(data);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [isStudent, isVerified, user?.username, pathname]);

  // If staff or user is already verified or on the KYC page itself, render children with no banner
  const hideBanner = !isStudent || isVerified || pathname === '/dashboard/kyc';

  const currentStatus = kycDetails?.status || (user?.verification_status?.toLowerCase() as string) || 'not_submitted';

  return (
    <div className="flex flex-col flex-1 w-full min-h-0">
      {/* Sticky Top KYC Reminder Banner for Non-verified Students */}
      {!hideBanner && (
        <div className="w-full z-40 shrink-0">
          {currentStatus === 'pending' ? (
            /* Pending Under Review Banner */
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 shadow-sm">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                  <div className="p-1 bg-amber-500/20 rounded-full shrink-0">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>
                    <strong className="font-semibold">KYC Verification In Progress:</strong> Your document verification request is under review by our administration.
                  </span>
                </div>

                <Button asChild size="sm" variant="outline" className="border-amber-500/40 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 h-7 text-xs font-medium shrink-0">
                  <Link href="/dashboard/kyc" className="flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5" /> View Submitted Details
                  </Link>
                </Button>
              </div>
            </div>
          ) : currentStatus === 'rejected' ? (
            /* Rejected / Resubmission Banner */
            <div className="bg-gradient-to-r from-red-500/15 via-red-500/10 to-red-500/15 border-b border-red-500/30 px-4 py-2.5 shadow-sm">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-red-900 dark:text-red-200">
                  <div className="p-1 bg-red-500/20 rounded-full shrink-0">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span>
                    <strong className="font-semibold">KYC Verification Action Required:</strong> {kycDetails?.rejection_reason || 'Your documents were rejected. Please re-upload corrected copies.'}
                  </span>
                </div>

                <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs font-medium shrink-0">
                  <Link href="/dashboard/kyc" className="flex items-center gap-1.5">
                    Re-upload Documents <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Unverified / Not Submitted Reminder Banner */
            <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border-b border-primary/30 px-4 py-2.5 shadow-sm">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-foreground">
                  <div className="p-1 bg-primary/20 rounded-full shrink-0">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                  </div>
                  <span>
                    <strong className="font-semibold text-primary">Verify Your Identity:</strong> Please complete your Student Document Verification (KYC) by uploading your National ID and G.C.E. O/L certificates.
                  </span>
                </div>

                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs font-semibold shrink-0 shadow-sm">
                  <Link href="/dashboard/kyc" className="flex items-center gap-1.5">
                    Complete KYC Now <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Content - Always accessible */}
      <div className="flex-1 flex flex-col w-full min-h-0">
        {children}
      </div>
    </div>
  );
}
