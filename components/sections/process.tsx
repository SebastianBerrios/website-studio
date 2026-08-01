import { getDictionary } from "@/lib/dictionaries";
import { PROCESS } from "@/lib/content/process";
import { StickyScrollReveal, type StickyScrollItem } from "@/components/ui/sticky-scroll-reveal";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: landing section 3, "Proceso" — task 3.2.
 *
 * Renders `PROCESS.phases` (`lib/content/process.ts`) as a fixed, ordered
 * five-step sequence. `requiresApproval` is rendered as a visible badge, not
 * carried silently — it is the section's selling point: the client is never
 * surprised at the end, because three of the five phases (Descubrimiento,
 * Propuesta y alcance, Diseño) cannot proceed without their explicit sign-off.
 *
 * `PROCESS.revisionRoundsIncluded` is read from the data module, not
 * hardcoded — see that module's doc comment for why this is the concrete
 * value that satisfies `specs/landing-narrative/spec.md`'s "Proceso Section
 * Contract" data-driven mechanism, and why a client-facing response-time
 * commitment is deliberately absent rather than invented (open item, tracked
 * in tasks.md / apply-progress.md, distinct from
 * `RETAINER_COMMITMENTS.responseWindow` which covers post-launch maintenance
 * requests, not mid-project approval turns).
 *
 * No link/CTA in this section: nothing in the studio's approved content for
 * this batch has a live target to point at from here (`/[locale]/precios`
 * and the retainer section both ship in later slices — see
 * `components/sections/services.tsx`'s doc comment for the same constraint
 * applied to a different section).
 *
 * Copy voice: first-person-plural studio voice ("Diseñamos…", "Construimos…"),
 * matching `lib/dictionaries/es.ts`'s existing hero copy. No "nuestro
 * equipo"/"nuestros diseñadores" phrasing — the studio is solo-operated and
 * this section earns its "studio" positioning through structure (the
 * five-phase, approval-gated sequence itself), never through implied
 * headcount (design.md §4.4 / landing-narrative spec's "Copy Voice
 * Constraint").
 *
 * **Approval-deadline addition**: renders
 * `PROCESS.clientApprovalDeadlineBusinessDays` and its pause/recalculation
 * consequence — stated up front, not raised later as a complaint. This
 * closes the open item this section's previous batch recorded: a process
 * gating 3 of 5 phases on client approval stalls when the client goes quiet,
 * with no stated consequence. See `lib/content/process.ts`'s doc comment.
 *
 * **Editorial restyle (feat/editorial-design)**: the five-phase list now
 * renders through `StickyScrollReveal` (`components/ui/
 * sticky-scroll-reveal.tsx`, new client component #3 of 3 this slice adds,
 * amending design.md D10 — see that file's doc comment and D10's dated
 * amendment for the full reasoning). Five phases is precisely this
 * component's intended use case, and reading-by-scroll is itself editorial
 * language, per the change's design brief. This component itself stays a
 * Server Component: `PROCESS.phases` and the dictionary's `approvalBadge`
 * label are mapped into a plain `StickyScrollItem[]` here, on the server,
 * and only that plain data crosses into the client boundary — no dictionary
 * object, no content module, ever gets bundled to the client.
 */
export function Process({ locale }: { locale: Locale }) {
  const { process } = getDictionary(locale);
  const {
    phases,
    revisionRoundsIncluded,
    clientApprovalDeadlineBusinessDays,
  } = PROCESS;

  const items: readonly StickyScrollItem[] = phases.map((phase, index) => ({
    id: phase.id,
    index: index + 1,
    title: phase.name[locale],
    description: phase.description[locale],
    badge: phase.requiresApproval ? process.approvalBadge : undefined,
  }));

  return (
    <section id="proceso" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="reveal font-display text-3xl font-medium md:text-5xl">
          {process.heading}
        </h2>
        <div className="mt-10">
          <StickyScrollReveal items={items} />
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          {revisionRoundsIncluded} {process.revisionsLabel}{" "}
          {process.revisionsExtra}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {process.approvalDeadlinePrefix} {clientApprovalDeadlineBusinessDays}{" "}
          {process.approvalDeadlineSuffix}
        </p>
      </div>
    </section>
  );
}
