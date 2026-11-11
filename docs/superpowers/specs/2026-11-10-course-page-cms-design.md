# Course Page CMS — Design

Date: 2026-11-10
Status: Draft for approval

## Intent

The public course detail page on pharmacollege.lk (`front-web`, route `/courses/[slug]`) is the page students land on from Facebook ads and WhatsApp links. Today its content is hard-coded in `front-web/src/lib/course-translations.ts` and `components/course-detail-client.tsx`, so every wording, fee or intake change needs a developer and a deploy.

We want:

1. A **simpler, more decisive page** that gives a student every decision fact (next intake, fee, duration, medium, entry requirement) on the first screen, with Apply and WhatsApp one tap away, followed by the full course story in short sections.
2. **All page content stored in the database** and **managed from SOS admin** (`client` app), per course.
3. **Sinhala and Tamil versions** produced automatically from the English text when admin saves, stored in the database, and correctable by admin.

Success: staff can change CCPP's next intake, fee, a module description or an FAQ answer in SOS admin, click Publish, and see it live on the public page in all three languages without a developer.

## Goals

- One reusable page layout for every course in `parent_main_course`; each course has its own content.
- Content blocks (in this order on the page):
  1. Hero + key facts — name, eyebrow ("Play • Learn • Grow"), headline ("Start Your Journey in Pharmacy Practice"), one-line promise, fact tiles: next intake, fee, duration, mode, medium, entry requirement, study materials, certificate; Apply + WhatsApp buttons.
  2. Sticky section tabs — Overview · Who it's for · Modules · Lecturers · FAQ · Fees.
  3. Overview — title + paragraphs.
  4. Who is this course for — bullet list + closing note.
  5. What makes CPC different — list of features (icon, title, description). Icons are chosen from a fixed Lucide set, never emojis.
  6. What you will learn — bullet list + closing line.
  7. Course modules — numbered list of (title, description), shown as an accordion.
  8. Assessment & progress — intro, bullet list, closing note.
  9. Schedule — class day, class time, mode, recordings, short note.
  10. Lecturer panel — (photo, name, qualifications).
  11. Student testimonials — reuse existing site reviews (`src/lib/reviews-data.ts` / reviews API); not edited here.
  12. FAQ — (question, answer) accordion.
  13. Ready to start — closing headline + repeat of intake/fee/duration + buttons + phone number.
  14. Refund policy — collapsed; **one global text shared by all courses**.
- Every list is add / remove / reorder in admin.
- Draft vs Published: admin edits a draft; Publish copies it live. The public site only ever reads the published version.
- Translation on save: when admin saves English, the server-side translate step produces Sinhala and Tamil and stores them. Admin can open the SI / TA tabs and edit any field. A field that admin has manually edited in SI/TA is not overwritten by later re-translation unless admin explicitly clicks "Re-translate".
- Fallback: a course with no published page content keeps rendering the current page (`course-detail-client.tsx`) so nothing breaks while staff fill courses in.
- Seed CCPP (`certificate-course-in-pharmacy-practice`, course_code `CS0001`) with the content supplied in the request, so it is live from day one.
- SEO: content is server-rendered (no client-only fetch), so English, Sinhala and Tamil text are in the HTML; keep the existing `Course` JSON-LD and add `FAQPage` JSON-LD from the FAQ block. Canonical stays `https://pharmacollege.lk/courses/{slug}`.

## Non-goals

- No change to enrollment/apply flow, payments, or the LMS course/batch tables.
- No live translation on every page view (the blog toolbar approach) for this page.
- No per-language URL routes (`/si/...`) in this project; language stays the existing client-side switcher. (Separate SEO follow-up.)
- No new auth system. See Constraints.
- Testimonials are not authored in this editor.

## Anti-goals (would count as failure even if it "works")

- Public page waits on a translation call or shows a spinner per section.
- A half-edited draft becomes visible to students.
- Admin's hand-corrected Sinhala/Tamil wording is silently overwritten.
- The page gets *more* cluttered than today, or loses the facts-first top screen.
- Existing courses without new content break or show empty sections (empty blocks must be hidden, not rendered blank).

