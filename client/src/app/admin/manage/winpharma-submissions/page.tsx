"use client";

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBatches } from '@/lib/actions/courses';
import type { Batch } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter } from 'lucide-react';

export default function WinPharmaAdminSubmissionsIndexPage() {
    const router = useRouter();

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

    if (isCoursesLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-12">
            <header className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-lg text-center md:text-left">WinPharma Submissions</h1>
                <p className="text-zinc-400 font-medium text-center md:text-left">Select a batch to manage student work submissions.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedBatches.map((batch) => (
                    <Card 
                        key={batch.courseCode} 
                        className="group cursor-pointer border-none bg-zinc-900/50 hover:bg-zinc-800 transition-all duration-300 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5"
                        onClick={() => router.push(`/admin/manage/winpharma-submissions/${batch.courseCode}`)}
                    >
                        <CardContent className="p-10 flex flex-col justify-between h-full space-y-8">
                            <div className="space-y-4">
                                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl group-hover:scale-110 transition-transform">
                                    WP
                                </div>
                                <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors">{batch.courseCode}</h3>
                                <p className="text-zinc-500 text-sm font-medium line-clamp-2">{batch.name}</p>
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-zinc-800 group-hover:bg-primary group-hover:text-white transition-all font-bold">
                                View Submissions
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {batches.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4 opacity-50">
                        <Filter className="h-12 w-12 mx-auto" />
                        <p className="text-xl font-bold">No available batches found in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
