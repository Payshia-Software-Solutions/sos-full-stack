"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Edit, Trash2, Loader2, Filter } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCareSavedAnswers, createCareSavedAnswer, updateCareSavedAnswer, deleteCareSavedAnswer } from '@/lib/actions/games';
import type { CareSavedAnswer } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ANSWER_TYPES = ["Additional", "Name", "DrugName", "DosageForm", "MealType", "UsingType", "Quantity"];

const SavedAnswerForm = ({ answer, onSave, onClose, isSaving }: { answer: CareSavedAnswer | null; onSave: (type: string, text: string) => void; onClose: () => void; isSaving: boolean; }) => {
    const [answerText, setAnswerText] = useState(answer?.answer || '');
    const [answerType, setAnswerType] = useState(answer?.answer_type || 'Additional');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answerText.trim()) {
            toast({ variant: 'destructive', title: 'Text cannot be empty.' });
            return;
        }
        onSave(answerType, answerText);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="answer-type">Category (Answer Type)</Label>
                    <Select value={answerType} onValueChange={setAnswerType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {ANSWER_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="answer-text">Option Text</Label>
                    <Input id="answer-text" value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="e.g. For very dry skin" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline" type="button" disabled={isSaving}>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save
                </Button>
            </DialogFooter>
        </form>
    );
};

export default function ManageSavedAnswersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState<CareSavedAnswer | null>(null);
    const [answerToDelete, setAnswerToDelete] = useState<CareSavedAnswer | null>(null);
    const [filterType, setFilterType] = useState<string>("Additional");

    const { data: allAnswers = [], isLoading, isError, error } = useQuery<CareSavedAnswer[]>({
        queryKey: ['allCareSavedAnswers'],
        queryFn: getCareSavedAnswers,
    });
    
    // Process the data to filter by type
    const filteredAnswers = useMemo(() => {
        let filtered = allAnswers;
        if (filterType !== "All") {
            filtered = filtered.filter(a => a.answer_type === filterType);
        }
        return filtered.sort((a,b) => a.answer.localeCompare(b.answer));
    }, [allAnswers, filterType]);

    const createMutation = useMutation({
        mutationFn: createCareSavedAnswer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allCareSavedAnswers'] });
            toast({ title: 'Option Added' });
            setIsDialogOpen(false);
        },
        onError: (err: Error) => {
            toast({ variant: 'destructive', title: 'Create Failed', description: err.message });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<CareSavedAnswer> }) => updateCareSavedAnswer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allCareSavedAnswers'] });
            toast({ title: 'Option Updated' });
            setIsDialogOpen(false);
        },
        onError: (err: Error) => {
            toast({ variant: 'destructive', title: 'Update Failed', description: err.message });
        }
    });

     const deleteMutation = useMutation({
        mutationFn: deleteCareSavedAnswer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allCareSavedAnswers'] });
            toast({ title: 'Option Deleted' });
        },
        onError: (err: Error) => {
            toast({ variant: 'destructive', title: 'Delete Failed', description: err.message });
        },
        onSettled: () => {
            setAnswerToDelete(null);
        }
    });

    const openDialog = (answer: CareSavedAnswer | null = null) => {
        setCurrentAnswer(answer);
        setIsDialogOpen(true);
    };

    const handleSave = (type: string, text: string) => {
        if (currentAnswer) {
            updateMutation.mutate({ id: currentAnswer.id, data: { answer_type: type, answer: text } });
        } else {
            createMutation.mutate({ answer_type: type, answer: text });
        }
    };
    
    const handleDelete = (answer: CareSavedAnswer) => {
        setAnswerToDelete(answer);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentAnswer ? 'Edit Option' : 'Add New Option'}</DialogTitle>
                    </DialogHeader>
                    <SavedAnswerForm 
                        answer={currentAnswer} 
                        onSave={handleSave} 
                        onClose={() => setIsDialogOpen(false)}
                        isSaving={createMutation.isPending || updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!answerToDelete} onOpenChange={(open) => !open && setAnswerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the option "{answerToDelete?.answer}". 
                            Note: This does not affect past prescriptions that already saved this text.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => answerToDelete && deleteMutation.mutate(answerToDelete.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="mb-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Game Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Manage Dropdown Options
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Add, edit, or remove dropdown options shared across Ceylon Pharmacy and D-Pad Setup.
                    </p>
                </div>
                <Button onClick={() => openDialog(null)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Option
                </Button>
            </header>

            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 max-w-xs">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            {ANSWER_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground ml-auto">
                    Showing {filteredAnswers.length} options
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="bg-card border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-3/4 mb-2 bg-muted" />
                                <Skeleton className="h-3 w-1/2 bg-muted" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-full bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <Card className="bg-destructive/10 border-destructive/20 text-center py-12">
                     <p className="text-destructive font-medium">Failed to load options: {error?.message}</p>
                     <Button variant="outline" className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => queryClient.invalidateQueries({ queryKey: ['allCareSavedAnswers'] })}>Try Again</Button>
                </Card>
            ) : filteredAnswers.length === 0 ? (
                <Card className="bg-card border-border shadow-sm text-center py-12">
                     <p className="text-muted-foreground mb-4">No dropdown options found for this category.</p>
                     <Button onClick={() => openDialog(null)} variant="outline" className="border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">Add First Option</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAnswers.map((answer) => (
                        <Card key={answer.id} className="bg-card border-border shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all group">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
                                    {answer.answer_type}
                                </CardDescription>
                                <CardTitle className="text-base text-card-foreground font-medium break-words leading-relaxed">
                                    {answer.answer}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => openDialog(answer)}
                                    className="h-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                >
                                    <Edit className="h-4 w-4 mr-1.5" />
                                    Edit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDelete(answer)}
                                    className="h-8 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
