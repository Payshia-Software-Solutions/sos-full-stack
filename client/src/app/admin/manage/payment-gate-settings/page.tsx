"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Lock,
  Unlock,
  ShieldAlert,
  Save,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  getPaymentGateSettings,
  updatePaymentGateSettings,
  PaymentGateSettingsData,
} from "@/lib/actions/paymentGate";

export default function PaymentGateSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError, refetch } = useQuery<PaymentGateSettingsData>({
    queryKey: ["paymentGateSettings"],
    queryFn: getPaymentGateSettings,
  });

  const [isActive, setIsActive] = useState<boolean>(true);
  const [restrictionMode, setRestrictionMode] = useState<"fully_paid" | "minimum_due">("minimum_due");
  const [minimumDueAmount, setMinimumDueAmount] = useState<number>(0);
  const [customMessage, setCustomMessage] = useState<string>("");

  useEffect(() => {
    if (settings) {
      setIsActive(settings.is_active);
      setRestrictionMode(settings.restriction_mode || "minimum_due");
      setMinimumDueAmount(settings.minimum_due_amount || 0);
      setCustomMessage(
        settings.custom_message ||
          "Please complete your pending payments to view your assignment and exam grades."
      );
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: updatePaymentGateSettings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["paymentGateSettings"] });
      queryClient.invalidateQueries({ queryKey: ["studentFullInfo"] });
      toast({
        title: "Settings Saved",
        description: data.message || "Payment gate settings updated successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to Save",
        description: err.message || "Could not update payment gate settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      is_active: isActive,
      restriction_mode: restrictionMode,
      minimum_due_amount: Number(minimumDueAmount) || 0,
      custom_message: customMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Failed to load settings</h2>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  // Preview test balance check
  const testBalance = 2500;
  const isTestLocked =
    isActive &&
    (restrictionMode === "fully_paid"
      ? testBalance > 0
      : testBalance > Number(minimumDueAmount));

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto pb-32">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/admin/manage">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Manage
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary" /> Grade Payment Gate Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Control whether students must settle their pending course payments before viewing grades, assignment marks, and certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isActive ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs">
              <Lock className="w-3.5 h-3.5 mr-1" /> Gate is Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="px-3 py-1 text-xs text-muted-foreground">
              <Unlock className="w-3.5 h-3.5 mr-1" /> Gate is Disabled
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Switch Card */}
        <Card className="border-2 border-primary/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">Enable Grade Restriction</CardTitle>
                <CardDescription>
                  When enabled, students with outstanding dues will see a "Complete Payment" notice instead of their grades.
                </CardDescription>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Configuration details */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${!isActive ? "opacity-50 pointer-events-none" : ""}`}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" /> Restriction Mode
              </CardTitle>
              <CardDescription>
                Choose how strict the payment check should be.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={restrictionMode}
                onValueChange={(val: any) => setRestrictionMode(val)}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/40 cursor-pointer">
                  <RadioGroupItem value="minimum_due" id="mode-threshold" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="mode-threshold" className="font-semibold cursor-pointer">
                      Minimum Due Threshold
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow students to view grades if their pending balance is less than or equal to an allowed amount.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/40 cursor-pointer">
                  <RadioGroupItem value="fully_paid" id="mode-strict" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="mode-strict" className="font-semibold cursor-pointer">
                      Completely Paid (Strict Mode)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Students must have zero outstanding balance (LKR 0.00) to view any grades or certificates.
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {restrictionMode === "minimum_due" && (
                <div className="pt-2 space-y-2">
                  <Label htmlFor="min-due-amount" className="text-sm font-semibold">
                    Allowed Maximum Due Amount (LKR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">
                      LKR
                    </span>
                    <Input
                      id="min-due-amount"
                      type="number"
                      min="0"
                      step="50"
                      value={minimumDueAmount}
                      onChange={(e) => setMinimumDueAmount(Number(e.target.value))}
                      className="pl-12"
                      placeholder="e.g. 0 or 5000"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Grades will be locked if the student's pending balance exceeds this amount. (Set to 0 to require full payment).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Message Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Student Alert Message
              </CardTitle>
              <CardDescription>
                Message shown to students when their grades are locked due to pending payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="custom-message" className="text-sm">
                  Instruction / Notice
                </Label>
                <Textarea
                  id="custom-message"
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Please complete your pending payments to view your assignment and exam grades."
                  className="text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                A "Make Payment" button will automatically be included below this message to direct students straight to the payment section.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Card */}
        <Card className="border border-dashed shadow-none bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Eye className="w-4 h-4 text-primary" /> Live Student View Preview (Simulated for LKR 2,500 Due)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isTestLocked ? (
              <div className="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300">
                      Payment Required to View Grades
                    </p>
                    <p className="text-sm font-medium">{customMessage}</p>
                    <p className="text-xs font-semibold mt-1">
                      Outstanding Due: <span className="font-bold underline">LKR 2,500.00</span>
                    </p>
                  </div>
                </div>
                <div className="pt-1">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
                    Complete Payment Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">
                    Grades Visible (Restriction satisfied or gate disabled).
                  </span>
                </div>
                <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                  85.50% (Grade A)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 min-w-[140px]"
          >
            {updateMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
