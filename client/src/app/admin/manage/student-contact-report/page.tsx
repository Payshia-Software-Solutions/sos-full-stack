"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Search, Users, AlertTriangle } from "lucide-react";

import { getBatches } from '@/lib/actions/courses';
import { getStudentContactsReport, StudentContactReport } from '@/lib/actions/reports';
import type { Batch } from '@/lib/types';

export default function StudentContactReportPage() {
    const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: batches = [], isLoading: isLoadingBatches } = useQuery<Batch[]>({
        queryKey: ['batches'],
        queryFn: getBatches,
    });

    const { data: reportData = [], isLoading: isLoadingReport, isError } = useQuery<StudentContactReport[]>({
        queryKey: ['studentContactReport', selectedBatch],
        queryFn: () => getStudentContactsReport(selectedBatch!),
        enabled: !!selectedBatch,
    });

    const filteredReport = useMemo(() => {
        return reportData.filter(student => 
            `${student.fname} ${student.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.city_name || student.original_city || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reportData, searchTerm]);

    const handleExport = () => {
        if (filteredReport.length === 0) return;
        
        const headers = [
            "Student Name", "Username", "Email", "Phone 1", "Phone 2", 
            "Telephone 1", "Telephone 2", "Address Line 1", "Address Line 2", 
            "City", "District"
        ];
        
        const csvData = filteredReport.map(s => {
            return [
                `"${s.fname} ${s.lname}"`,
                `"${s.username}"`,
                `"${s.email || ''}"`,
                `"${s.phone || ''}"`,
                `"${s.telephone_1 || ''}"`,
                `"${s.telephone_2 || ''}"`,
                `"${s.address_line_1 || ''}"`,
                `"${s.address_line_2 || ''}"`,
                `"${s.city_name || s.original_city || ''}"`,
                `"${s.district_name || s.original_district || ''}"`
            ].join(",");
        });
        
        const csvContent = [headers.join(","), ...csvData].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Student_Contacts_${selectedBatch}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-headline font-semibold mt-2 flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        Student Contact & Address Report
                    </h1>
                    <p className="text-muted-foreground">Monitor and export contact information for students in a specific batch.</p>
                </div>
                {selectedBatch && reportData.length > 0 && (
                    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 shadow-md h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Report Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Batch</label>
                            {isLoadingBatches ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select value={selectedBatch || ""} onValueChange={setSelectedBatch}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a batch..." />
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
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Name, Username, or City..." 
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={!selectedBatch}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-6">
                    <Card className="shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle>Batch Contact Details</CardTitle>
                            <CardDescription>
                                Contact and address information for batch: <span className="font-bold text-foreground">{selectedBatch || 'None Selected'}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!selectedBatch ? (
                                <div className="p-20 text-center text-muted-foreground">
                                    <Users className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                    <p className="italic text-lg">Select a batch to generate the report.</p>
                                </div>
                            ) : isLoadingReport ? (
                                <div className="p-8 space-y-4">
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            ) : isError ? (
                                <div className="p-20 text-center text-red-500">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                                    <p>Failed to load report data. Please try again.</p>
                                </div>
                            ) : filteredReport.length === 0 ? (
                                <div className="p-20 text-center text-muted-foreground">
                                    <Search className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                    <p>No student contacts found for this criteria.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="font-bold">Student Name</TableHead>
                                            <TableHead className="font-bold">Phones</TableHead>
                                            <TableHead className="font-bold">Address</TableHead>
                                            <TableHead className="font-bold">City / District</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReport.map((student) => (
                                            <TableRow key={student.user_id} className="hover:bg-muted/20">
                                                <TableCell>
                                                    <div className="font-medium text-base">
                                                        {student.fname} {student.lname}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {student.username}
                                                    </div>
                                                    {student.email && (
                                                        <div className="text-xs text-blue-600 mt-1">
                                                            {student.email}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        {student.phone && <span><span className="font-semibold text-muted-foreground">M:</span> {student.phone}</span>}
                                                        {student.telephone_1 && <span><span className="font-semibold text-muted-foreground">T1:</span> {student.telephone_1}</span>}
                                                        {student.telephone_2 && <span><span className="font-semibold text-muted-foreground">T2:</span> {student.telephone_2}</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm space-y-0.5">
                                                        <div>{student.address_line_1}</div>
                                                        {student.address_line_2 && <div>{student.address_line_2}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {student.city_name || student.original_city || <span className="text-muted-foreground italic">No City</span>}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {student.district_name || student.original_district || <span className="italic">No District</span>}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
