"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, RefreshCw, Trophy, HelpCircle, Loader2, Sparkles, ChevronRight, Check, ZoomIn, Smile, Flame, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRandomPrescription, submitAttempt, getUserGrades, getPharmaReaderProgress, getPharmaReaderSettings, type Prescription, type AttemptResult } from '@/lib/actions/pharma-reader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { LMS_API_URL } from '@/lib/config';
import { cn } from '@/lib/utils';
import parse from 'html-react-parser';

export default function PharmaReaderStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);

  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [isCourseLoaded, setIsCourseLoaded] = useState(false);

  // Read course code from localStorage
  useEffect(() => {
    const storedCourse = localStorage.getItem('selected_course');
    if (storedCourse) {
      setCourseCode(storedCourse);
    }
    setIsCourseLoaded(true);
  }, []);

  // Get user overall score and attempt list
  const { data: gradesData, isLoading: isLoadingGrades } = useQuery({
    queryKey: ['pharmaReaderGrades', user?.username],
    queryFn: () => getUserGrades(user!.username!),
    enabled: !!user,
  });

  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['pharmaReaderProgress', user?.username, courseCode],
    queryFn: () => getPharmaReaderProgress(user!.username!, courseCode || undefined),
    enabled: !!user && isCourseLoaded,
  });

  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['pharmaReaderSettings', courseCode],
    queryFn: () => getPharmaReaderSettings(courseCode || undefined),
    enabled: isCourseLoaded,
  });

  // Get random unanswered prescription
  const { data: gameData, isLoading: isLoadingGame, refetch: refetchGame } = useQuery({
    queryKey: ['randomPrescription', user?.username, selectedDifficulty, courseCode],
    queryFn: () => getRandomPrescription(user!.username!, selectedDifficulty!, courseCode || undefined),
    enabled: !!user && !!selectedDifficulty,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { presId: number; selectedAnswer: string }) => 
      submitAttempt(data.presId, user!.username!, data.selectedAnswer),
    onSuccess: (res) => {
      setAttemptResult(res);
      setIsAnswered(true);
      queryClient.invalidateQueries({ queryKey: ['pharmaReaderGrades', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['pharmaReaderProgress', user?.username] });
      if (res.is_correct) {
        toast({ title: 'Correct!', description: 'Great job!' });
      } else {
        toast({ variant: 'destructive', title: 'Wrong Answer', description: 'Try the next prescription!' });
      }
    },
    onError: (err: Error) => toast({ variant: 'destructive', title: 'Submission failed', description: err.message }),
  });

  const handleSelectAnswer = (optionKey: string) => {
    if (isAnswered) return;
    setSelectedAnswer(optionKey);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !gameData?.prescription) return;
    submitMutation.mutate({
      presId: gameData.prescription.id,
      selectedAnswer,
    });
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setAttemptResult(null);
    setIsAnswered(false);
    setShowHint(false);
    refetchGame();
  };

  const formatImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) return `${LMS_API_URL}${path}`;
    return `https://content-provider.pharmacollege.lk/content-provider/uploads/pharma-reader/${path}`;
  };

  if (isLoadingGrades || isLoadingGame) {
    return (
      <div className="p-4 md:p-8 space-y-6 w-full pb-20">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const overallGrade = gradesData?.overallGrade || 0;
  const finished = gameData?.finished;
  const prescription = gameData?.prescription;

  const difficulty = prescription?.difficulty || 'Basic';

  const diffThemes = {
    Basic: {
      border: 'border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5',
      bg: 'from-emerald-500/5 to-transparent',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      accent: 'emerald',
      label: 'Basic - Apprentice'
    },
    Medium: {
      border: 'border-amber-500/30 dark:border-amber-500/20 shadow-amber-500/5',
      bg: 'from-amber-500/5 to-transparent',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      accent: 'amber',
      label: 'Medium - Practitioner'
    },
    Hard: {
      border: 'border-rose-500/40 dark:border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
      bg: 'from-rose-500/5 to-transparent',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
      button: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
      accent: 'rose',
      label: 'Hard - Specialist'
    },
    Advanced: {
      border: 'border-rose-500/40 dark:border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
      bg: 'from-rose-500/5 to-transparent',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
      button: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
      accent: 'rose',
      label: 'Hard - Specialist'
    }
  } as const;

  const currentTheme = diffThemes[difficulty as keyof typeof diffThemes] || diffThemes.Basic;

  // Stats calculations
  const attempts = gradesData?.attempts || [];
  const totalAttemptsCount = attempts.length;
  const correctAttemptsCount = attempts.filter((a: any) => a.answer_status === 'Correct').length;
  const successRate = totalAttemptsCount > 0 ? Math.round((correctAttemptsCount / totalAttemptsCount) * 100) : 0;
  const sortedAttempts = [...attempts].reverse();

  return (
    <div className="p-4 md:p-8 space-y-6 w-full pb-20">
      {/* Top Navigation */}
      <header className="flex flex-col sm:flex-row items-center justify-between py-6 px-4 md:px-8 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="-ml-2 hover:bg-black/5">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Pharma Reader
            </h1>
            {courseCode && (
              <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-200/60 shadow-sm w-fit font-mono">
                Course: {courseCode}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/pharma-reader/performance')}
            className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-indigo-600 transition-colors bg-white/50"
          >
            <Trophy className="mr-2 h-4 w-4" /> View Performance
          </Button>
          
          {/* Overall Score Badge */}
          <Card className="shadow-md bg-gradient-to-r from-purple-500 to-indigo-600 text-white min-w-[180px] p-4 text-center border-0 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute -top-3 -right-3 h-12 w-12 bg-white/10 rounded-full blur-lg" />
            <div className="text-xs uppercase tracking-wider text-purple-200 font-semibold flex items-center gap-1.5 mb-1">
              <Trophy className="w-3.5 h-3.5" /> Overall Score
            </div>
            <span className="text-3xl font-extrabold tracking-tight">{overallGrade} XP</span>
          </Card>
        </div>
      </header>

      {!selectedDifficulty ? (
        <div className="mt-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold mb-2">Choose Your Difficulty Level</h2>
            <p className="text-muted-foreground">Select a difficulty level to start practicing. You can complete a specific number of prescriptions per level.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Basic */}
            <Card className={cn("overflow-hidden border-2 transition-all hover:-translate-y-1 hover:shadow-lg", diffThemes.Basic.border)}>
              <CardHeader className={cn("bg-gradient-to-br", diffThemes.Basic.bg)}>
                <div className="flex justify-between items-start">
                  <div className={cn("p-3 rounded-xl", diffThemes.Basic.badge)}>
                    <Smile className="w-6 h-6" />
                  </div>
                  {progressData?.Basic?.correct >= progressData?.Basic?.required && progressData?.Basic?.required > 0 && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">Basic</CardTitle>
                <CardDescription>Perfect for beginners. Simple and clear prescriptions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-muted-foreground">Correct Answers</span>
                  <span className="font-bold">{progressData?.Basic?.correct || 0} / {progressData?.Basic?.required || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progressData?.Basic?.required > 0 ? Math.min(((progressData?.Basic?.correct || 0) / progressData?.Basic?.required) * 100, 100) : 0}%` }} />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={cn("w-full", diffThemes.Basic.button)}
                  disabled={progressData?.Basic?.correct >= progressData?.Basic?.required && progressData?.Basic?.required > 0}
                  onClick={() => setSelectedDifficulty('Basic')}
                >
                  {progressData?.Basic?.correct >= progressData?.Basic?.required && progressData?.Basic?.required > 0 ? 'Limit Reached' : 'Start Basic'}
                </Button>
              </CardFooter>
            </Card>

            {/* Intermediate */}
            <Card className={cn("overflow-hidden border-2 transition-all hover:-translate-y-1 hover:shadow-lg", diffThemes.Medium.border)}>
              <CardHeader className={cn("bg-gradient-to-br", diffThemes.Medium.bg)}>
                <div className="flex justify-between items-start">
                  <div className={cn("p-3 rounded-xl", diffThemes.Medium.badge)}>
                    <Flame className="w-6 h-6" />
                  </div>
                  {progressData?.Intermediate?.correct >= progressData?.Intermediate?.required && progressData?.Intermediate?.required > 0 && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">Intermediate</CardTitle>
                <CardDescription>A bit tricky. Some challenging handwriting.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-muted-foreground">Correct Answers</span>
                  <span className="font-bold">{progressData?.Intermediate?.correct || 0} / {progressData?.Intermediate?.required || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${progressData?.Intermediate?.required > 0 ? Math.min(((progressData?.Intermediate?.correct || 0) / progressData?.Intermediate?.required) * 100, 100) : 0}%` }} />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={cn("w-full", diffThemes.Medium.button)}
                  disabled={progressData?.Intermediate?.correct >= progressData?.Intermediate?.required && progressData?.Intermediate?.required > 0}
                  onClick={() => setSelectedDifficulty('Intermediate')}
                >
                  {progressData?.Intermediate?.correct >= progressData?.Intermediate?.required && progressData?.Intermediate?.required > 0 ? 'Limit Reached' : 'Start Intermediate'}
                </Button>
              </CardFooter>
            </Card>

            {/* Advanced */}
            <Card className={cn("overflow-hidden border-2 transition-all hover:-translate-y-1 hover:shadow-lg", diffThemes.Hard.border)}>
              <CardHeader className={cn("bg-gradient-to-br", diffThemes.Hard.bg)}>
                <div className="flex justify-between items-start">
                  <div className={cn("p-3 rounded-xl", diffThemes.Hard.badge)}>
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  {progressData?.Advanced?.correct >= progressData?.Advanced?.required && progressData?.Advanced?.required > 0 && (
                    <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">Advanced</CardTitle>
                <CardDescription>Only for the experts. Almost illegible prescriptions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-muted-foreground">Correct Answers</span>
                  <span className="font-bold">{progressData?.Advanced?.correct || 0} / {progressData?.Advanced?.required || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${progressData?.Advanced?.required > 0 ? Math.min(((progressData?.Advanced?.correct || 0) / progressData?.Advanced?.required) * 100, 100) : 0}%` }} />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={cn("w-full", diffThemes.Hard.button)}
                  disabled={progressData?.Advanced?.correct >= progressData?.Advanced?.required && progressData?.Advanced?.required > 0}
                  onClick={() => setSelectedDifficulty('Advanced')}
                >
                  {progressData?.Advanced?.correct >= progressData?.Advanced?.required && progressData?.Advanced?.required > 0 ? 'Limit Reached' : 'Start Advanced'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : gameData?.limit_reached ? (
        <Card className="max-w-md mx-auto text-center border-0 shadow-xl bg-gradient-to-b from-card to-muted/20 relative overflow-hidden mt-8">
          <div className="absolute inset-0 bg-grid-white/10 pointer-events-none" />
          <CardHeader className="pt-8">
            <div className="mx-auto bg-green-500/10 p-5 rounded-full w-fit">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold mt-4">Level Completed!</CardTitle>
            <CardDescription className="text-md">
              {gameData.message}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-8 justify-center gap-3">
            <Button onClick={() => setSelectedDifficulty(null)} variant="outline">
              Back to Levels
            </Button>
          </CardFooter>
        </Card>
      ) : finished ? (
        <Card className="max-w-md mx-auto text-center border-0 shadow-xl bg-gradient-to-b from-card to-muted/20 relative overflow-hidden mt-8">
          <div className="absolute inset-0 bg-grid-white/10 pointer-events-none" />
          <CardHeader className="pt-8">
            <div className="mx-auto bg-yellow-500/10 p-5 rounded-full w-fit animate-bounce">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold mt-4">Amazing Work!</CardTitle>
            <CardDescription className="text-md">
              You have successfully answered all available prescriptions for this difficulty.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-8 justify-center gap-3">
            <Button onClick={() => setSelectedDifficulty(null)} variant="outline">
              Choose Another Level
            </Button>
            <Button onClick={() => router.push('/dashboard/games')} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25">
              Other Games
            </Button>
          </CardFooter>
        </Card>
      ) : prescription ? (
        <div className="mt-4 mb-4">
           <Button variant="outline" size="sm" onClick={() => setSelectedDifficulty(null)} className="mb-4">
             <ArrowLeft className="w-4 h-4 mr-2" /> Change Difficulty
           </Button>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left panel: Prescription Image */}
          <Card className={cn("shadow-lg overflow-hidden border relative flex flex-col justify-center min-h-[350px] bg-gradient-to-b transition-all duration-300", currentTheme.border, currentTheme.bg)}>
            <div className="absolute top-3 left-3 z-10">
              <span className={cn("backdrop-blur-sm border px-3 py-1.5 rounded-full text-xs font-bold shadow-sm", currentTheme.badge)}>
                Difficulty: {currentTheme.label}
              </span>
            </div>
            {prescription.image_path && (
              <div className="absolute top-3 right-3 z-10">
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="rounded-full bg-background/80 backdrop-blur-sm shadow-sm h-8 w-8 hover:bg-background border"
                  onClick={() => setIsZoomed(true)}
                  title="Zoom Prescription"
                >
                  <ZoomIn className="h-4 w-4 text-foreground" />
                </Button>
              </div>
            )}
            <div className="p-4 flex items-center justify-center w-full">
              {prescription.image_path ? (
                <div 
                  className="relative group overflow-hidden rounded-lg cursor-zoom-in border bg-white"
                  onClick={() => setIsZoomed(true)}
                >
                  <img 
                    src={formatImageUrl(prescription.image_path)} 
                    alt={prescription.pres_name} 
                    className="rounded-lg max-h-[380px] w-full object-contain transition-all duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                    <span className="bg-background/90 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 border border-muted/50">
                      <ZoomIn className="w-3.5 h-3.5" /> Click to Zoom
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                  <HelpCircle className="w-16 h-16 mb-2 stroke-1" />
                  <p>No prescription image attached.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Right panel: Quiz questions */}
          <div className="space-y-4">
            <Card className={cn("shadow-lg border transition-all duration-300", currentTheme.border)}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Gameplay</span>
                </div>
                <CardTitle className="text-xl leading-tight font-bold">
                  {parse(prescription.prescription_question || '')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 4 Answers */}
                {['answer_1', 'answer_2', 'answer_3', 'answer_4'].map((optionKey) => {
                  const optionText = (prescription as any)[optionKey];
                  const isSelected = selectedAnswer === optionKey;
                  const isCorrectOption = prescription.correct_answer === optionKey;

                  return (
                    <button
                      key={optionKey}
                      onClick={() => handleSelectAnswer(optionKey)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between font-medium group",
                        isSelected 
                          ? cn(
                              "border-indigo-600 bg-indigo-500/5 text-indigo-900 dark:text-indigo-200 shadow-md",
                              difficulty === 'Basic' && "border-emerald-600 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200",
                              difficulty === 'Medium' && "border-amber-600 bg-amber-500/5 text-amber-950 dark:text-amber-200",
                              (difficulty === 'Hard' || difficulty === 'Advanced') && "border-rose-600 bg-rose-500/5 text-rose-950 dark:text-rose-200"
                            )
                          : "border-muted/60 hover:border-muted-foreground/30 hover:bg-muted/10",
                        isAnswered && isCorrectOption && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300",
                        isAnswered && isSelected && !isCorrectOption && "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                      )}
                    >
                      <span>{parse(optionText || '')}</span>
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "border-indigo-600 bg-indigo-600" : "border-muted-foreground/30",
                        isAnswered && isCorrectOption && "border-green-600 bg-green-600",
                        isAnswered && isSelected && !isCorrectOption && "border-rose-600 bg-rose-600"
                      )}>
                        {(isSelected || (isAnswered && isCorrectOption)) && (
                          <Check className="h-3 w-3 text-white stroke-[3px]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>

              <CardFooter className="flex flex-col gap-4 border-t pt-4">
                {/* Clue/Help area */}
                {prescription.PresHelp && (
                  <div className="w-full">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowHint(!showHint)} 
                      className="text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/5 font-semibold flex items-center p-0"
                    >
                      <Lightbulb className="w-3.5 h-3.5 mr-1" /> {showHint ? "Hide Clue" : "Need a Hint?"}
                    </Button>
                    {showHint && (
                      <Alert className="mt-2 bg-indigo-500/5 border-indigo-500/20 text-indigo-950 dark:text-indigo-200">
                        <AlertDescription>{parse(prescription.PresHelp || '')}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
                {attemptResult && (
                  <Alert className={cn(
                    "w-full",
                    attemptResult.is_correct 
                      ? "bg-green-500/10 border-green-500/30 text-green-900 dark:text-green-200" 
                      : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                  )}>
                    <div className="flex items-center gap-2">
                      {attemptResult.is_correct ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                      <div>
                        <AlertTitle className="font-bold">
                          {attemptResult.is_correct ? "Correct! (+10 XP)" : "Wrong Answer"}
                        </AlertTitle>
                        <AlertDescription className="text-xs opacity-90 mt-0.5">
                          {attemptResult.message}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex w-full gap-3 justify-between items-center">
                  {!isAnswered ? (
                    <>
                      <Button 
                        variant="outline"
                        onClick={handleNext}
                        disabled={submitMutation.isPending}
                        className="border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                      >
                        Skip
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedAnswer || submitMutation.isPending}
                        className={cn("text-white shadow-md transition-all duration-200", currentTheme.button)}
                      >
                        {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Submit Answer
                      </Button>
                    </>
                  ) : (
                    <div className="flex w-full justify-end">
                      <Button onClick={handleNext} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
                        Next Prescription <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Error Loading Level</CardTitle>
            <CardDescription>Could not retrieve next prescription data. Please reload.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetchGame()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Reload
            </Button>
          </CardContent>
        </Card>
      )}



      {/* Image Lightbox / Zoom Modal */}
      {isZoomed && prescription && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Top Controls Bar */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-50 bg-background/80 backdrop-blur-md p-1.5 rounded-full border shadow-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted font-bold"
              onClick={() => setScale(prev => Math.min(prev + 0.25, 3))}
              title="Zoom In"
            >
              ＋
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted font-bold"
              onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))}
              title="Zoom Out"
            >
              －
            </Button>
            <Button 
              variant="ghost" 
              className="px-2.5 h-8 rounded-full text-xs font-semibold hover:bg-muted"
              onClick={() => setScale(1)}
            >
              Reset
            </Button>
            <div className="h-4 w-px bg-muted mx-1" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 font-bold"
              onClick={() => { setIsZoomed(false); setScale(1); }}
            >
              ✕
            </Button>
          </div>

          {/* Zoomable Image Container */}
          <div 
            className="w-full h-full flex items-center justify-center overflow-auto cursor-zoom-out p-6" 
            onClick={() => { setIsZoomed(false); setScale(1); }}
          >
            <img 
              src={formatImageUrl(prescription.image_path)} 
              alt={prescription.pres_name} 
              className="max-w-[95vw] max-h-[85vh] object-contain transition-transform duration-200 ease-out select-none bg-white rounded-lg shadow-2xl border"
              style={{ transform: `scale(${scale})` }}
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
