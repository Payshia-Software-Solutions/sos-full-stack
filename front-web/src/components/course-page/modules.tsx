import type { CoursePageDoc } from "@/lib/course-page";
import { isBlockEmpty } from "@/lib/course-page";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionShell } from "./section-shell";

export default function ModulesSection({ block }: { block: CoursePageDoc["modules"] }) {
  if (isBlockEmpty(block)) return null;
  const items = block?.items ?? [];
  return (
    <SectionShell id="modules" title={block?.title}>
      {items.length > 0 && (
        <Accordion type="single" collapsible className="w-full rounded-2xl border border-border bg-card px-5 md:px-6">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`module-${i}`}>
              <AccordionTrigger className="gap-3 py-4 text-left text-base font-semibold hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{item.title}</span>
                </span>
              </AccordionTrigger>
              {item.description && (
                <AccordionContent className="pl-11 text-base text-muted-foreground leading-relaxed">{item.description}</AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </SectionShell>
  );
}
