import { ChevronDown } from "lucide-react";
import type { RefundPolicyDoc } from "@/lib/course-page";
import { isBlockEmpty } from "@/lib/course-page";
import { SectionShell } from "./section-shell";

// Shared refund policy (one text for every course), collapsed until opened.
export default function RefundPolicySection({ policy, fallbackTitle }: { policy: RefundPolicyDoc | null; fallbackTitle: string }) {
  if (!policy || isBlockEmpty(policy)) return null;
  const items = policy.items ?? [];
  return (
    <SectionShell id="refund-policy">
      <details className="group rounded-xl border border-border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-base font-semibold text-foreground">
          <span>{policy.title || fallbackTitle}</span>
          <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ol className="space-y-4 border-t border-border p-4">
          {items.map((item, i) => (
            <li key={i}>
              <h3 className="text-base font-bold text-foreground">
                {i + 1}. {item.title}
              </h3>
              {item.body && <p className="mt-1 text-sm md:text-base text-muted-foreground leading-relaxed">{item.body}</p>}
            </li>
          ))}
        </ol>
      </details>
    </SectionShell>
  );
}
