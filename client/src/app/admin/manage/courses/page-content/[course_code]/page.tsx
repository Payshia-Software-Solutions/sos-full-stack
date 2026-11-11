"use client";

import { useParams } from 'next/navigation';
import { CoursePageEditor } from '@/components/admin/course-page/CoursePageEditor';

export default function CoursePageContentPage() {
  const { course_code } = useParams<{ course_code: string }>();
  return <CoursePageEditor courseCode={decodeURIComponent(course_code)} />;
}
