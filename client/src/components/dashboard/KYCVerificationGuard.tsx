'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentKycStatus } from '@/lib/actions/kyc';
import type { StudentDocumentVerification } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Clock, XCircle, ArrowRight, LogOut, FileCheck } from 'lucide-react';
import Link from 'next/link';

interface KYCVerificationGuardProps {
  children: React.ReactNode;
}

export function KYCVerificationGuard({ children }: KYCVerificationGuardProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [kycDetails, setKycDetails] = useState<StudentDocumentVerification | null>(null);

  const isStudent = user?.role === 'student';
  const isVerified = user?.verification_status === 'Verified';

  useEffect(() => {
    // If student is not verified and not on the KYC page, redirect immediately
    if (isStudent && !isVerified && pathname !== '/dashboard/kyc') {
      router.replace('/dashboard/kyc');
    }
  }, [isStudent, isVerified, pathname, router]);

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
  }, [isStudent, isVerified, user?.username]);

  // Bypass for staff or when student is verified or when already on /dashboard/kyc
  if (!isStudent || isVerified || pathname === '/dashboard/kyc') {
    return <>{children}</>;
  }

  const currentStatus = user?.verification_status || kycDetails?.status || 'Unverified';

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh]">
      <Card className="max-w-xl w-full shadow-lg border-2 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            {currentStatus === 'Pending' || currentStatus === 'pending' ? (
              <Clock className="w-8 h-8 text-amber-500" />
            ) : currentStatus === 'Rejected' || currentStatus === 'rejected' ? (
              <XCircle className="w-8 h-8 text-red-500" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {currentStatus === 'Pending' || currentStatus === 'pending'
              ? 'Verification Under Review'
              : currentStatus === 'Rejected' || currentStatus === 'rejected'
              ? 'Verification Resubmission Needed'
              : 'Complete Your Student KYC Verification'}
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            {currentStatus === 'Pending' || currentStatus === 'pending'
              ? 'Your documents have been submitted and are currently being reviewed by the administration.'
              : currentStatus === 'Rejected' || currentStatus === 'rejected'
              ? 'Your verification documents were rejected. Please review the feedback and re-upload.'
              : 'National ID and G.C.E. O/L Certificate verification is mandatory to access your student portal.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {(currentStatus === 'Rejected' || currentStatus === 'rejected') && kycDetails?.rejection_reason && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg p-3 text-sm text-red-800 dark:text-red-300">
              <span className="font-semibold block mb-1">Reason for Rejection:</span>
              {kycDetails.rejection_reason}
            </div>
          )}

          {currentStatus === 'Pending' || currentStatus === 'pending' ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-300">
              <p>
                Our administration team is reviewing your ID and educational certificates. Once verified by an admin, full dashboard access will be unlocked.
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
              <p className="font-semibold text-foreground">Mandatory Documents Required:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong className="text-primary">National Identity Card (NIC) / Passport (Front Copy) *</strong></li>
                <li><strong className="text-primary">G.C.E. O/L Examination Certificate / Result Sheet *</strong></li>
                <li>Birth Certificate (උප්පැන්න සහතිකය)</li>
                <li>G.C.E. A/L Certificate / Result Sheet</li>
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between border-t pt-4">
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 w-full sm:w-auto">
            <LogOut className="w-4 h-4" /> Logout
          </Button>

          <Button asChild className="gap-2 w-full sm:w-auto">
            <Link href="/dashboard/kyc">
              <FileCheck className="w-4 h-4" />
              {currentStatus === 'Pending' || currentStatus === 'pending' ? 'View Submitted Documents' : 'Complete Verification Now'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
