# Course Page CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store each course's public page content in MySQL, edit it (EN/SI/TA, draft → publish) in SOS admin, and render a redesigned facts-first course page on pharmacollege.lk from that data.

**Architecture:** One JSON document per course in a new `course_page_content` table (draft + published columns) served by a new PHP controller in `server/`. The `client` admin app gets an editor page that saves drafts and publishes; the `front-web` course route fetches the published document server-side and renders new section components, falling back to the existing `CourseDetailClient` when nothing is published.

**Tech Stack:** PHP 8 + PDO/MySQL (custom router), Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui (both `client` and `front-web`), TanStack Query (client), Genkit/Gemini (optional, disabled without key), Vitest (new dev dependency, pure-function tests only), PHP CLI test script (no framework).

**Spec:** `docs/superpowers/specs/2026-11-10-course-page-cms-design.md` — seed copy in `docs/superpowers/specs/2026-11-10-ccpp-content.md`.

## Global Constraints

- Table names: `course_page_content` (one row per `course_code`, UNIQUE) and `site_content` (key/value; key `refund_policy`). Charset `utf8mb4`, collation `utf8mb4_unicode_ci`.
- Public site reads **published** content only. Draft content is returned only by the admin endpoint.
- Fee and duration are **not** CMS fields: always from `parent_main_course.course_fee` / `course_duration`.
- Shared (language-independent) fields live only in `en`: `features.items[].icon`, `lecturers.items[].photo_url`, `cta.phone`.
- Icons come from this fixed Lucide set only: `gamepad-2, pill, calculator, book-open, video, play-circle, trophy, stethoscope, briefcase, graduation-cap, flask-conical, clipboard-check, users, shield-check, heart-pulse, award`. Unknown icon → `award`.
- Empty block (no title and no items/paragraphs) → section not rendered and its sticky tab hidden.
- Missing SI/TA string → English string for that field (field-level fallback), never blank.
- Translation is enabled only when `GOOGLE_GENAI_API_KEY` or `GEMINI_API_KEY` is set in the client app env; otherwise translate buttons are disabled with the text "Add a Gemini API key to enable auto-translate".
- Any SOS admin user may save and publish (no role check).
- Canonical URL stays `https://pharmacollege.lk/courses/{slug}`.
- UI tokens from the recent UI fixes: no text below 12px (`text-xs`), primary buttons `bg-primary text-primary-foreground`, full-width green bands `bg-emerald-800 text-white`, no emojis as icons, respect `prefers-reduced-motion`.
- **The `server/.env` DB_HOST is a remote IP.** Do not run the migration or write endpoints against it without the user confirming which database to use (Task 2, Step 1).

### Content document shape (extends the spec's shape with fields the seed copy needs)

```ts
interface CoursePageDoc {
  hero?: { eyebrow?: string; title?: string; headline?: string; promise?: string };
  facts?: { next_intake?: string; mode?: string; medium?: string; entry_requirements?: string;
            study_materials?: string; learning_style?: string; support?: string; certificate?: string;
            class_day?: string; class_time?: string };
  overview?: { title?: string; paragraphs?: string[] };
  audience?: { title?: string; intro?: string; items?: string[]; note?: string };
  features?: { title?: string; intro?: string; closing?: string; items?: { icon?: string; title?: string; description?: string }[] };
  learn?: { title?: string; intro?: string; items?: string[]; closing?: string };
  modules?: { title?: string; items?: { title?: string; description?: string }[] };
  assessment?: { title?: string; intro?: string; items?: string[]; note?: string };
  schedule?: { title?: string; note?: string; recordings?: string };
  lecturers?: { title?: string; items?: { name?: string; qualifications?: string; photo_url?: string }[] };
  faq?: { title?: string; items?: { question?: string; answer?: string }[] };
  cta?: { title?: string; subtitle?: string; tagline?: string; phone?: string };
}
interface CoursePageContent { en: CoursePageDoc; si: CoursePageDoc; ta: CoursePageDoc; overrides?: { si: string[]; ta: string[] } }
interface RefundPolicyDoc { title?: string; items?: { title?: string; body?: string }[] }
interface RefundPolicy { en: RefundPolicyDoc; si: RefundPolicyDoc; ta: RefundPolicyDoc }
```

Field paths (used for `overrides` and stale tracking) are dot paths with numeric indexes, e.g. `modules.items.3.description`.

