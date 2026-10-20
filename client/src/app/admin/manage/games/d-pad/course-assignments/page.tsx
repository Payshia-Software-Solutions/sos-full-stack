"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Search, GraduationCap, Pill, Loader2, Check, Dna, Eye } from "lucide-react";
import { PrescriptionPaper } from "@/components/d-pad/PrescriptionPaper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

import { 
    getDpadAllPrescriptions, 
    getDpadAllCourseAssignments, 
    assignDpadPrescriptionToCourse, 
    unassignDpadPrescriptionFromCourse 
} from '@/lib/actions/games';
import { getBatches } from '@/lib/actions/courses';
import type { Batch } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Prescription {
  prescription_id: string;
  prescription_name: string;
  Pres_Name: string;
  prescription_status: string;
  pres_date?: string;
  Pres_Age?: string;
  Pres_Method?: string;
  doctor_name?: string;
  notes?: string;
  drugs_list?: string;
}

export default function DpadCourseAssignmentsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [prescriptionSearch, setPrescriptionSearch] = useState('');
    const [previewPrescription, setPreviewPrescription] = useState<Prescription | null>(null);

    // --- Data Fetching ---
    const { data: batches = [], isLoading: isLoadingBatches } = useQuery<Batch[]>({
        queryKey: ['batches'],
        queryFn: getBatches,
    });

    const { data: prescriptions = [], isLoading: isLoadingRx } = useQuery<Prescription[]>({
        queryKey: ['dpadAllPrescriptions'],
        queryFn: getDpadAllPrescriptions,
    });

    const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery<any[]>({
        queryKey: ['dpadCourseAssignments'],
        queryFn: getDpadAllCourseAssignments,
    });

    // --- Mutations ---
    const assignMutation = useMutation({
        mutationFn: (data: { course_code: string; prescription_id: string; assigned_by: string }) => 
            assignDpadPrescriptionToCourse(data.prescription_id, data.course_code, data.assigned_by),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dpadCourseAssignments'] });
            toast({ title: "Prescription Assigned", className: "bg-emerald-600 text-white" });
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Assignment Failed', description: err.message }),
    });

    const unassignMutation = useMutation({
        mutationFn: (data: { course_code: string; prescription_id: string }) => 
            unassignDpadPrescriptionFromCourse(data.prescription_id, data.course_code),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dpadCourseAssignments'] });
            toast({ title: "Assignment Removed" });
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Removal Failed', description: err.message }),
    });

    // --- Derived State ---
    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter(p => 
            p.prescription_id.toLowerCase().includes(prescriptionSearch.toLowerCase()) || 
            (p.Pres_Name || "").toLowerCase().includes(prescriptionSearch.toLowerCase())
        );
    }, [prescriptions, prescriptionSearch]);

    const selectedCourseAssignments = useMemo(() => {
        return assignments.filter(a => a.course_code === selectedCourseCode);
    }, [assignments, selectedCourseCode]);

    const isAssigned = (prescriptionId: string) => {
        return selectedCourseAssignments.some(a => a.prescription_id === prescriptionId);
    };

    const handleToggleAssignment = (prescriptionId: string, currentlyAssigned: boolean) => {
        if (!selectedCourseCode || !user?.username) return;

        if (currentlyAssigned) {
            unassignMutation.mutate({ course_code: selectedCourseCode, prescription_id: prescriptionId });
        } else {
            assignMutation.mutate({ 
                course_code: selectedCourseCode, 
                prescription_id: prescriptionId, 
                assigned_by: user.username 
            });
        }
    };

    const isLoading = isLoadingBatches || isLoadingRx || isLoadingAssignments;

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20 max-w-7xl mx-auto w-full">
            <header>
                <Button variant="ghost" size="sm" onClick={() => router.push('/admin/manage/games/d-pad')} className="-ml-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to D-Pad Setup
                </Button>
                <div className="flex items-center gap-3 mt-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            Manage Course Assignments
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">Control which D-Pad prescriptions are accessible to specific student batches.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Batch/Course Selector */}
                <Card className="lg:col-span-1 shadow-xs border border-border bg-card rounded-2xl h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <GraduationCap className="h-5 w-5 text-indigo-500" />
                            Select Batch
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Choose a batch to manage its assigned prescriptions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingBatches ? (
                            <Skeleton className="h-10 w-full rounded-xl" />
                        ) : (
                            <Select value={selectedCourseCode || ""} onValueChange={setSelectedCourseCode}>
                                <SelectTrigger className="w-full bg-card border-border text-foreground">
                                    <SelectValue placeholder="Select a batch/course..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    {batches.map(batch => (
                                        <SelectItem key={batch.id} value={batch.courseCode}>
                                            {batch.name || batch.courseCode} ({batch.courseCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </CardContent>
                    {selectedCourseCode && (
                        <CardFooter className="bg-muted/30 border-t border-border py-4">
                            <div className="text-sm font-medium text-muted-foreground">
                                <span className="text-primary font-bold text-lg mr-1">{selectedCourseAssignments.length}</span> 
                                Prescriptions assigned to this batch.
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* Assignment Controls */}
                <Card className="lg:col-span-2 shadow-xs border border-border bg-card rounded-2xl min-h-[500px]">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl text-foreground">Prescriptions</CardTitle>
                                <CardDescription className="text-muted-foreground">Toggle prescriptions to assign or unassign them from the selected batch.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search prescriptions..."
                                    value={prescriptionSearch}
                                    onChange={(e) => setPrescriptionSearch(e.target.value)}
                                    className="pl-10 bg-card border-border text-foreground"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!selectedCourseCode ? (
                            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                                <GraduationCap className="h-20 w-20 mb-4 opacity-20" />
                                <p className="text-lg italic font-medium">Select a batch from the left to start assigning.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                            </div>
                        ) : filteredPrescriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <p>No prescriptions found matching your search.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
                                {filteredPrescriptions.map(pres => {
                                    const assigned = isAssigned(pres.prescription_id);
                                    const isPending = (assignMutation.isPending && (assignMutation.variables as any)?.prescription_id === pres.prescription_id) || 
                                                     (unassignMutation.isPending && (unassignMutation.variables as any)?.prescription_id === pres.prescription_id);
                                    
                                    return (
                                        <div 
                                            key={pres.prescription_id} 
                                            className={cn(
                                                "flex items-center justify-between p-4 transition-colors hover:bg-muted/40",
                                                assigned ? "bg-primary/5" : ""
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "mt-1 p-2 rounded-lg border",
                                                    assigned 
                                                        ? "bg-primary/10 border-primary/20 text-primary" 
                                                        : "bg-muted border-border text-muted-foreground"
                                                )}>
                                                    <Dna className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {pres.Pres_Name} 
                                                        <span className="ml-2 text-xs font-mono text-muted-foreground">({pres.prescription_id})</span>
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn(
                                                            "text-xs px-2 py-0.5 rounded-full font-medium",
                                                            pres.prescription_status === 'Active' 
                                                                ? "bg-primary/10 text-primary" 
                                                                : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {pres.prescription_status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setPreviewPrescription(pres)}
                                                    title="Quick View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={assigned ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={isPending}
                                                    onClick={() => handleToggleAssignment(pres.prescription_id, assigned)}
                                                    className={cn(
                                                        "min-w-[120px] transition-all font-semibold",
                                                        assigned 
                                                            ? "bg-primary hover:bg-destructive hover:text-destructive-foreground text-primary-foreground" 
                                                            : ""
                                                    )}
                                                >
                                                    {isPending ? (
                                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating</>
                                                    ) : assigned ? (
                                                        <><Check className="mr-2 h-4 w-4" /> Assigned</>
                                                    ) : (
                                                        "Assign"
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick View Dialog */}
            <Dialog open={!!previewPrescription} onOpenChange={(open) => !open && setPreviewPrescription(null)}>
                <DialogContent className="max-w-2xl w-[90vw]">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
                            <Eye className="w-5 h-5 text-indigo-500" />
                            Prescription Preview
                        </DialogTitle>
                    </DialogHeader>
                    {previewPrescription && (
                        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <PrescriptionPaper prescription={previewPrescription} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
