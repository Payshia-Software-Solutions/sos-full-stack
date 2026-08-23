'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentKycStatus, submitStudentKyc } from '@/lib/actions/kyc';
import type { StudentDocumentVerification, DocumentIdType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Preloader } from '@/components/ui/preloader';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  Lock,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface FileState {
  file: File | null;
  previewUrl: string | null;
}

const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

const resolveDocUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  if (url.startsWith('/student-documents/')) return `${CONTENT_PROVIDER_URL}${url}`;
  if (url.startsWith('/uploads/')) return `https://qa-api.pharmacollege.lk${url}`;
  return `${CONTENT_PROVIDER_URL}/${url.replace(/^\/+/, '')}`;
};

export default function StudentKycPage() {
  const { user } = useAuth();
  const [kycData, setKycData] = useState<StudentDocumentVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [idType, setIdType] = useState<DocumentIdType>('nic');
  const [idNumber, setIdNumber] = useState('');
  const [otherDocs, setOtherDocs] = useState('');

  // Files
  const [idFront, setIdFront] = useState<FileState>({ file: null, previewUrl: null });
  const [idBack, setIdBack] = useState<FileState>({ file: null, previewUrl: null });
  const [bcFront, setBcFront] = useState<FileState>({ file: null, previewUrl: null });
  const [bcBack, setBcBack] = useState<FileState>({ file: null, previewUrl: null });
  const [olCert, setOlCert] = useState<FileState>({ file: null, previewUrl: null });
  const [alCert, setAlCert] = useState<FileState>({ file: null, previewUrl: null });

  const loadKycStatus = useCallback(async () => {
    if (!user?.username) return;
    try {
      setIsLoading(true);
      const data = await getStudentKycStatus(user.username);
      setKycData(data);
      if (data) {
        if (data.id_type) setIdType(data.id_type);
        if (data.id_number) setIdNumber(data.id_number);
        if (data.other_documents) setOtherDocs(data.other_documents);
      }
    } catch (err: any) {
      console.error('Failed to load KYC status', err);
      setErrorMessage('Failed to load document verification status.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    loadKycStatus();
  }, [loadKycStatus]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FileState>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const preview = URL.createObjectURL(selectedFile);
      setter({ file: selectedFile, previewUrl: preview });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) return;

    // Check mandatory fields for submission
    if (!kycData?.id_front_image && !idFront.file) {
      setErrorMessage('Please upload the front copy of your Identification Document (NIC / Passport).');
      return;
    }

    if (!kycData?.ol_certificate && !olCert.file) {
      setErrorMessage('Please upload your G.C.E. O/L Examination Certificate or Result Sheet.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append('student_id', user.username);
      formData.append('id_type', idType);
      formData.append('id_number', idNumber);
      if (otherDocs) formData.append('other_documents', otherDocs);

      if (idFront.file) formData.append('id_front', idFront.file);
      if (idBack.file) formData.append('id_back', idBack.file);
      if (bcFront.file) formData.append('bc_front', bcFront.file);
      if (bcBack.file) formData.append('bc_back', bcBack.file);
      if (olCert.file) formData.append('ol_cert', olCert.file);
      if (alCert.file) formData.append('al_cert', alCert.file);

      const res = await submitStudentKyc(formData);
      if (res.success) {
        setSuccessMessage('Your documents have been submitted successfully for verification!');
        await loadKycStatus();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while uploading documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Preloader message="Checking document verification status..." />;
  }

  const status = kycData?.status || 'not_submitted';
  const isLockedForReview = status === 'pending';

  return (
    <div className="w-full py-6 px-4 md:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Student Document Verification (KYC)</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Official identification and educational certificates submitted for student identity verification.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {status === 'approved' && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1.5 px-3 py-1.5 text-sm">
              <CheckCircle2 className="h-4 w-4" /> Verified
            </Badge>
          )}
          {status === 'pending' && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 px-3 py-1.5 text-sm">
              <Clock className="h-4 w-4" /> Under Review (Pending)
            </Badge>
          )}
          {status === 'rejected' && (
            <Badge variant="destructive" className="gap-1.5 px-3 py-1.5 text-sm">
              <XCircle className="h-4 w-4" /> Resubmission Required
            </Badge>
          )}
          {status === 'not_submitted' && (
            <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1.5 px-3 py-1.5 text-sm">
              <AlertTriangle className="h-4 w-4" /> Verification Required
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-500 bg-green-50/50 text-green-900 dark:bg-green-950/20 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Status Notice Blocks */}
      {status === 'approved' && (
        <Card className="border-green-200 bg-green-50/40 dark:bg-green-950/20">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                  Your Account & Documents are Verified!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Your submitted identification and academic records have been approved by the administration.
                  Verified on {kycData?.verified_at ? new Date(kycData.verified_at).toLocaleDateString() : 'N/A'}.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-green-600 hover:bg-green-700">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'pending' && (
        <Card className="border-amber-200 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
                Verification Request Already Submitted & Under Review
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Your documents have been submitted and are currently locked for administrative review.
                You cannot re-submit or modify them until an administrator completes the verification process.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
                <Lock className="h-3.5 w-3.5" /> Editing is disabled while request is pending review.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'rejected' && (
        <Card className="border-red-200 bg-red-50/40 dark:bg-red-950/20">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600">
              <XCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                Verification Rejected - Please Re-upload Corrected Documents
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                <strong>Reason:</strong> {kycData?.rejection_reason || 'Please provide clearer, valid copies of your documents.'}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Please review the feedback above, re-upload the required document copies below and click &quot;Submit Documents for Verification&quot;.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW MODE 1: When status is Pending or Approved - Show Submitted Details in Read-Only Mode */}
      {(status === 'pending' || status === 'approved') && kycData && (
        <Card className="shadow-sm border">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Submitted Document Details
                </CardTitle>
                <CardDescription>
                  Review the documents and details you have submitted.
                </CardDescription>
              </div>
              <Badge variant="outline" className="self-start md:self-auto font-mono text-xs">
                Last Updated: {kycData.updated_at ? new Date(kycData.updated_at).toLocaleString() : '-'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Document Type:</span>
                <span className="text-sm font-semibold uppercase">{kycData.id_type?.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Document / ID Number:</span>
                <span className="text-sm font-semibold font-mono">{kycData.id_number || '-'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Verification Status:</span>
                <span className="text-sm font-semibold capitalize">{kycData.status}</span>
              </div>
              {kycData.other_documents && (
                <div className="md:col-span-3 pt-2 border-t text-xs">
                  <span className="text-muted-foreground block font-medium">Additional Remarks:</span>
                  <span className="text-foreground">{kycData.other_documents}</span>
                </div>
              )}
            </div>

            {/* Submitted Documents Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold border-b pb-2">Uploaded Document Copies</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ID Front */}
                <SubmittedDocCard
                  title="ID Front Side (NIC / Passport)"
                  url={kycData.id_front_image}
                />

                {/* ID Back */}
                {kycData.id_back_image && (
                  <SubmittedDocCard
                    title="ID Back Side"
                    url={kycData.id_back_image}
                  />
                )}

                {/* O/L Certificate */}
                <SubmittedDocCard
                  title="G.C.E. O/L Certificate"
                  url={kycData.ol_certificate}
                />

                {/* A/L Certificate */}
                {kycData.al_certificate && (
                  <SubmittedDocCard
                    title="G.C.E. A/L Certificate"
                    url={kycData.al_certificate}
                  />
                )}

                {/* Birth Certificate Front */}
                {kycData.birth_certificate_front && (
                  <SubmittedDocCard
                    title="Birth Certificate (Front)"
                    url={kycData.birth_certificate_front}
                  />
                )}

                {/* Birth Certificate Back */}
                {kycData.birth_certificate_back && (
                  <SubmittedDocCard
                    title="Birth Certificate (Back)"
                    url={kycData.birth_certificate_back}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW MODE 2: When status is NOT Submitted or REJECTED - Show Editable Upload Form */}
      {(status === 'not_submitted' || status === 'rejected') && (
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Document Submission Form</CardTitle>
              <CardDescription>
                Upload clear photos or scans (JPG, PNG, PDF up to 5MB each).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Section 1: Identification */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> 1. National Identity / Passport / Driving License
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Document Type <span className="text-red-500">*</span></Label>
                    <select
                      id="idType"
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as DocumentIdType)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="nic">National Identity Card (NIC)</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">Document Number (e.g. NIC No) <span className="text-red-500">*</span></Label>
                    <Input
                      id="idNumber"
                      placeholder="Enter ID / NIC / Passport Number"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* ID Front & Back Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <FileUploadBox
                    label="ID Front Side *"
                    sublabel="Clear photo of the front side"
                    currentUrl={kycData?.id_front_image}
                    fileState={idFront}
                    onFileChange={(e) => handleFileChange(e, setIdFront)}
                  />
                  <FileUploadBox
                    label="ID Back Side"
                    sublabel="Clear photo of the back side"
                    currentUrl={kycData?.id_back_image}
                    fileState={idBack}
                    onFileChange={(e) => handleFileChange(e, setIdBack)}
                  />
                </div>
              </div>

              {/* Section 2: Educational Qualifications */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> 2. Educational Certificates (O/L & A/L)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUploadBox
                    label="G.C.E. O/L Certificate / Result Sheet *"
                    sublabel="Official certificate or certified result sheet (Mandatory)"
                    currentUrl={kycData?.ol_certificate}
                    fileState={olCert}
                    onFileChange={(e) => handleFileChange(e, setOlCert)}
                  />
                  <FileUploadBox
                    label="G.C.E. A/L Certificate / Result Sheet"
                    sublabel="Official certificate or certified result sheet"
                    currentUrl={kycData?.al_certificate}
                    fileState={alCert}
                    onFileChange={(e) => handleFileChange(e, setAlCert)}
                  />
                </div>
              </div>

              {/* Section 3: Birth Certificate */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> 3. Birth Certificate (උප්පැන්න සහතිකය - Optional)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUploadBox
                    label="Birth Certificate (Front Page)"
                    sublabel="Front page scan/photo"
                    currentUrl={kycData?.birth_certificate_front}
                    fileState={bcFront}
                    onFileChange={(e) => handleFileChange(e, setBcFront)}
                  />
                  <FileUploadBox
                    label="Birth Certificate (Back Page)"
                    sublabel="Back page / remarks page"
                    currentUrl={kycData?.birth_certificate_back}
                    fileState={bcBack}
                    onFileChange={(e) => handleFileChange(e, setBcBack)}
                  />
                </div>
              </div>

              {/* Section 4: Other / Remarks */}
              <div className="space-y-2">
                <Label htmlFor="otherDocs">Additional Remarks / Other Certificates Info (Optional)</Label>
                <Input
                  id="otherDocs"
                  placeholder="Any additional info or notes regarding your certificates"
                  value={otherDocs}
                  onChange={(e) => setOtherDocs(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 px-6"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Uploading & Submitting...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" /> Submit Documents for Verification
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}

// Read-only document card for Pending / Approved view
function SubmittedDocCard({ title, url }: { title: string; url?: string | null }) {
  const fullUrl = resolveDocUrl(url);
  if (!fullUrl) return null;

  const isPdf = fullUrl.endsWith('.pdf');

  return (
    <div className="border rounded-lg p-3 bg-background flex flex-col justify-between space-y-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold truncate">{title}</span>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0 ml-1"
        >
          <ExternalLink className="h-3 w-3" /> View Full
        </a>
      </div>

      <div className="relative rounded border bg-muted/20 overflow-hidden aspect-[4/3] flex items-center justify-center">
        {isPdf ? (
          <div className="flex flex-col items-center gap-2 p-3 text-center">
            <FileText className="h-8 w-8 text-red-500" />
            <span className="text-[11px] text-muted-foreground font-mono">PDF Document</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={fullUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

interface FileUploadBoxProps {
  label: string;
  sublabel: string;
  currentUrl?: string | null;
  fileState: FileState;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

function FileUploadBox({
  label,
  sublabel,
  currentUrl,
  fileState,
  onFileChange,
  disabled
}: FileUploadBoxProps) {
  const inputId = `file-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const displayUrl = fileState.previewUrl || resolveDocUrl(currentUrl);

  return (
    <div className="border border-dashed rounded-lg p-4 bg-muted/20 space-y-3 flex flex-col justify-between">
      <div>
        <Label htmlFor={inputId} className="font-semibold text-sm block">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">{sublabel}</span>
      </div>

      {displayUrl ? (
        <div className="space-y-2">
          <div className="relative rounded border bg-background overflow-hidden aspect-[4/3] flex items-center justify-center">
            {displayUrl.endsWith('.pdf') ? (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <FileText className="h-10 w-10 text-red-500" />
                <span className="text-xs text-muted-foreground font-mono">PDF Document</span>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" /> View PDF
                </a>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {fileState.file && (
            <p className="text-xs text-green-600 font-medium truncate">
              New: {fileState.file.name}
            </p>
          )}
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-6 text-center bg-background/50 flex flex-col items-center justify-center gap-2">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">No document uploaded yet</span>
        </div>
      )}

      {!disabled && (
        <div>
          <input
            id={inputId}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={onFileChange}
          />
          <Label
            htmlFor={inputId}
            className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-medium border rounded-md cursor-pointer hover:bg-accent transition-colors text-center"
          >
            <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
            {displayUrl ? 'Replace File' : 'Upload File'}
          </Label>
        </div>
      )}
    </div>
  );
}
