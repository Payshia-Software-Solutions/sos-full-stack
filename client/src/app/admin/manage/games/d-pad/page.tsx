"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { DPadIcon } from "@/components/icons/module-icons";
import { getDpadAllPrescriptions, saveDpadPrescription, updateDpadPrescriptionStatus, getMasterProducts } from "@/lib/actions/games";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PrescriptionPaper } from "@/components/d-pad/PrescriptionPaper";
import { 
  ArrowLeft, Plus, Edit, Settings, FileText, 
  PlusCircle, Calendar, User, Clock, BookOpen, Check, Loader2
} from "lucide-react";

interface Prescription {
  id: string;
  prescription_id: string;
  prescription_name: string;
  prescription_status: string;
  Pres_Name: string;
  pres_date: string;
  Pres_Age: string;
  Pres_Method: string;
  doctor_name: string;
  notes: string;
  drugs_list: string;
  drugs_written_list?: string;
}

interface AddedDrug {
  drug: string;
  written: string;
}

export default function DpadAdminManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [patientDate, setPatientDate] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [usingMethod, setUsingMethod] = useState("");
  const [drugDescription, setDrugDescription] = useState("");
  const [prescriptionStatus, setPrescriptionStatus] = useState("Active");

  // Drug builder states
  const [selectedDrug, setSelectedDrug] = useState("");
  const [drugSearch, setDrugSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [drugUsage, setDrugUsage] = useState("tds");
  const [drugWritten, setDrugWritten] = useState("");
  const [addedDrugs, setAddedDrugs] = useState<AddedDrug[]>([]);
  const [editingDrugIndex, setEditingDrugIndex] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch all prescriptions
  const { data: prescriptions = [], isLoading, refetch } = useQuery({
    queryKey: ["dpadAllPrescriptions"],
    queryFn: getDpadAllPrescriptions,
  });

  // Fetch master POS products for the drug selector dropdown
  const { data: masterProducts = [] } = useQuery({
    queryKey: ["masterProducts"],
    queryFn: getMasterProducts,
  });

  // Handle open form for create/edit
  const handleOpenForm = (prescription: Prescription | null = null) => {
    if (prescription) {
      setSelectedPrescription(prescription);
      setPatientName(prescription.Pres_Name || "");
      setPatientDate(prescription.pres_date || "");
      setPatientAge(prescription.Pres_Age || "");
      setDoctorName(prescription.doctor_name || "");
      setUsingMethod(prescription.Pres_Method || "");
      setDrugDescription(prescription.notes || "");
      setPrescriptionStatus(prescription.prescription_status || "Active");
      
      const parsedDrugs = prescription.drugs_list 
        ? prescription.drugs_list.split(", ") 
        : [];
      const parsedWritten = prescription.drugs_written_list
        ? prescription.drugs_written_list.split(", ")
        : [];
      setAddedDrugs(parsedDrugs.map((d, i) => {
        let defaultWritten = parsedWritten[i] || "";
        if (!defaultWritten && d) {
          const parts = d.split(" ");
          const lastWord = parts[parts.length - 1];
          const knownUsages = ["bd", "tds", "daily", "mane", "nocte"];
          
          if (parts.length > 1 && knownUsages.includes(lastWord)) {
            parts.pop(); // remove usage
            defaultWritten = parts.join(" ");
          } else {
            defaultWritten = d;
          }
        }
        return { drug: d, written: defaultWritten };
      }));
    } else {
      setSelectedPrescription(null);
      setPatientName("");
      setPatientDate(new Date().toISOString().split("T")[0]);
      setPatientAge("");
      setDoctorName("");
      setUsingMethod("");
      setDrugDescription("");
      setPrescriptionStatus("Active");
      setAddedDrugs([]);
    }
    setSelectedDrug("");
    setDrugSearch("");
    setDrugWritten("");
    setEditingDrugIndex(null);
    setIsDropdownOpen(false);
    setIsFormOpen(true);
  };

  // Add drug from helper inputs to list
  const handleAddDrug = () => {
    if (!selectedDrug) {
      toast({ variant: "destructive", title: "Select a drug to add" });
      return;
    }
    if (!drugWritten) {
      toast({ variant: "destructive", title: "Enter the written drug name" });
      return;
    }
    const drugString = `${selectedDrug} ${drugUsage}`;
    
    if (editingDrugIndex !== null) {
      const newDrugs = [...addedDrugs];
      newDrugs[editingDrugIndex] = { drug: drugString, written: drugWritten };
      setAddedDrugs(newDrugs);
      setEditingDrugIndex(null);
    } else {
      if (addedDrugs.some(d => d.drug === drugString)) {
        toast({ variant: "destructive", title: "This drug is already added" });
        return;
      }
      setAddedDrugs([...addedDrugs, { drug: drugString, written: drugWritten }]);
    }
    
    setSelectedDrug("");
    setDrugSearch("");
    setDrugWritten("");
  };

  const handleEditDrug = (idx: number) => {
    const item = addedDrugs[idx];
    const parts = item.drug.split(" ");
    const lastWord = parts[parts.length - 1];
    const knownUsages = ["bd", "tds", "daily", "mane", "nocte"];
    
    let usage = "tds";
    let name = item.drug;
    
    if (parts.length > 1 && knownUsages.includes(lastWord)) {
      usage = parts.pop() || "tds";
      name = parts.join(" ");
    }
    
    setSelectedDrug(name);
    setDrugSearch(name);
    setDrugUsage(usage);
    setDrugWritten(item.written);
    setEditingDrugIndex(idx);
  };

  // Remove drug from list
  const handleRemoveDrug = (indexToRemove: number) => {
    setAddedDrugs(addedDrugs.filter((_, i) => i !== indexToRemove));
  };

  const saveMutation = useMutation({
    mutationFn: (payload: any) => saveDpadPrescription(payload),
    onSuccess: (res) => {
      if (res.status === "success") {
        toast({ title: "🎉 " + res.message, className: "bg-emerald-600 text-white" });
        setIsFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ["dpadAllPrescriptions"] });
        refetch();
      } else {
        toast({ variant: "destructive", title: "❌ " + res.message });
      }
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to save prescription." });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (pres: Prescription) => {
      const newStatus = pres.prescription_status === "Active" ? "In-Active" : "Active";
      return updateDpadPrescriptionStatus(pres.prescription_id, newStatus);
    },
    onSuccess: (res) => {
      if (res.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["dpadAllPrescriptions"] });
        refetch();
        toast({ title: "Status Updated", description: "Prescription status toggled successfully.", className: "bg-emerald-600 text-white" });
      }
    }
  });

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientDate || !patientAge || !doctorName || !usingMethod) {
      toast({ variant: "destructive", title: "Please fill out all required fields" });
      return;
    }
    if (addedDrugs.length === 0) {
      toast({ variant: "destructive", title: "Please add at least one drug cover to the prescription" });
      return;
    }

    const payload = {
      prescriptionID: selectedPrescription ? selectedPrescription.prescription_id : "0",
      patientName,
      prescriptionStatus,
      patientDate,
      patientAge: parseInt(patientAge),
      usingMethod,
      doctorName,
      drugDescription,
      drugsList: JSON.stringify(addedDrugs.map(d => d.drug)),
      drugsWrittenList: JSON.stringify(addedDrugs.map(d => d.written))
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/admin/manage")} 
            className="gap-2 pl-0 hover:pl-2 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Management
          </Button>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white">
              <DPadIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline text-slate-100">D-Pad Setup</h1>
              <p className="text-slate-400 text-sm">Create prescriptions and configure envelope answer keys for the Dispensing Game.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button 
            onClick={() => router.push('/admin/manage/games/d-pad/course-assignments')}
            variant="outline"
            className="border-indigo-600/50 text-indigo-400 hover:bg-indigo-600/10 hover:text-indigo-300 gap-2 font-bold"
          >
            <BookOpen className="w-4 h-4" /> Manage Assignments
          </Button>
          <Button 
            onClick={() => handleOpenForm(null)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-md"
          >
            <Plus className="w-4 h-4" /> New Prescription
          </Button>
        </div>
      </header>

      {/* Prescriptions Grid */}
      {isLoading ? (
        <p className="text-center text-slate-500 py-12">Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/40 text-center p-12">
          <p className="text-slate-400">No prescriptions found. Click "New Prescription" to get started.</p>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="All" className="w-full mb-6" onValueChange={setFilterStatus}>
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="All" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">All</TabsTrigger>
              <TabsTrigger value="Active" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 text-slate-400">Active</TabsTrigger>
              <TabsTrigger value="In-Active" className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-300 text-slate-400">In-Active</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.filter((pres: Prescription) => filterStatus === "All" || pres.prescription_status === filterStatus).length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No prescriptions found for the selected filter.
              </div>
            ) : (
              prescriptions
                .filter((pres: Prescription) => filterStatus === "All" || pres.prescription_status === filterStatus)
                .map((pres: Prescription) => {
                  const drugCount = pres.drugs_list ? pres.drugs_list.split(", ").length : 0;
                  return (
                    <Card key={pres.prescription_id} className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={pres.prescription_status === "Active"}
                        onCheckedChange={() => toggleStatusMutation.mutate(pres)}
                        disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.prescription_id === pres.prescription_id}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <span className={cn("text-xs font-semibold", pres.prescription_status === "Active" ? "text-emerald-400" : "text-slate-500")}>
                        {pres.prescription_status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{pres.prescription_id}</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-100 mt-2">{pres.Pres_Name}</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Patient: {pres.Pres_Age} Years | Date: {pres.pres_date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-slate-400 border-t border-b border-slate-800/55 py-2">
                    <p><strong className="text-slate-300">Doctor:</strong> {pres.doctor_name}</p>
                    <p className="mt-1"><strong className="text-slate-300">Covers:</strong> {drugCount} configured</p>
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      onClick={() => handleOpenForm(pres)}
                      className="flex-1 border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button 
                      onClick={() => router.push(`/admin/manage/games/d-pad/${pres.prescription_id}`)}
                      className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-855 hover:border-emerald-700"
                    >
                      <Settings className="w-3.5 h-3.5 mr-1.5" /> Answers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        </div>
        </>
      )}

      {/* Create / Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-headline text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              {selectedPrescription ? `Edit Prescription: ${selectedPrescription.prescription_id}` : "Create New Prescription"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2 items-start">
            <form onSubmit={handleSavePrescription} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="patientName" className="text-xs font-bold text-slate-300">Patient Name *</Label>
                <Input 
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prescriptionStatus" className="text-xs font-bold text-slate-300">Status *</Label>
                <select 
                  id="prescriptionStatus"
                  value={prescriptionStatus}
                  onChange={(e) => setPrescriptionStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="patientDate" className="text-xs font-bold text-slate-300">Date *</Label>
                <Input 
                  id="patientDate"
                  type="date"
                  value={patientDate}
                  onChange={(e) => setPatientDate(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="patientAge" className="text-xs font-bold text-slate-300">Age *</Label>
                <Input 
                  id="patientAge"
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  placeholder="Patient Age"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usingMethod" className="text-xs font-bold text-slate-300">Using Method *</Label>
                <Input 
                  id="usingMethod"
                  value={usingMethod}
                  onChange={(e) => setUsingMethod(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  placeholder="e.g. 1W, 2D, 3D"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="doctorName" className="text-xs font-bold text-slate-300">Doctor Name *</Label>
                <Input 
                  id="doctorName"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  placeholder="e.g. Dr. Sunil Rathnayaka"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="drugDescription" className="text-xs font-bold text-slate-300">Prescription Instructions/Notes</Label>
                <Input 
                  id="drugDescription"
                  value={drugDescription}
                  onChange={(e) => setDrugDescription(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  placeholder="Optional instruction notes"
                />
              </div>
            </div>

            {/* Drugs config list builder */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Dispensing Drugs List *</h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4 space-y-1.5">
                  <Label htmlFor="drugSelect" className="text-xs font-bold text-slate-400">Medicine Drug *</Label>
                  <div className="relative">
                    <Input 
                      id="drugSelect"
                      value={drugSearch}
                      onChange={(e) => {
                        setDrugSearch(e.target.value);
                        setSelectedDrug(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      className="bg-slate-950 border-slate-800 text-slate-100 h-10 w-full pr-8"
                      placeholder="Search or select drug..."
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-2 top-3 text-slate-400 hover:text-white"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                        {masterProducts.filter((p: any) => 
                          p.ProductName.toLowerCase().includes(drugSearch.toLowerCase())
                        ).length === 0 ? (
                          <div className="px-3 py-2 text-sm text-slate-500">No results found</div>
                        ) : (
                          masterProducts
                            .filter((p: any) => 
                              p.ProductName.toLowerCase().includes(drugSearch.toLowerCase())
                            )
                            .map((p: any) => (
                              <button
                                key={p.product_id || p.product_code}
                                type="button"
                                onClick={() => {
                                  setSelectedDrug(p.ProductName);
                                  setDrugSearch(p.ProductName);
                                  setDrugWritten(p.ProductName);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                              >
                                {p.ProductName}
                              </button>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-3 space-y-1.5">
                  <Label htmlFor="drugWritten" className="text-xs font-bold text-slate-400">Medicine Drug Written *</Label>
                  <Input 
                    id="drugWritten"
                    value={drugWritten}
                    onChange={(e) => setDrugWritten(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-10 w-full"
                    placeholder="Enter written drug"
                    autoComplete="off"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="drugUsage" className="text-xs font-bold text-slate-400">Usage *</Label>
                  <select 
                    id="drugUsage"
                    value={drugUsage}
                    onChange={(e) => setDrugUsage(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bd">bd</option>
                    <option value="tds">tds</option>
                    <option value="daily">daily</option>
                    <option value="mane">mane</option>
                    <option value="nocte">nocte</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <Button 
                    type="button" 
                    onClick={handleAddDrug}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-2"
                  >
                    {editingDrugIndex !== null ? (
                      <><Check className="w-4 h-4 mr-1 shrink-0" /> Update</>
                    ) : (
                      <><PlusCircle className="w-4 h-4 mr-1 shrink-0" /> Add</>
                    )}
                  </Button>
                  {editingDrugIndex !== null && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingDrugIndex(null);
                        setSelectedDrug("");
                        setDrugSearch("");
                        setDrugWritten("");
                      }}
                      className="h-10 px-3 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Added drugs pill elements */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850/80 min-h-[80px] space-y-2">
                {addedDrugs.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-4">No covers added yet. Select a medicine and click add.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {addedDrugs.map((d, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-900 border-slate-800 text-slate-200 px-3 py-2 gap-3 text-xs w-full sm:w-auto">
                        <div className="flex flex-col gap-1.5 w-full">
                            <span>Cover {idx + 1}: <strong className="text-emerald-400">{d.drug}</strong></span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 shrink-0">Written:</span>
                              <input 
                                type="text"
                                value={d.written}
                                onChange={(e) => {
                                  const newDrugs = [...addedDrugs];
                                  newDrugs[idx].written = e.target.value;
                                  setAddedDrugs(newDrugs);
                                }}
                                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded w-full sm:w-48 focus:outline-none focus:border-emerald-500"
                                placeholder="Edit written name"
                              />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 self-start mt-0.5">
                          <button type="button" onClick={() => handleEditDrug(idx)} className="text-blue-400 hover:text-blue-600 transition-all font-bold" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleRemoveDrug(idx)} className="text-rose-400 hover:text-rose-600 transition-all font-bold" title="Remove">
                            ✕
                          </button>
                        </div>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="text-slate-400 hover:text-white">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md"
              >
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="hidden lg:flex flex-col h-full bg-slate-950/50 rounded-xl p-6 border border-slate-800 sticky top-0 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Prescription Preview</h3>
            <div className="bg-white/5 rounded-lg w-full flex-1">
              <PrescriptionPaper 
                prescription={{
                  doctor_name: doctorName,
                  Pres_Method: usingMethod,
                  Pres_Name: patientName,
                  pres_date: patientDate,
                  Pres_Age: patientAge,
                  drugs_list: addedDrugs.map(d => d.drug).join(", "),
                  drugs_written_list: addedDrugs.map(d => d.written).join(", ")
                }} 
              />
            </div>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
