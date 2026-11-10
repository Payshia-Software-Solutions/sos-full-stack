import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  id?: string;
  title?: string;
  tone?: "plain" | "tinted";
  children: ReactNode;
}

// One page section: anchor target for the sticky tabs, consistent spacing and heading.
export function SectionShell({ id, title, tone = "plain", children }: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-32 py-10 md:py-14", tone === "tinted" && "bg-card/60 border-y border-border/50")}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {title && (
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground leading-tight mb-5">{title}</h2>
        )}
        {children}
      </div>
    </section>
  );
}

export function Paragraphs({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
