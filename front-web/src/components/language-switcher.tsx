"use client";

import { useTranslation } from "@/context/language-context";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "header" | "pill" | "light";
}

export default function LanguageSwitcher({ className, variant = "pill" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  const languages: { code: "si" | "en" | "ta"; label: string }[] = [
    { code: "si", label: "සිංහල" },
    { code: "en", label: "English" },
    { code: "ta", label: "தமிழ்" },
  ];

  const isLight = variant === "light";

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={cn(
        "inline-flex items-center rounded-full p-0.5 text-xs font-semibold transition-all shadow-sm",
        isLight
          ? "bg-muted/80 border border-border text-foreground"
          : "bg-black/25 dark:bg-zinc-800/90 border border-white/20 dark:border-zinc-700 text-white",
        className
      )}
    >
      {languages.map((item) => {
        const isActive = language === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={cn(
              "px-2.5 py-1 rounded-full transition-all duration-200 text-[11px] md:text-xs font-bold leading-none select-none",
              isActive
                ? isLight
                  ? "bg-primary text-primary-foreground shadow-sm scale-100"
                  : "bg-white text-emerald-950 dark:bg-primary dark:text-primary-foreground shadow-sm scale-100"
                : isLight
                ? "text-muted-foreground hover:text-foreground hover:bg-background/60"
                : "text-white/80 hover:text-white hover:bg-white/10 dark:text-zinc-300 dark:hover:text-white"
            )}
            title={`Switch to ${item.label}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
