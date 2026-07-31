import Image from "next/image";
import { ACADEMY, type Authority as AuthorityContent } from "@/lib/content/authority";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: landing section 5, "Autoridad" — the ElectroCode Academy
 * authority block. Task 3.5.
 *
 * See `openspec/changes/dev-services-website/proposal.md` §8.1 and
 * `specs/trust-signals/spec.md` ("Academy Block Placement", "Academy No-Link
 * State While Undeployed", "Academy No-Scale-Claim Constraint", "Academy
 * Upgrade Condition"). This block is intentionally its own section, never a
 * card in `components/sections/portfolio.tsx`'s grid — `electrocode-academy`
 * is deliberately absent from `lib/content/projects/index.ts`'s curated set
 * for exactly this reason.
 *
 * **No-link enforcement is structural, not a conditional a reviewer must
 * trust.** `renderLink` below switches exhaustively on `ACADEMY.state`. The
 * `no-link` branch returns `null` — there is no code path in this component
 * that can render an `<a>` while that branch is selected. The `linked`
 * branch (which reads `academy.url`) only becomes reachable once
 * `lib/content/authority.ts` itself is edited to change `ACADEMY.state`, per
 * design.md §5 ("the `url` field only exists in the `linked` variant, so the
 * anchor can only be rendered in that branch") — matching the pattern
 * `components/portfolio/evidence.tsx` already uses for `Evidence.state`.
 *
 * **No-scale-claim enforcement is also structural**: `Authority` has no field
 * anywhere for a student count, course count, or review figure (see
 * `lib/content/authority.ts`'s own doc comment), so this component has
 * nothing to read even if it wanted to render one.
 *
 * `ACADEMY.media` is empty today (no local capture exists yet, blocked on
 * task 3.H1) — the image block below renders nothing rather than a broken
 * frame, same discipline as `components/portfolio/evidence.tsx`'s `no-visual`
 * branch.
 */
export function Authority({ locale }: { locale: Locale }) {
  const { authority } = getDictionary(locale);

  return (
    <section id="autoridad" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold">
          {authority.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {authority.intro}
        </p>
        <div className="mt-10 flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
          {ACADEMY.media.length > 0 ? (
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-64">
              <Image
                src={ACADEMY.media[0].asset}
                alt={ACADEMY.media[0].alt[locale]}
                fill
                sizes="(min-width: 640px) 256px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-card-foreground">
              {ACADEMY.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {ACADEMY.description[locale]}
            </p>
            {renderLink(ACADEMY, authority.visitCta)}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Exhaustive switch on `ACADEMY.state` — see this file's top doc comment for
 * why this is the mechanism that makes the no-link constraint structural
 * rather than conventional.
 */
function renderLink(academy: AuthorityContent, visitCta: string) {
  switch (academy.state) {
    case "no-link":
      // No clickable link, no "visitar" button — the deployment 404s
      // (VERIFIED). See lib/content/authority.ts.
      return null;
    case "linked":
      return (
        <a
          href={academy.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline underline-offset-4"
        >
          {visitCta}
        </a>
      );
    default: {
      const exhaustiveCheck: never = academy;
      throw new Error(`Unhandled authority state: ${String(exhaustiveCheck)}`);
    }
  }
}
