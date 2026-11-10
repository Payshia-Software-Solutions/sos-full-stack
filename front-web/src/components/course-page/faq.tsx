import type { CoursePageDoc } from "@/lib/course-page";
import { isBlockEmpty } from "@/lib/course-page";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionShell } from "./section-shell";

export default function FaqSection({ block }: { block: CoursePageDoc["faq"] }) {
  if (isBlockEmpty(block)) return null;
  const items = (block?.items ?? []).filter((i) => i.question);
  return (
    <SectionShell id="faq" title={block?.title} tone="tinted">
      <Accordion type="single" collapsible className="w-full rounded-xl border border-border bg-background px-4">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="py-4 text-left text-base font-semibold hover:no-underline">{item.question}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground leading-relaxed">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}
