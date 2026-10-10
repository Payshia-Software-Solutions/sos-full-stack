"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-[70px] h-[34px] rounded-full bg-[var(--border)] animate-pulse" />;

  const isLight = theme === "light";

  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label="Toggle theme"
      className="relative flex items-center w-[70px] h-[34px] rounded-full border border-[var(--border-2)] bg-[var(--surface-2)] transition-all duration-300 hover:border-[var(--gold)] shadow-inner overflow-hidden"
    >
      {/* Track */}
      <span
        className={`absolute left-1 w-[26px] h-[26px] rounded-full flex items-center justify-center shadow-md transition-all duration-400 ease-in-out ${
          isLight
            ? "translate-x-[36px] bg-gradient-to-br from-[#f6d860] to-[#e0a020]"
            : "translate-x-0 bg-gradient-to-br from-[#2e2e2e] to-[#1a1a1a] border border-[#3a3a3a]"
        }`}
      >
        {isLight
          ? <Sun size={13} className="text-white" />
          : <Moon size={13} className="text-[var(--gold)]" />
        }
      </span>
      {/* Labels */}
      <span className={`absolute right-2.5 text-[9px] font-black uppercase tracking-wider transition-opacity duration-300 ${isLight ? "opacity-0" : "opacity-60 text-[var(--text-muted)]"}`}>
        D
      </span>
      <span className={`absolute left-2.5 text-[9px] font-black uppercase tracking-wider transition-opacity duration-300 ${isLight ? "opacity-60 text-[var(--text-muted)]" : "opacity-0"}`}>
        L
      </span>
    </button>
  );
}
