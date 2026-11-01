"use client";

import { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Upload, 
  Search, 
  FileCheck2, 
  Landmark, 
  Phone, 
  MessageCircle, 
  ArrowLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { uploadPaymentSlip, lookupStudentByReference } from '@/app/actions';
import { BankInfoDialog } from '@/components/bank-info-dialog';

interface StudentInfo {
  id: string | number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  phone_number?: string | number;
  nic_number?: string;
  selected_course?: string | number;
}

function PaymentPortalContent() {
  const { language } = useTranslation();
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('registrationId') || searchParams.get('ref') || '';

  const [refInput, setRefInput] = useState(initialRef);
  const [isSearching, setIsSearching] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState('15000');
  const [bank, setBank] = useState('Bank of Ceylon (BOC)');
  const [branch, setBranch] = useState('Pelmadulla Branch');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto lookup if ref is in URL
  useEffect(() => {
    if (initialRef.trim()) {
      handleLookup(initialRef.trim());
    }
  }, [initialRef]);

  const handleLookup = async (idToSearch: string) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) {
      setSearchError(language === 'si' ? 'කරුණාකර Reference ID අංකය ඇතුළත් කරන්න.' : 'Please enter your Reference ID.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setStudentInfo(null);

    try {
      const data = await lookupStudentByReference(cleanId);
      if (data && data.id) {
        setStudentInfo(data);
      } else {
        setSearchError(
          language === 'si'
            ? `"${cleanId}" අංකයට අදාළ ශිෂ්‍ය අයදුම්පතක් හමු නොවුණි. කරුණාකර නිවැරදි Reference අංකය පරීක්ෂා කරන්න.`
            : `No student application found for Reference ID "${cleanId}". Please verify your number.`
        );
      }
    } catch {
      setSearchError(language === 'si' ? 'තොරතුරු සෙවීමේදී දෝෂයක් මතු විය.' : 'Error fetching application details.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSubmitError(null);
      if (file.type.startsWith('image/')) {
        setSlipPreviewUrl(URL.createObjectURL(file));
      } else {
        setSlipPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo) {
      setSubmitError(language === 'si' ? 'පළමුව ඔබගේ Reference ID අංකය තහවුරු කරගන්න.' : 'Please verify your Reference ID first.');
      return;
    }
    if (!slipFile) {
      setSubmitError(language === 'si' ? 'කරුණාකර ගෙවීම් රිසිට්පත (Slip) තෝරන්න.' : 'Please select your payment slip file.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append('studentNumber', String(studentInfo.id));
      fd.append('amount', amount);
      fd.append('bank', bank);
      fd.append('branch', branch);
      fd.append('paymentReason', 'course');
      fd.append('slip', slipFile);

      const res = await uploadPaymentSlip(null, fd);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.message);
      }
    } catch {
      setSubmitError(language === 'si' ? 'රිසිට්පත යොමු කිරීමේ දෝෂයක් මතු විය.' : 'Error submitting payment slip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mask student details for privacy
  const maskedName = studentInfo?.full_name || `${studentInfo?.first_name || ''} ${studentInfo?.last_name || ''}`.trim() || 'CPC Student';
  const rawPhone = String(studentInfo?.phone_number || '');
  const maskedPhone = rawPhone.length >= 6 
    ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-3)}` 
    : rawPhone || 'N/A';

  return (
    <div className="w-full max-w-3xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-2 px-3 py-1 font-semibold text-primary border-primary/30 inline-flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          <span>{language === 'si' ? 'නිල ගෙවීම් ද්වාරය' : 'Official Tuition Payment Portal'}</span>
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-foreground">
          {language === 'si' ? 'ගෙවීම් රිසිට්පත් යොමු කිරීමේ පද්ධතිය' : 'Submit Tuition Payment Slip'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground font-body max-w-xl mx-auto">
          {language === 'si'
            ? 'ලියාපදිංචියේදී ලැබුණු ඔබගේ Reference ID අංකය ඇතුළත් කර බැංකු තැන්පතු පත්‍රිකාව හෝ Online Transfer Screenshot එක මෙතැනින් යොමු කරන්න.'
            : 'Enter your Reference ID received upon registration to upload your bank deposit slip or transfer screenshot.'}
        </p>
      </div>

      {submitSuccess ? (
        <Card className="border-2 border-emerald-500/40 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-400 bg-card p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge className="bg-emerald-600 text-white font-bold mb-2">
              {language === 'si' ? 'ගෙවීම් රිසිට්පත ලැබිණි' : 'Slip Received'}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-headline font-bold text-foreground">
              {language === 'si' ? 'ඔබගේ ගෙවීම් රිසිට්පත සාර්ථකව පද්ධතියට එක් විය!' : 'Your Payment Slip Has Been Uploaded!'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              {language === 'si'
                ? `Reference ID: ${studentInfo?.id} සඳහා වන රිසිට්පත CPC ගිණුම් අංශය වෙත ලැබී ඇත. එය කඩිනමින් තහවුරු කර ඔබගේ ශිෂ්‍ය ගිණුම (LMS) සක්‍රීය කරනු ලැබේ.`
                : `Your payment record for Reference ID ${studentInfo?.id} is now queued for verification. CPC admissions will activate your student access promptly.`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs sm:text-sm text-left max-w-md mx-auto space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference ID:</span>
              <span className="font-bold font-mono text-primary">{studentInfo?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Applicant Name:</span>
              <span className="font-semibold text-foreground">{maskedName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-bold text-foreground">LKR {parseFloat(amount).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button asChild size="lg" className="w-full sm:w-auto font-bold gap-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'si' ? 'මුල් පිටුවට යන්න' : 'Return to Home'}</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-semibold gap-2">
              <a href="https://wa.me/94715884884" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'si' ? 'WhatsApp මගින් විමසන්න' : 'Inquire on WhatsApp'}</span>
              </a>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">

          {/* Step 1: Reference ID Lookup Card */}
          <Card className="border border-border/80 shadow-md rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border/60 p-5 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-headline flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <span>{language === 'si' ? '1. ඔබගේ Reference ID අංකය ඇතුළත් කරන්න' : '1. Enter Your Reference ID'}</span>
              </CardTitle>
              <CardDescription className="text-xs font-body">
                {language === 'si' ? 'ලියාපදිංචි වූ විට SMS මගින් ලැබුණු අංකය (උදා: 10905)' : 'The number dispatched to your mobile phone via SMS upon registration.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder="e.g. 10905"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookup(refInput);
                      }
                    }}
                    className="font-mono text-base tracking-wider h-11"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={() => handleLookup(refInput)} 
                  disabled={isSearching || !refInput.trim()}
                  className="font-bold gap-2 px-5 h-11"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{language === 'si' ? 'සොයන්න' : 'Verify'}</span>
                </Button>
              </div>

              {searchError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Student Verified Identity Card */}
              {studentInfo && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm animate-in fade-in space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === 'si' ? '✓ ශිෂ්‍ය අයදුම්පත තහවුරු විය' : '✓ Student Application Verified'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-xs">
                    <p><span className="text-muted-foreground font-medium">Applicant:</span> <strong>{maskedName}</strong></p>
                    <p><span className="text-muted-foreground font-medium">Phone:</span> <strong>{maskedPhone}</strong></p>
                    <p><span className="text-muted-foreground font-medium">Reference:</span> <strong className="font-mono">{studentInfo.id}</strong></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Payment Slip Form */}
          {studentInfo && (
            <Card className="border-2 border-primary/40 shadow-xl rounded-2xl overflow-hidden bg-card animate-in fade-in zoom-in-95 duration-200">
              <CardHeader className="bg-primary/5 border-b border-primary/20 p-5 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-headline flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>{language === 'si' ? '2. ගෙවීම් තොරතුරු සහ රිසිට්පත (Payment Slip)' : '2. Payment Details & Receipt'}</span>
                </CardTitle>
                <CardDescription className="text-xs font-body">
                  {language === 'si' ? 'මුදල් ගෙවූ ආකාරය තෝරා රිසිට්පත upload කරන්න.' : 'Provide transaction details and upload your slip.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">
                        {language === 'si' ? 'ගෙවූ මුදල (Amount Paid - LKR) *' : 'Amount Paid (LKR) *'}
                      </Label>
                      <Input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="font-mono"
                        placeholder="15000"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold mb-1 block">
                        {language === 'si' ? 'තැන්පත් කළ බැංකුව (Bank) *' : 'Bank Paid To *'}
                      </Label>
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-card text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                        <option value="Commercial Bank">Commercial Bank</option>
                        <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                        <option value="Sampath Bank">Sampath Bank</option>
                        <option value="Peoples Bank">Peoples Bank</option>
                        <option value="Other Bank / Online App">Other Bank / CDM / Online App</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-1 block">
                      {language === 'si' ? 'ශාඛාව (Branch)' : 'Branch'}
                    </Label>
                    <Input 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Pelmadulla Branch"
                    />
                  </div>

                  {/* Drag & Drop Slip Input */}
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">
                      {language === 'si' ? 'රිසිට්පතේ ඡායාරූපය හෝ PDF ගොනුව (Slip File / Screenshot) *' : 'Payment Slip / Transfer Screenshot (Image or PDF) *'}
                    </Label>
                    <div className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 rounded-xl p-5 text-center cursor-pointer relative transition-all">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        required
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {slipPreviewUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={slipPreviewUrl} alt="Slip Preview" className="max-h-52 rounded-lg shadow-sm border object-contain" />
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {slipFile?.name} (Click to change)
                          </span>
                        </div>
                      ) : slipFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
                          <FileCheck2 className="w-5 h-5" />
                          <span>{slipFile.name} (Ready to upload)</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground">
                          <Upload className="w-8 h-8 text-primary/70" />
                          <p className="text-xs sm:text-sm font-medium text-foreground">
                            {language === 'si' ? 'රිසිට්පත තෝරාගැනීමට මෙතැන Click කරන්න හෝ Drag & Drop කරන්න' : 'Click to select slip file or drag & drop here'}
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, JPEG හෝ PDF (Max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !slipFile}
                      size="lg"
                      className="w-full font-bold gap-2 text-base h-12 bg-primary text-primary-foreground shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'si' ? 'රිසිට්පත යොමු වෙමින් පවතී...' : 'Submitting Slip...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>{language === 'si' ? 'ගෙවීම් රිසිට්පත තහවුරු කරන්න' : 'Submit Payment Slip Now'}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Official Bank Account Details Reference Box */}
          <div className="rounded-2xl border-2 border-border/80 bg-muted/40 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  {language === 'si' ? 'පාඨමාලා ගාස්තු ගෙවීමට නිල බැංකු ගිණුම් විස්තර' : 'Official Tuition Payment Bank Details'}
                </h4>
              </div>
              <BankInfoDialog variant="button-outline" className="w-auto py-1 px-3 text-xs h-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-card rounded-xl border">
                <span className="text-muted-foreground block text-[11px]">Bank Name</span>
                <span className="font-bold text-foreground">Bank Of Ceylon (BOC)</span>
              </div>
              <div className="p-3 bg-card rounded-xl border">
                <span className="text-muted-foreground block text-[11px]">Account Name</span>
                <span className="font-bold text-foreground">Ceylon Pharma College Pvt Ltd</span>
              </div>
              <div className="p-3 bg-card rounded-xl border flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Account Number</span>
                  <span className="font-bold font-mono text-base text-primary">89090906</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('89090906')}
                  className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground"
                  title="Copy Account Number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-3 bg-card rounded-xl border flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Branch</span>
                  <span className="font-bold text-foreground">Pelmadulla Branch</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('Pelmadulla Branch')}
                  className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground"
                  title="Copy Branch"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Help & Contact */}
          <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>{language === 'si' ? 'ගෙවීම් සම්බන්ධ ඕනෑම ගැටලුවක් සඳහා අමතන්න:' : 'For payment inquiries, call admissions:'} <strong>0715 884 884</strong></span>
            </div>
            <a
              href="https://wa.me/94715884884"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp CPC Desk</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentPortalContent />
    </Suspense>
  );
}
