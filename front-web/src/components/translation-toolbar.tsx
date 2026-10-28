"use client";

import { useState } from "react";
import { Sparkles, Loader2, RotateCcw, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { translate } from "@/ai/flows/translate-flow";

interface TranslationToolbarProps {
  originalText: string;
  onTranslated: (text: string, lang: string) => void;
  className?: string;
}

export default function TranslationToolbar({
  originalText,
  onTranslated,
  className = "",
}: TranslationToolbarProps) {
  const [activeLang, setActiveLang] = useState<"en" | "si" | "ta">("en");
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<{ si?: string; ta?: string }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTranslate = async (lang: "si" | "ta") => {
    if (activeLang === lang) return;
    setErrorMsg(null);

    // If already in cache, switch immediately
    if (cache[lang]) {
      setActiveLang(lang);
      onTranslated(cache[lang]!, lang);
      return;
    }

    try {
      setLoading(true);
      const targetLanguageName = lang === "si" ? "Sinhala" : "Tamil";
      const result = await translate({
        text: originalText,
        targetLanguage: targetLanguageName,
      });

      if (result && result.trim()) {
        setCache((prev) => ({ ...prev, [lang]: result }));
        setActiveLang(lang);
        onTranslated(result, lang);
      } else {
        throw new Error("Empty translation received");
      }
    } catch (err) {
      console.error("AI translation error:", err);
      setErrorMsg("Translation service is currently busy. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveLang("en");
    setErrorMsg(null);
    onTranslated(originalText, "en");
  };

  return (
    <div className={`rounded-xl border border-border/80 bg-secondary/30 p-3.5 backdrop-blur-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block">
              Translate Article / Syllabus
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Powered by AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sinhala Button */}
          <Button
            type="button"
            size="sm"
            variant={activeLang === "si" ? "default" : "outline"}
            disabled={loading}
            onClick={() => handleTranslate("si")}
            className="text-xs font-bold h-8 px-3"
          >
            {loading && activeLang !== "si" ? null : "සිංහල"}
          </Button>

          {/* Tamil Button */}
          <Button
            type="button"
            size="sm"
            variant={activeLang === "ta" ? "default" : "outline"}
            disabled={loading}
            onClick={() => handleTranslate("ta")}
            className="text-xs font-bold h-8 px-3"
          >
            {loading && activeLang !== "ta" ? null : "தமிழ்"}
          </Button>

          {/* Reset / English Button */}
          {activeLang !== "en" && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="text-xs font-semibold h-8 px-2 text-muted-foreground hover:text-foreground"
              title="Show Original English"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Original (EN)
            </Button>
          )}

          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse ml-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Translating...</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
