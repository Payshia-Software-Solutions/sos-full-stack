import { 
    BookOpen, KeyRound, CreditCard, Package, FileText,
    Award, HelpCircle, Shield, Laptop, Phone, Bell,
    Settings, AlertCircle, Headphones, Mail, User,
    FileCheck, CheckCircle2, MessageSquare, Wrench,
    GraduationCap, Calendar, Compass, Layers, Sparkles
} from "lucide-react";
import React from "react";

// Icon mapping dictionary for Lucide icons
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    BookOpen,
    KeyRound,
    CreditCard,
    Package,
    FileText,
    Award,
    HelpCircle,
    Shield,
    Laptop,
    Phone,
    Bell,
    Settings,
    AlertCircle,
    Headphones,
    Mail,
    User,
    FileCheck,
    CheckCircle2,
    MessageSquare,
    Wrench,
    GraduationCap,
    Calendar,
    Compass,
    Layers,
    Sparkles
};

// Available icons for admin selection
export const AVAILABLE_ICONS = [
    { name: "BookOpen", label: "Book / Academic" },
    { name: "KeyRound", label: "Key / LMS Access" },
    { name: "CreditCard", label: "Card / Payments" },
    { name: "Package", label: "Package / Courier" },
    { name: "FileText", label: "File / Exams" },
    { name: "Award", label: "Award / Certificates" },
    { name: "HelpCircle", label: "Help / General" },
    { name: "Headphones", label: "Support / Call" },
    { name: "Laptop", label: "Laptop / Technical" },
    { name: "Shield", label: "Shield / Security" },
    { name: "Phone", label: "Phone / Contact" },
    { name: "Bell", label: "Bell / Urgent" },
    { name: "Settings", label: "Settings / System" },
    { name: "MessageSquare", label: "Chat / Messaging" },
    { name: "GraduationCap", label: "Graduation" },
    { name: "Sparkles", label: "Sparkles / Special" },
];

// Available color presets
export const COLOR_PRESETS = [
    { label: "Blue", color: "text-blue-400", bg_color: "bg-blue-500/10", border_color: "border-blue-500/30" },
    { label: "Purple", color: "text-purple-400", bg_color: "bg-purple-500/10", border_color: "border-purple-500/30" },
    { label: "Emerald", color: "text-emerald-400", bg_color: "bg-emerald-500/10", border_color: "border-emerald-500/30" },
    { label: "Amber", color: "text-amber-400", bg_color: "bg-amber-500/10", border_color: "border-amber-500/30" },
    { label: "Rose", color: "text-rose-400", bg_color: "bg-rose-500/10", border_color: "border-rose-500/30" },
    { label: "Teal", color: "text-teal-400", bg_color: "bg-teal-500/10", border_color: "border-teal-500/30" },
    { label: "Indigo", color: "text-indigo-400", bg_color: "bg-indigo-500/10", border_color: "border-indigo-500/30" },
    { label: "Orange", color: "text-orange-400", bg_color: "bg-orange-500/10", border_color: "border-orange-500/30" },
    { label: "Slate", color: "text-slate-400", bg_color: "bg-slate-500/10", border_color: "border-slate-500/30" },
];

export function getCategoryIcon(iconName?: string): React.ComponentType<{ className?: string }> {
    if (iconName && ICON_MAP[iconName]) {
        return ICON_MAP[iconName];
    }
    return HelpCircle;
}
