"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentFullInfo } from "@/lib/actions/users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Upload, Banknote, Landmark, FileText, CheckCircle2, History, AlertCircle, ChevronsUpDown, Check } from "lucide-react";
import { LMS_API_URL } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';

interface Bank {
  id: string;
  bank_code: string;
  bank_name: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<any | null>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [uploadAmount, setUploadAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [branch, setBranch] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [isSubmittingSlip, setIsSubmittingSlip] = useState(false);

  const BankSelector = () => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background border-input text-foreground hover:bg-muted hover:text-foreground focus:ring-0 focus:ring-offset-0 focus:border-primary h-10 text-sm font-normal"
            disabled={isLoadingBanks}
            type="button"
          >
            {isLoadingBanks ? "Loading banks..." : (
              selectedBank ? banks.find(bank => bank.id === selectedBank)?.bank_name : "Select Bank"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover border-border text-popover-foreground shadow-lg" side="bottom" align="start">
          <Command className="bg-popover text-popover-foreground">
            <CommandInput placeholder="Search bank..." className="text-foreground placeholder:text-muted-foreground border-b border-border" />
            <CommandEmpty className="p-2 text-sm text-muted-foreground text-center">No bank found.</CommandEmpty>
            <ScrollArea className="h-60">
              <CommandGroup>
                {banks.map((bank) => (
                  <CommandItem
                    key={bank.id}
                    value={bank.bank_name}
                    onSelect={() => {
                      setSelectedBank(bank.id);
                      setOpen(false);
                    }}
                    className="hover:bg-accent hover:text-accent-foreground text-foreground cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Check
                        className={cn(
                          "h-4 w-4 text-primary shrink-0",
                          selectedBank === bank.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{bank.bank_name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const fetchData = async () => {
    if (!user?.username) return;
    try {
      const fullInfo = await getStudentFullInfo(user.username);
      setBalance(fullInfo.studentBalance || null);
      setPendingPayments(fullInfo.pendingPaymentRequests || []);
      setEnrollments(Object.values(fullInfo.studentEnrollments || {}));
      
      // Default amount to due balance if not already set
      if (fullInfo.studentBalance && !uploadAmount) {
        setUploadAmount(String(fullInfo.studentBalance.studentBalance));
      }
    } catch (error) {
      console.error(error);
      toast({ description: "Failed to load payment details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Fetch banks
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const res = await fetch(`${LMS_API_URL}/banks`);
        if (res.ok) {
          const data = await res.json();
          setBanks(data);
        }
      } catch (error) {
        console.error("Failed to fetch banks:", error);
      } finally {
        setIsLoadingBanks(false);
      }
    };
    fetchBanks();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentSlip(e.target.files[0]);
    }
  };

  const handleSubmitSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) return;
    if (!uploadAmount || parseFloat(uploadAmount) <= 0) {
      toast({ description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (!selectedBank) {
      toast({ description: "Please select a bank", variant: "destructive" });
      return;
    }
    if (!paymentSlip) {
      toast({ description: "Please upload your payment slip file", variant: "destructive" });
      return;
    }

    setIsSubmittingSlip(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("studentNumber", user.username);
      formDataToSend.append("paymentReason", "course");
      formDataToSend.append("number_type", "student_number");
      formDataToSend.append("amount", uploadAmount);
      formDataToSend.append("reference", paymentReference.trim() || user.username);
      formDataToSend.append("bank", selectedBank);
      formDataToSend.append("branch", branch);
      formDataToSend.append("slip", paymentSlip);

      const response = await fetch(`${LMS_API_URL}/payment-portal-requests`, {
        method: "POST",
        body: formDataToSend,
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resData.error || resData.message || "Failed to submit payment slip");
      }

      toast({ title: "Submitted!", description: "Payment slip uploaded successfully. Verification pending." });
      
      // Reset form fields
      setBranch("");
      setPaymentReference("");
      setPaymentSlip(null);
      if (balance) {
        setUploadAmount(String(balance.studentBalance));
      }
      
      // Reload details
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast({ description: error.message || "Submission failed", variant: "destructive" });
    } finally {
      setIsSubmittingSlip(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const paymentRecordsList = balance?.paymentRecords ? Object.values(balance.paymentRecords) : [];

  const getCoursePaymentSummary = (courseCode: string, courseFee: number, regFee: number) => {
    const totalFee = Number(courseFee || 0) + Number(regFee || 0);
    
    // Filter payments for this course
    const coursePayments = paymentRecordsList.filter((rec: any) => rec.course_code === courseCode);
    const totalPaid = coursePayments.reduce((sum: number, rec: any) => {
      return sum + (Number(rec.paid_amount || 0) + Number(rec.discount_amount || 0));
    }, 0);
    
    const due = totalFee - totalPaid;
    return {
      totalFee,
      totalPaid,
      due: due > 0 ? due : 0
    };
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-headline font-semibold flex items-center gap-3 text-foreground">
          <CreditCard className="h-8 w-8 text-primary" /> Payments & Billing
        </h1>
        <p className="text-muted-foreground mt-2">Manage your course fees, view receipts, and upload payment slips.</p>
      </header>

      {balance && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          <div className="p-3 sm:p-4 md:p-6 rounded-xl border border-border bg-card text-center shadow-md flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium truncate">Total Fee</p>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground mt-1 truncate">
              LKR {(balance.totalPaymentAmount || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
          <div className="p-3 sm:p-4 md:p-6 rounded-xl border border-border bg-card text-center shadow-md flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium truncate">Total Paid</p>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-500 mt-1 truncate">
              LKR {(balance.TotalStudentPaymentRecords || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
          <div className="p-3 sm:p-4 md:p-6 rounded-xl border border-border bg-card text-center shadow-md flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium truncate">Total Due</p>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-rose-500 mt-1 truncate">
              LKR {(balance.studentBalance || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
        </div>
      )}

      {/* Course Fee Breakdown Section */}
      {enrollments.length > 0 && (
        <Card className="shadow-lg border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
              <Landmark className="h-5 w-5 text-primary" /> Enrolled Courses & Fee Details
            </CardTitle>
            <CardDescription className="text-muted-foreground">Breakdown of fees, payments, and outstanding balances for each of your enrolled courses.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {enrollments.map((course: any, index: number) => {
                const summary = getCoursePaymentSummary(course.course_code, course.course_fee, course.registration_fee);
                return (
                  <div key={course.id || index} className="p-5 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Badge className="bg-primary/10 text-primary border border-primary/20 mb-1">{course.course_code}</Badge>
                      <h3 className="font-bold text-foreground text-lg leading-tight">{course.batch_name || course.parent_course_name}</h3>
                      <p className="text-xs text-muted-foreground">Duration: {course.course_duration || "-"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 md:gap-12 text-center md:text-right shrink-0">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Course Fee</p>
                        <p className="text-sm font-semibold text-foreground mt-1">LKR {summary.totalFee.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Paid</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-550 mt-1">LKR {summary.totalPaid.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Due Balance</p>
                        <p className={`text-sm font-bold mt-1 ${summary.due > 0 ? "text-rose-500" : "text-green-600 dark:text-green-500"}`}>
                          LKR {summary.due.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: History and Verification */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pending Slip Verification */}
          <Card className="shadow-md border-border bg-card">
            <CardHeader className="bg-muted/10 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-xl text-yellow-600 dark:text-yellow-500">
                <History className="h-5 w-5" /> Pending Verification
              </CardTitle>
              <CardDescription className="text-muted-foreground">Slips submitted by you that are awaiting admin approval.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {pendingPayments.length > 0 ? (
                <div className="space-y-4">
                  {pendingPayments.map((req: any) => (
                    <div key={req.id} className="flex justify-between items-center p-4 rounded-xl bg-muted/10 border border-border gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-yellow-600 dark:text-yellow-500 text-sm">Ref: {req.payment_reference || req.unique_number}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(req.created_at).toLocaleDateString()} | Bank: {req.bank === "1" ? "BOC" : req.bank || "-"}
                        </p>
                        {req.slip_path && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link" className="p-0 h-auto text-xs text-primary hover:underline font-normal justify-start">
                                View Uploaded Slip
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl bg-slate-900 border-slate-800 text-slate-100">
                              <DialogHeader>
                                <DialogTitle className="text-slate-100">Payment Slip Preview</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center items-center p-4 bg-slate-950 rounded-xl border border-slate-850">
                                {req.slip_path.toLowerCase().endsWith('.pdf') ? (
                                  <iframe 
                                    src={`${CONTENT_PROVIDER_URL}${req.slip_path}`} 
                                    className="w-full h-[70vh] rounded-md border-0"
                                    title="Payment Slip PDF"
                                  />
                                ) : (
                                  <img 
                                    src={`${CONTENT_PROVIDER_URL}${req.slip_path}`} 
                                    alt="Payment Slip" 
                                    className="max-h-[65vh] object-contain rounded-md"
                                  />
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-yellow-600 dark:text-yellow-500">LKR {parseFloat(req.paid_amount).toLocaleString(undefined, {minimumFractionDigits: 0})}</p>
                        <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 mt-1 uppercase text-[9px] tracking-wider font-bold">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center justify-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                  <p>No pending payment slips to verify.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Official Receipts */}
          <Card className="shadow-md border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/10">
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <FileText className="h-5 w-5 text-primary" /> Official Payment Receipts
              </CardTitle>
              <CardDescription className="text-muted-foreground">All approved payments credited to your account.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {paymentRecordsList.length > 0 ? (
                <div className="space-y-4">
                  {paymentRecordsList.map((rec: any) => (
                    <div key={rec.id} className="flex justify-between items-center p-4 rounded-xl bg-muted/10 border border-border">
                      <div>
                        <p className="font-bold text-foreground text-sm">{rec.receipt_number}</p>
                        <p className="text-xs text-muted-foreground mt-1">Date: {rec.paid_date} | Method: {rec.payment_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-500">LKR {parseFloat(rec.paid_amount).toLocaleString(undefined, {minimumFractionDigits: 0})}</p>
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20 mt-1 uppercase text-[9px] tracking-wider font-bold">Approved</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center justify-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  <p>No official payment receipts found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upload Slip Form */}
        <div className="lg:col-span-5">
          <Card className="shadow-xl border-border relative overflow-hidden h-fit bg-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <CardHeader className="border-b border-border bg-muted/10">
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Upload className="h-5 w-5 text-primary" /> Upload Installment Slip
              </CardTitle>
              <CardDescription className="text-muted-foreground">Submit a new payment slip to settle your outstanding balance.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {balance && balance.studentBalance <= 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">No Outstanding Balance</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Your course fees are fully settled. Thank you!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitSlip} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-foreground">Amount Paid (LKR) *</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      step="0.01"
                      value={uploadAmount} 
                      onChange={(e) => setUploadAmount(e.target.value)} 
                      required 
                      className="bg-background border-input focus:border-primary text-foreground placeholder:text-muted-foreground h-10" 
                      placeholder="e.g. 9000"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="bank" className="text-sm font-medium text-foreground">Bank Name *</Label>
                    <BankSelector />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-sm font-medium text-foreground">Branch Name (Optional)</Label>
                      <Input 
                        id="branch" 
                        value={branch} 
                        onChange={(e) => setBranch(e.target.value)} 
                        className="bg-background border-input focus:border-primary text-foreground placeholder:text-muted-foreground h-10" 
                        placeholder="e.g. Colombo 07"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentReference" className="text-sm font-medium text-foreground">Reference Number (Optional)</Label>
                      <Input 
                        id="paymentReference" 
                        value={paymentReference} 
                        onChange={(e) => setPaymentReference(e.target.value)} 
                        className="bg-background border-input focus:border-primary text-foreground placeholder:text-muted-foreground h-10" 
                        placeholder="e.g. TXN123456"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Payment Slip *</Label>
                    <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-4 text-center cursor-pointer relative bg-muted/10">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-1" />
                        <p className="text-xs font-semibold text-foreground">
                          {paymentSlip ? paymentSlip.name : "Click or drag file to upload"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {paymentSlip ? `${(paymentSlip.size / (1024 * 1024)).toFixed(2)} MB` : "Support Images (PNG, JPG) or PDF"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmittingSlip} className="w-full bg-primary hover:bg-primary/95 text-white gap-2 font-medium h-12 shadow-md">
                    {isSubmittingSlip && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmittingSlip ? "Submitting..." : "Submit Payment Slip"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
