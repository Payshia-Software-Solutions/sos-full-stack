"use client";

import { useState, useMemo, useEffect } from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WinPharmaIcon } from "@/components/icons/module-icons";
import { Lock, Trophy, ChevronRight, BookOpen, Clock, CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueries } from "@tanstack/react-query";
import { 
    getWinPharmaLevelsOfficial, 
    getWinPharmaTasks, 
    getWinPharmaSubmissionResults 
} from "@/lib/actions/games";
import { getStudentEnrollments } from "@/lib/actions/users";
import { getCourses } from "@/lib/actions/courses";
import { useAuth } from "@/contexts/AuthContext";
import type { WinPharmaLevel, StudentEnrollmentInfo, Course, WinPharmaTask, WinPharmaSubmissionResults } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function WinPharmaPage() {
    const { user } = useAuth();
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

    // Fetch static data
    const { data: allCourses = [] } = useQuery<Course[]>({
        queryKey: ['allCourses'],
        queryFn: getCourses,
        staleTime: Infinity,
    });

    const { data: enrollments = [] } = useQuery<StudentEnrollmentInfo[]>({
        queryKey: ['studentEnrollments', user?.username],
        queryFn: () => getStudentEnrollments(user!.username!),
        enabled: !!user?.username,
    });

    const enrolledCourseDetails = useMemo(() => {
        return [...enrollments]
            .sort((a, b) => {
                const numA = parseInt(a.course_code.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.course_code.replace(/\D/g, '')) || 0;
                return numB - numA;
            })
            .map(en => {
                const courseDetail = allCourses.find(c => c.courseCode === en.course_code);
                return {
                    code: en.course_code,
                    name: courseDetail?.name || "Unknown Course"
                };
            });
    }, [enrollments, allCourses]);

    const activeCourseName = useMemo(() => {
        return enrolledCourseDetails.find(c => c.code === selectedCourseCode)?.name || selectedCourseCode;
    }, [selectedCourseCode, enrolledCourseDetails]);

    useEffect(() => {
        const storedCourseCode = localStorage.getItem('selected_course');
        setSelectedCourseCode(storedCourseCode);
    }, []);

    // Official Levels Fetch
    const { data: levels = [], isLoading: isLoadingLevels, isError: isErrorLevels } = useQuery<WinPharmaLevel[]>({
        queryKey: ['winPharmaLevels', selectedCourseCode],
        queryFn: () => getWinPharmaLevelsOfficial(selectedCourseCode!),
        enabled: !!selectedCourseCode,
    });

    const activeLevels = useMemo(() => {
        // More lenient check: include if is_active is missing or explicitly 1
        return levels.filter(l => l.is_active === undefined || l.is_active === null || Number(l.is_active) === 1);
    }, [levels]);

    // Official Results Fetch
    const { data: submissionResults, isLoading: isLoadingResults } = useQuery<WinPharmaSubmissionResults>({
        queryKey: ['winPharmaResults', user?.username, selectedCourseCode],
        queryFn: () => getWinPharmaSubmissionResults(user!.username!, selectedCourseCode!),
        enabled: !!user?.username && !!selectedCourseCode,
    });

    // Parallel Tasks Fetch for UI consistency
    const tasksResults = useQueries({
        queries: activeLevels.map((level) => ({
            queryKey: ['winPharmaTasks', String(level.id || level.level_id)],
            queryFn: () => getWinPharmaTasks(String(level.id || level.level_id)),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const handleCourseChange = (newCourseCode: string) => {
        setSelectedCourseCode(newCourseCode);
        localStorage.setItem('selected_course', newCourseCode);
        setIsCourseModalOpen(false);
        toast({ title: "Course Switched", description: `Loading data for ${newCourseCode}.` });
    };

    if (!selectedCourseCode) {
        return (
            <div className="p-8 text-center space-y-4">
                <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                <h3 className="text-xl font-bold italic">Configuring your dashboard...</h3>
            </div>
        );
    }

    const progressData = submissionResults?.data;
    const progressPercent = progressData?.gradePercentage || 0;
    const currentTopLevel = progressData?.winpharmaCurrentTopLevel || 1;

    return (
        <div className="p-3 md:p-8 space-y-6 md:space-y-10 pb-40 w-full animate-in fade-in duration-1000">
            <header className="flex flex-col lg:flex-row gap-4 md:gap-6 justify-between items-start lg:items-center">
                <div className="flex items-center gap-3 md:gap-6 w-full lg:w-auto">
                    <div className="bg-gradient-to-br from-primary to-indigo-600 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl shadow-primary/20 ring-4 md:ring-8 ring-primary/5 shrink-0">
                        <WinPharmaIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 lg:flex-none">
                        <h1 className="text-3xl md:text-5xl font-headline font-black tracking-tighter leading-none mb-1 md:mb-2">WinPharma</h1>
                        <div className="flex items-center gap-2">
                             <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="h-auto p-0 hover:bg-transparent group w-full">
                                        <div className="text-left w-full">
                                            <p className="text-sm md:text-base font-bold text-primary flex items-center gap-1 group-hover:underline line-clamp-1">
                                                {activeCourseName}
                                                <ChevronRight className={cn("h-4 w-4 shrink-0 opacity-70 transition-transform", isCourseModalOpen && "rotate-90")} />
                                            </p>
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-black tracking-widest uppercase opacity-60">{selectedCourseCode}</p>
                                        </div>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl rounded-[2.5rem] p-8 border-none shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3 mb-4">
                                            <BookOpen className="h-8 w-8 text-primary" /> Course Selection
                                        </DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="max-h-[60vh] -mx-2 px-2">
                                        <div className="grid gap-4 pt-2">
                                            {enrolledCourseDetails.map((course) => (
                                                <button
                                                    key={course.code}
                                                    onClick={() => handleCourseChange(course.code)}
                                                    className={cn(
                                                        "w-full text-left p-6 rounded-[1.5rem] border-4 transition-all flex items-center justify-between group",
                                                        selectedCourseCode === course.code ? "border-primary bg-primary/5" : "border-muted/50 hover:border-primary/40"
                                                    )}
                                                >
                                                    <div className="min-w-0 pr-6">
                                                        <p className="text-lg font-black tracking-tight">{course.name}</p>
                                                        <p className="text-xs text-muted-foreground font-black uppercase mt-1">{course.code}</p>
                                                    </div>
                                                    <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center transition-all", selectedCourseCode === course.code ? "bg-primary text-white" : "bg-muted")}>
                                                        {selectedCourseCode === course.code ? <CheckCircle className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
                
                <Card className="p-4 md:p-6 w-full lg:w-auto lg:min-w-[400px] rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border-none bg-gradient-to-br from-card to-muted/30 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Certified Performance</CardTitle>
                            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px]">
                                {progressPercent >= 100 ? 'Level Achieved' : 'Ongoing'}
                            </Badge>
                        </div>
                        <Progress value={progressPercent} className="h-4 rounded-full bg-background" indicatorClassName="bg-gradient-to-r from-primary to-indigo-500" />
                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <p className="text-2xl font-black">{activeLevels.length}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Modules</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary">{progressData?.submissionCount || 0}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Verified Submissions</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </header>

            {isLoadingLevels || isLoadingResults ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />)}
                </div>
            ) : isErrorLevels ? (
                <Alert variant="destructive" className="rounded-[2.5rem] p-8 border-4">
                    <AlertTriangle className="h-8 w-8 mb-4" />
                    <AlertTitle className="text-xl font-black uppercase">Service Interruption</AlertTitle>
                    <AlertDescription>Unable to contact the WinPharma Gateway. Please verify your connection.</AlertDescription>
                </Alert>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {(() => {
                        let canAccessNextLevel = true; // Level 1 (first in list) is always accessible if sequence permits
                        const serverTopLevel = progressData?.winpharmaCurrentTopLevel || 1;

                        return activeLevels.map((level, index) => {
                            const levelIdStr = String(level.id || level.level_id!);
                            const displayLevelNum = index + 1;
                            
                            // 1. Data Retrieval
                            const levelData = progressData?.taskCounts[levelIdStr] || { levelTasks: 0, levelTaskSubmissions: 0 };
                            const levelTasksCount = levelData.levelTasks || tasksResults[index]?.data?.length || 0;
                            const levelSubmissions = levelData.levelTaskSubmissions || 0;
                            const levelProgress = levelTasksCount > 0 ? (levelSubmissions / levelTasksCount) * 100 : 0;
                            const levelCompleted = levelTasksCount > 0 && levelSubmissions === levelTasksCount;
                            
                            // 2. STRICT LOCKING LOGIC
                            // A level is locked if:
                            // - It exceeds the server's authorized top level AND it's NOT the first one
                            // - OR: The preceding level was not completed
                            const isStaff = user?.type && user.type.toLowerCase() !== 'student';
                            const isLocked = !isStaff && (!canAccessNextLevel || (displayLevelNum > serverTopLevel && index > 0));
                            
                            // 3. Update Sequence Control for NEXT iteration
                            // The NEXT level can only be accessed if THIS level is completed AND THIS level itself was accessible
                            // Admins don't need to complete it, but we still update the sequence for standard flow if we wanted.
                            canAccessNextLevel = !isLocked && (levelCompleted || isStaff);

                            return (
                                <Link 
                                    key={levelIdStr} 
                                    href={isLocked ? '#' : `/dashboard/winpharma/${levelIdStr}`} 
                                    className={cn("group block", isLocked && "cursor-not-allowed")}
                                    onClick={(e) => isLocked && e.preventDefault()}
                                >
                                    <Card className={cn(
                                        "h-full border-2 transition-all duration-500 rounded-[2rem] overflow-hidden bg-card shadow-lg hover:shadow-primary/20 group flex flex-col min-h-[260px]",
                                        isLocked ? "border-muted opacity-60 grayscale bg-muted/5" : "border-muted hover:border-primary hover:bg-gradient-to-br hover:from-card hover:to-primary/5 shadow-xl",
                                        levelCompleted && "border-green-500/50 bg-green-500/[0.02]"
                                    )}>
                                        <div className="p-6 space-y-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center text-2xl font-black transition-all shadow-sm",
                                                    isLocked ? "bg-muted text-muted-foreground/40" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
                                                    levelCompleted && "bg-green-500 text-white"
                                                )}>
                                                    {isLocked ? <Lock className="h-6 w-6" /> : (levelCompleted ? <ShieldCheck className="h-8 w-8" /> : displayLevelNum)}
                                                </div>
                                                <Badge variant="secondary" className="bg-muted text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                                    LVL {displayLevelNum}
                                                </Badge>
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className={cn("text-xl font-black tracking-tight leading-tight line-clamp-2", isLocked ? "text-muted-foreground" : "group-hover:text-primary")}>
                                                    {level.level_name}
                                                </h3>
                                                
                                                {!isLocked && (
                                                    <div className="space-y-1.5 pt-1">
                                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                            <span>Progress</span>
                                                            <span>{Math.round(levelProgress)}%</span>
                                                        </div>
                                                        <Progress value={levelProgress} className="h-1 rounded-full bg-background" indicatorClassName={cn("transition-all duration-500", levelCompleted ? "bg-green-500" : "bg-primary")} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <CardFooter className="px-6 pb-6 pt-0 border-t-0 flex justify-between items-center mt-auto">
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                                {isLocked ? (
                                                    <span className="flex items-center gap-1 text-amber-600 font-black"><ShieldAlert className="h-3 w-3" /> Locked</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 font-black">
                                                        <BookOpen className="h-3 w-3" /> {levelTasksCount} Units
                                                    </span>
                                                )}
                                            </div>
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-1 shadow-sm",
                                                isLocked && "opacity-20 translate-x-0"
                                            )}>
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            );
                        });
                    })()}
                </div>
            )}
        </div>
    );
}
