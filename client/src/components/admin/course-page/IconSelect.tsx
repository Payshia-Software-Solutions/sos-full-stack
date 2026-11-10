"use client";

import {
  Award, BookOpen, Briefcase, Calculator, ClipboardCheck, FlaskConical, Gamepad2, GraduationCap,
  HeartPulse, Pill, PlayCircle, ShieldCheck, Stethoscope, Trophy, Users, Video, type LucideIcon,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COURSE_PAGE_ICONS } from '@/lib/course-page/types';

const ICONS: Record<string, LucideIcon> = {
  'gamepad-2': Gamepad2, pill: Pill, calculator: Calculator, 'book-open': BookOpen, video: Video,
  'play-circle': PlayCircle, trophy: Trophy, stethoscope: Stethoscope, briefcase: Briefcase,
  'graduation-cap': GraduationCap, 'flask-conical': FlaskConical, 'clipboard-check': ClipboardCheck,
  users: Users, 'shield-check': ShieldCheck, 'heart-pulse': HeartPulse, award: Award,
};

export function IconPreview({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || Award;
  return <Icon className={className ?? 'h-4 w-4'} aria-hidden="true" />;
}

interface IconSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function IconSelect({ id, value, onChange }: IconSelectProps) {
  return (
    <Select value={value || 'award'} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COURSE_PAGE_ICONS.map((name) => (
          <SelectItem key={name} value={name}>
            <span className="flex items-center gap-2">
              <IconPreview name={name} />
              {name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
