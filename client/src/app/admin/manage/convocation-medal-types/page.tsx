"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    getConvocationMedalTypes, 
    createConvocationMedalType, 
    updateConvocationMedalType, 
    deleteConvocationMedalType 
} from '@/lib/actions/certificates';
import type { ConvocationMedalType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, ArrowLeft, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const COLOR_OPTIONS = [
    { label: 'Gold (Highest Honor / 1st Place)', value: 'gold', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/30' },
    { label: 'Silver (Excellence / 2nd Place)', value: 'silver', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-400/30' },
    { label: 'Bronze (Merit / 3rd Place)', value: 'bronze', badgeClass: 'bg-orange-100 text-orange-900 border-orange-300 ring-1 ring-orange-400/30' },
    { label: 'Purple (Special Recognition)', value: 'purple', badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 ring-1 ring-purple-400/30' },
    { label: 'Blue (Dean’s Honor)', value: 'blue', badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 ring-1 ring-blue-400/30' },
    { label: 'Emerald (Distinction)', value: 'emerald', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400/30' },
];

export const getMedalBadgeClass = (color?: string | null) => {
    switch (color?.toLowerCase()) {
        case 'silver':
            return 'bg-slate-100 text-slate-800 border-slate-300';
        case 'bronze':
            return 'bg-amber-100 text-amber-900 border-amber-300';
        case 'purple':
            return 'bg-purple-100 text-purple-900 border-purple-300';
        case 'blue':
            return 'bg-blue-100 text-blue-900 border-blue-300';
        case 'emerald':
            return 'bg-emerald-100 text-emerald-900 border-emerald-300';
        case 'gold':
        default:
            return 'bg-yellow-100 text-yellow-900 border-yellow-400';
    }
};

const medalSchema = z.object({
    name: z.string().min(2, "Medal name must be at least 2 characters."),
    description: z.string().optional(),
    color: z.string().default('gold'),
    is_active: z.boolean().default(true),
});

type MedalFormValues = z.infer<typeof medalSchema>;

export default function ConvocationMedalTypesPage() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMedal, setSelectedMedal] = useState<ConvocationMedalType | null>(null);
    const [medalToDelete, setMedalToDelete] = useState<ConvocationMedalType | null>(null);

    const { data: medalTypes, isLoading, isError, error } = useQuery<ConvocationMedalType[]>({
        queryKey: ['convocationMedalTypes'],
        queryFn: () => getConvocationMedalTypes(false),
    });

    const form = useForm<MedalFormValues>({
        resolver: zodResolver(medalSchema),
        defaultValues: {
            name: '',
            description: '',
            color: 'gold',
            is_active: true,
        },
    });

    const handleCreate = () => {
        setSelectedMedal(null);
        form.reset({
            name: '',
            description: '',
            color: 'gold',
            is_active: true,
        });
        setIsFormOpen(true);
    };

    const handleEdit = (medal: ConvocationMedalType) => {
        setSelectedMedal(medal);
        form.reset({
            name: medal.name,
            description: medal.description || '',
            color: medal.color || 'gold',
            is_active: String(medal.is_active) === '1' || medal.is_active === true,
        });
        setIsFormOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: (data: MedalFormValues) => {
            const payload = {
                name: data.name,
                description: data.description,
                color: data.color,
                is_active: data.is_active ? 1 : 0,
            };
            if (selectedMedal?.id) {
                return updateConvocationMedalType(selectedMedal.id, payload);
            }
            return createConvocationMedalType(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['convocationMedalTypes'] });
            toast({ 
                title: 'Success', 
                description: `Medal type ${selectedMedal ? 'updated' : 'created'} successfully.` 
            });
            setIsFormOpen(false);
        },
        onError: (err: Error) => {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteConvocationMedalType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['convocationMedalTypes'] });
            toast({ title: 'Success', description: 'Medal type deleted successfully.' });
            setMedalToDelete(null);
        },
        onError: (err: Error) => {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
            setMedalToDelete(null);
        },
    });

    const onSubmit = (data: MedalFormValues) => {
        saveMutation.mutate(data);
    };

    const watchColor = form.watch('color');
    const watchName = form.watch('name');

    return (
        <div className="w-full p-4 md:p-8 space-y-6 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                            <Link href="/admin/manage/convocation">
                                <ArrowLeft className="mr-1 h-4 w-4" /> Convocation Bookings
                            </Link>
                        </Button>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-xs font-semibold text-primary">Medal Types Master</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Convocation Medal Types</h1>
                            <p className="text-sm text-muted-foreground">Configure medals, honors, and academic awards awarded during convocation ceremonies.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={handleCreate} className="font-semibold shadow-sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Medal Type
                    </Button>
                </div>
            </header>

            {/* List Table Card */}
            <Card className="shadow-sm border">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg">Configured Medal Types</CardTitle>
                            <CardDescription>All academic awards available for convocation bookings.</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                            {medalTypes?.length || 0} Total Types
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead className="min-w-[200px]">Medal Badge Preview</TableHead>
                                    <TableHead className="min-w-[220px]">Description</TableHead>
                                    <TableHead className="w-[140px]">Color Theme</TableHead>
                                    <TableHead className="w-[120px]">Status</TableHead>
                                    <TableHead className="w-[150px]">Created</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-destructive">
                                            {error?.message || "Failed to load medal types."}
                                        </TableCell>
                                    </TableRow>
                                ) : medalTypes && medalTypes.length > 0 ? (
                                    medalTypes.map((medal) => {
                                        const isActive = String(medal.is_active) === '1' || medal.is_active === true;
                                        return (
                                            <TableRow key={medal.id} className="hover:bg-muted/20">
                                                <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                                                    #{medal.id}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            "px-2.5 py-1 text-xs font-bold gap-1.5 shadow-xs border inline-flex items-center",
                                                            getMedalBadgeClass(medal.color)
                                                        )}
                                                    >
                                                        <Award className="w-3.5 h-3.5 shrink-0" />
                                                        {medal.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-[320px]">
                                                    {medal.description || <span className="italic opacity-60">No description provided</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-mono uppercase bg-muted px-2 py-0.5 rounded">
                                                        {medal.color || 'gold'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={isActive ? "default" : "secondary"} className={cn("text-[10px] font-semibold", isActive ? "bg-green-600" : "bg-muted text-muted-foreground")}>
                                                        {isActive ? "Active" : "Disabled"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground font-mono">
                                                    {medal.created_at ? format(parseISO(medal.created_at), 'yyyy-MM-dd') : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => handleEdit(medal)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => setMedalToDelete(medal)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <Award className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                                            <p className="font-semibold text-sm">No Medal Types Found</p>
                                            <p className="text-xs mt-1">Click "Add Medal Type" above to create your first award category.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            {selectedMedal ? 'Edit' : 'Create'} Medal Type
                        </DialogTitle>
                        <DialogDescription>
                            Define the award name, description, and preview color theme.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        {/* Live Preview Box */}
                        <div className="p-4 rounded-xl border bg-muted/30 flex flex-col items-center justify-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Live Preview</span>
                            <Badge 
                                variant="outline" 
                                className={cn(
                                    "px-3 py-1.5 text-sm font-bold gap-1.5 shadow-sm border",
                                    getMedalBadgeClass(watchColor)
                                )}
                            >
                                <Award className="w-4 h-4 shrink-0" />
                                {watchName || "Sample Medal Name"}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Medal Name *</Label>
                            <Input 
                                id="name" 
                                placeholder="e.g. Gold Medal, Silver Medal, Batch Top..." 
                                {...form.register('name')} 
                            />
                            {form.formState.errors.name && (
                                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color Theme</Label>
                            <Select 
                                value={form.watch('color')} 
                                onValueChange={(val) => form.setValue('color', val)}
                            >
                                <SelectTrigger id="color">
                                    <SelectValue placeholder="Select color theme..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {COLOR_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-3 h-3 rounded-full border", opt.badgeClass)} />
                                                <span>{opt.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea 
                                id="description" 
                                rows={2} 
                                placeholder="Eligibility criteria or explanation of this award..." 
                                {...form.register('description')} 
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="text-sm">Active Status</Label>
                                <p className="text-[11px] text-muted-foreground">Available for student convocation bookings</p>
                            </div>
                            <Switch 
                                id="is_active" 
                                checked={form.watch('is_active')} 
                                onCheckedChange={(val) => form.setValue('is_active', val)} 
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saveMutation.isPending} className="font-semibold">
                                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {selectedMedal ? 'Save Changes' : 'Create Medal Type'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!medalToDelete} onOpenChange={() => setMedalToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Medal Type?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>"{medalToDelete?.name}"</strong>? Existing bookings with this medal will retain their record, but it will no longer be selectable for new bookings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => medalToDelete && deleteMutation.mutate(medalToDelete.id)} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
