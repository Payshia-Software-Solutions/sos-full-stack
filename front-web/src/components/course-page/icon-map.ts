import {
  Award, Briefcase, Calculator, BookOpen, ClipboardCheck, FlaskConical, Gamepad2, GraduationCap,
  HeartPulse, PlayCircle, Pill, ShieldCheck, Stethoscope, Trophy, Users, Video,
  type LucideIcon,
} from "lucide-react";

// Fixed set the admin editor can choose from (must match COURSE_PAGE_ICONS in the client app).
const ICONS: Record<string, LucideIcon> = {
  "gamepad-2": Gamepad2,
  pill: Pill,
  calculator: Calculator,
  "book-open": BookOpen,
  video: Video,
  "play-circle": PlayCircle,
  trophy: Trophy,
  stethoscope: Stethoscope,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  "flask-conical": FlaskConical,
  "clipboard-check": ClipboardCheck,
  users: Users,
  "shield-check": ShieldCheck,
  "heart-pulse": HeartPulse,
  award: Award,
};

export function iconFor(name?: string): LucideIcon {
  return (name && ICONS[name]) || Award;
}
