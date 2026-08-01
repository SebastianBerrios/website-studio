import type { Evidence as EvidenceField } from "@/lib/content/types";
import type { Locale } from "@/lib/content/locales";
import { getDictionary } from "@/lib/dictionaries";

/**
 * Server Component: the case study's truthful disclosure line. Task 5.1. See
 * `specs/case-study/spec.md`, "Truthful Disclosure Line".
 *
 * Exhaustive switch on `Evidence.state`, mirroring `components/portfolio/
 * evidence.tsx`'s discipline but rendering text only — the case-study page
 * (`case-study-layout.tsx`) renders the media itself, at case-study scale,
 * separately.
 *
 * - `gated`: the project's own specific, truthful reason (e.g. "shown with
 *   the client's permission") — never a generic label standing in for it.
 * - `not-deployed`: the generic "no public deployment" note.
 * - `live` / `no-visual`: nothing to disclose — returns `null`.
 */
export function DisclosureNote({
  evidence,
  locale,
}: {
  evidence: EvidenceField;
  locale: Locale;
}) {
  const { portfolio } = getDictionary(locale);

  switch (evidence.state) {
    case "gated":
      return (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">{portfolio.gatedNote}</span>{" "}
          {evidence.disclosure[locale]}
        </p>
      );
    case "not-deployed":
      return (
        <p className="text-sm text-muted-foreground">
          {portfolio.notDeployedNote}
        </p>
      );
    case "live":
    case "no-visual":
      return null;
    default: {
      const exhaustiveCheck: never = evidence;
      throw new Error(`Unhandled evidence state: ${String(exhaustiveCheck)}`);
    }
  }
}
