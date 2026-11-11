# Graph Report - client  (2026-11-11)

## Corpus Check
- 371 files · ~331,507 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 2107 nodes · 16203 edges · 70 communities (60 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 226 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Translation & AI Flows
- Admin Game Pages
- Package Dependencies
- External Libraries
- Criteria & PDF Export
- Admin Content Pages
- Batch Management
- MediMind Game Admin
- Blog & Rich Text Editor
- Chat & Tickets
- Announcement & Book Forms
- Course & Login-As Admin
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69

## God Nodes (most connected - your core abstractions)
1. `Button` - 486 edges
2. `Card` - 381 edges
3. `CardContent` - 369 edges
4. `CardHeader` - 354 edges
5. `CardTitle` - 348 edges
6. `cn()` - 339 edges
7. `toast()` - 317 edges
8. `Input` - 295 edges
9. `CardDescription` - 284 edges
10. `Skeleton()` - 252 edges

## Surprising Connections (you probably didn't know these)
- `AnnouncementForm()` --indirect_call--> `createAnnouncement()`  [INFERRED]
  src/app/admin/announcements/page.tsx → src/lib/actions/announcements.ts
- `AdminAnnouncementsPage()` --indirect_call--> `deleteAnnouncement()`  [INFERRED]
  src/app/admin/announcements/page.tsx → src/lib/actions/announcements.ts
- `AdminAnnouncementsPage()` --indirect_call--> `getAnnouncements()`  [INFERRED]
  src/app/admin/announcements/page.tsx → src/lib/actions/announcements.ts
- `AdminDashboardPage()` --indirect_call--> `getAdminChats()`  [INFERRED]
  src/app/admin/dashboard/page.tsx → src/lib/actions/tickets.ts
- `AdminDashboardPage()` --indirect_call--> `getAdminTickets()`  [INFERRED]
  src/app/admin/dashboard/page.tsx → src/lib/actions/tickets.ts

## Import Cycles
- None detected.

## Communities (70 total, 10 thin omitted)

### Community 0 - "Translation & AI Flows"
Cohesion: 0.06
Nodes (80): vitest, hasKey(), isTranslateEnabled(), LANGUAGE_NAMES, translateCoursePage(), CoursePageContentPage(), asDoc(), CoursePageEditor() (+72 more)

### Community 1 - "Admin Game Pages"
Cohesion: 0.08
Nodes (63): ManagementCommissionsTab(), CeylonPharmacySetupPage(), DrugCounselingCard(), ManageCounselingPage(), PatientHubPage(), DpadAdminManagementPage(), MediMindSetupPage(), PharmaHunterSetupPage() (+55 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.03
Nodes (94): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.0.0, date-fns@^3.6.0, dotenv@^16.5.0, emoji-picker-react@^4.10.0, firebase@^11.8.1 (+86 more)

### Community 3 - "External Libraries"
Cohesion: 0.10
Nodes (51): date-fns, @hookform/resolvers, lucide-react, next, react, react-hook-form, @tanstack/react-query, zod (+43 more)

### Community 4 - "Criteria & PDF Export"
Cohesion: 0.05
Nodes (65): CreateCriteriaPage(), criteriaFormSchema, criteriaFormSchema, EditCriteriaPage(), CreateCertificateOrderPage(), getCityName(), getDistrictName(), CountdownTimer() (+57 more)

### Community 5 - "Admin Content Pages"
Cohesion: 0.13
Nodes (55): AdminAnnouncementsPage(), SectionPagesPage(), EligibilityStatusCell(), ManageCoursesPage(), ReceivedStatusCell(), ManageInstructionsPage(), ManagePatientsPage(), ManageDrugsPage() (+47 more)

### Community 6 - "Batch Management"
Cohesion: 0.05
Nodes (60): batchFormSchema, BatchFormValues, CreateBatchPage(), batchFormSchema, BatchFormValues, EditBatchPage(), DocumentElement, CreateContentForm() (+52 more)

### Community 7 - "MediMind Game Admin"
Cohesion: 0.07
Nodes (55): answerFormSchema, AnswerFormValues, ManageAnswersPage(), CourseAssignmentsPage(), LevelDetailsPage(), MedicineAnswersPage(), MediMindGamePage(), MediMindModulesPage() (+47 more)

### Community 8 - "Blog & Rich Text Editor"
Cohesion: 0.06
Nodes (47): react-quill-new, AI_TEMPLATES, ReactQuill, PharmaReaderCourseAssignmentsPage(), ManagePharmaReaderPage(), ReactQuill, announcements, announcements (+39 more)

### Community 9 - "Chat & Tickets"
Cohesion: 0.09
Nodes (54): emoji-picker-react, AdminChatPage(), AdminTicketDetailPage(), ChatPage(), CANNED_RESPONSES, cleanPhoneForWhatsApp(), ImageViewerModal(), ModernAdminTicketDetail() (+46 more)

### Community 10 - "Announcement & Book Forms"
Cohesion: 0.12
Nodes (56): AnnouncementForm(), EditBlogPage(), BookForm(), SectionForm(), CreatePageContentPage(), ChapterForm(), EditableCell(), EditableCell() (+48 more)

### Community 11 - "Course & Login-As Admin"
Cohesion: 0.13
Nodes (41): EditCoursePage(), LoginAsPage(), AnnouncementsPage(), BnfPage(), CertificateOrderHistoryPage(), getStatusBadge(), CounselPage(), RecoverPatientPage() (+33 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (43): AdminBlogsPage(), ManageBatchesPage(), ManageBatchesPageComponent(), BirthdayStudentRow(), BirthdayWishesPage(), BooksManagementPage(), ChapterSectionsPage(), BookChaptersPage() (+35 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (37): PackageForm(), packageFormSchema, PackageFormValues, patientFormSchema, PatientFormValues, ProductSelector(), ProductSelector(), CreateLeadPage() (+29 more)

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (40): ManagePackagesPage(), BookingCertificateControl(), ConvocationCertificateGenPage(), ConvocationMedalTypesPage(), getMedalBadgeClass(), ConvocationListPage(), getMedalBadgeClass(), parseMedalIds() (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (34): CreateDeliveryOrderPage(), GenerateConfirmationLetterPage(), StudentEnrollment, StudentInfo, AdminMorePage(), AdminTicketsPage(), TicketsPageContent(), StaffPerformancePage() (+26 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (31): CourseCompletionReportPage(), WinPharmaGraderPerformancePage(), GroupedIssuance, IssuedCertificatesReportPage(), LeadManagementPage(), PaymentRecord, PaymentStats, StudentContactReportPage() (+23 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (37): EnrollStudentPage(), FullStudentData, StudentEnrollment, StudentInfo, CATEGORIES, cleanPhoneForWhatsApp(), CreateTicketPage(), CreateTicketPageContent() (+29 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (35): adminNavItem, navItems, SidebarNav(), AdminSidebarNav(), NavItem, navItems, studentViewItem, adminNavItem (+27 more)

### Community 19 - "Community 19"
Cohesion: 0.11
Nodes (36): GameReportsContent(), GameReportsPage(), GameReportType, GradingCell(), GradingCellProps, AssignmentItem, AssignmentReportResponse, AssignmentStudentRow (+28 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (30): GoldMedalIcon(), SilverMedalIcon(), TopMedalIcon(), CommandSeparator, CommandShortcut(), DialogOverlay, DropdownMenuCheckboxItem, DropdownMenuLabel (+22 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (30): BirthdayWishesPage(), SelectionDialog(), AdminPOSCalculator(), SelectionDialog(), AdminProfileEditsPage(), WinPharmaNestedGradingPage(), WinPharmaGradingPage(), SelectionDialog() (+22 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (25): AI_TEMPLATES, CreateBlogPage(), ReactQuill, PaymentGateSettingsPage(), ApiCourse, City, RegisterPage(), fetchCities() (+17 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (27): DrugFormValues, drugSchema, DrugFormValues, drugSchema, itemFormSchema, ItemFormValues, ManageItemsPage(), Action (+19 more)

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (29): BatchReminderDialog(), formatSriLankanPhoneNumber(), formatWhatsAppNumber(), generateReminderMessage(), getStatusInfo(), OrderActionCell(), OrderDetailsDialogContent(), OrdersTab() (+21 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (29): BnfContentsPage(), BnfIndexPage(), BnfReaderPage(), groupPages(), ImageViewer(), apiFetch(), createBook(), createChapter() (+21 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (23): ManageCommissionsPage(), GameInfoCell(), DeliveryManagementPage(), AdminQuickLinksPage(), RegisteredStudentInfo(), Student360Drawer(), Student360DrawerProps, StudentInline360Dossier() (+15 more)

### Community 27 - "Community 27"
Cohesion: 0.14
Nodes (23): recharts, AdminDashboardPage(), AgeGroup, StudentAnalyticsPage(), AGE_GROUPS, AnalyticsReportPage(), GENDERS, Location (+15 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (20): AdminLayout(), LayoutContent(), DashboardLayout(), LayoutContent(), TicketDetailPage(), AdminBottomDock(), navItems, ImpersonationBanner() (+12 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (22): ManageBillingPage(), POSCalculatorDialog(), drugSchema, EditDrugFormValues, EditDrugPage(), drugSchema, EditPatientPage(), InstructionSelectionDialog() (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.09
Nodes (25): AuthContextType, dummyCourses, dummyPayments, dummyRecordings, dummyStaffMembers, dummyUsers, ApiStaffMember, AssignmentGrade (+17 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (24): devDependencies, genkit-cli@^1.8.0, postcss@^8, tailwindcss@^3.4.1, @tailwindcss/typography@^0.5.13, @types/jspdf@^2.0.0, @types/node@^20, @types/nprogress@^0.2.3 (+16 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (20): DpadCourseAssignmentsPage(), Prescription, DpadAnswerKeySetupPage(), OPTIONS_MAPPINGS, FIELD_LABEL_KEYS, Language, OPTIONS_MAPPINGS, SearchableSelectDialogProps (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.12
Nodes (20): class-variance-authority, TagInput(), EditPageContentPage(), pageFormSchema, PageFormValues, TagInput(), ConvocationStatusCell(), fetchConvocationStatus() (+12 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (18): genkit@^1.8.0, @genkit-ai/googleai@^1.8.0, wav@^1.0.2, genkit, @genkit-ai/googleai, wav, prompt, summarizeTicket() (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (16): AccountActivationPage(), AssignmentGrade, AssignmentInfoPage(), FullStudentData, StudentEnrollment, StudentInfo, BatchProgressReportPage(), StudentProgress (+8 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (16): @radix-ui/react-toggle@^1.1.0, @tiptap/extension-underline@^2.5.7, @tiptap/react@^2.5.7, @tiptap/starter-kit@^2.5.7, @radix-ui/react-toggle, @tiptap/extension-underline, @tiptap/react, @tiptap/starter-kit (+8 more)

### Community 37 - "Community 37"
Cohesion: 0.14
Nodes (17): DPadIndexPage(), MediMindPage(), View, Progress, getDpadActivePrescriptionsByCourse(), getDpadOverallGrade(), getDpadSubmittedAnswers(), allAnswerSets (+9 more)

### Community 38 - "Community 38"
Cohesion: 0.23
Nodes (17): ManageSentencesPage(), Word, apiFetch(), createLevel(), createSentence(), deleteSentence(), getLevelById(), getLevels() (+9 more)

### Community 39 - "Community 39"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 40 - "Community 40"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 41 - "Community 41"
Cohesion: 0.14
Nodes (13): ConvocationOrdersPage(), GameDetailItem(), ViewMode, getCoursesForFilter(), getFilteredConvocationRegistrations(), updateConvocationCourses(), CeylonPharmacyInfo, ConvocationCourse (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.31
Nodes (15): WinPharmaLevelTasksPage(), WinPharmaTaskDetailPage(), WinPharmaPage(), WinPharmaIcon(), createWinPharmaSubmission(), getWinpharmaCommonReasons(), getWinPharmaLevelsOfficial(), getWinPharmaSubmissionResults() (+7 more)

### Community 43 - "Community 43"
Cohesion: 0.13
Nodes (11): allImports, content, fs, imported, importMatch, missing, possibleLucideIcons, usedComponents (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.26
Nodes (12): CertificateOrdersPage(), OrderStatusBadge(), CertificateGenerationRow(), GenerateCertificateBatchPage(), CertificateAddressListPage(), deleteCertificateOrder(), generateCertificate(), getCertificateOrders() (+4 more)

### Community 45 - "Community 45"
Cohesion: 0.30
Nodes (11): TicketCategoriesPage(), createTicketCategory(), CreateTicketCategoryPayload, deleteTicketCategory(), getAllTicketCategories(), TicketCategoryItem, updateTicketCategory(), AVAILABLE_ICONS (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.21
Nodes (11): addressFormSchema, AddressFormValues, City, District, OrderStep, ProfilePage(), GradePaymentGate(), GradePaymentGateProps (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.24
Nodes (8): metadata, ptSans, RootLayout(), QueryProvider(), ThemeProvider(), TopLoader(), Preloader(), AuthProvider()

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (10): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (6): allPages, BnfChapter, bnfChapters, BnfPage, BnfWordIndexEntry, wordIndexData

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (9): scripts, build, dev, genkit:dev, genkit:watch, lint, start, test (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 52 - "Community 52"
Cohesion: 0.39
Nodes (8): FileState, FileUploadBox(), FileUploadBoxProps, resolveDocUrl(), StudentKycPage(), SubmittedDocCard(), getStudentKycStatus(), submitStudentKyc()

### Community 53 - "Community 53"
Cohesion: 0.39
Nodes (7): ANSWER_TYPES, ManageSavedAnswersPage(), createCareSavedAnswer(), deleteCareSavedAnswer(), getCareSavedAnswers(), updateCareSavedAnswer(), CareSavedAnswer

### Community 54 - "Community 54"
Cohesion: 0.39
Nodes (7): ManageWinPharmaLevelTasksPage(), taskFormSchema, TaskFormValues, createWinPharmaTask(), deleteWinPharmaTask(), getWinPharmaLevelById(), updateWinPharmaTask()

### Community 55 - "Community 55"
Cohesion: 0.39
Nodes (7): levelFormSchema, LevelFormValues, ManageWinPharmaLevelsPage(), createWinPharmaLevel(), deleteWinPharmaLevel(), getWinPharmaLevelsByCourse(), updateWinPharmaLevel()

### Community 56 - "Community 56"
Cohesion: 0.25
Nodes (6): ApiPaymentRecord, FullStudentData, PendingPaymentRequest, StudentEnrollment, StudentInfo, ZoomableImage()

### Community 57 - "Community 57"
Cohesion: 0.39
Nodes (4): DropdownMenuContent, DropdownMenuItem, ThemeSwitcher(), TooltipContent

### Community 58 - "Community 58"
Cohesion: 0.43
Nodes (6): levelFormSchema, LevelFormValues, ManageLevelsPage(), createMediMindLevel(), deleteMediMindLevel(), updateMediMindLevel()

### Community 59 - "Community 59"
Cohesion: 0.43
Nodes (6): ManageQuestionsPage(), questionFormSchema, QuestionFormValues, createMediMindQuestion(), deleteMediMindQuestion(), updateMediMindQuestion()

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 20` to `Admin Game Pages`, `External Libraries`, `Criteria & PDF Export`, `Admin Content Pages`, `Batch Management`, `MediMind Game Admin`, `Blog & Rich Text Editor`, `Chat & Tickets`, `Announcement & Book Forms`, `Course & Login-As Admin`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 32`, `Community 33`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 41`, `Community 42`, `Community 44`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 56`, `Community 57`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `Translation & AI Flows` be split into smaller, more focused modules?**
  _Cohesion score 0.05657492354740061 - nodes in this community are weakly interconnected._
- **Why does `react` connect `External Libraries` to `Translation & AI Flows`, `Admin Game Pages`, `Package Dependencies`, `Criteria & PDF Export`, `Admin Content Pages`, `Batch Management`, `MediMind Game Admin`, `Blog & Rich Text Editor`, `Chat & Tickets`, `Announcement & Book Forms`, `Course & Login-As Admin`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 32`, `Community 33`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 41`, `Community 42`, `Community 44`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 52`, `Community 53`, `Community 54`, `Community 55`, `Community 56`, `Community 57`, `Community 58`, `Community 59`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `Admin Game Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.08421052631578947 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `Announcement & Book Forms` to `Translation & AI Flows`, `Admin Game Pages`, `External Libraries`, `Criteria & PDF Export`, `Admin Content Pages`, `Batch Management`, `MediMind Game Admin`, `Blog & Rich Text Editor`, `Chat & Tickets`, `Course & Login-As Admin`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 32`, `Community 33`, `Community 35`, `Community 37`, `Community 38`, `Community 41`, `Community 42`, `Community 44`, `Community 45`, `Community 46`, `Community 52`, `Community 53`, `Community 54`, `Community 55`, `Community 56`, `Community 57`, `Community 58`, `Community 59`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.029787234042553193 - nodes in this community are weakly interconnected._
- **Should `External Libraries` be split into smaller, more focused modules?**
  _Cohesion score 0.10495403472931562 - nodes in this community are weakly interconnected._