### API contract

| Method & path | Body | Response |
|---|---|---|
| `GET /api/course-pages/{slug}` | – | 200 `{ success:true, course_code, slug, published_at, content: CoursePageContent, refund_policy: RefundPolicy \| null }`; 404 `{ success:false, message:"Course page not published" }` |
| `GET /api/course-pages/admin/{course_code}` | – | 200 `{ success:true, course_code, status:"draft"\|"published"\|"none", draft: CoursePageContent \| null, published: CoursePageContent \| null, published_at, updated_at }` |
| `PUT /api/course-pages/{course_code}` | `{ content: CoursePageContent }` | 200 `{ success:true, status }`; 400 on invalid JSON / unknown course_code |
| `POST /api/course-pages/{course_code}/publish` | – | 200 `{ success:true, published_at }`; 404 when no draft |
| `GET /api/site-content/{setting_name}` | – | 200 `{ success:true, key, value }`; 404 when unset |
| `PUT /api/site-content/{setting_name}` | `{ value: object }` | 200 `{ success:true }`; 400 when key not in allow-list `['refund_policy']` |
| `GET /run-course-page-migration/` | – | creates both tables, seeds CS0001 draft+published and `refund_policy` only if absent |

## Review Focus

1. **Course published but SI/TA empty** — switching to Sinhala shows English text for every empty field, never blank cards or `undefined`. → test in Task 3 (`resolveDoc falls back per field`).
2. **Malformed or hostile input to `PUT`** (non-JSON, `content` missing, unknown keys, HTML/script in strings, 500 FAQ items) — server rejects or normalizes; unknown keys are dropped; strings stored as plain text and rendered escaped (no `dangerouslySetInnerHTML`). → test in Task 1 (`normalize drops unknown keys and non-strings`, `caps list length at 50`).
3. **Admin saves while editing SI after changing EN** — hand-edited SI/TA fields listed in `overrides` survive later saves/re-translate. → test in Task 5 (`applyTranslation skips override paths`).
4. **API down or slow during public page render** — page still renders the old `CourseDetailClient` within the 3s fetch timeout, no 500. → test in Task 3 (`getCoursePage returns null on timeout/404`).
5. **Slug of an unpublished course / draft-only course** — public endpoint returns 404 (draft never leaks), page falls back. → test in Task 2 (API script: draft-only course → 404).

---

### Task 1: Server content normalizer + PHP test runner

**Files:**
- Create: `server/models/Course/CoursePageSchema.php`
- Create: `server/tests/run.php` (tiny runner: requires every `server/tests/*Test.php`, each test is a function `test_*` throwing on failure; prints `PASS name` / `FAIL name: msg`, exits 1 on any failure)
- Create: `server/tests/CoursePageSchemaTest.php`

**Interfaces:**
- Produces: `CoursePageSchema::normalizeDoc(array $doc, bool $isEnglish): array`, `CoursePageSchema::normalizeContent(array $content): array` (always returns keys `en`,`si`,`ta`,`overrides`), `CoursePageSchema::normalizeRefundPolicy(array $value): array`, `CoursePageSchema::ICONS` (array of the allowed icon names), `CoursePageSchema::MAX_ITEMS = 50`.

- [ ] **Step 1: Write failing tests** in `CoursePageSchemaTest.php`:
  - `test_normalize_drops_unknown_keys_and_non_strings`: input `['hero'=>['title'=>' CCPP ','evil'=>'x'],'bogus'=>[1]]` → `['hero'=>['title'=>'CCPP']]` (trimmed, `evil` and `bogus` gone).
  - `test_caps_list_length_at_50`: `faq.items` with 60 entries → 50 kept.
  - `test_drops_empty_list_items`: `audience.items = ['A','',' ']` → `['A']`; `modules.items=[['title'=>'','description'=>'']]` → `[]`.
  - `test_unknown_icon_becomes_award`: `features.items[0].icon='rocket'` → `'award'`.
  - `test_shared_fields_only_kept_in_english`: SI doc with `cta.phone` and `lecturers.items[0].photo_url` → both removed when `$isEnglish=false`.
  - `test_normalize_content_always_has_three_languages`: `normalizeContent(['en'=>[]])` has keys `en,si,ta,overrides` and `overrides` = `['si'=>[],'ta'=>[]]`.