## Constraints / current state

- **Backend:** custom PHP MVC in `server/` (PDO, MySQL). Routes are arrays returned from `server/routes/*.php`, merged in `server/routes/web.php`, matched by placeholder regex (`{slug}`, `{course_code}`, `{id}` already supported). Schema changes in this codebase are done via `CREATE TABLE IF NOT EXISTS` migration routes in `web.php` or SQL files in `server/migrations/` (note: root `.gitignore` ignores `*.sql`).
- **Existing course tables:** `parent_main_course` (public course list: slug, course_code, course_name, course_fee, course_duration, course_img, …) and LMS-academic `course_modules` / `course_overviews` / `course_outcomes`. The new page content is marketing content and lives in its **own table**; it does not reuse `course_modules` (those are credit-bearing LMS modules).
- **Admin app:** `client/` (Next.js 15, TanStack Query, shadcn/ui, Tiptap and react-quill available). Course admin lives at `client/src/app/admin/manage/courses` using `getParentCourses` from `client/src/lib/actions/courses.ts` against `NEXT_PUBLIC_LMS_SERVER_URL`. The Blogs admin (`client/src/app/admin/blogs`) is the closest existing pattern for a content editor with image upload.
- **Public site:** `front-web/` (Next.js 15 App Router). Course page `app/courses/[slug]/page.tsx` is a server component that fetches courses and renders `CourseDetailClient`. Language switching is client-side via `LanguageProvider` (`en` / `si` / `ta`).
- **Translation:** both `client` and `front-web` already depend on Genkit with `googleai/gemini-2.0-flash` (`src/ai/genkit.ts`, `front-web/src/ai/flows/translate-flow.ts`). Requires a Google AI API key in the environment of whichever app runs the translation; no key is present in the repo's env files today, so it must be configured on the admin app's host.
- **Security (existing, not fixed here):** server write endpoints (e.g. blogs) have no authentication; CORS is `*`. New write endpoints follow the same pattern for consistency; adding auth to the API is a separate follow-up and is flagged as a known risk.
- Design tokens/contrast fixes from the recent UI work apply: primary `161 100% 24%` (light), white button text; dark-mode-safe colors; minimum text 12px; respect `prefers-reduced-motion`.

## Decided by the user

- First screen = **facts first** (option A): name + promise + big fact tiles + Apply/WhatsApp, then sticky tabs.
- Section order as listed in Goals (approved "all good").
- Content managed from **SOS admin**, stored in the **database**, fetched by the public page.
- Translation: **translate once on save, store SI/TA, admin can correct**, chosen as the best method.

## Data model (my call)

New table `course_page_content`, one row per course:

| column | type | notes |
|---|---|---|
| id | INT PK AI | |
| course_code | VARCHAR(50) UNIQUE | joins to `parent_main_course.course_code` |
| draft_content | LONGTEXT (JSON) | `{ en: {...}, si: {...}, ta: {...}, overrides: { si: [paths], ta: [paths] } }` |
| published_content | LONGTEXT (JSON) NULL | same shape; NULL = never published (public page falls back) |
| status | ENUM('draft','published') | |
| published_at | DATETIME NULL | |
| updated_at | TIMESTAMP | on update |

One JSON document per language with this shape (all fields optional; empty → section hidden):

```
{
  hero: { eyebrow, title, headline, promise },
  facts: { next_intake, fee, duration, mode, medium, entry_requirements, study_materials, certificate, class_day, class_time },
  overview: { title, paragraphs: [] },
  audience: { title, items: [], note },
  features: { title, intro, items: [{ icon, title, description }] },
  learn: { title, intro, items: [], closing },
  modules: { title, items: [{ title, description }] },
  assessment: { title, intro, items: [], note },
  schedule: { title, note, recordings },
  lecturers: { title, items: [{ name, qualifications, photo_url }] },
  faq: { title, items: [{ question, answer }] },
  cta: { title, subtitle, phone }
}
```

Refund policy: one row in a small `site_content` key/value table (`key = 'refund_policy'`, same en/si/ta JSON), editable from the same admin area.

Non-text fields (icon names, photo URLs, phone) live only in `en` and are shared across languages.

