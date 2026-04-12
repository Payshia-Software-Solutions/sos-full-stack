"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWinpharmaCommonReasons,
    createWinpharmaCommonReason,
    updateWinpharmaCommonReason,
    deleteWinpharmaCommonReason
} from '@/lib/actions/games';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Loader2, MessageSquareQuote } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';

export default function WinPharmaCommonReasonsPage() {
    const queryClient = useQueryClient();

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Form States
    const [newReasonText, setNewReasonText] = useState("");
    const [editReasonData, setEditReasonData] = useState<{ id: string | number, reason: string } | null>(null);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);

    // Fetch Data
    const { data: commonReasons = [], isLoading } = useQuery({
        queryKey: ['winpharmaCommonReasons'],
        queryFn: getWinpharmaCommonReasons,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (reason: string) => {
            return createWinpharmaCommonReason({
                reason: reason,
                is_active: 1,
                created_by: "admin",
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['winpharmaCommonReasons'] });
            toast({ title: "Reason Created", description: "The new feedback reason has been added." });
            setIsAddOpen(false);
            setNewReasonText("");
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string | number, reason: string }) => {
            return updateWinpharmaCommonReason(id, {
                reason: reason,
                is_active: 1,
                created_by: "admin",
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['winpharmaCommonReasons'] });
            toast({ title: "Reason Updated", description: "The feedback reason has been updated successfully." });
            setIsEditOpen(false);
            setEditReasonData(null);
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => deleteWinpharmaCommonReason(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['winpharmaCommonReasons'] });
            toast({ title: "Reason Deleted", description: "The reason has been removed permanently." });
            setIsDeleteOpen(false);
            setDeleteId(null);
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
    });

    // Handlers
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReasonText.trim()) return;
        createMutation.mutate(newReasonText);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editReasonData || !editReasonData.reason.trim()) return;
        updateMutation.mutate(editReasonData);
    };

    const handleDelete = () => {
        if (deleteId) deleteMutation.mutate(deleteId);
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 w-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <MessageSquareQuote className="h-8 w-8 text-primary" /> Common Reasons Library
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        Manage standardized feedback templates for student submissions.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsAddOpen(true)}
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-[#0092A8] text-white font-bold"
                >
                    <Plus className="h-5 w-5 mr-2" /> Add New Reason
                </Button>
            </header>

            <Card className="border-none shadow-xl ring-1 ring-black/5 rounded-3xl overflow-hidden bg-white dark:bg-zinc-950">
                <CardHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-0">Configured Templates</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800">
                                <TableHead className="w-[100px] font-black uppercase text-[11px] tracking-widest pl-8">ID</TableHead>
                                <TableHead className="font-black uppercase text-[11px] tracking-widest">Reason Text</TableHead>
                                <TableHead className="w-[200px] text-right pr-8 font-black uppercase text-[11px] tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commonReasons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground font-medium">
                                        No reasons configured. Click "Add New Reason" to start.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                commonReasons.map((item: any) => (
                                    <TableRow key={item.id} className="border-zinc-100 dark:border-zinc-800 group transition-colors">
                                        <TableCell className="font-medium text-muted-foreground pl-8">{item.id}</TableCell>
                                        <TableCell className="font-semibold text-foreground py-4">
                                            {item.reason}
                                        </TableCell>
                                        <TableCell className="text-right pr-8 space-x-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => {
                                                    setEditReasonData(item);
                                                    setIsEditOpen(true);
                                                }}
                                                className="rounded-lg h-9 bg-transparent border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => {
                                                    setDeleteId(item.id);
                                                    setIsDeleteOpen(true);
                                                }}
                                                className="rounded-lg h-9 bg-transparent border-red-200 dark:border-red-900/50 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* CREATE DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) setNewReasonText(""); // Reset on close
            }}>
                <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2rem] bg-background">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-black">Add Evaluation Reason</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-6 pt-4">
                        <div className="space-y-3">
                            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason Template Text</Label>
                            <Textarea 
                                id="reason" 
                                value={newReasonText}
                                onChange={(e) => setNewReasonText(e.target.value)}
                                placeholder="Enter the feedback exactly as it should appear..." 
                                className="min-h-[120px] rounded-2xl resize-none font-medium bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                required 
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || !newReasonText.trim()} className="rounded-xl bg-primary text-white hover:bg-primary/90 px-8">
                                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Reason"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setEditReasonData(null);
            }}>
                <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2rem] bg-background">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-black">Edit Reason #{editReasonData?.id}</DialogTitle>
                    </DialogHeader>
                    {editReasonData && (
                        <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                            <div className="space-y-3">
                                <Label htmlFor="edit-reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Modify Text</Label>
                                <Textarea 
                                    id="edit-reason" 
                                    value={editReasonData.reason}
                                    onChange={(e) => setEditReasonData({ ...editReasonData, reason: e.target.value })}
                                    className="min-h-[120px] rounded-2xl resize-none font-medium bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                    required 
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" disabled={updateMutation.isPending || !editReasonData.reason.trim()} className="rounded-xl bg-primary text-white hover:bg-primary/90 px-8">
                                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Record"}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* DELETE ALERT */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-background">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium">
                            This action cannot be undone. This will permanently delete the common reason from the database and it will no longer be available in the grading console.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="rounded-xl border-none bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            disabled={deleteMutation.isPending}
                            className="rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold"
                        >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Forever
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
