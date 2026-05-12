"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { getMediMindLevels, getMediMindLevelMedicines, getMediMindStudentAnswersByStudent, getMediMindStudentLevels, getMediMindLevelQuestions, getMediMindItems } from '@/lib/actions/games';
import { getStudentEnrollments } from '@/lib/actions/users';
import { MediMindLevel, MediMindLevelMedicine, MediMindStudentAnswer, StudentEnrollmentInfo, MediMindLevelQuestion, MediMindItem } from '@/lib/types';
import { Target, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, History as HistoryIcon } from 'lucide-react';

export default function MediMindLevelsPage() {
    const router = useRouter();
    const { user } = useAuth();

    const { data: studentEnrollments = [], isLoading: isLoadingEnrollments } = useQuery<StudentEnrollmentInfo[]>({
        queryKey: ['studentEnrollments', user?.username],
        queryFn: () => getStudentEnrollments(user!.username!),
        enabled: !!user?.username,
    });

    const courseCodes = useMemo(() => studentEnrollments.map(e => e.course_code), [studentEnrollments]);

    const { data: levels = [], isLoading: isLoadingLevels } = useQuery<MediMindLevel[]>({
        queryKey: ['mediMindLevels', courseCodes],
        queryFn: () => getMediMindStudentLevels(courseCodes),
        enabled: courseCodes.length > 0,
    });

    const { data: levelMedicines = [], isLoading: isLoadingLevelMedicines } = useQuery<MediMindLevelMedicine[]>({
        queryKey: ['mediMindLevelMedicines'],
        queryFn: getMediMindLevelMedicines,
    });

    const { data: allMedicines = [], isLoading: isLoadingAllMedicines } = useQuery<MediMindItem[]>({
        queryKey: ['mediMindItems'],
        queryFn: getMediMindItems,
    });

    const { data: levelQuestions = [], isLoading: isLoadingLevelQuestions } = useQuery<MediMindLevelQuestion[]>({
        queryKey: ['mediMindLevelQuestions'],
        queryFn: getMediMindLevelQuestions,
    });

    const { data: studentAnswers = [], isLoading: isLoadingHistory } = useQuery<MediMindStudentAnswer[]>({
        queryKey: ['studentMediMindHistory', user?.username],
        queryFn: () => getMediMindStudentAnswersByStudent(user!.username!),
        enabled: !!user?.username,
    });

    const totalCoins = useMemo(() => {
        const correct = studentAnswers.filter(a => a.correct_status === 'Correct').length;
        const wrong = studentAnswers.filter(a => a.correct_status === 'Wrong').length;
        return (correct * 10) - (wrong * 2);
    }, [studentAnswers]);

    const overallStats = useMemo(() => {
        if (levels.length === 0) return { accuracy: 0, completion: 0, mastered: 0, total: 0 };

        const totalAttempts = studentAnswers.length;
        const totalCorrect = studentAnswers.filter(a => a.correct_status === 'Correct').length;
        const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

        let totalMedicinesAcrossLevels = 0;
        let totalMasteredAcrossLevels = 0;

        levels.forEach(level => {
            const levelSpecificQuestions = levelQuestions.filter(q => String(q.level_id) === String(level.id));
            const questionsInLevelCount = levelSpecificQuestions.length;
            if (questionsInLevelCount === 0) return;

            const levelMedicinesForThisLevel = levelMedicines.filter(lm => String(lm.level_id) === String(level.id));
            const levelSpecificAnswers = studentAnswers.filter(ans => String(ans.level_id) === String(level.id));

            totalMedicinesAcrossLevels += levelMedicinesForThisLevel.length;

            levelMedicinesForThisLevel.forEach(lm => {
                const medicineAnswers = levelSpecificAnswers.filter(ans => 
                    String(ans.medicine_id) === String(lm.medicine_id) && 
                    ans.correct_status === 'Correct'
                );
                const uniqueCorrectQIds = new Set(medicineAnswers.map(ans => String(ans.question_id)));
                const relevantCorrectQIds = Array.from(uniqueCorrectQIds).filter(qid => 
                    levelSpecificQuestions.some(lq => String(lq.question_id) === String(qid))
                );

                if (relevantCorrectQIds.length === questionsInLevelCount) {
                    totalMasteredAcrossLevels++;
                }
            });
        });

        const completion = totalMedicinesAcrossLevels > 0 ? (totalMasteredAcrossLevels / totalMedicinesAcrossLevels) * 100 : 0;

        return { 
            accuracy, 
            completion, 
            mastered: totalMasteredAcrossLevels, 
            total: totalMedicinesAcrossLevels 
        };
    }, [levels, studentAnswers, levelMedicines, levelQuestions]);

    const isLoading = isLoadingLevels || isLoadingLevelMedicines || isLoadingAllMedicines || (!!user?.username && isLoadingHistory) || isLoadingEnrollments || isLoadingLevelQuestions;

    if (isLoading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading levels...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1">
                    <Button onClick={() => router.push('/dashboard')} variant="ghost" className="-ml-4 hover:bg-primary/10 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
                    </Button>
                    <h1 className="text-4xl font-headline font-bold mt-2 text-primary">MediMind Challenge</h1>
                    <p className="text-muted-foreground text-lg">Pick a challenge level to test your medical knowledge.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Accuracy Card */}
                    <div className="bg-green-500/5 px-4 py-3 rounded-2xl border-2 border-green-500/20 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                            <Target className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-green-600/60 leading-none mb-1 uppercase tracking-wider">Accuracy</p>
                            <p className="text-xl font-black text-green-700 leading-none">{overallStats.accuracy.toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Completion Card */}
                    <div className="bg-blue-500/5 px-4 py-3 rounded-2xl border-2 border-blue-500/20 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-right-3 duration-700">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Trophy className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-600/60 leading-none mb-1 uppercase tracking-wider">Completion</p>
                            <p className="text-xl font-black text-blue-700 leading-none">{overallStats.completion.toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-yellow-500/5 px-4 py-3 rounded-2xl border-2 border-yellow-500/20 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-1000">
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <Coins className="h-5 w-5 text-yellow-600 animate-bounce" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-yellow-600/60 leading-none mb-1 uppercase tracking-wider">Balance</p>
                            <p className="text-xl font-black text-yellow-700 leading-none">{totalCoins}</p>
                        </div>
                    </div>

                    <Button 
                        onClick={() => router.push('/dashboard/medimind/history')}
                        variant="outline"
                        className="rounded-2xl h-[52px] px-6 border-primary/20 hover:bg-primary/5 group"
                    >
                        <HistoryIcon className="mr-2 h-5 w-5 text-primary group-hover:rotate-[-45deg] transition-transform" />
                        <span className="font-bold">History</span>
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.map((level) => {
                    // Count only unique medicines that actually exist in the medicines pool
                    const medicineCount = allMedicines.filter(item => 
                        levelMedicines.some(m => 
                            String(m.level_id) === String(level.id) && 
                            String(m.medicine_id) === String(item.id)
                        )
                    ).length;
                    return (
                        <button 
                            key={level.id} 
                            onClick={() => router.push(`/dashboard/medimind/${level.id}`)} 
                            className="group block h-full text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                        >
                            <Card className="shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all h-full border-2 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <div className="bg-primary h-24 w-24 rounded-full" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between p-6">
                                    <div className="space-y-1 pr-6 flex-1">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors font-bold truncate">
                                            {level.level_name}
                                        </CardTitle>
                                        <CardDescription className="text-sm font-semibold flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                                    {medicineCount} Medicines
                                                </span>
                                            </div>
                                            {(() => {
                                                const levelSpecificQuestions = levelQuestions.filter(q => String(q.level_id) === String(level.id));
                                                const totalQuestions = levelSpecificQuestions.length;
                                                
                                                if (totalQuestions === 0) return null;

                                                const levelSpecificAnswers = studentAnswers.filter(ans => String(ans.level_id) === String(level.id));
                                                
                                                // Count how many medicines in this level are fully mastered
                                                let masteredCount = 0;
                                                const levelMedicinesForThisLevel = levelMedicines.filter(lm => String(lm.level_id) === String(level.id));
                                                
                                                levelMedicinesForThisLevel.forEach(lm => {
                                                    const medicineAnswers = levelSpecificAnswers.filter(ans => 
                                                        String(ans.medicine_id) === String(lm.medicine_id) && 
                                                        ans.correct_status === 'Correct'
                                                    );
                                                    const uniqueCorrectQIds = new Set(medicineAnswers.map(ans => String(ans.question_id)));
                                                    
                                                    // Only check questions that belong to this level
                                                    const relevantCorrectQIds = Array.from(uniqueCorrectQIds).filter(qid => 
                                                        levelSpecificQuestions.some(lq => String(lq.question_id) === String(qid))
                                                    );

                                                    if (relevantCorrectQIds.length === totalQuestions && totalQuestions > 0) {
                                                        masteredCount++;
                                                    }
                                                });

                                                const progressPercent = medicineCount > 0 ? (masteredCount / medicineCount) * 100 : 0;

                                                return (
                                                    <div className="space-y-1 mt-1">
                                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                                            <span className="text-primary/70 uppercase">Mastered</span>
                                                            <span className="text-foreground">{masteredCount} / {medicineCount}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-primary transition-all duration-500" 
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </CardDescription>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                                        <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </CardHeader>
                            </Card>
                        </button>
                    );
                })}
                {levels.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-muted/30 border-2 border-dashed rounded-2xl">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold">No Levels Available</h3>
                        <p className="text-muted-foreground">Admin hasn't configured any game levels yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
