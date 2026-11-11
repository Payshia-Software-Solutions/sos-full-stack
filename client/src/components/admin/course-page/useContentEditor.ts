"use client";

import { useCallback, useState } from 'react';
import { applyListOp, editField, type ListOp } from '@/lib/course-page/paths';
import { setListFromText, type ListTextKind } from '@/lib/course-page/lists';
import { emptyContent, type CoursePageContent, type PageLanguage } from '@/lib/course-page/types';

// Holds a three-language content document being edited and the handlers the section editors call.
export function useContentEditor(initial?: CoursePageContent | null) {
  const [content, setContent] = useState<CoursePageContent>(initial ?? emptyContent());
  const [dirty, setDirty] = useState(false);
  // Bumped when the content is replaced from outside (load, translate) so text boxes that keep their own
  // typing state start again from the new content.
  const [version, setVersion] = useState(0);

  const load = useCallback((next: CoursePageContent) => {
    setContent(next);
    setDirty(false);
    setVersion((v) => v + 1);
  }, []);

  const replace = useCallback((update: (prev: CoursePageContent) => CoursePageContent) => {
    setContent(update);
    setDirty(true);
  }, []);

  const replaceExternally = useCallback((update: (prev: CoursePageContent) => CoursePageContent) => {
    setContent(update);
    setDirty(true);
    setVersion((v) => v + 1);
  }, []);

  const handlersFor = useCallback(
    (lang: PageLanguage) => ({
      onChange: (path: string, value: string) => replace((prev) => editField(prev, lang, path, value)),
      onListOp: (listPath: string, op: ListOp) => replace((prev) => applyListOp(prev, listPath, op)),
      onLines: (listPath: string, kind: ListTextKind, text: string) =>
        replace((prev) => setListFromText(prev, listPath, kind, lang, text)),
    }),
    [replace]
  );

  return { content, dirty, version, setDirty, load, replace, replaceExternally, handlersFor };
}
