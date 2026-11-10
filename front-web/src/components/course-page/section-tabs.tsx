"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface SectionTab {
  id: string;
  label: string;
}

// Sticky in-page navigation. Sits just below the (sticky) site header and highlights the section in view.
export default function SectionTabs({ tabs, ariaLabel }: { tabs: SectionTab[]; ariaLabel: string }) {
  const [top, setTop] = useState(64);
  const [active, setActive] = useState<string>(tabs[0]?.id ?? "");

  useEffect(() => {
    const header = document.querySelector("header");
    const measure = () => setTop(Math.round(header?.getBoundingClientRect().height ?? 64));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const elements = tabs.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tabs]);

  if (tabs.length < 2) return null;

  return (
    <nav
      aria-label={ariaLabel}
      style={{ top }}
      className="sticky z-40 border-b border-border bg-background/95 backdrop-blur"
    >
      <ul className="container mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 py-2 md:px-6">
        {tabs.map((tab) => (
          <li key={tab.id} className="shrink-0">
            <a
              href={`#${tab.id}`}
              aria-current={active === tab.id ? "true" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                active === tab.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
