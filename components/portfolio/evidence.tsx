import Image from "next/image";
import type { Evidence as EvidenceField } from "@/lib/content/types";
import type { Locale } from "@/lib/content/locales";
import { getDictionary } from "@/lib/dictionaries";

/**
 * Server Component: the portfolio grid card's visual-evidence slot, switched
 * exhaustively on `Evidence.state`. See design.md §8, "The `no-visual` state
 * renders no image at all", and `specs/project-portfolio/spec.md`, "Evidence
 * State Rendering". Task 3.3.
 *
 * - `live`: screenshot only. The external link itself is rendered by the
 *   parent (`project-card.tsx`), which wraps the whole card in an `<a>`.
 * - `gated`: the authorized screenshot, PLUS a generic "requires login" note
 *   (from the dictionary — a UI label, not a domain fact) PLUS the
 *   project's own specific `evidence.disclosure` line. Both render: the
 *   generic note names the *kind* of restriction, the disclosure names the
 *   *specific, truthful reason* (see `specs/case-study/spec.md`, "Truthful
 *   Disclosure Line"). Neither substitutes for the other.
 * - `not-deployed`: a locally-captured screenshot, plus a note that no
 *   public deployment exists.
 * - `no-visual`: renders NOTHING — no `<img>`, no placeholder frame, no gray
 *   box. `project-card.tsx` is what makes the resulting card still "read as
 *   complete" (design.md §8's acceptance test): it composes the service
 *   badge, title, and summary regardless of whether this component renders
 *   anything.
 */
export function Evidence({
  evidence,
  locale,
}: {
  evidence: EvidenceField;
  locale: Locale;
}) {
  const { portfolio } = getDictionary(locale);

  switch (evidence.state) {
    case "live":
      return (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={evidence.media[0].asset}
            alt={evidence.media[0].alt[locale]}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      );

    case "gated":
      return (
        <div className="space-y-2">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={evidence.media[0].asset}
              alt={evidence.media[0].alt[locale]}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {portfolio.gatedNote}
          </p>
          <p className="text-xs text-muted-foreground">
            {evidence.disclosure[locale]}
          </p>
        </div>
      );

    case "not-deployed":
      return (
        <div className="space-y-2">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={evidence.media[0].asset}
              alt={evidence.media[0].alt[locale]}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {portfolio.notDeployedNote}
          </p>
        </div>
      );

    case "no-visual":
      // Deliberately no element at all — see this component's doc comment.
      return null;

    default: {
      const exhaustiveCheck: never = evidence;
      throw new Error(`Unhandled evidence state: ${String(exhaustiveCheck)}`);
    }
  }
}
