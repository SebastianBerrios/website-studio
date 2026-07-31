import { SERVICE_LINES, type ServiceLine } from "@/lib/content/service-lines";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: a small label naming a project's service line.
 *
 * Reads the same `SERVICE_LINES` data the Servicios section and (in PR 4)
 * the pricing page render from, so a badge's label and its matching pricing
 * block are guaranteed to reference the same identifier — see
 * `specs/service-catalog/spec.md`, "Cross-Surface Consistency". See task 3.3.
 */
export function ServiceBadge({
  serviceLine,
  locale,
}: {
  serviceLine: ServiceLine;
  locale: Locale;
}) {
  const { name } = SERVICE_LINES[serviceLine];

  return (
    <span className="inline-flex w-fit items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
      {name[locale]}
    </span>
  );
}
