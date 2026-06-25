"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { 
  getDpadPrescriptionDetails, 
  getDpadAnswerKey, 
  saveDpadAnswerKey,
  getFormSelectionData
} from "@/lib/actions/games";
import { 
  ArrowLeft, Pill, CheckCircle, Save, 
  Calendar, User, Clipboard, Sun, Sunset, Moon, Clock, Info, Settings 
} from "lucide-react";

// Option mappings matching the student dispensing page options
const OPTIONS_MAPPINGS = {
  dosageForm: ["Tablet", "Capsule", "Syrup", "Inhaler"],
  mealType: ["Before Meal", "With Meal", "After Meal", "N/A"],
  usingFrequency: ["Daily", "Weekly", "As needed"],
  scheduleQty: ["-", "1", "2", "3", "1/2"],
  atATime: ["-", "1", "2", "1/2"],
  hourQty: ["-", "4", "6", "8", "12"]
};

export default function DpadAnswerKeySetupPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const username = user?.username || "admin";
  const prescriptionId = params.id as string;

  // Active cover state
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0);

  // Search states for custom searchable dropdowns
  const [drugSearch, setDrugSearch] = useState("");
  const [isDrugDropdownOpen, setIsDrugDropdownOpen] = useState(false);
  const [instructionSearch, setInstructionSearch] = useState("");
  const [isInstructionDropdownOpen, setIsInstructionDropdownOpen] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    date: "",
    name: "",
    drug_name: "",
    drug_type: "Tablet",
    drug_qty: "10",
    morning_qty: "-",
    afternoon_qty: "-",
    evening_qty: "-",
    night_qty: "-",
    meal_type: "After Meal",
    using_type: "Daily",
    at_a_time: "-",
    hour_qty: "-",
    additional_description: "",
  });

  // Fetch prescription details
  const { data: rxDetails, isLoading: rxLoading } = useQuery({
    queryKey: ["dpadPrescriptionDetails", prescriptionId],
    queryFn: () => getDpadPrescriptionDetails(prescriptionId),
    enabled: !!prescriptionId,
  });

  // Fetch student form selections (to suggest correct values)
  const { data: selectionData } = useQuery({
    queryKey: ["dpadFormSelectionData"],
    queryFn: getFormSelectionData,
  });

  // Parse drugs in prescription
  const drugs = rxDetails?.drugs_list ? rxDetails.drugs_list.split(", ") : [];
  const currentCoverId = `Cover${selectedCoverIndex + 1}`;

  // Fetch existing answer key for selected cover
  const { data: existingAnswerKey, isLoading: answerKeyLoading, refetch: refetchAnswerKey } = useQuery({
    queryKey: ["dpadAnswerKey", prescriptionId, currentCoverId],
    queryFn: () => getDpadAnswerKey(prescriptionId, currentCoverId),
    enabled: !!prescriptionId && !!currentCoverId,
  });

  // Prefill form when rx details or existing answer key loads
  useEffect(() => {
    if (existingAnswerKey) {
      setFormState({
        date: existingAnswerKey.date || rxDetails?.pres_date || "",
        name: existingAnswerKey.name || rxDetails?.Pres_Name || "",
        drug_name: existingAnswerKey.drug_name || "",
        drug_type: existingAnswerKey.drug_type || "Tablet",
        drug_qty: existingAnswerKey.drug_qty || "10",
        morning_qty: existingAnswerKey.morning_qty || "-",
        afternoon_qty: existingAnswerKey.afternoon_qty || "-",
        evening_qty: existingAnswerKey.evening_qty || "-",
        night_qty: existingAnswerKey.night_qty || "-",
        meal_type: existingAnswerKey.meal_type || "After Meal",
        using_type: existingAnswerKey.using_type || "Daily",
        at_a_time: existingAnswerKey.at_a_time || "-",
        hour_qty: existingAnswerKey.hour_qty || "-",
        additional_description: existingAnswerKey.additional_description || "",
      });
      setDrugSearch(existingAnswerKey.drug_name || "");
      setInstructionSearch(existingAnswerKey.additional_description || "");
    } else {
      // Set sensible defaults based on prescription details
      // Attempt to extract drug name from prescription line (e.g. "Paracetamol 500mg tds" -> "Paracetamol")
      let suggestedDrugName = "";
      if (drugs[selectedCoverIndex]) {
        const parts = drugs[selectedCoverIndex].split(" ");
        suggestedDrugName = parts[0]; // First word is typically the drug name
      }

      setFormState({
        date: rxDetails?.pres_date || "",
        name: rxDetails?.Pres_Name || "",
        drug_name: suggestedDrugName,
        drug_type: "Tablet",
        drug_qty: "10",
        morning_qty: "-",
        afternoon_qty: "-",
        evening_qty: "-",
        night_qty: "-",
        meal_type: "After Meal",
        using_type: "Daily",
        at_a_time: "-",
        hour_qty: "-",
        additional_description: "",
      });
      setDrugSearch(suggestedDrugName);
      setInstructionSearch("");
    }
    setIsDrugDropdownOpen(false);
    setIsInstructionDropdownOpen(false);
  }, [existingAnswerKey, rxDetails, selectedCoverIndex]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: any) => saveDpadAnswerKey(username, payload),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast({ title: "🎉 " + res.message, className: "bg-emerald-600 text-white" });
        refetchAnswerKey();
        queryClient.invalidateQueries({ queryKey: ["dpadAnswerKey", prescriptionId, currentCoverId] });
      } else {
        toast({ variant: "destructive", title: "❌ " + res.message });
      }
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to save answer key" });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.date || !formState.name || !formState.drug_name || !formState.drug_type || !formState.drug_qty) {
      toast({ variant: "destructive", title: "Please fill out all required fields" });
      return;
    }

    const payload = {
      prescriptionID: prescriptionId,
      coverID: currentCoverId,
      ...formState
    };

    saveMutation.mutate(payload);
  };

  // Helper to quickly copy prescription values
  const handleCopyFromPrescription = () => {
    if (!rxDetails) return;
    setFormState(prev => ({
      ...prev,
      date: rxDetails.pres_date || "",
      name: rxDetails.Pres_Name || "",
    }));
    toast({ title: "Copied Date & Patient Name from Prescription details" });
  };

  if (rxLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 w-full">
        <Skeleton className="h-10 w-1/4 bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5"><Skeleton className="h-[400px] w-full bg-slate-800" /></div>
          <div className="lg:col-span-7"><Skeleton className="h-[500px] w-full bg-slate-800" /></div>
        </div>
      </div>
    );
  }

  if (!rxDetails) {
    return (
      <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Prescription not found</h2>
        <Button onClick={() => router.push("/admin/manage/games/d-pad")}>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/admin/manage/games/d-pad")} 
            className="gap-2 mb-2 pl-0 hover:pl-2 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Setup List
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600/25 text-emerald-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">Benchmark Answer Key Setup</h1>
              <p className="text-slate-400 text-sm">Configure correct benchmark values for D-Pad Prescription ID: <span className="font-mono text-emerald-400 font-bold">{prescriptionId}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Prescription View & Cover Selector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cover Selector */}
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-bold flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" /> Dispensing Drug Covers
              </CardTitle>
              <CardDescription className="text-xs">Select a cover envelope to configure its answers key.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {drugs.map((drugName: string, index: number) => {
                const isSelected = selectedCoverIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCoverIndex(index)}
                    className={`w-full p-3.5 border rounded-xl flex items-center justify-between transition-all text-left ${
                      isSelected 
                        ? "bg-emerald-950/20 border-emerald-600 shadow-sm" 
                        : "border-slate-800 bg-slate-950/20 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <Badge className={`mb-1 ${isSelected ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-700"} text-white`}>
                        Cover {index + 1}
                      </Badge>
                      <h4 className="font-bold text-slate-100 text-sm truncate max-w-[250px]">{drugName}</h4>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        Active Selection
                      </span>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Rx Digital Preview */}
          <Card className="shadow-lg border border-slate-800 overflow-hidden bg-slate-900/40">
            <div className="bg-slate-950 text-slate-400 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b border-slate-850">
              <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
              Prescription Sheet Preview
            </div>
            <CardContent className="p-6 bg-slate-900/50">
              <div className="space-y-4 font-sans text-slate-200">
                <div className="text-center border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-slate-100">
                    {rxDetails.doctor_name || "Dr. Sunil Rathnayaka"}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {rxDetails.Pres_Method || "Registered Medical Practitioner"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Patient Name</span>
                    <span className="font-bold text-slate-200">{rxDetails.Pres_Name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase">Date</span>
                    <span className="font-mono text-slate-200">{rxDetails.pres_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Age</span>
                    <span className="font-bold text-slate-200">{rxDetails.Pres_Age} Years</span>
                  </div>
                </div>

                <div className="relative pl-12 min-h-[120px] pt-1">
                  <span className="absolute left-0 top-0 text-3xl font-serif text-slate-700/35 select-none font-bold italic">Rx</span>
                  <div className="space-y-3 font-mono text-xs text-slate-200">
                    {drugs.map((drug: string, i: number) => (
                      <div key={i} className={`pb-1.5 ${selectedCoverIndex === i ? "text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2" : "text-slate-300"}`}>
                        <p>{drug}</p>
                        <p className="text-[10px] text-slate-500 italic">Cover {i + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Answers Configuration Form */}
        <div className="lg:col-span-7">
          <Card className="shadow-lg border border-slate-800 bg-slate-900/50">
            <CardHeader className="border-b border-slate-800/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-100 font-headline">Benchmark Config: Cover {selectedCoverIndex + 1}</CardTitle>
                <CardDescription className="text-xs text-emerald-400 font-mono">
                  Target Drug: {drugs[selectedCoverIndex]}
                </CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleCopyFromPrescription}
                className="text-xs bg-slate-950 border-slate-800 hover:bg-slate-800"
              >
                Copy Patient & Date
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {answerKeyLoading ? (
                <p className="text-center text-slate-500 py-12">Loading Cover Answer Key...</p>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="date" className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Correct Date *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formState.date}
                        onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-slate-100"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Correct Patient Name *
                      </Label>
                      <Input
                        id="name"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-slate-100"
                        placeholder="Correct Patient Name matching prescription"
                        required
                      />
                    </div>
                  </div>

                  {/* Drug Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="drug_name" className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-slate-400" /> Correct Drug Name *
                      </Label>
                      <div className="relative">
                        <Input
                          id="drug_name"
                          value={drugSearch}
                          onChange={(e) => {
                            setDrugSearch(e.target.value);
                            setFormState({ ...formState, drug_name: e.target.value });
                            setIsDrugDropdownOpen(true);
                          }}
                          onFocus={() => setIsDrugDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsDrugDropdownOpen(false), 200)}
                          className="bg-slate-950 border-slate-800 text-slate-100 pr-8"
                          placeholder="Search or enter correct generic/brand name"
                          autoComplete="off"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsDrugDropdownOpen(!isDrugDropdownOpen)}
                          className="absolute right-2 top-3 text-slate-400 hover:text-white"
                        >
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </button>

                        {isDrugDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                            {selectionData?.drug_name?.filter((name: string) => 
                              name.toLowerCase().includes(drugSearch.toLowerCase())
                            ).length === 0 ? (
                              <div className="px-3 py-2 text-sm text-slate-500">No results found</div>
                            ) : (
                              selectionData?.drug_name
                                ?.filter((name: string) => 
                                  name.toLowerCase().includes(drugSearch.toLowerCase())
                                )
                                .map((name: string) => (
                                  <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                      setFormState({ ...formState, drug_name: name });
                                      setDrugSearch(name);
                                      setIsDrugDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                                  >
                                    {name}
                                  </button>
                                ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="drug_type" className="text-xs font-bold text-slate-300">Dosage Form *</Label>
                      <select
                        id="drug_type"
                        value={formState.drug_type}
                        onChange={(e) => setFormState({ ...formState, drug_type: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {OPTIONS_MAPPINGS.dosageForm.map((form) => (
                          <option key={form} value={form}>{form}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Qty & Daily Frequency */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/60 pt-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="drug_qty" className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Total Quantity *
                      </Label>
                      <Input
                        id="drug_qty"
                        value={formState.drug_qty}
                        onChange={(e) => setFormState({ ...formState, drug_qty: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-slate-100"
                        placeholder="e.g. 10 or 15"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="meal_type" className="text-xs font-bold text-slate-300">Meal Type *</Label>
                      <select
                        id="meal_type"
                        value={formState.meal_type}
                        onChange={(e) => setFormState({ ...formState, meal_type: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none"
                      >
                        {OPTIONS_MAPPINGS.mealType.map((meal) => (
                          <option key={meal} value={meal}>{meal}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="using_type" className="text-xs font-bold text-slate-300">Using Frequency *</Label>
                      <select
                        id="using_type"
                        value={formState.using_type}
                        onChange={(e) => setFormState({ ...formState, using_type: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none"
                      >
                        {OPTIONS_MAPPINGS.usingFrequency.map((freq) => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Daily Quantities schedule */}
                  <div className="bg-slate-950/60 p-4 rounded-xl space-y-3 border border-slate-850">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      Correct Schedule Quantities
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Morning */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-1.5">
                        <div className="flex justify-center text-amber-500"><Sun className="w-4 h-4" /></div>
                        <Label htmlFor="morning_qty" className="text-[10px] font-bold text-slate-400">Morning</Label>
                        <select
                          id="morning_qty"
                          value={formState.morning_qty}
                          onChange={(e) => setFormState({ ...formState, morning_qty: e.target.value })}
                          className="w-full h-8 px-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none"
                        >
                          {OPTIONS_MAPPINGS.scheduleQty.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>

                      {/* Afternoon */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-1.5">
                        <div className="flex justify-center text-orange-400"><Sun className="w-4 h-4" /></div>
                        <Label htmlFor="afternoon_qty" className="text-[10px] font-bold text-slate-400">Afternoon</Label>
                        <select
                          id="afternoon_qty"
                          value={formState.afternoon_qty}
                          onChange={(e) => setFormState({ ...formState, afternoon_qty: e.target.value })}
                          className="w-full h-8 px-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none"
                        >
                          {OPTIONS_MAPPINGS.scheduleQty.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>

                      {/* Evening */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-1.5">
                        <div className="flex justify-center text-indigo-400"><Sunset className="w-4 h-4" /></div>
                        <Label htmlFor="evening_qty" className="text-[10px] font-bold text-slate-400">Evening</Label>
                        <select
                          id="evening_qty"
                          value={formState.evening_qty}
                          onChange={(e) => setFormState({ ...formState, evening_qty: e.target.value })}
                          className="w-full h-8 px-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none"
                        >
                          {OPTIONS_MAPPINGS.scheduleQty.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>

                      {/* Night */}
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center space-y-1.5">
                        <div className="flex justify-center text-slate-300"><Moon className="w-4 h-4" /></div>
                        <Label htmlFor="night_qty" className="text-[10px] font-bold text-slate-400">Night</Label>
                        <select
                          id="night_qty"
                          value={formState.night_qty}
                          onChange={(e) => setFormState({ ...formState, night_qty: e.target.value })}
                          className="w-full h-8 px-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none"
                        >
                          {OPTIONS_MAPPINGS.scheduleQty.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Special parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/45 rounded-xl border border-slate-850">
                    <div className="space-y-1.5">
                      <Label htmlFor="at_a_time" className="text-xs font-bold text-slate-300">at a time quantity (at a time) *</Label>
                      <select
                        id="at_a_time"
                        value={formState.at_a_time}
                        onChange={(e) => setFormState({ ...formState, at_a_time: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none"
                      >
                        {OPTIONS_MAPPINGS.atATime.map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="hour_qty" className="text-xs font-bold text-slate-300">every __ hours frequency *</Label>
                      <select
                        id="hour_qty"
                        value={formState.hour_qty}
                        onChange={(e) => setFormState({ ...formState, hour_qty: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none"
                      >
                        {OPTIONS_MAPPINGS.hourQty.map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Additional Instructions */}
                  <div className="space-y-1.5">
                    <Label htmlFor="additional_description" className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      Correct Additional Instructions
                    </Label>
                    <div className="relative">
                      <Input
                        id="additional_description"
                        value={instructionSearch}
                        onChange={(e) => {
                          setInstructionSearch(e.target.value);
                          setFormState({ ...formState, additional_description: e.target.value });
                          setIsInstructionDropdownOpen(true);
                        }}
                        onFocus={() => setIsInstructionDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsInstructionDropdownOpen(false), 200)}
                        className="bg-slate-950 border-slate-800 text-slate-100 pr-8"
                        placeholder="Search or type correct instructions..."
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setIsInstructionDropdownOpen(!isInstructionDropdownOpen)}
                        className="absolute right-2 top-3 text-slate-400 hover:text-white"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </button>

                      {isInstructionDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                          {selectionData?.additional_description?.filter((desc: string) => 
                            desc.toLowerCase().includes(instructionSearch.toLowerCase())
                          ).length === 0 ? (
                            <div className="px-3 py-2 text-sm text-slate-500">No results found</div>
                          ) : (
                            selectionData?.additional_description
                              ?.filter((desc: string) => 
                                desc.toLowerCase().includes(instructionSearch.toLowerCase())
                              )
                              .map((desc: string) => (
                                <button
                                  key={desc}
                                  type="button"
                                  onClick={() => {
                                    setFormState({ ...formState, additional_description: desc });
                                    setInstructionSearch(desc);
                                    setIsInstructionDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                  {desc}
                                </button>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-450 mr-auto">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      {existingAnswerKey ? (
                        <span className="text-emerald-500 font-semibold">Key configured. Click save to update.</span>
                      ) : (
                        <span className="text-amber-500 font-semibold">No key configured yet for this cover.</span>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-6"
                    >
                      <Save className="w-4 h-4" />
                      {saveMutation.isPending ? "Saving..." : "Save Answer Key"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
