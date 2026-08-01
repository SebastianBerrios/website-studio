import type { Evidence as EvidenceField } from "@/lib/content/types";
import type { Locale } from "@/lib/content/locales";
import { getDictionary } from "@/lib/dictionaries";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";

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
 *
 * **Editorial restyle (feat/editorial-design)**: every image-bearing branch
 * (`live`, `gated`, `not-deployed`) now renders its screenshot through
 * `DirectionAwareHover` (`components/ui/direction-aware-hover.tsx`, new
 * client component #1 of 3 this slice adds — "subtle, expensive to perceive,
 * cheap to run" per the change's design brief) instead of a bare `<Image>`.
 * `no-visual` is structurally excluded from ever reaching it: this switch
 * still only calls `DirectionAwareHover` from branches where `Evidence`'s
 * discriminated union guarantees `media` is non-empty, so an honest empty
 * state never gains a hover surface that would make it look like a broken
 * image slot.
 */
export function Evidence({
  evidence,
  locale,
}: {
  evidence: EvidenceField;
  locale: Locale;
}) {
  const { portfolio } = getDictionary(locale);

  const gridSizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

  switch (evidence.state) {
    case "live":
      return (
        <DirectionAwareHover
          image={evidence.media[0].asset}
          imageAlt={evidence.media[0].alt[locale]}
          sizes={gridSizes}
        />
      );

    case "gated":
      return (
        <div className="space-y-2">
          <DirectionAwareHover
            image={evidence.media[0].asset}
            imageAlt={evidence.media[0].alt[locale]}
            sizes={gridSizes}
          />
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
          <DirectionAwareHover
            image={evidence.media[0].asset}
            imageAlt={evidence.media[0].alt[locale]}
            sizes={gridSizes}
          />
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
