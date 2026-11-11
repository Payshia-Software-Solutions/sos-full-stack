"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, ExternalLink, Languages, Loader2, Rocket, Save } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { getParentCourses } from '@/lib/actions/courses';
import { getCoursePageAdmin, publishCoursePage, saveCoursePageDraft } from '@/lib/actions/course-pages';
import { isTranslateEnabled, translateCoursePage } from '@/ai/flows/translate-course-page';
import { applyTranslation, changedPaths, stalePaths, translatableTexts } from '@/lib/course-page/paths';
import { pruneBlankItems } from '@/lib/course-page/prune';
import { BLOCKS, isBlockFilled } from '@/lib/course-page/schema';
import type { CoursePageContent, CoursePageDoc, PageLanguage } from '@/lib/course-page/types';
import { CoverCard } from './CoverCard';
import { RefundPolicyEditor } from './RefundPolicyEditor';
import { SectionEditor } from './SectionEditor';
import { SectionNav, type NavSection } from './SectionNav';
import { useContentEditor } from './useContentEditor';

const FRONT_WEB_URL = process.env.NEXT_PUBLIC_FRONT_WEB_URL || 'https://pharmacollege.lk';
const LANGUAGES: { value: PageLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'සිංහල' },
  { value: 'ta', label: 'தமிழ்' },
];
const NO_KEY_NOTE = 'Add a Gemini API key to enable auto-translate';
const REFUND_ID = 'refund';

// PHP serialises an empty object as [], so any document may arrive as an array.
const asDoc = (value: unknown): CoursePageDoc => (value && !Array.isArray(value) ? (value as CoursePageDoc) : {});

function normalizeLoaded(content: CoursePageContent | null): CoursePageContent {
  return {
    en: asDoc(content?.en),
    si: asDoc(content?.si),
    ta: asDoc(content?.ta),
    overrides: { si: content?.overrides?.si ?? [], ta: content?.overrides?.ta ?? [] },
  };
}

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Please try again.');

