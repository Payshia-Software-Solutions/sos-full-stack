"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getDpadActivePrescriptionsByCourse, 
  getDpadOverallGrade, 
  getDpadSubmittedAnswers 
} from "@/lib/actions/games";
import Link from "next/link";
import { getPrescriptionDisplayDrugs } from "@/components/d-pad/PrescriptionPaper";
import { ArrowRight, Pill, Trophy, CheckCircle, Activity, Award, BookOpen, Search } from "lucide-react";

export default function DPadIndexPage() {
  const { user } = useAuth();
  const username = user?.username || "";
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Read selected course from localStorage (set after login/course-select)
  useEffect(() => {
    const stored = sessionStorage.getItem("selected_course");
    setCourseCode(stored);
  }, []);

  // 1. Fetch Active Prescriptions filtered by selected course
  const { data: prescriptions = [], isLoading: isLoadingRx } = useQuery({
    queryKey: ["dpadActivePrescriptions", courseCode],
    queryFn: () => getDpadActivePrescriptionsByCourse(courseCode!),
    enabled: !!courseCode,
  });

  // 2. Fetch Overall Grade
  const { data: gradeData, isLoading: isLoadingGrade } = useQuery({
    queryKey: ["dpadOverallGrade", username, courseCode],
    queryFn: () => getDpadOverallGrade(username, courseCode),
    enabled: !!username && !!courseCode,
  });

  // 3. Fetch Student Submissions
  const { data: submissions = [] } = useQuery({
    queryKey: ["dpadSubmissions", username],
    queryFn: () => getDpadSubmittedAnswers(username),
    enabled: !!username,
  });

  const overallGrade = gradeData ? parseFloat(gradeData.overallGrade) : 0;

  // If no course selected yet, show a prompt
  if (courseCode === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
        <div className="p-4 rounded-full bg-emerald-500/10">
          <BookOpen className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold">No Course Selected</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Please select your course from the dashboard to see the D-Pad prescriptions assigned to you.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/select-course">Select Course</Link>
        </Button>
      </div>
    );
  }

  // Calculate status for each prescription card
  const rxCards = prescriptions.map((rx: any) => {
    const drugs = getPrescriptionDisplayDrugs(rx);
    const totalEnvelopes = drugs.length;
    
    // Count how many correct submissions the user has for this prescription
    const completedCorrectCount = drugs.filter((_: string, index: number) => {
      const coverId = `Cover${index + 1}`;
      return submissions.some(
        (sub: any) => 
          sub.pres_id === rx.prescription_id && 
          sub.cover_id === coverId && 
          sub.answer_status === "Correct"
      );
    }).length;

    const isCompleted = completedCorrectCount === totalEnvelopes && totalEnvelopes > 0;
    const progressPercent = totalEnvelopes > 0 ? (completedCorrectCount / totalEnvelopes) * 100 : 0;

    return {
      ...rx,
      totalEnvelopes,
      completedCorrectCount,
      isCompleted,
      progressPercent,
      drugs
    };
  });

  const filteredRxCards = rxCards.filter((rx: any, index: number) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const rxNumber = `prescription #${index + 1}`.toLowerCase();
    const shortNumber = `#${index + 1}`;
    
    return (
      rxNumber.includes(q) ||
      shortNumber.includes(q) ||
      (rx.prescription_id && rx.prescription_id.toLowerCase().includes(q)) ||
      (rx.prescription_name && rx.prescription_name.toLowerCase().includes(q)) ||
      (rx.Pres_Name && rx.Pres_Name.toLowerCase().includes(q)) ||
      (rx.doctor_name && rx.doctor_name.toLowerCase().includes(q)) ||
      (rx.drugs_list && rx.drugs_list.toLowerCase().includes(q)) ||
      (rx.drugs_written_list && rx.drugs_written_list.toLowerCase().includes(q)) ||
      rx.drugs.some((d: string) => d.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20 w-full">
      {/* Top Banner / Grade Dashboard */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 text-white p-6 md:p-8 shadow-xl border border-teal-500/20"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-xs px-3 py-1">
                Prescribing & Dispensing Simulation
              </Badge>
              {courseCode && (
                <Badge className="bg-emerald-500 hover:bg-emerald-400 text-white border-none text-xs px-3 py-1 shadow-md">
                  Course: {courseCode}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-white">
              D-Pad Game Dashboard
            </h1>
            <p className="text-emerald-100 max-w-xl text-sm md:text-base">
              Test your prescription interpretation, choose packaging correctly, and ensure accuracy in labeling.
            </p>
          </div>

          {/* Gamified Overall Grade Tracker */}
          <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-md px-6 py-4 rounded-xl border border-white/15 shadow-lg">
            <div className="bg-amber-400 p-3 rounded-full text-slate-900">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-emerald-200 uppercase font-semibold tracking-wider font-sans">Overall Grade</p>
              <h2 className="text-3xl font-black font-mono tracking-tight text-white">
                {isLoadingGrade ? <Skeleton className="h-9 w-20 bg-white/20" /> : `${overallGrade.toFixed(1)}%`}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Available Prescriptions List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-headline">
              <Activity className="w-5 h-5 text-emerald-500" />
              Available Challenges
            </h2>
            <Badge variant="outline" className="text-slate-300 border-slate-700 bg-slate-900/30">
              {prescriptions.length} Total
            </Badge>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by PRE ID, #, patient, drug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-14 bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 text-xs h-9"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Showing {filteredRxCards.length} of {rxCards.length} challenges for <strong className="text-emerald-400">"{searchQuery}"</strong></span>
            <button onClick={() => setSearchQuery("")} className="text-emerald-400 hover:underline">Reset search</button>
          </div>
        )}

        {isLoadingRx ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="shadow-md bg-slate-900/40 border-slate-800">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-1/3 bg-slate-800" />
                  <Skeleton className="h-4 w-2/3 bg-slate-800" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-10 w-full bg-slate-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRxCards.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 rounded-xl border border-dashed border-slate-850">
            <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">
              {searchQuery ? "No Prescriptions Found" : "No Active Prescriptions"}
            </h3>
            <p className="text-slate-500 text-sm">
              {searchQuery ? `No challenges matching "${searchQuery}" was found.` : "Active prescriptions will be set up by the administrator."}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchQuery("")} 
                className="mt-3 border-slate-800 text-slate-300 hover:text-white"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRxCards.map((rx: any, index: number) => (
              <div
                key={rx.prescription_id}
                className="transition-all duration-200 hover:-translate-y-1"
              >
                <Link href={`/dashboard/d-pad/${rx.prescription_id}`} className="block h-full">
                  <Card className={`shadow-md hover:shadow-lg transition-all border-t-4 flex flex-col h-full bg-slate-900/30 hover:bg-slate-900/50 border-slate-800/80 ${
                    rx.isCompleted ? "border-t-emerald-500 bg-emerald-950/10" : "border-t-teal-600"
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={rx.isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-teal-600 text-white hover:bg-teal-700"}>
                            Prescription #{index + 1}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-400 border-emerald-500/40 bg-slate-950/80 px-2 py-0.5">
                            {rx.prescription_id}
                          </Badge>
                        </div>
                        {rx.isCompleted && (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-slate-950/60 gap-1 flex items-center shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2 text-slate-100 font-headline">
                        {rx.prescription_name || `Patient: ${rx.Pres_Name}`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Award className="w-3.5 h-3.5 text-emerald-500/80" />
                        Dr. {rx.doctor_name || "Unknown Doctor"}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow space-y-4">
                      {/* Envelopes and Drugs info */}
                      <div className="text-sm space-y-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Drugs to Dispense</p>
                        <div className="space-y-1">
                          {rx.drugs.slice(0, 2).map((drug: string, i: number) => (
                            <div key={i} className="flex items-center text-slate-300 gap-1 text-xs">
                              <Pill className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{drug}</span>
                            </div>
                          ))}
                          {rx.drugs.length > 2 && (
                            <p className="text-[10px] text-slate-400 font-medium pl-4">+{rx.drugs.length - 2} more item(s)</p>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>Labeling Progress</span>
                          <span>{rx.completedCorrectCount} / {rx.totalEnvelopes} Covers</span>
                        </div>
                        <Progress value={rx.progressPercent} className="h-2 bg-slate-950" indicatorClassName="bg-emerald-500" />
                      </div>
                    </CardContent>

                    <CardContent className="pt-0 mt-auto">
                      <Button className={`w-full gap-2 text-white font-semibold ${rx.isCompleted ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-950/40 border border-emerald-800 hover:bg-emerald-900/40 text-emerald-400"}`}>
                        Open Challenge
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
