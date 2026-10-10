'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGrades } from '@/lib/actions/pharma-reader';
import { cn } from '@/lib/utils';

export default function PharmaReaderPerformancePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [courseCode, setCourseCode] = useState<string | null>(null);

  useEffect(() => {
    const storedCourse = sessionStorage.getItem('selected_course');
    if (storedCourse) {
      setCourseCode(storedCourse);
    }
  }, []);

  const { data: gradesData, isLoading } = useQuery({
    queryKey: ['pharmaReaderGrades', user?.username],
    queryFn: () => getUserGrades(user!.username!),
    enabled: !!user,
  });

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('All');

  const attempts = gradesData?.attempts || [];
  
  const filteredAttempts = activeTab === 'All' 
    ? attempts 
    : attempts.filter((a: any) => a.difficulty === activeTab || (activeTab === 'Intermediate' && a.difficulty === 'Medium'));

  const correctAttemptsCount = filteredAttempts.filter((a: any) => a.answer_status === 'Correct').length;
  const totalAttemptsCount = filteredAttempts.length;
  const successRate = totalAttemptsCount > 0 
    ? Math.round((correctAttemptsCount / totalAttemptsCount) * 100) 
    : 0;

  const sortedAttempts = [...filteredAttempts].sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="p-4 md:p-8 space-y-6 w-full mx-auto pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between py-6 px-4 md:px-8 border-b bg-card rounded-xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/pharma-reader')} className="-ml-2 hover:bg-black/5">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              My Performance
            </h1>
            {courseCode && (
              <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-200/60 shadow-sm w-fit font-mono">
                Course: {courseCode}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3 shadow-inner">
          <Trophy className="w-5 h-5 text-indigo-500" />
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-tight">Overall Score</div>
            <div className="font-black text-xl text-indigo-700 dark:text-indigo-400 leading-none mt-0.5">
              {gradesData?.overallGrade || 0} XP
            </div>
          </div>
        </div>
      </header>

      {/* Performance Stats */}
      <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="All">All Levels</TabsTrigger>
            <TabsTrigger value="Basic">Basic</TabsTrigger>
            <TabsTrigger value="Intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="Advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        <Card className="shadow-lg border">
          <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500 animate-bounce" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Keep track of your dispensing accuracy and practice history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-muted/20 border-0 flex flex-col justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total Attempts</span>
              <span className="text-3xl font-extrabold mt-2">{totalAttemptsCount}</span>
            </Card>
            <Card className="p-4 bg-muted/20 border-0 flex flex-col justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Correct Answers</span>
              <span className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">{correctAttemptsCount}</span>
            </Card>
            <Card className="p-4 bg-muted/20 border-0">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Success Rate</span>
                <span className="text-sm font-extrabold text-indigo-500">{successRate}%</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/50 rounded-full h-3.5 mt-3 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-3">Recent Attempts</h3>
            {sortedAttempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-xl border-dashed">
                You haven't submitted any answers yet. Start playing!
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden divide-y max-h-[60vh] overflow-y-auto">
                {sortedAttempts.map((attempt: any) => {
                  const isCorrect = attempt.answer_status === 'Correct';
                  return (
                    <div key={attempt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card hover:bg-muted/10 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">Prescription #{attempt.pres_id}</span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            attempt.difficulty === 'Basic' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            attempt.difficulty === 'Medium' || attempt.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          )}>
                            {attempt.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Selected Option: <span className="font-medium text-foreground">{attempt.selected_answer}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className="text-xs text-muted-foreground">
                          {new Date(attempt.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1",
                          isCorrect 
                            ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" 
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                        )}>
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </Tabs>
    </div>
  );
}