- [ ] **Step 2: Run** `/d/xampp/php/php.exe server/tests/run.php` → Expected: FAIL (class not found).
- [ ] **Step 3: Implement `CoursePageSchema`** — a static field map mirroring the CoursePageDoc shape (block → scalar keys / list keys / list item keys); walk it, keep only mapped keys, cast scalars with `trim((string)$v)` and drop non-scalars, strip shared fields when `!$isEnglish`.
- [ ] **Step 4: Run** the runner → Expected: all `PASS`, exit 0.
- [ ] **Step 5: Commit** `feat(server): add course page content normalizer and test runner`.

### Task 2: Server tables, model, controller, routes, seed

**Files:**
- Create: `server/models/Course/CoursePageContent.php`, `server/models/SiteContent.php`
- Create: `server/controllers/Course/CoursePageController.php`
- Create: `server/routes/Course/CoursePageRoutes.php`
- Create: `server/seeds/course_page_ccpp.en.json` (CoursePageDoc built from `docs/superpowers/specs/2026-11-10-ccpp-content.md`, every section; icons exactly as in that file's table)
- Create: `server/seeds/refund_policy.en.json` (RefundPolicyDoc, title "Refund Policy – Ceylon Pharma College", 7 items from the content file)
- Modify: `server/routes/web.php` — require routes file next to `$blogRoutes`, add to `array_merge`, add `GET /run-course-page-migration/` beside the announcements migration route
- Test: `server/tests/api_course_pages.sh` (curl script against `$API` base URL)

**Interfaces:**
- Consumes: `CoursePageSchema::normalizeContent`, `normalizeRefundPolicy`.
- Produces: the API contract table above. Model methods: `CoursePageContent::getByCourseCode(string $code): ?array`, `getPublishedBySlug(string $slug): ?array` (JOIN `parent_main_course` ON `course_code`), `saveDraft(string $code, array $content): void` (INSERT … ON DUPLICATE KEY UPDATE `draft_content`, `status` stays `published` if previously published), `publish(string $code): ?string` (returns `published_at` or null when no draft). `SiteContent::get(string $key): ?array`, `set(string $key, array $value): void`.

- [ ] **Step 1: STOP and ask the user** which database the migration and API tests may write to (`server/.env` DB_HOST is a remote IP). Do not continue until they answer; use only that target.
- [ ] **Step 2: Write `api_course_pages.sh`** asserting (with `jq`/`grep`, exit 1 on mismatch):
  - `GET /api/course-pages/certificate-course-in-pharmacy-practice` → 200, `.content.en.hero.headline == "Start Your Journey in Pharmacy Practice"`, `.content.en.modules.items | length == 10`, `.refund_policy.en.items | length == 7`.
  - `PUT /api/course-pages/CS0001` with `{"content":{"en":{"hero":{"title":"Draft T"}}}}` → 200; then public GET still returns the seeded title (draft does not leak); admin GET `.draft.en.hero.title == "Draft T"`.
  - `PUT /api/course-pages/CS0001` with body `not json` → 400.
  - `PUT /api/course-pages/NOPE999` → 400 `"Unknown course_code"`.
  - Public GET for a course with no row (e.g. slug of CS0002) → 404.
  - `PUT /api/site-content/hack` → 400.
  - Finally re-PUT the seed and POST publish so CS0001 is left in its seeded state.
- [ ] **Step 3: Run** `API=http://localhost/sos-full-stack/server bash server/tests/api_course_pages.sh` → Expected: FAIL (route not found).
- [ ] **Step 4: Implement** models, controller (read body via `json_decode(file_get_contents('php://input'), true)`, 400 when not an array or `content` missing; JSON responses with `success`), routes (register `admin/{course_code}` before `{slug}`), migration route (CREATE TABLE IF NOT EXISTS for both tables; seed CS0001 draft + published from the seed file only when no row exists; seed `refund_policy` only when absent).
- [ ] **Step 5: Run** the migration once (`curl $API/run-course-page-migration/`) → `{"success":true,...}`; run `api_course_pages.sh` → all checks pass; run `php server/tests/run.php` → PASS.
- [ ] **Step 6: Commit** `feat(server): course page content API, tables and CCPP seed`.

### Task 3: front-web data layer (types, fetch, language resolve, FAQ JSON-LD)

**Files:**
- Create: `front-web/src/lib/course-page.ts`
- Create: `front-web/src/lib/course-page.test.ts`
- Modify: `front-web/package.json` — add dev dependency `vitest` and script `"test": "vitest run"`

**Interfaces:**
- Consumes: API contract `GET /api/course-pages/{slug}` via `LMS_API_URL` from `src/lib/config.ts`.
- Produces: exported types `CoursePageDoc`, `CoursePageContent`, `RefundPolicyDoc`, `CoursePageData = { courseCode: string; slug: string; publishedAt: string | null; content: CoursePageContent; refundPolicy: { en: RefundPolicyDoc; si: RefundPolicyDoc; ta: RefundPolicyDoc } | null }`; functions `getCoursePage(slug: string): Promise<CoursePageData | null>` (fetch with `next: { revalidate: 300 }` and 3000 ms AbortController timeout; null on non-200/timeout/parse error), `resolveDoc<T extends object>(content: { en: T; si?: T; ta?: T }, lang: 'en'|'si'|'ta'): T` (deep field-level fallback to `en`; arrays resolved item-by-item by index using the `en` array length), `isBlockEmpty(block: unknown): boolean`, `buildFaqJsonLd(doc: CoursePageDoc): object | null` (null when no FAQ items).

- [ ] **Step 1: Write failing tests** in `course-page.test.ts`:
  - `resolveDoc falls back per field`: en `{hero:{title:'T',headline:'H'}}`, si `{hero:{title:'සි'}}` → `{hero:{title:'සි',headline:'H'}}`.
  - `resolveDoc keeps en list length and fills missing items`: en modules 3 items, si modules 1 item → 3 items, item 0 from si, items 1–2 from en.
  - `resolveDoc returns en when lang doc missing`: `resolveDoc({en:X}, 'ta')` deep-equals `X`.
  - `isBlockEmpty`: `{}` → true, `{title:''}` → true, `{items:[]}` → true, `{title:'A'}` → false.
  - `buildFaqJsonLd`: 2 items → `@type: 'FAQPage'` with `mainEntity.length === 2` and `acceptedAnswer.text` equal to answers; 0 items → null.
  - `getCoursePage returns null on timeout/404`: mock `global.fetch` to reject with AbortError → null; to resolve `{ok:false,status:404}` → null; to resolve the contract JSON → mapped `CoursePageData` with `courseCode`.
- [ ] **Step 2: Run** `cd front-web && npx vitest run src/lib/course-page.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `course-page.ts` per the signatures.
- [ ] **Step 4: Run** the test → PASS; `npx tsc --noEmit` → 0 errors.
- [ ] **Step 5: Commit** `feat(front-web): course page data layer with language fallback`.

### Task 4: front-web redesigned course page

**Files:**
- Create: `front-web/src/components/course-page/course-page-view.tsx` (client; picks lang from `useTranslation()`, calls `resolveDoc`, renders sections in order, hides empty ones)
- Create in the same folder, one per block: `hero-facts.tsx`, `section-tabs.tsx` (sticky; tabs only for rendered sections; anchors `#overview #audience #modules #lecturers #faq #fees`), `overview.tsx`, `audience.tsx`, `features.tsx` (icon map from the Lucide set, `aria-hidden` icons), `learn.tsx`, `modules.tsx` (shadcn Accordion, numbered 01–10), `assessment.tsx`, `schedule.tsx`, `lecturers.tsx` (photo via `next/image` when `photo_url`, initials avatar otherwise), `testimonials.tsx` (reuse existing review card/data; render nothing if none), `faq.tsx` (Accordion), `cta-band.tsx` (`bg-emerald-800 text-white`, id `fees`), `refund-policy.tsx` (collapsed `<details>`/Accordion).
- Modify: `front-web/src/app/courses/[slug]/page.tsx` — call `getCoursePage(slug)` alongside the existing course lookup; if data → render `<CoursePageView data course />` and add FAQ JSON-LD script; else render existing `<CourseDetailClient>` unchanged. `generateMetadata` description uses `hero.promise` when published.

**Interfaces:**
- Consumes: Task 3 exports; existing `Course` type (`course_fee`, `course_duration`, `course_name`, `slug`, `course_code`) from `src/lib/courses-data.ts`; `useTranslation` from `src/context/language-context.tsx`.
- Produces: `CoursePageView(props: { data: CoursePageData; course: Course })`.

- [ ] **Step 1: Hero facts content rules** — fact tiles in this order: Next intake (highlighted, with class day/time underneath when set), Fee (`LKR` + `course.course_fee` formatted `toLocaleString('en-LK')`), Duration (`course.course_duration`), Mode, Medium, Entry requirements. Study materials / certificate / learning style / support render as a compact checklist under the tiles. Buttons: Apply → `/apply?course={slug}`, WhatsApp → `https://wa.me/94715884884?text=` + encoded "Hi Ceylon Pharma College, I'd like details about {course_name}."
- [ ] **Step 2: Implement** the components and page wiring.
- [ ] **Step 3: Verify** `npx tsc --noEmit` → 0 errors; `npx vitest run` → PASS.
- [ ] **Step 4: Verify in the browser** (dev server on 9002, `NEXT_PUBLIC_LMS_SERVER_URL` pointed at the API from Task 2): at 375px and 1024px, light and dark, CCPP shows hero facts with intake 13th January 2027 and fee LKR 15,000 above the fold at 375px; all 13 sections present; modules accordion opens; switching to සිංහල with empty SI shows English text (no blanks); contrast audit (same script as the UI review) reports 0 failures; no horizontal scroll; a course without a published page (CS0002) still renders the old page.
- [ ] **Step 5: Commit** `feat(front-web): facts-first course page rendered from CMS content`.

### Task 5: client admin data layer + translation action

**Files:**
- Create: `client/src/lib/course-page/types.ts` (same types as front-web Task 3, copied — the two apps share no package)
- Create: `client/src/lib/course-page/paths.ts` + `paths.test.ts`
- Create: `client/src/lib/actions/course-pages.ts`
- Create: `client/src/ai/flows/translate-course-page.ts` (server action)
- Modify: `client/package.json` — dev dependency `vitest`, script `"test": "vitest run"`

**Interfaces:**
- Consumes: API contract; `LMS_API_URL` from `client/src/lib/config.ts`; `ai` from `client/src/ai/genkit.ts`.
- Produces:
  - `getCoursePageAdmin(courseCode: string): Promise<AdminCoursePage>` where `AdminCoursePage = { courseCode; status: 'draft'|'published'|'none'; draft: CoursePageContent|null; published: CoursePageContent|null; publishedAt: string|null; updatedAt: string|null }`
  - `saveCoursePageDraft(courseCode: string, content: CoursePageContent): Promise<void>`, `publishCoursePage(courseCode: string): Promise<string>` (published_at), `getSiteContent<T>(key: 'refund_policy'): Promise<T|null>`, `saveSiteContent(key: 'refund_policy', value: object): Promise<void>` — all throw `Error(message)` on non-2xx.
  - `flattenDoc(doc: object): Record<string, string>`, `setPath(doc: object, path: string, value: string): object` (immutable), `changedPaths(prev: object, next: object): string[]`, `applyTranslation(target: object, translated: Record<string,string>, overrides: string[]): object`, `stalePaths(content: CoursePageContent, lang: 'si'|'ta'): string[]` (EN paths whose SI/TA value is empty).
  - Server action `translateCoursePage(texts: Record<string,string>, lang: 'si'|'ta'): Promise<{ enabled: boolean; result?: Record<string,string>; error?: string }>` — returns `{ enabled:false }` without calling Genkit when neither `GOOGLE_GENAI_API_KEY` nor `GEMINI_API_KEY` is set; otherwise one prompt with the JSON map, model `googleai/gemini-2.0-flash`, keys preserved; never throws.
  - `isTranslateEnabled(): Promise<boolean>` server action.

- [ ] **Step 1: Write failing tests** in `paths.test.ts`:
  - `flattenDoc` on `{hero:{title:'A'},modules:{items:[{title:'M1'}]}}` → `{'hero.title':'A','modules.items.0.title':'M1'}`.
  - `setPath` creates missing objects/arrays and does not mutate input.
  - `changedPaths` returns only paths whose string changed or was added.
  - `applyTranslation skips override paths`: target si `{hero:{title:'manual'}}`, translated `{'hero.title':'auto','hero.headline':'auto2'}`, overrides `['hero.title']` → title stays `'manual'`, headline `'auto2'`.
  - `stalePaths` lists EN paths with empty SI value.
- [ ] **Step 2: Run** `cd client && npx vitest run src/lib/course-page/paths.test.ts` → FAIL.
- [ ] **Step 3: Implement** `paths.ts`, the actions file, and the translate server action.
- [ ] **Step 4: Run** tests → PASS; `npx tsc --noEmit` → no new errors vs. baseline (record baseline count first).
- [ ] **Step 5: Commit** `feat(client): course page admin data layer and optional translation`.

### Task 6: client admin editor UI

**Files:**
- Create: `client/src/app/admin/manage/courses/page-content/[course_code]/page.tsx`
- Create: `client/src/components/admin/course-page/CoursePageEditor.tsx` (language tabs EN/SI/TA, toolbar: Save draft · Translate (SI/TA, disabled + note when `isTranslateEnabled()` is false) · Preview · Publish; status badge; stale-translation banner using `stalePaths`)
- Create: `client/src/components/admin/course-page/BlockCard.tsx` (collapsible card per block), `StringListField.tsx` (add/remove/move up/move down), `ObjectListField.tsx` (same for object items with given sub-fields), `IconSelect.tsx` (the fixed Lucide set), `PhotoUploadField.tsx` (posts the file as form field `image` to the existing `POST /api/blogs/upload-image`, which returns `{ success, url: <filename> }`; stores `https://content-provider.pharmacollege.lk/content-provider/uploads/blogs/{filename}` in `lecturers.items[].photo_url`; also allows pasting a URL), `RefundPolicyEditor.tsx`
- Modify: `client/src/components/admin/courses/CoursePageClient.tsx` — add a "Page content" action per course row linking to `/admin/manage/courses/page-content/{course_code}`

**Interfaces:**
- Consumes: Task 5 exports; shadcn/ui components already in `client/src/components/ui`; TanStack Query (`useQuery`, `useMutation`).
- Produces: route `/admin/manage/courses/page-content/[course_code]`.

- [ ] **Step 1: Behaviour rules** — editing a SI/TA field adds its path to `overrides[lang]`; Save draft sends the full `CoursePageContent`; Publish asks for confirmation ("Publish this page to pharmacollege.lk?"), then saves the draft first, then publishes, then toasts the published time; shared fields (icon, photo_url, phone) editable only on EN tab and shown read-only on SI/TA; fee and duration shown read-only from the course record with a link to `/admin/manage/courses/edit/{id}`; unsaved-changes guard on navigation (`beforeunload`); Preview opens `{FRONT_WEB_URL}/courses/{slug}` in a new tab, where `FRONT_WEB_URL` = `process.env.NEXT_PUBLIC_FRONT_WEB_URL || 'https://pharmacollege.lk'`. This shows the live (published) page; a draft-reading preview is deliberately deferred (spec leaves the preview mechanism to the builder, and a public draft endpoint would risk leaking drafts).
- [ ] **Step 2: Implement** the components and route.
- [ ] **Step 3: Verify** `npx tsc --noEmit` → no new errors; `npx vitest run` → PASS.
- [ ] **Step 4: Verify in the browser** (client dev server, API from Task 2): open CS0001 → seeded EN content loads in all 12 blocks; change Next intake to "20th January 2027", Save draft → public page unchanged; Publish → public page (after revalidate or a dev reload) shows the new intake; add an FAQ item, reorder modules, type a SI hero title → saved and visible when site language is සිංහල; Translate buttons disabled with the key note; restore the seeded intake and publish again.
- [ ] **Step 5: Commit** `feat(client): SOS admin course page content editor`.

### Task 7: End-to-end check and handover

**Files:**
- Modify: `.gitignore` — add `.superpowers/`
- Modify: `docs/superpowers/specs/2026-11-10-course-page-cms-design.md` — set Status to "Implemented" and note any deviations

- [ ] **Step 1: Run all checks** — `php server/tests/run.php`, `bash server/tests/api_course_pages.sh`, `cd front-web && npx vitest run && npx tsc --noEmit`, `cd client && npx vitest run`.
- [ ] **Step 2: Browser pass** — front-web CCPP page at 375px and desktop, light and dark, contrast audit 0 failures; CS0002 falls back to old page; admin round trip from Task 6 Step 4 once more.
- [ ] **Step 3: Commit** `chore: course page CMS docs and gitignore`.