## API (my call)

- `GET /api/course-pages/{slug}` — public; returns published content for the course (joined via `parent_main_course.slug`) plus the refund policy; 404 if not published.
- `GET /api/course-pages/admin/{course_code}` — draft + published + status, for the editor.
- `PUT /api/course-pages/{course_code}` — save draft (full JSON).
- `POST /api/course-pages/{course_code}/publish` — copy draft → published, set `published_at`.
- `GET/PUT /api/site-content/refund_policy`.
- Lecturer photo upload: reuse the blog image upload mechanism (`POST /api/blogs/upload-image` pattern) or an equivalent endpoint.

## Admin editor (my call)

- Entry: a "Page content" action on each row of `admin/manage/courses`, opening `admin/manage/courses/page-content/[course_code]`.
- Layout: language tabs **EN / SI / TA**; one collapsible card per block in page order; repeatable lists with add / remove / move up / move down; icon picker for features from a fixed list.
- Buttons: **Save draft** (saves EN, auto-translates changed EN fields to SI/TA except overridden ones), **Re-translate** (per language, overwrites all), **Preview** (opens the public page in a preview mode reading draft), **Publish**.
- Translation runs in the admin app as a Next.js server action using Genkit (already a dependency), batched per save, so the public site never calls the translator.

## Public page (my call)

- `front-web/app/courses/[slug]/page.tsx` fetches `GET /api/course-pages/{slug}` server-side (revalidate ~5 min, plus on-demand revalidation is optional), passes all three language docs to a new `CoursePageView` client component that picks the active language from `LanguageProvider`, falling back to `en` for any missing field.
- If the API returns 404 or fails, render the existing `CourseDetailClient` (fallback).
- Mobile-first; sticky tabs; accordions for modules and FAQ; Apply → existing `/apply?course={slug}`; WhatsApp → existing wa.me number with a prefilled message naming the course.

## Resolved after builder review

- **CCPP seed content (answered):** the English copy is the text the user supplied in the request (hero, key facts, lecturer panel, who it's for, what makes CPC different, what you'll learn, 10 modules, assessment, schedule, FAQ, ready-to-start, refund policy). It is committed as `server/seeds/course_page_ccpp.en.json` and loaded by the migration. SI/TA are produced by the translator on first save and then reviewed by staff. The old hand-written SI/TA in `front-web/src/lib/course-translations.ts` is **not** migrated; it does not match the new blocks.
- **Fee and duration source (my call):** `parent_main_course.course_fee` and `course_duration` stay the single source of truth for fee and duration (JSON-LD, apply and payment already use them). The page reads them from there. The CMS has no fee or duration field; the editor shows both read-only with a link to the existing course edit screen. Next intake, mode, medium, entry requirement, study materials, certificate, class day and class time are CMS fields.
- **Translation failure (my call):** Save draft always saves EN, even when translation fails or no key is configured. Fields whose EN changed but whose SI/TA were not regenerated are marked stale. The editor shows a "translations out of date" banner with a Re-translate button. Publish is allowed but warns when any SI/TA field is stale or missing; the public page falls back to EN for missing fields.

- **No Gemini key today (user):** the user has no Google AI API key. Build the translate step behind a single server action that checks for `GOOGLE_GENAI_API_KEY` (or `GEMINI_API_KEY`). When no key is set, the Translate/Re-translate buttons are disabled with a short note ("Add a Gemini API key to enable auto-translate"), and staff type Sinhala/Tamil by hand in the SI/TA tabs. Missing SI/TA fields fall back to English on the public page. Adding a key later turns auto-translate on with no code change. CCPP launches with English content; SI/TA are filled in by staff.
- **Who may publish (user):** any SOS admin user can save and publish. No extra role check.

## Left to the builder

- Exact visual styling within the existing design tokens and component library (shadcn/ui).
- Preview mechanism (query param + token, or a draft endpoint) as long as drafts are never publicly listed.
- Whether translation diffing is per-field hash or simple "changed since last save".
- Image upload endpoint choice for lecturer photos.
- Migration mechanism (migration route vs SQL file), consistent with the repo.
