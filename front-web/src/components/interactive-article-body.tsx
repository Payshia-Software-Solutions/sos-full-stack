"use client";

import { useState } from "react";
import TranslationToolbar from "./translation-toolbar";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface InteractiveArticleBodyProps {
  initialHtml: string;
}

export default function InteractiveArticleBody({ initialHtml }: InteractiveArticleBodyProps) {
  const [content, setContent] = useState(initialHtml);
  const [currentLang, setCurrentLang] = useState<string>("en");

  const handleTranslated = (translatedText: string, lang: string) => {
    setCurrentLang(lang);
    if (lang === "en") {
      setContent(initialHtml);
    } else {
      // Wrap paragraphs cleanly if returned as plain text
      const formattedHtml = translatedText
        .split("\n\n")
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");
      setContent(formattedHtml);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Translation Control Bar */}
      <TranslationToolbar
        originalText={initialHtml.replace(/<[^>]*>?/gm, "")}
        onTranslated={handleTranslated}
      />

      {currentLang !== "en" && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Translation: {currentLang === "si" ? "සිංහල" : "தமிழ்"}</span>
          </Badge>
        </div>
      )}

      {/* Article Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-headline prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-img:rounded-xl dark:prose-invert font-body leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