export function CoursePageEditor({ courseCode }: { courseCode: string }) {
  const queryClient = useQueryClient();
  const pageQuery = useQuery({ queryKey: ['coursePageAdmin', courseCode], queryFn: () => getCoursePageAdmin(courseCode) });
  const coursesQuery = useQuery({ queryKey: ['parentCourses'], queryFn: getParentCourses, staleTime: 5 * 60 * 1000 });
  const course = coursesQuery.data?.find((c) => c.course_code === courseCode);

  const editor = useContentEditor();
  const { content, dirty, version } = editor;
  const [lang, setLang] = useState<PageLanguage>('en');
  const [section, setSection] = useState<string>(BLOCKS[0].id);
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'translate'>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const lastSavedEn = useRef<CoursePageDoc>({});

  useEffect(() => {
    isTranslateEnabled().then(setTranslateEnabled).catch(() => setTranslateEnabled(false));
  }, []);

  useEffect(() => {
    if (!pageQuery.data) return;
    const loaded = normalizeLoaded(pageQuery.data.draft ?? pageQuery.data.published);
    editor.load(loaded);
    lastSavedEn.current = loaded.en;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageQuery.data]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const staleSi = useMemo(() => stalePaths(content, 'si').length, [content]);
  const staleTa = useMemo(() => stalePaths(content, 'ta').length, [content]);
  const staleHere = lang === 'si' ? staleSi : lang === 'ta' ? staleTa : 0;
  const status = pageQuery.data?.status ?? 'none';

  const sections: NavSection[] = useMemo(
    () => [
      ...BLOCKS.map((b) => ({ id: b.id as string, label: b.title, filled: isBlockFilled(content[lang], b.id) })),
      { id: REFUND_ID, label: 'Refund policy (all courses)', filled: true },
    ],
    [content, lang]
  );
  const activeBlock = BLOCKS.find((b) => b.id === section);

  /** Saves the draft (blank English items pruned first). When a key is set, changed English text is translated too. */
  const saveDraft = async (): Promise<boolean> => {
    let toSave = pruneBlankItems(content);
    if (translateEnabled) {
      try {
        const changed = changedPaths(lastSavedEn.current, toSave.en);
        for (const target of ['si', 'ta'] as const) {
          const texts = translatableTexts(toSave.en, changed);
          if (Object.keys(texts).length === 0) continue;
          const res = await translateCoursePage(texts, target);
          if (res.result) toSave = { ...toSave, [target]: applyTranslation(toSave[target], res.result, toSave.overrides?.[target] ?? []) as CoursePageDoc };
          else if (res.error) toast({ variant: 'destructive', title: `Could not translate to ${target === 'si' ? 'Sinhala' : 'Tamil'}`, description: res.error });
        }
      } catch (e) {
        toast({ variant: 'destructive', title: 'Auto-translate skipped', description: errorMessage(e) });
      }
    }
    try {
      await saveCoursePageDraft(courseCode, toSave);
      editor.load(toSave);
      lastSavedEn.current = toSave.en;
      await queryClient.invalidateQueries({ queryKey: ['coursePageAdmin', courseCode] });
      return true;
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not save the draft', description: errorMessage(e) });
      return false;
    }
  };

  const onSave = async () => {
    setBusy('save');
    if (await saveDraft()) toast({ title: 'Draft saved', description: 'Students do not see it until you publish.' });
    setBusy(null);
  };

  const onPublish = async () => {
    setConfirmPublish(false);
    setBusy('publish');
    try {
      if (!(await saveDraft())) return;
      const publishedAt = await publishCoursePage(courseCode);
      await queryClient.invalidateQueries({ queryKey: ['coursePageAdmin', courseCode] });
      toast({ title: 'Published', description: `Live on the course page${publishedAt ? ` (${publishedAt})` : ''}. It can take a few minutes to appear.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not publish', description: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  };

  const onTranslate = async (mode: 'missing' | 'all') => {
    if (lang === 'en') return;
    setBusy('translate');
    try {
      const texts = translatableTexts(content.en, mode === 'missing' ? stalePaths(content, lang) : undefined);
      const res = await translateCoursePage(texts, lang);
      if (!res.enabled) toast({ title: 'Auto-translate is off', description: NO_KEY_NOTE });
      else if (res.error) toast({ variant: 'destructive', title: 'Translation failed', description: res.error });
      else if (res.result) {
        const result = res.result;
        editor.replaceExternally((prev) => ({ ...prev, [lang]: applyTranslation(prev[lang], result, prev.overrides?.[lang] ?? []) as CoursePageDoc }));
        toast({ title: 'Translated', description: 'Check the wording, then save the draft.' });
      }
    } finally {
      setBusy(null);
    }
  };

  const handlers = editor.handlersFor(lang);

  if (pageQuery.isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-8">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (pageQuery.isError) {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Could not load this page's content</AlertTitle>
          <AlertDescription>{errorMessage(pageQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this page to pharmacollege.lk?</AlertDialogTitle>
            <AlertDialogDescription>
              Your draft is saved first and then goes live for students.
              {staleSi + staleTa > 0 && ` ${staleSi} Sinhala and ${staleTa} Tamil fields are still empty and will show the English text.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onPublish}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/admin/manage/courses">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to courses
          </Link>
        </Button>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-headline text-3xl font-semibold">Course page</h1>
            <p className="text-muted-foreground">
              {course?.course_name ?? courseCode} <span className="text-xs">({courseCode})</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status === 'published' ? 'default' : 'secondary'}>
              {status === 'published' ? 'Published' : status === 'draft' ? 'Draft, not published' : 'Not created yet'}
            </Badge>
            {course?.slug && (
              <Button variant="outline" size="sm" asChild>
                <a href={`${FRONT_WEB_URL}/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View live page
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <CoverCard courseCode={courseCode} courseImg={course?.course_img} />

      {course && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fee and duration</CardTitle>
            <CardDescription>Taken from the course record, so the page always matches what students are charged.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <span><span className="text-muted-foreground">Fee:</span> <strong>{course.course_fee ? `LKR ${Number(course.course_fee).toLocaleString('en-LK')}` : '—'}</strong></span>
            <span><span className="text-muted-foreground">Duration:</span> <strong>{course.course_duration || '—'}</strong></span>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href={`/admin/manage/courses/edit/${course.id}`}>Change in the course record</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Tabs value={lang} onValueChange={(v) => setLang(v as PageLanguage)}>
            <TabsList aria-label="Language being edited">
              {LANGUAGES.map((l) => (
                <TabsTrigger key={l.value} value={l.value}>
                  {l.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {lang !== 'en' && (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" disabled={!translateEnabled || busy !== null} onClick={() => onTranslate('missing')}>
                {busy === 'translate' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                Translate missing
              </Button>
              <Button size="sm" variant="outline" disabled={!translateEnabled || busy !== null} onClick={() => onTranslate('all')}>
                Re-translate all
              </Button>
              {!translateEnabled && <span className="text-xs text-muted-foreground">{NO_KEY_NOTE}</span>}
            </div>
          )}
        </div>
      </div>

      {lang !== 'en' && (
        <Alert>
          <AlertTitle>{staleHere === 0 ? 'Everything is translated' : `${staleHere} fields still need ${lang === 'si' ? 'Sinhala' : 'Tamil'} text`}</AlertTitle>
          <AlertDescription>
            English is on the left, your translation on the right. Anything left empty shows the English text to students.
            Add, remove and reorder items on the English tab.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <SectionNav sections={sections} active={section} onSelect={setSection} />
        <div className="min-w-0">
          {activeBlock ? (
            <SectionEditor
              key={`${section}-${lang}-${version}`}
              block={activeBlock}
              lang={lang}
              content={content}
              {...handlers}
            />
          ) : (
            <RefundPolicyEditor key={lang} lang={lang} />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <p className="text-sm text-muted-foreground" role="status">
          {dirty ? (
            <span className="font-medium text-foreground">You have unsaved changes</span>
          ) : status === 'published' ? (
            'All changes saved. The page is published.'
          ) : (
            'All changes saved. Not published yet.'
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onSave} disabled={busy !== null || !dirty}>
            {busy === 'save' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save draft
          </Button>
          <Button onClick={() => setConfirmPublish(true)} disabled={busy !== null}>
            {busy === 'publish' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
