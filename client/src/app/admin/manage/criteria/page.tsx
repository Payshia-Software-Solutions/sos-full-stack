"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCriteriaLists, deleteCriteriaList } from '@/lib/actions/criteria';
import type { CriteriaList } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageCriteriaPage() {
    const queryClient = useQueryClient();
    const [criteriaToDelete, setCriteriaToDelete] = useState<number | null>(null);

    const { data: criteriaLists, isLoading, isError, error } = useQuery<CriteriaList[]>({
        queryKey: ['criteriaLists'],
        queryFn: getCriteriaLists,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCriteriaList(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['criteriaLists'] });
            toast({
                title: 'Success',
                description: 'Criteria deleted successfully',
                variant: 'default',
            });
            setCriteriaToDelete(null);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete criteria',
                variant: 'destructive',
            });
            setCriteriaToDelete(null);
        }
    });

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id.toString());
    };

    if (isLoading) return <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (isError) return <div className="text-red-500 text-center p-4">Error loading criteria: {(error as Error).message}</div>;

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Manage Criteria</h1>
                <Link href="/admin/manage/criteria/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add New Criteria
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Criteria List</CardTitle>
                    <CardDescription>Manage all certificate evaluation criteria. Note that new criteria might require additional logic in the backend evaluation script.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Criteria Name</TableHead>
                                <TableHead>Required Value (MOQ)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {criteriaLists?.map((criteria) => (
                                <TableRow key={criteria.id}>
                                    <TableCell className="font-medium">{criteria.id}</TableCell>
                                    <TableCell>{criteria.list_name}</TableCell>
                                    <TableCell>{criteria.moq}</TableCell>
                                    <TableCell>
                                        <Badge variant={criteria.is_active === 1 ? 'default' : 'secondary'}>
                                            {criteria.is_active === 1 ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/admin/manage/criteria/edit/${criteria.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" onClick={() => setCriteriaToDelete(criteria.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the criteria. Make sure no courses are currently using this criteria ID.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setCriteriaToDelete(null)}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => criteriaToDelete && handleDelete(criteriaToDelete)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {criteriaLists?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        No criteria found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
