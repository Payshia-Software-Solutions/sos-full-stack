"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Loader2, CreditCard, Filter, Calendar, Users, CircleDollarSign, BadgeCheck, AlertCircle } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { LMS_API_URL } from '@/lib/config';

interface PaymentStats {
    total_enrollments: number;
    total_expected: number;
    total_paid: number;
    total_due: number;
}

interface PaymentRecord {
    id: string;
    receipt_number: string;
    course_code: string;
    student_id: string;
    paid_amount: string;
    discount_amount: string;
    payment_status: string;
    payment_type: string;
    paid_date: string;
    created_at: string;
    created_by: string;
}

export default function PaymentHistoryPage() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'all', '7', '30', '90'
    const [courseFilter, setCourseFilter] = useState('all');
    
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Extract unique course codes from the fetched payments for the dropdown
    const uniqueCourses = useMemo(() => {
        const courses = new Set(payments.map(p => p.course_code).filter(Boolean));
        return Array.from(courses).sort();
    }, [payments]);

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        fetchStats(courseFilter);
    }, [courseFilter]);

    const fetchStats = async (course: string) => {
        setIsLoadingStats(true);
        try {
            let url = `${LMS_API_URL}/student-payments-new/stats`;
            if (course !== 'all') {
                url += `?course_code=${encodeURIComponent(course)}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Stats Error', description: err.message });
        } finally {
            setIsLoadingStats(false);
        }
    };

    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${LMS_API_URL}/student-payments-new/`);
            if (!res.ok) throw new Error('Failed to fetch payments');
            const data = await res.json();
            // Data may come back in an array
            setPayments(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = 
                (p.student_id?.toLowerCase().includes(searchLower) || '') || 
                (p.receipt_number?.toLowerCase().includes(searchLower) || '');
            
            // Date filter
            let matchesDate = true;
            if (dateFilter !== 'all' && p.paid_date) {
                const paymentDate = new Date(p.paid_date);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - paymentDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                matchesDate = diffDays <= parseInt(dateFilter);
            }

            // Course filter
            const matchesCourse = courseFilter === 'all' || p.course_code === courseFilter;

            return matchesSearch && matchesDate && matchesCourse;
        }).sort((a, b) => new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime());
    }, [payments, searchQuery, dateFilter, courseFilter]);

    const handleExportCSV = () => {
        if (filteredPayments.length === 0) {
            toast({ title: 'No Data', description: 'There is no data to export.' });
            return;
        }

        // CSV Headers
        const headers = ['Receipt No', 'Student ID', 'Course Code', 'Amount (LKR)', 'Discount (LKR)', 'Status', 'Method', 'Paid Date', 'Processed By'];
        
        // CSV Rows
        const rows = filteredPayments.map(p => [
            p.receipt_number || 'N/A',
            p.student_id || 'N/A',
            p.course_code || 'N/A',
            p.paid_amount || '0',
            p.discount_amount || '0',
            p.payment_status || 'N/A',
            p.payment_type || 'N/A',
            p.paid_date || 'N/A',
            p.created_by || 'N/A'
        ]);

        // Build CSV Content
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(field => `"${field}"`).join(','))
        ].join('\n');

        // Download logic
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `payment_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 md:p-8 w-full max-w-full space-y-8 animate-in fade-in duration-500 bg-background text-foreground min-h-screen">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur-xl p-6 rounded-2xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
                        <CreditCard className="h-8 w-8" />
                        Payment History
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">View and export all student payment transactions.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto flex-wrap">
                    <Button onClick={handleExportCSV} variant="outline" className="h-11 px-6 rounded-xl border-green-200 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                        <Download className="mr-2 h-4 w-4" />
                        Export to CSV
                    </Button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-sm bg-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
                                <h3 className="text-2xl font-bold mt-2">
                                    {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.total_enrollments?.toLocaleString() || '0')}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Expected (LKR)</p>
                                <h3 className="text-2xl font-bold mt-2">
                                    {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : parseFloat(stats?.total_expected?.toString() || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                                <CircleDollarSign className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Paid (LKR)</p>
                                <h3 className="text-2xl font-bold mt-2 text-green-600 dark:text-green-500">
                                    {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : parseFloat(stats?.total_paid?.toString() || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                                <BadgeCheck className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Due (LKR)</p>
                                <h3 className="text-2xl font-bold mt-2 text-red-600 dark:text-red-500">
                                    {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : parseFloat(stats?.total_due?.toString() || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border shadow-md bg-card">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Student ID or Receipt..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-11 bg-background border-input shadow-sm rounded-xl"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-[150px] h-11 rounded-xl">
                                    <SelectValue placeholder="Filter by date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="7">Last 7 Days</SelectItem>
                                    <SelectItem value="30">Last 30 Days</SelectItem>
                                    <SelectItem value="90">Last 90 Days</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger className="w-[150px] h-11 rounded-xl">
                                    <SelectValue placeholder="Filter by course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {uniqueCourses.map(course => (
                                        <SelectItem key={course} value={course}>{course}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="whitespace-nowrap font-semibold">Receipt No</TableHead>
                                    <TableHead className="whitespace-nowrap font-semibold">Student ID</TableHead>
                                    <TableHead className="whitespace-nowrap font-semibold">Course</TableHead>
                                    <TableHead className="whitespace-nowrap font-semibold text-right">Amount</TableHead>
                                    <TableHead className="whitespace-nowrap font-semibold text-center">Status</TableHead>
                                    <TableHead className="whitespace-nowrap font-semibold">Method</TableHead>
                                    <TableHead className="whitespace-nowrap font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No payment records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium text-foreground">{payment.receipt_number}</TableCell>
                                            <TableCell>{payment.student_id}</TableCell>
                                            <TableCell>{payment.course_code}</TableCell>
                                            <TableCell className="text-right font-semibold text-green-600 dark:text-green-500">
                                                {parseFloat(payment.paid_amount || '0').toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    payment.payment_status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    payment.payment_status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                }`}>
                                                    {payment.payment_status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{payment.payment_type}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                                {new Date(payment.paid_date).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
