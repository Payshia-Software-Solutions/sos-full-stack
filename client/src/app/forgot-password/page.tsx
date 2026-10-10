'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LMS_API_URL } from '@/lib/config';
import { 
  ArrowLeft, 
  CheckCircle2, 
  KeyRound, 
  Loader2, 
  Lock, 
  Phone, 
  RotateCcw, 
  ShieldCheck, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [identifier, setIdentifier] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend OTP countdown timer
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({
        variant: "destructive",
        title: "Required Field",
        description: "Please enter your Student ID (Username), Mobile Number, or Email.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${LMS_API_URL}/password-reset/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setStudentNumber(data.student_number || identifier.trim());
      setMaskedPhone(data.masked_phone || '');
      setStep(2);
      setResendTimer(60); // 60s cooldown

      toast({
        title: "OTP Sent!",
        description: `Verification code sent via SMS to ${data.masked_phone || 'your phone'}.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${LMS_API_URL}/password-reset/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: studentNumber || identifier.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code.');
      }

      setResendTimer(60);
      toast({
        title: "New OTP Sent!",
        description: `A new code has been sent to ${data.masked_phone || 'your phone'}.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: err.message || "Could not resend OTP.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 4) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code received on your phone.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${LMS_API_URL}/password-reset/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: studentNumber,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired OTP.');
      }

      setResetToken(data.token);
      setStep(3);
      toast({
        title: "Code Verified!",
        description: "Please set your new password below.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: err.message || "Verification code is invalid.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Do Not Match",
        description: "Please make sure both passwords match.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${LMS_API_URL}/password-reset/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setStep(4);
      toast({
        title: "Password Reset Successful!",
        description: "You can now log in with your new password.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: err.message || "Failed to update your password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex min-h-screen items-center justify-center p-4", "auth-background")}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Image
              unoptimized
              src="https://content-provider.pharmacollege.lk/app-icon/android-chrome-192x192.png"
              alt="SOS App Logo"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>

          {step === 1 && (
            <>
              <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
              <CardDescription>
                Enter your details to receive a verification code on your phone
              </CardDescription>
            </>
          )}

          {step === 2 && (
            <>
              <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                <Phone className="h-6 w-6 text-primary" />
                Enter OTP
              </CardTitle>
              <CardDescription>
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-foreground">
                  {maskedPhone || 'your registered phone number'}
                </span>
              </CardDescription>
            </>
          )}

          {step === 3 && (
            <>
              <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                New Password
              </CardTitle>
              <CardDescription>
                Account: <span className="font-semibold text-foreground">{studentNumber}</span>. Set your new password.
              </CardDescription>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex justify-center my-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline text-emerald-600 dark:text-emerald-400">
                All Set!
              </CardTitle>
              <CardDescription>
                Your password has been reset successfully.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Student ID, Phone, or Email</Label>
                <div className="relative">
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="e.g. PA12345, 0771234567, or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                    autoFocus
                  />
                  <KeyRound className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  An SMS containing a 6-digit OTP will be sent to the phone number on file.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={isSubmitting}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-12"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || otp.length < 4}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify Code
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                  }}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Change Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isSubmitting}
                  className={cn(
                    "inline-flex items-center font-medium",
                    resendTimer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:underline"
                  )}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || newPassword.length < 6 || newPassword !== confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Confirm & Reset Password'
                )}
              </Button>
            </form>
          )}

          {/* STEP 4: Success Message */}
          {step === 4 && (
            <div className="space-y-4 text-center py-2">
              <p className="text-sm text-muted-foreground">
                Your new password is now active. You can proceed to log in to your account.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">
                  Log In Now
                </Link>
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Log In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
