'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Loader2, 
  Lock, 
  AlertTriangle, 
  Eye, 
  EyeOff 
} from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [validationError, setValidationError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsValidToken(false);
      setValidationError('No reset token was provided. Please request a new password reset link.');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${LMS_API_URL}/password-reset/validate-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValidToken(true);
          setStudentNumber(data.student_number || '');
        } else {
          setIsValidToken(false);
          setValidationError(data.message || 'This reset link has expired or is invalid.');
        }
      } catch (err: any) {
        setIsValidToken(false);
        setValidationError(err.message || 'Failed to validate reset link.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
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
          token: token,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Password reset successful! You can now log in.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update password.",
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

          {isValidating && (
            <>
              <CardTitle className="text-2xl font-headline">Checking Link...</CardTitle>
              <CardDescription>Verifying your password reset token</CardDescription>
            </>
          )}

          {!isValidating && !isValidToken && !isSuccess && (
            <>
              <div className="flex justify-center my-2">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline text-destructive">Invalid Link</CardTitle>
              <CardDescription>{validationError}</CardDescription>
            </>
          )}

          {!isValidating && isValidToken && !isSuccess && (
            <>
              <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                Reset Password
              </CardTitle>
              <CardDescription>
                {studentNumber ? `Account: ${studentNumber}. ` : ''}Enter your new password below.
              </CardDescription>
            </>
          )}

          {isSuccess && (
            <>
              <div className="flex justify-center my-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline text-emerald-600 dark:text-emerald-400">
                Password Updated!
              </CardTitle>
              <CardDescription>
                Your password has been reset successfully.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {isValidating && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validating token, please wait...</p>
            </div>
          )}

          {!isValidating && !isValidToken && !isSuccess && (
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/forgot-password">
                  Request New OTP
                </Link>
              </Button>
            </div>
          )}

          {!isValidating && isValidToken && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  'Reset Password'
                )}
              </Button>
            </form>
          )}

          {isSuccess && (
            <div className="space-y-4 text-center py-2">
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
