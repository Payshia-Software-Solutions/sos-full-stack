"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBatches } from '@/lib/actions/courses';
import type { Batch } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Filter, Search, ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react';

export default function WinPharmaAdminSubmissionsIndexPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch courses/batches
    const { data: batches = [], isLoading: isCoursesLoading } = useQuery<Batch[]>({
        queryKey: ['adminBatches'],
        queryFn: getBatches,
    });

    // Sort batches in descending order by course code number
    const sortedBatches = useMemo(() => {
        return [...batches].sort((a, b) => {
            const numA = parseInt(a.courseCode.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.courseCode.replace(/\D/g, '')) || 0;
            
            // If both have numbers, sort by that descending
            if (numA !== 0 && numB !== 0) return numB - numA;
            
            // Fallback to ID comparison
            return b.id.localeCompare(a.id);
        });
    }, [batches]);

    // Filter batches by search term
    const filteredBatches = useMemo(() => {
        if (!searchTerm.trim()) return sortedBatches;
        const term = searchTerm.toLowerCase();
        return sortedBatches.filter(
            (batch) =>
                batch.courseCode.toLowerCase().includes(term) ||
                batch.name.toLowerCase().includes(term)
        );
    }, [sortedBatches, searchTerm]);

    if (isCoursesLoading) {
        return (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                <Skeleton className="h-10 w-44 rounded-xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-56 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            <header className="space-y-4">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/admin/manage/games/winpharma')} 
                    className="-ml-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to WinPharma Setup
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <ClipboardCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                    WinPharma Submissions
                                </h1>
                                <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5 rounded-full">
                                    {sortedBatches.length} {sortedBatches.length === 1 ? 'Batch' : 'Batches'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium mt-1">
                                Select a batch to manage and evaluate student work submissions.
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search batch or course name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9.5 h-11 bg-card border-border rounded-xl text-sm shadow-2xs"
                        />
                    </div>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => (
                    <Card 
                        key={batch.courseCode} 
                        className="group cursor-pointer border border-border bg-card hover:bg-muted/30 transition-all duration-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/50 flex flex-col justify-between"
                        onClick={() => router.push(`/admin/manage/winpharma-submissions/${batch.courseCode}`)}
                    >
                        <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="h-12 w-12 bg-primary/10 text-primary font-black text-sm rounded-xl flex items-center justify-center border border-primary/20 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        WP
                                    </div>
                                    <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-border bg-muted/40 text-muted-foreground">
                                        Batch
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                                        {batch.courseCode}
                                    </h3>
                                    <p className="text-muted-foreground text-sm font-medium line-clamp-2 mt-1">
                                        {batch.name}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <Button 
                                    variant="outline" 
                                    className="w-full h-11 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-semibold flex items-center justify-center gap-2"
                                >
                                    <span>View Submissions</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredBatches.length === 0 && (
                    <div className="col-span-full py-16 text-center space-y-3 bg-muted/20 border border-dashed border-border rounded-2xl">
                        <Filter className="h-10 w-10 mx-auto text-muted-foreground/60" />
                        <p className="text-base font-semibold text-foreground">No matching batches found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
                        {searchTerm && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSearchTerm('')} 
                                className="mt-2 text-primary hover:text-primary/90"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
