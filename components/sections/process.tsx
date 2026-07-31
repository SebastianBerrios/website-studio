import { getDictionary } from "@/lib/dictionaries";
import { PROCESS } from "@/lib/content/process";
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
 */
export function Process({ locale }: { locale: Locale }) {
  const { process } = getDictionary(locale);
  const { phases, revisionRoundsIncluded } = PROCESS;

  return (
    <section id="proceso" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold">{process.heading}</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {phases.map((phase, index) => (
            <li
              key={phase.id}
              className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold text-card-foreground">
                {phase.name[locale]}
              </h3>
              <p className="flex-1 text-sm text-muted-foreground">
                {phase.description[locale]}
              </p>
              {phase.requiresApproval ? (
                <span className="inline-flex w-fit items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-card-foreground">
                  {process.approvalBadge}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted-foreground">
          {revisionRoundsIncluded} {process.revisionsLabel}{" "}
          {process.revisionsExtra}
        </p>
      </div>
    </section>
  );
}
