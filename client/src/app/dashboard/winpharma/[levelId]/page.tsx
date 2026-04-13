"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WinPharmaIcon } from "@/components/icons/module-icons";
import { 
    ArrowLeft, 
    CheckCircle, 
    Video, 
    FileQuestion, 
    ChevronRight, 
    Lock, 
    Trophy, 
    Clock, 
    AlertCircle, 
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
    getWinPharmaTasks, 
    getWinPharmaLevelsOfficial, 
    getWinPharmaSubmissions,
    getWinPharmaSubmissionResults
} from "@/lib/actions/games";
import type { WinPharmaTask, WinPharmaLevel, WinPharmaSubmission, WinPharmaSubmissionResults } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function WinPharmaLevelTasksPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const levelId = params.levelId as string;
    
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);

    // Initialize state
    useEffect(() => {
        const storedCourseCode = localStorage.getItem('selected_course');
        setSelectedCourseCode(storedCourseCode);
    }, []);

    const { data: levels = [] } = useQuery<WinPharmaLevel[]>({
        queryKey: ['winPharmaLevels', selectedCourseCode],
        queryFn: () => getWinPharmaLevelsOfficial(selectedCourseCode!),
        enabled: !!selectedCourseCode,
    });

    const { data: submissionResults } = useQuery<WinPharmaSubmissionResults>({
        queryKey: ['winPharmaResults', user?.username, selectedCourseCode],
        queryFn: () => getWinPharmaSubmissionResults(user!.username!, selectedCourseCode!),
        enabled: !!user?.username && !!selectedCourseCode,
    });

    // Level sequence logic to check locking based on official CurrentTopLevel
    const currentLevelNum = useMemo(() => levels.findIndex(l => String(l.id || l.level_id) === levelId) + 1, [levels, levelId]);
    const winpharmaCurrentTopLevel = submissionResults?.data?.winpharmaCurrentTopLevel || 1;
    const isStaff = user?.type && user.type.toLowerCase() !== 'student';
    const isLevelLocked = !isStaff && currentLevelNum > winpharmaCurrentTopLevel;

    const currentLevel = useMemo(() => {
        return levels.find(l => String(l.id || l.level_id) === levelId);
    }, [levels, levelId]);

    const { data: tasks = [], isLoading } = useQuery<WinPharmaTask[]>({
        queryKey: ['winPharmaTasks', levelId],
        queryFn: () => getWinPharmaTasks(levelId),
        enabled: !!levelId,
    });

    const activeTasks = useMemo(() => {
        return tasks
            .filter(t => Number(t.is_active) === 1)
            .sort((a, b) => a.resource_title.localeCompare(b.resource_title, undefined, { numeric: true, sensitivity: 'base' }));
    }, [tasks]);

    // Fetch student's submissions to show status per task
    const { data: studentSubmissions = [] } = useQuery<WinPharmaSubmission[]>({
        queryKey: ['winPharmaSubmissions', user?.username, selectedCourseCode],
        queryFn: () => getWinPharmaSubmissions(user!.username!, selectedCourseCode!),
        enabled: !!user?.username && !!selectedCourseCode,
    });

    const getTaskSubmission = (taskId: string) => {
        if (!studentSubmissions.length) return null;
        
        // Convert to a local array before sorting to avoid mutating query cache
        const unitSubmissions = [...studentSubmissions]
            .filter(s => String(s.resource_id) === taskId)
            .sort((a, b) => {
                const idA = Number(a.submission_id || a.id || 0);
                const idB = Number(b.submission_id || b.id || 0);
                return idB - idA;
            });
            
        return unitSubmissions[0] || null;
    };

    const getStatusBadge = (status: string | undefined) => {
        if (!status) return <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest opacity-40">Not Submitted</Badge>;
        
        switch (status) {
            case 'Pending': return <Badge className="bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><Clock className="h-3 w-3 mr-1"/> Pending</Badge>;
            case 'Completed': return <Badge className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><CheckCircle className="h-3 w-3 mr-1"/> Completed</Badge>;
            case 'Try Again': return <Badge variant="destructive" className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><RefreshCw className="h-3 w-3 mr-1"/> Try Again</Badge>;
            case 'Sp-Pending': return <Badge className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><AlertCircle className="h-3 w-3 mr-1"/> Sp-Pending</Badge>;
            case 'Re-Correction': return <Badge className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><ShieldAlert className="h-3 w-3 mr-1"/> Re-Correction</Badge>;
            default: return <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest opacity-60">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />)}
                </div>
            </div>
        );
    }

    if (isLevelLocked) {
        return (
            <div className="p-8 h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
                <div className="h-32 w-32 bg-muted rounded-[3rem] flex items-center justify-center shadow-2xl ring-8 ring-primary/5">
                    <Lock className="h-16 w-16 text-muted-foreground opacity-50" />
                </div>
                <div className="max-w-md">
                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Access Denied</h2>
                    <p className="text-muted-foreground text-lg italic">
                        This module is locked. Complete the previous level to unlock <b>{currentLevel?.level_name}</b>.
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/winpharma')} variant="outline" className="rounded-2xl px-8 h-12 font-bold uppercase tracking-widest transition-all hover:bg-primary/5">
                    Return to Syllabus
                </Button>
            </div>
        );
    }

    const verifiedCount = activeTasks.filter(t => getTaskSubmission(String(t.resource_id || t.id))?.grade_status === 'Completed').length;

    return (
        <div className="p-3 md:p-8 space-y-6 md:space-y-8 pb-40 w-full animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                <div className="flex flex-col gap-2 md:gap-4 w-full">
                    <Button 
                        onClick={() => router.push('/dashboard/winpharma')} 
                        variant="ghost" 
                        className="-ml-3 h-8 md:h-10 px-3 md:px-4 hover:bg-primary/10 rounded-full group transition-all w-fit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-1 transition-transform" /> 
                        <span className="font-bold tracking-tight text-xs md:text-sm">Back to Curriculum</span>
                    </Button>
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="h-10 w-10 md:h-14 md:w-14 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl font-black shadow-lg shadow-primary/30 rotate-3 shrink-0">
                            {currentLevelNum}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-4xl font-headline font-black tracking-tighter leading-tight mb-0.5 md:mb-1 line-clamp-1">
                                {currentLevel?.level_name || `Level ${levelId}`}
                            </h1>
                            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground opacity-60 text-primary truncate">
                                Resource Hub • Level {currentLevelNum}
                            </p>
                        </div>
                    </div>
                </div>
                
                <Card className="p-4 md:p-6 h-fit bg-gradient-to-br from-card to-muted/20 border-none rounded-2xl md:rounded-3xl shadow-xl w-full md:w-auto md:min-w-[260px]">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Level Metrics</span>
                        <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />
                    </div>
                    <div className="flex justify-between items-end gap-8">
                        <div>
                            <p className="text-xl md:text-2xl font-black">{activeTasks.length}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase opacity-60">Tasks</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xl md:text-2xl font-black text-green-500">{verifiedCount}</p>
                             <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase opacity-60">Verified</p>
                        </div>
                    </div>
                </Card>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {activeTasks.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-muted/20 rounded-[3rem] border-4 border-dashed">
                         <h3 className="text-2xl font-black text-muted-foreground opacity-40 uppercase tracking-tighter italic">No resources found</h3>
                    </div>
                ) : (
                    activeTasks.map((task, index) => {
                        const taskId = String(task.resource_id || task.id!);
                        const sub = getTaskSubmission(taskId);
                        const isVideo = task.resource_data.toLowerCase().includes('youtube') || 
                                        task.resource_data.toLowerCase().includes('iframe') || 
                                        task.resource_data.toLowerCase().includes('video');

                        return (
                            <Link key={taskId} href={`/dashboard/winpharma/${levelId}/${taskId}`} className="group block h-full">
                                <Card className={cn(
                                    "h-full border-2 transition-all duration-500 rounded-[2rem] overflow-hidden bg-card shadow-lg hover:shadow-primary/20",
                                    sub?.grade_status === 'Completed' ? "border-green-500/50 bg-green-500/[0.02]" : "border-muted hover:border-primary"
                                )} style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-500 shadow-sm",
                                                sub?.grade_status === 'Completed' ? "bg-green-500 text-white shadow-green-500/30" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                            )}>
                                                {sub?.grade_status === 'Completed' ? <ShieldCheck className="h-4 w-4" /> : (isVideo ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />)}
                                            </div>
                                            {getStatusBadge(sub?.grade_status)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className={cn("text-base font-black tracking-tight leading-tight transition-colors duration-300 min-h-[2rem] line-clamp-2", sub?.grade_status === 'Completed' ? "text-green-700" : "group-hover:text-primary")}>
                                                {task.resource_title}
                                            </h3>
                                        </div>
                                    </div>
                                    <CardFooter className="px-4 pb-4 pt-0 border-t-0 flex justify-between items-center">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary group-hover:opacity-100 opacity-0 transition-all">Begin Study</span>
                                        <div className="h-7 w-7 rounded-lg bg-muted group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-500 group-hover:translate-x-1 shadow-sm">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>

            <footer className="pt-20 flex flex-col items-center gap-6 opacity-40">
                <div className="h-px w-full max-w-xl bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
                <div className="flex items-center gap-4">
                    <WinPharmaIcon className="h-6 w-6 grayscale" />
                    <span className="font-black text-[10px] uppercase tracking-[0.5em] text-muted-foreground">Certified Learning Pathway • CPC Portal</span>
                </div>
            </footer>
        </div>
    );
}
