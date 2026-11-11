import type { CoursePageDoc } from "@/lib/course-page";
import { isBlockEmpty } from "@/lib/course-page";
import { iconFor } from "./icon-map";
import { SectionShell } from "./section-shell";

export default function FeaturesSection({ block }: { block: CoursePageDoc["features"] }) {
  if (isBlockEmpty(block)) return null;
  const items = block?.items ?? [];
  return (
    <SectionShell id="features" title={block?.title} tone="tinted">
      {block?.intro && <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{block.intro}</p>}
      {items.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = iconFor(item.icon);
            return (
              <li key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-snug">{item.title}</h3>
                  {item.description && <p className="mt-1 text-sm md:text-base text-muted-foreground leading-relaxed">{item.description}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {block?.closing && <p className="mt-6 text-base md:text-lg font-semibold text-foreground leading-relaxed">{block.closing}</p>}
    </SectionShell>
  );
}
