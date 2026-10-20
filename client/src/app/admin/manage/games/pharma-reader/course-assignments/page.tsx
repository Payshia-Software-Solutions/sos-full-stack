"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Search, GraduationCap, Pill, Loader2, Check, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

import { 
    getPrescriptions, 
    getAllPharmaReaderCourseAssignments, 
    assignPharmaReaderPrescriptionToCourse, 
    unassignPharmaReaderPrescriptionFromCourse,
    type Prescription,
    type PharmaReaderCourseAssignment
} from '@/lib/actions/pharma-reader';
import { getBatches } from '@/lib/actions/courses';
import type { Batch } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LMS_API_URL } from '@/lib/config';

export default function PharmaReaderCourseAssignmentsPage() {
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
        queryKey: ['pharmaReaderPrescriptions'],
        queryFn: () => getPrescriptions(),
    });

    const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery<PharmaReaderCourseAssignment[]>({
        queryKey: ['pharmaReaderCourseAssignments'],
        queryFn: getAllPharmaReaderCourseAssignments,
    });

    // --- Mutations ---
    const assignMutation = useMutation({
        mutationFn: (data: { course_code: string; prescription_id: number; assigned_by: string }) => 
            assignPharmaReaderPrescriptionToCourse(data.prescription_id, data.course_code, data.assigned_by),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmaReaderCourseAssignments'] });
            toast({ title: "Prescription Assigned", className: "bg-emerald-600 text-white" });
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Assignment Failed', description: err.message }),
    });

    const unassignMutation = useMutation({
        mutationFn: (data: { course_code: string; prescription_id: number }) => 
            unassignPharmaReaderPrescriptionFromCourse(data.prescription_id, data.course_code),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmaReaderCourseAssignments'] });
            toast({ title: "Assignment Removed" });
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Removal Failed', description: err.message }),
    });

    // --- Derived State ---
    const filteredPrescriptions = useMemo(() => {
        // Fallback for when API returns {status, data} wrapper due to missing conversion
        const actualPrescriptions = Array.isArray(prescriptions) ? prescriptions : ((prescriptions as any).data || []);
        
        return actualPrescriptions.filter((p: Prescription) => 
            p.id.toString().includes(prescriptionSearch.toLowerCase()) || 
            (p.pres_name || "").toLowerCase().includes(prescriptionSearch.toLowerCase())
        );
    }, [prescriptions, prescriptionSearch]);

    const selectedCourseAssignments = useMemo(() => {
        return assignments.filter(a => a.course_code === selectedCourseCode);
    }, [assignments, selectedCourseCode]);

    const isAssigned = (prescriptionId: number) => {
        return selectedCourseAssignments.some(a => Number(a.prescription_id) === Number(prescriptionId));
    };

    const handleToggleAssignment = (prescriptionId: number, currentlyAssigned: boolean) => {
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

    const formatImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads')) return `${LMS_API_URL}${path}`;
        return `https://content-provider.pharmacollege.lk/content-provider/uploads/pharma-reader/${path}`;
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <header>
                <Button variant="ghost" onClick={() => router.push('/admin/manage/games/pharma-reader')} className="-ml-4 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pharma Reader Setup
                </Button>
                <h1 className="text-3xl font-headline font-semibold mt-2 text-foreground flex items-center gap-2">
                    <Pill className="text-indigo-600 dark:text-indigo-400 w-8 h-8" /> 
                    Manage Course Assignments
                </h1>
                <p className="text-muted-foreground mt-1">Control which Pharma Reader prescriptions are accessible to specific student batches.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Batch/Course Selector */}
                <Card className="lg:col-span-1 shadow-sm h-fit bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                            <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Select Batch
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Choose a batch to manage its assigned prescriptions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingBatches ? (
                            <Skeleton className="h-10 w-full bg-muted" />
                        ) : (
                            <Select value={selectedCourseCode || ""} onValueChange={setSelectedCourseCode}>
                                <SelectTrigger className="w-full bg-background border-input text-foreground">
                                    <SelectValue placeholder="Select a batch/course..." />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground max-h-64">
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
                        <CardFooter className="bg-muted/40 border-t border-border py-4">
                            <div className="text-sm font-medium text-muted-foreground">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mr-1">{selectedCourseAssignments.length}</span> 
                                Prescriptions assigned to this batch.
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* Assignment Controls */}
                <Card className="lg:col-span-2 shadow-sm min-h-[500px] bg-card border-border">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl text-card-foreground">Prescriptions</CardTitle>
                                <CardDescription className="text-muted-foreground">Toggle prescriptions to assign or unassign them from the selected batch.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search prescriptions..."
                                    value={prescriptionSearch}
                                    onChange={(e) => setPrescriptionSearch(e.target.value)}
                                    className="pl-10 bg-background border-input text-foreground"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!selectedCourseCode ? (
                            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                                <GraduationCap className="h-20 w-20 mb-4 opacity-20" />
                                <p className="text-lg italic">Select a batch from the left to start assigning.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full bg-muted" />)}
                            </div>
                        ) : filteredPrescriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <p>No prescriptions found matching your search.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
                                {filteredPrescriptions.map((pres: Prescription) => {
                                    const assigned = isAssigned(pres.id);
                                    const isPending = (assignMutation.isPending && (assignMutation.variables as any)?.prescription_id === pres.id) || 
                                                     (unassignMutation.isPending && (unassignMutation.variables as any)?.prescription_id === pres.id);
                                    
                                    return (
                                        <div 
                                            key={pres.id} 
                                            className={cn(
                                                "flex items-center justify-between p-4 transition-colors hover:bg-muted/50",
                                                assigned ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "mt-1 p-2 rounded-lg border",
                                                    assigned 
                                                        ? "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400" 
                                                        : "bg-muted/50 border-border text-muted-foreground"
                                                )}>
                                                    <Pill className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {pres.pres_name} 
                                                        <span className="ml-2 text-xs font-mono text-muted-foreground">({pres.id})</span>
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn(
                                                            "text-xs px-2 py-0.5 rounded-full font-medium",
                                                            pres.active_status === 'Active' 
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                                                                : "bg-muted text-muted-foreground border border-border"
                                                        )}>
                                                            {pres.active_status}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                            {pres.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    onClick={() => setPreviewPrescription(pres)}
                                                    title="Quick View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={assigned ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={isPending}
                                                    onClick={() => handleToggleAssignment(pres.id, assigned)}
                                                    className={cn(
                                                        "min-w-[120px] transition-all",
                                                        assigned 
                                                            ? "bg-indigo-600 hover:bg-rose-600 hover:text-white text-white shadow-sm" 
                                                            : "bg-background border-input text-foreground hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
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
                <DialogContent className="bg-card border-border text-card-foreground max-w-2xl w-[90vw]">
                    <DialogHeader className="p-6 pb-2 border-b border-border">
                        <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
                            <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Prescription Preview
                        </DialogTitle>
                    </DialogHeader>
                    {previewPrescription && (
                        <div className="p-4 flex flex-col items-center overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <img 
                                src={formatImageUrl(previewPrescription.image_path)} 
                                alt={previewPrescription.pres_name}
                                className="max-w-full max-h-[40vh] object-contain rounded-md shadow-sm border border-border"
                            />
                            <div className="mt-4 w-full bg-muted/40 p-4 rounded-md border border-border flex-shrink-0">
                                <h3 className="font-bold text-foreground" dangerouslySetInnerHTML={{ __html: previewPrescription.prescription_question }} />
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <li className={previewPrescription.correct_answer === 'answer_1' ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>1. {previewPrescription.answer_1}</li>
                                    <li className={previewPrescription.correct_answer === 'answer_2' ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>2. {previewPrescription.answer_2}</li>
                                    <li className={previewPrescription.correct_answer === 'answer_3' ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>3. {previewPrescription.answer_3}</li>
                                    <li className={previewPrescription.correct_answer === 'answer_4' ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>4. {previewPrescription.answer_4}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
