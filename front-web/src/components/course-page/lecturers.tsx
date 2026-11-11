import type { CoursePageDoc } from "@/lib/course-page";
import { isBlockEmpty } from "@/lib/course-page";
import { SectionShell } from "./section-shell";

function initials(name?: string): string {
  const letters = (name ?? "")
    .replace(/^(mr|ms|mrs|dr)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "");
  return letters.join("") || "CP";
}

export default function LecturersSection({ block }: { block: CoursePageDoc["lecturers"] }) {
  if (isBlockEmpty(block)) return null;
  const items = block?.items ?? [];
  return (
    <SectionShell id="lecturers" title={block?.title} tone="tinted">
      <ul className="grid gap-4">
        {items.map((person, i) => (
          <li key={i} className="flex gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
            {person.photo_url && /^https?:\/\//i.test(person.photo_url) ? (
              // Plain <img>: the URL is typed or pasted by admin and may be on a host next/image does not allow.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.photo_url}
                alt={person.name ?? ""}
                width={72}
                height={72}
                loading="lazy"
                className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
              >
                {initials(person.name)}
              </span>
            )}
            <div>
              <h3 className="text-lg font-bold text-foreground leading-snug">{person.name}</h3>
              {person.qualifications && <p className="mt-1 text-sm md:text-base text-muted-foreground leading-relaxed">{person.qualifications}</p>}
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
