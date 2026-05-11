"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Layers, Check, Loader2, AlertTriangle, ChevronRight, GraduationCap, MinusCircle, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from "@/components/ui/checkbox";

import { 
    getMediMindLevels, 
    getMediMindCourseLevels, 
    assignMediMindLevelToCourse, 
    unassignMediMindLevelFromCourse 
} from '@/lib/actions/games';
import { getBatches } from '@/lib/actions/courses';
import type { MediMindLevel, Batch } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function CourseAssignmentsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [levelSearch, setLevelSearch] = useState('');

    // --- Data Fetching ---
    const { data: batches = [], isLoading: isLoadingBatches } = useQuery<Batch[]>({
        queryKey: ['batches'],
        queryFn: getBatches,
    });

    const { data: levels = [], isLoading: isLoadingLevels } = useQuery<MediMindLevel[]>({
        queryKey: ['mediMindLevels'],
        queryFn: getMediMindLevels,
    });

    const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery<any[]>({
        queryKey: ['mediMindCourseLevels'],
        queryFn: getMediMindCourseLevels,
    });

    // --- Mutations ---
    const assignMutation = useMutation({
        mutationFn: assignMediMindLevelToCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mediMindCourseLevels'] });
            toast({ title: "Level Assigned", description: "The level is now available for this batch." });
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Assignment Failed', description: err.message }),
    });

    const unassignMutation = useMutation({
        mutationFn: unassignMediMindLevelFromCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mediMindCourseLevels'] });
            toast({ title: "Assignment Removed" });
        },
        onError: (err: Error) => toast({ variant: 'destructive', title: 'Removal Failed', description: err.message }),
    });

    // --- Derived State ---
    const filteredLevels = useMemo(() => {
        return levels.filter(l => l.level_name.toLowerCase().includes(levelSearch.toLowerCase()));
    }, [levels, levelSearch]);

    const selectedCourseAssignments = useMemo(() => {
        return assignments.filter(a => a.course_code === selectedCourseCode);
    }, [assignments, selectedCourseCode]);

    const isAssigned = (levelId: number) => {
        return selectedCourseAssignments.some(a => Number(a.level_id) === levelId);
    };

    const handleToggleAssignment = (levelId: number, currentlyAssigned: boolean) => {
        if (!selectedCourseCode || !user?.username) return;

        if (currentlyAssigned) {
            unassignMutation.mutate({ course_code: selectedCourseCode, level_id: levelId });
        } else {
            assignMutation.mutate({ 
                course_code: selectedCourseCode, 
                level_id: levelId, 
                assigned_by: user.username 
            });
        }
    };

    const isLoading = isLoadingBatches || isLoadingLevels || isLoadingAssignments;

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <header>
                <Button variant="ghost" onClick={() => router.push('/admin/manage/games/medimind')} className="-ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to MediMind Setup
                </Button>
                <h1 className="text-3xl font-headline font-semibold mt-2">Manage Course Assignments</h1>
                <p className="text-muted-foreground">Control which game levels are accessible to specific student batches.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Batch/Course Selector */}
                <Card className="lg:col-span-1 shadow-lg h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Select Batch
                        </CardTitle>
                        <CardDescription>Choose a batch to manage its assigned levels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingBatches ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select value={selectedCourseCode || ""} onValueChange={setSelectedCourseCode}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a batch/course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map(batch => (
                                        <SelectItem key={batch.id} value={batch.courseCode}>
                                            {batch.name} ({batch.courseCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </CardContent>
                    {selectedCourseCode && (
                        <CardFooter className="bg-muted/30 border-t py-4">
                            <div className="text-sm font-medium">
                                <span className="text-primary font-bold">{selectedCourseAssignments.length}</span> Levels currently assigned to this batch.
                            </div>
                        </CardFooter>
                    )}
                </Card>

                {/* Assignment Controls */}
                <Card className="lg:col-span-2 shadow-lg min-h-[500px]">
                    <CardHeader className="border-b bg-muted/10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Game Levels</CardTitle>
                                <CardDescription>Toggle levels to assign or unassign them from the selected batch.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search levels..."
                                    value={levelSearch}
                                    onChange={(e) => setLevelSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!selectedCourseCode ? (
                            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground/40">
                                <GraduationCap className="h-20 w-20 mb-4 opacity-10" />
                                <p className="text-lg italic">Select a batch from the left to start assigning levels.</p>
                            </div>
                        ) : isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredLevels.map(level => {
                                    const assigned = isAssigned(Number(level.id));
                                    const isPending = (assignMutation.isPending && (assignMutation.variables as any)?.level_id === Number(level.id)) || 
                                                     (unassignMutation.isPending && (unassignMutation.variables as any)?.level_id === Number(level.id));

                                    return (
                                        <div key={level.id} className={cn(
                                            "p-4 flex items-center justify-between transition-colors",
                                            assigned ? "bg-primary/5" : "hover:bg-muted/30"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm transition-colors",
                                                    assigned ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground"
                                                )}>
                                                    <Layers className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className={cn("font-bold text-lg", assigned ? "text-primary" : "text-foreground")}>
                                                        {level.level_name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground font-medium">Level ID: {level.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isPending ? (
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                ) : (
                                                    <Button
                                                        variant={assigned ? "destructive" : "default"}
                                                        size="sm"
                                                        onClick={() => handleToggleAssignment(Number(level.id), assigned)}
                                                        className={cn(
                                                            "rounded-full px-4 h-9 font-bold flex items-center gap-2 transition-all",
                                                            !assigned && "bg-green-600 hover:bg-green-700"
                                                        )}
                                                    >
                                                        {assigned ? (
                                                            <>
                                                                <MinusCircle className="h-4 w-4" /> Unassign
                                                            </>
                                                        ) : (
                                                            <>
                                                                <PlusCircle className="h-4 w-4" /> Assign Level
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredLevels.length === 0 && (
                                    <div className="p-20 text-center text-muted-foreground">
                                        <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>No game levels found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
