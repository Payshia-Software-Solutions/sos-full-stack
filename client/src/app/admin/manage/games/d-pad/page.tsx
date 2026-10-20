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
  PlusCircle, Calendar, User, Clock, BookOpen, Check, Loader2, Search
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
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all prescriptions
  const { data: prescriptions = [], isLoading, refetch } = useQuery({
    queryKey: ["dpadAllPrescriptions"],
    queryFn: getDpadAllPrescriptions,
  });

  // Filtered prescriptions based on status tabs and search query
  const filteredPrescriptions = prescriptions.filter((pres: Prescription) => {
    const matchesStatus = filterStatus === "All" || pres.prescription_status === filterStatus;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      (pres.prescription_id && pres.prescription_id.toLowerCase().includes(q)) ||
      (pres.id && String(pres.id).toLowerCase().includes(q)) ||
      (pres.Pres_Name && pres.Pres_Name.toLowerCase().includes(q)) ||
      (pres.prescription_name && pres.prescription_name.toLowerCase().includes(q)) ||
      (pres.doctor_name && pres.doctor_name.toLowerCase().includes(q)) ||
      (pres.drugs_list && pres.drugs_list.toLowerCase().includes(q)) ||
      (pres.drugs_written_list && pres.drugs_written_list.toLowerCase().includes(q)) ||
      (pres.notes && pres.notes.toLowerCase().includes(q))
    );
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/admin/manage")} 
            className="gap-2 pl-0 hover:pl-2 text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Management
          </Button>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
              <DPadIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">D-Pad Setup</h1>
              <p className="text-muted-foreground text-sm">Create prescriptions and configure envelope answer keys for the Dispensing Game.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button 
            onClick={() => router.push('/admin/manage/game-reports?game=dpad')}
            variant="outline"
            className="gap-2 font-bold"
          >
            <FileText className="w-4 h-4" /> Assessment Report
          </Button>
          <Button 
            onClick={() => router.push('/admin/manage/games/d-pad/course-assignments')}
            variant="outline"
            className="gap-2 font-bold"
          >
            <BookOpen className="w-4 h-4" /> Manage Assignments
          </Button>
          <Button 
            onClick={() => handleOpenForm(null)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Prescription
          </Button>
        </div>
      </header>

      {/* Prescriptions Grid */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <Card className="border-border bg-card text-center p-12">
          <p className="text-muted-foreground">No prescriptions found. Click "New Prescription" to get started.</p>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <Tabs defaultValue="All" className="w-auto" onValueChange={setFilterStatus}>
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Active">Active</TabsTrigger>
                <TabsTrigger value="In-Active">In-Active</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by PRE ID, patient, doctor, drug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-14 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results summary if searching */}
          {searchQuery && (
            <div className="text-xs text-muted-foreground mb-4 flex items-center justify-between">
              <span>Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions for <strong className="text-primary">"{searchQuery}"</strong></span>
              <button onClick={() => setSearchQuery("")} className="text-primary hover:underline">Reset search</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrescriptions.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                <Search className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No prescriptions found matching your search.</p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchQuery("")} 
                    className="mt-3"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              filteredPrescriptions.map((pres: Prescription) => {
                const drugCount = pres.drugs_list ? pres.drugs_list.split(", ").length : 0;
                return (
                  <Card key={pres.prescription_id} className="border-border bg-card hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={pres.prescription_status === "Active"}
                            onCheckedChange={() => toggleStatusMutation.mutate(pres)}
                            disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables?.prescription_id === pres.prescription_id}
                          />
                          <span className={cn("text-xs font-semibold", pres.prescription_status === "Active" ? "text-primary" : "text-muted-foreground")}>
                            {pres.prescription_status}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono font-bold text-primary bg-primary/10 border-primary/20">
                          {pres.prescription_id}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground mt-2">{pres.Pres_Name}</CardTitle>
                      <CardDescription className="text-muted-foreground text-xs">
                        Patient: {pres.Pres_Age} Years | Date: {pres.pres_date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-xs text-muted-foreground border-t border-b border-border py-2">
                        <p><strong className="text-foreground">Doctor:</strong> {pres.doctor_name}</p>
                        <p className="mt-1"><strong className="text-foreground">Covers:</strong> {drugCount} configured</p>
                      </div>

                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          onClick={() => handleOpenForm(pres)}
                          className="flex-1"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => router.push(`/admin/manage/games/d-pad/${pres.prescription_id}`)}
                          className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
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
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedPrescription ? `Edit Prescription: ${selectedPrescription.prescription_id}` : "Create New Prescription"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2 items-start">
            <form onSubmit={handleSavePrescription} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="patientName" className="text-xs font-bold text-foreground">Patient Name *</Label>
                <Input 
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prescriptionStatus" className="text-xs font-bold text-foreground">Status *</Label>
                <select 
                  id="prescriptionStatus"
                  value={prescriptionStatus}
                  onChange={(e) => setPrescriptionStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="patientDate" className="text-xs font-bold text-foreground">Date *</Label>
                <Input 
                  id="patientDate"
                  type="date"
                  value={patientDate}
                  onChange={(e) => setPatientDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="patientAge" className="text-xs font-bold text-foreground">Age *</Label>
                <Input 
                  id="patientAge"
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="Patient Age"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usingMethod" className="text-xs font-bold text-foreground">Using Method *</Label>
                <Input 
                  id="usingMethod"
                  value={usingMethod}
                  onChange={(e) => setUsingMethod(e.target.value)}
                  placeholder="e.g. 1W, 2D, 3D"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="doctorName" className="text-xs font-bold text-foreground">Doctor Name *</Label>
                <Input 
                  id="doctorName"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Sunil Rathnayaka"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="drugDescription" className="text-xs font-bold text-foreground">Prescription Instructions/Notes</Label>
                <Input 
                  id="drugDescription"
                  value={drugDescription}
                  onChange={(e) => setDrugDescription(e.target.value)}
                  placeholder="Optional instruction notes"
                />
              </div>
            </div>

            {/* Drugs config list builder */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground">Dispensing Drugs List *</h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4 space-y-1.5">
                  <Label htmlFor="drugSelect" className="text-xs font-bold text-muted-foreground">Medicine Drug *</Label>
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
                      className="h-10 w-full pr-8"
                      placeholder="Search or select drug..."
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-2 top-3 text-muted-foreground hover:text-foreground"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                        {masterProducts.filter((p: any) => 
                          p.ProductName.toLowerCase().includes(drugSearch.toLowerCase())
                        ).length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">No results found</div>
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
                                className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
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
                  <Label htmlFor="drugWritten" className="text-xs font-bold text-muted-foreground">Medicine Drug Written *</Label>
                  <Input 
                    id="drugWritten"
                    value={drugWritten}
                    onChange={(e) => setDrugWritten(e.target.value)}
                    className="h-10 w-full"
                    placeholder="Enter written drug"
                    autoComplete="off"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="drugUsage" className="text-xs font-bold text-muted-foreground">Usage *</Label>
                  <select 
                    id="drugUsage"
                    value={drugUsage}
                    onChange={(e) => setDrugUsage(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-2"
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
                      className="h-10 px-3"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Added drugs pill elements */}
              <div className="bg-muted/40 rounded-xl p-3 border border-border min-h-[80px] space-y-2">
                {addedDrugs.length === 0 ? (
                  <p className="text-muted-foreground text-xs text-center py-4">No covers added yet. Select a medicine and click add.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {addedDrugs.map((d, idx) => (
                      <Badge key={idx} variant="outline" className="bg-card border-border text-foreground px-3 py-2 gap-3 text-xs w-full sm:w-auto shadow-2xs">
                        <div className="flex flex-col gap-1.5 w-full">
                            <span>Cover {idx + 1}: <strong className="text-primary">{d.drug}</strong></span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground shrink-0">Written:</span>
                              <input 
                                type="text"
                                value={d.written}
                                onChange={(e) => {
                                  const newDrugs = [...addedDrugs];
                                  newDrugs[idx].written = e.target.value;
                                  setAddedDrugs(newDrugs);
                                }}
                                className="bg-background border border-input text-foreground text-xs px-2 py-1 rounded w-full sm:w-48 focus:outline-none focus:border-primary"
                                placeholder="Edit written name"
                              />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 self-start mt-0.5">
                          <button type="button" onClick={() => handleEditDrug(idx)} className="text-blue-500 hover:text-blue-700 transition-all font-bold" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleRemoveDrug(idx)} className="text-destructive hover:text-destructive/80 transition-all font-bold" title="Remove">
                            ✕
                          </button>
                        </div>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-xs"
              >
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="hidden lg:flex flex-col h-full bg-muted/30 rounded-xl p-6 border border-border sticky top-0 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 border-b border-border pb-2">Prescription Preview</h3>
            <div className="rounded-lg w-full flex-1">
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
