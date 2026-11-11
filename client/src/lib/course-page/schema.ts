// Describes the admin editor: one card per block, in the same order as the public page.
import { SHARED_FIELDS, type CoursePageDoc } from './types';

export type FieldKind = 'text' | 'textarea' | 'icon' | 'photo';

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  /** Same in every language (icon, photo, phone): editable on the English tab only. */
  shared?: boolean;
}

export type ListSpec =
  | { key: string; label: string; type: 'strings'; itemLabel: string; textarea?: boolean }
  | { key: string; label: string; type: 'objects'; itemLabel: string; fields: FieldSpec[]; titleField: string };

export interface BlockSpec {
  id: keyof CoursePageDoc;
  title: string;
  hint: string;
  fields: FieldSpec[];
  lists: ListSpec[];
}

const text = (key: string, label: string, shared = false): FieldSpec => ({ key, label, kind: 'text', shared });
const area = (key: string, label: string): FieldSpec => ({ key, label, kind: 'textarea' });

export const BLOCKS: BlockSpec[] = [
  {
    id: 'hero',
    title: 'Hero',
    hint: 'First thing students see: eyebrow, course name, headline and promise.',
    fields: [text('eyebrow', 'Eyebrow (small line above the name)'), text('title', 'Course name (page heading)'), text('headline', 'Headline'), area('promise', 'Promise (one sentence)')],
    lists: [],
  },
  {
    id: 'facts',
    title: 'Key facts',
    hint: 'Shown as tiles on the first screen. Fee and duration come from the course record, not from here.',
    fields: [
      text('next_intake', 'Next intake'),
      text('class_day', 'Class day'),
      text('class_time', 'Class time'),
      text('mode', 'Mode'),
      text('medium', 'Medium of instruction'),
      area('entry_requirements', 'Entry requirements'),
      text('study_materials', 'Study materials'),
      text('learning_style', 'Learning style'),
      text('support', 'Student support'),
      text('certificate', 'Certificate'),
    ],
    lists: [],
  },
  {
    id: 'overview',
    title: 'Overview',
    hint: 'A title and a few short paragraphs.',
    fields: [text('title', 'Title')],
    lists: [{ key: 'paragraphs', label: 'Paragraphs', type: 'strings', itemLabel: 'Paragraph', textarea: true }],
  },
  {
    id: 'audience',
    title: 'Who is this course for?',
    hint: 'A tick list of the people the course suits.',
    fields: [text('title', 'Title'), area('intro', 'Intro'), area('note', 'Closing note')],
    lists: [{ key: 'items', label: 'Points', type: 'strings', itemLabel: 'Point' }],
  },
  {
    id: 'features',
    title: 'What makes CPC different',
    hint: 'Feature cards with an icon, a title and a description.',
    fields: [text('title', 'Title'), area('intro', 'Intro'), area('closing', 'Closing line')],
    lists: [
      {
        key: 'items',
        label: 'Features',
        type: 'objects',
        itemLabel: 'Feature',
        titleField: 'title',
        fields: [{ key: 'icon', label: 'Icon', kind: 'icon', shared: true }, text('title', 'Title'), area('description', 'Description')],
      },
    ],
  },
  {
    id: 'learn',
    title: 'What you will learn',
    hint: 'A tick list of outcomes.',
    fields: [text('title', 'Title'), area('intro', 'Intro'), area('closing', 'Closing line')],
    lists: [{ key: 'items', label: 'Points', type: 'strings', itemLabel: 'Point' }],
  },
  {
    id: 'modules',
    title: 'Course modules',
    hint: 'Numbered automatically in the order shown here.',
    fields: [text('title', 'Title')],
    lists: [
      {
        key: 'items',
        label: 'Modules',
        type: 'objects',
        itemLabel: 'Module',
        titleField: 'title',
        fields: [text('title', 'Module title'), area('description', 'Description')],
      },
    ],
  },
  {
    id: 'assessment',
    title: 'Assessment & student progress',
    hint: 'How students are assessed.',
    fields: [text('title', 'Title'), area('intro', 'Intro'), area('note', 'Closing note')],
    lists: [{ key: 'items', label: 'Assessment types', type: 'strings', itemLabel: 'Type' }],
  },
  {
    id: 'certification',
    title: 'Certification',
    hint: 'What students receive on completion: certificate, study pack and how it is awarded.',
    fields: [text('title', 'Title'), area('intro', 'Intro'), area('note', 'Closing note')],
    lists: [{ key: 'items', label: 'Certification points', type: 'strings', itemLabel: 'Point' }],
  },
  {
    id: 'schedule',
    title: 'Schedule',
    hint: 'Class day and time are edited under Key facts.',
    fields: [text('title', 'Title'), area('note', 'Note'), text('recordings', 'Recordings')],
    lists: [],
  },
  {
    id: 'lecturers',
    title: 'Lecturer panel',
    hint: 'Photo, name and qualifications.',
    fields: [text('title', 'Title')],
    lists: [
      {
        key: 'items',
        label: 'Lecturers',
        type: 'objects',
        itemLabel: 'Lecturer',
        titleField: 'name',
        fields: [text('name', 'Name'), area('qualifications', 'Qualifications'), { key: 'photo_url', label: 'Photo', kind: 'photo', shared: true }],
      },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    hint: 'Questions and answers. Also sent to Google as FAQ data.',
    fields: [text('title', 'Title')],
    lists: [
      {
        key: 'items',
        label: 'Questions',
        type: 'objects',
        itemLabel: 'Question',
        titleField: 'question',
        fields: [text('question', 'Question'), area('answer', 'Answer')],
      },
    ],
  },
  {
    id: 'cta',
    title: 'Ready to start?',
    hint: 'Closing block with the key facts and the Apply / WhatsApp buttons.',
    fields: [text('title', 'Title'), area('subtitle', 'Subtitle'), text('tagline', 'Tagline'), text('phone', 'Phone number', true)],
    lists: [],
  },
];

export const isSharedField = (key: string) => (SHARED_FIELDS as readonly string[]).includes(key);

function hasText(value: unknown): boolean {
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.some(hasText);
  if (value && typeof value === 'object') {
    // Icon, photo and phone are shared defaults, not content a person wrote.
    return Object.entries(value).some(([key, v]) => !isSharedField(key) && hasText(v));
  }
  return false;
}

/** True when the block has any real text in this language's document (used for the "filled" ticks). */
export function isBlockFilled(doc: CoursePageDoc, id: string): boolean {
  return hasText((doc as Record<string, unknown>)[id]);
}
