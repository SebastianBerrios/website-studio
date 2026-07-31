import type { Route } from "next";
import Link from "next/link";
import { SERVICE_LINES } from "@/lib/content/service-lines";
import { getDictionary } from "@/lib/dictionaries";
import { landingAnchor } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: landing section 2, "Servicios" — one self-identification
 * card per service line. Task 3.1.
 *
 * **Deviation from the literal spec text, documented rather than silently
 * applied** (same discipline as `lib/content/projections.ts`'s `publicLink()`
 * comment). `specs/landing-narrative/spec.md`'s "Servicios Section Contract"
 * and `specs/service-catalog/spec.md`'s "Line-to-Pricing Anchor Mapping"
 * both call for each card to link to its pricing block on
 * `/[locale]/precios`. That route ships in PR 4, and the landing's own
 * Precios summary section ships in PR 3b — both are explicitly out of scope
 * for this batch, and `/es/precios` and `#precios` are hard-banned targets
 * here precisely because neither destination exists yet (see
 * `components/layout/site-header.tsx`'s own note on why it carries no
 * "Precios" nav item for the same reason). Linking to either would be
 * exactly the "ship the reference before the referent" defect this change
 * set exists to stop repeating.
 *
 * So each card renders exactly ONE CTA today, to the Proyectos grid anchor
 * (`#proyectos`, a real, live target — `components/sections/portfolio.tsx`
 * owns that id). Task 4.8 already anticipates this: "Update PR 3's
 * services.tsx/pricing-summary.tsx anchor links to the real
 * `/[locale]/precios#<line>` block anchors now that the route exists" — this
 * component is exactly what that task updates once PR 4/PR 3b ship.
 */
export function Services({ locale }: { locale: Locale }) {
  const { services } = getDictionary(locale);
  // Same pattern as `site-header.tsx`/`site-footer.tsx`/`hero-header.tsx`:
  // `landingAnchor()` returns a plain `string` (locale + arbitrary fragment
  // id), so `typedRoutes` cannot verify it structurally and this cast waives
  // that check — an existing, already-established waiver reused here, not a
  // new one. See `hero-header.tsx`'s fuller comment on this exact cast.
  const proyectosHref = landingAnchor(locale, "proyectos") as Route;

  return (
    <section id="servicios" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold">{services.heading}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(SERVICE_LINES).map((line) => (
            <article
              key={line.id}
              className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold text-card-foreground">
                {line.name[locale]}
              </h3>
              <p className="flex-1 text-sm text-muted-foreground">
                {line.description[locale]}
              </p>
              <Link
                href={proyectosHref}
                className="text-sm font-medium underline underline-offset-4"
              >
                {services.proofCta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
