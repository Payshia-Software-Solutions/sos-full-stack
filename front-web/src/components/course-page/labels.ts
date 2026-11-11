import type { PageLanguage } from "@/lib/course-page";

// Interface text around the CMS content (buttons, tab names, fact labels).
// Course content itself comes from the database; only this fixed chrome lives here.
export interface CoursePageLabels {
  applyNow: string;
  whatsapp: string;
  nextIntake: string;
  fee: string;
  duration: string;
  mode: string;
  medium: string;
  entry: string;
  module: string;
  tabsLabel: string;
  tabOverview: string;
  tabAudience: string;
  tabModules: string;
  tabCertification: string;
  tabLecturers: string;
  tabFaq: string;
  tabFees: string;
  testimonials: string;
  recordings: string;
  classSchedule: string;
  refundPolicy: string;
  callUs: string;
}

export const LABELS: Record<PageLanguage, CoursePageLabels> = {
  en: {
    applyNow: "Apply Now",
    whatsapp: "WhatsApp Enquiry",
    nextIntake: "Next intake",
    fee: "Course fee",
    duration: "Duration",
    mode: "Mode",
    medium: "Medium of instruction",
    entry: "Entry requirements",
    module: "Module",
    tabsLabel: "Course sections",
    tabOverview: "Overview",
    tabAudience: "Who it's for",
    tabModules: "Modules",
    tabCertification: "Certification",
    tabLecturers: "Lecturers",
    tabFaq: "FAQ",
    tabFees: "Fees",
    testimonials: "What our students say",
    recordings: "Recordings",
    classSchedule: "Class schedule",
    refundPolicy: "Refund policy",
    callUs: "Call us",
  },
  si: {
    applyNow: "දැන්ම අයදුම් කරන්න",
    whatsapp: "WhatsApp විමසුම",
    nextIntake: "ඊළඟ කණ්ඩායම",
    fee: "පාඨමාලා ගාස්තුව",
    duration: "කාලසීමාව",
    mode: "ඉගෙනුම් ක්‍රමය",
    medium: "ඉගැන්වීමේ මාධ්‍යය",
    entry: "ඇතුළත් වීමේ සුදුසුකම්",
    module: "මොඩියුලය",
    tabsLabel: "පාඨමාලා කොටස්",
    tabOverview: "දළ විශ්ලේෂණය",
    tabAudience: "කා සඳහාද",
    tabModules: "මොඩියුල",
    tabCertification: "සහතිකය",
    tabLecturers: "කථිකාචාර්යවරු",
    tabFaq: "නිතර අසන ප්‍රශ්න",
    tabFees: "ගාස්තු",
    testimonials: "අපගේ සිසුන් පවසන දේ",
    recordings: "පටිගත කළ පාඩම්",
    classSchedule: "පන්ති කාලසටහන",
    refundPolicy: "ආපසු ගෙවීමේ ප්‍රතිපත්තිය",
    callUs: "අමතන්න",
  },
  ta: {
    applyNow: "இப்போதே விண்ணப்பிக்கவும்",
    whatsapp: "WhatsApp விசாரணை",
    nextIntake: "அடுத்த தொடக்கம்",
    fee: "பாடநெறிக் கட்டணம்",
    duration: "கால அளவு",
    mode: "கற்றல் முறை",
    medium: "கற்பித்தல் மொழி",
    entry: "சேர்க்கைத் தகுதி",
    module: "பாடத் தொகுதி",
    tabsLabel: "பாடநெறிப் பிரிவுகள்",
    tabOverview: "கண்ணோட்டம்",
    tabAudience: "யாருக்கு",
    tabModules: "பாடத் தொகுதிகள்",
    tabCertification: "சான்றிதழ்",
    tabLecturers: "விரிவுரையாளர்கள்",
    tabFaq: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    tabFees: "கட்டணம்",
    testimonials: "எங்கள் மாணவர்கள் கூறுவது",
    recordings: "பதிவு செய்யப்பட்ட பாடங்கள்",
    classSchedule: "வகுப்பு அட்டவணை",
    refundPolicy: "பணத்தைத் திரும்பப் பெறும் கொள்கை",
    callUs: "அழைக்கவும்",
  },
};
