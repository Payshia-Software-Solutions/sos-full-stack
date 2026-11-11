import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  id?: string;
  title?: string;
  tone?: "plain" | "tinted";
  children: ReactNode;
}

// One page section: anchor target for the sticky tabs, consistent spacing and heading.
// The page view provides the column width, so sections do not add their own container.
export function SectionShell({ id, title, tone = "plain", children }: SectionShellProps) {
  return (
    <section id={id} className={cn("scroll-mt-40 py-12 md:py-16", tone === "tinted" && "border-t border-border/70")}>
      {title && (
        <h2 className="mb-6 text-2xl md:text-3xl lg:text-4xl font-headline font-bold tracking-tight text-foreground leading-tight">
          {title}
        </h2>
      )}
      {children}
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
