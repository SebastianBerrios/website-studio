import type { Route } from "next";
import Link from "next/link";
import { SERVICE_LINES } from "@/lib/content/service-lines";
import { getDictionary } from "@/lib/dictionaries";
import { landingAnchor, pricingLineAnchor } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: landing section 2, "Servicios" — one self-identification
 * card per service line. Task 3.1, updated by task 4.8.
 *
 * `specs/landing-narrative/spec.md`'s "Servicios Section Contract" and
 * `specs/service-catalog/spec.md`'s "Line-to-Pricing Anchor Mapping" both
 * call for each card to link to its pricing block on `/[locale]/precios`
 * AND to its available proof. Task 3.1 shipped only the proof CTA because
 * `/[locale]/precios` did not exist yet — see git history for that batch's
 * documented deviation. Now that PR 4 has shipped the route, each card
 * renders both CTAs: `pricingCta` (`pricingLineAnchor()`, deep-linking to
 * that exact line's block) and `proofCta` (`#proyectos`, unchanged).
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
    <section id="servicios" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="reveal max-w-xl text-3xl font-medium tracking-tight md:text-5xl">
          {services.heading}
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(SERVICE_LINES).map((line, index) => (
            <article
              key={line.id}
              style={{ animationDelay: `${index * 80}ms` }}
              className="reveal flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/30"
            >
              <h3 className="font-display text-lg font-medium text-card-foreground">
                {line.name[locale]}
              </h3>
              <p className="flex-1 text-sm text-muted-foreground">
                {line.description[locale]}
              </p>
              <div className="flex flex-col gap-1">
                <Link
                  href={pricingLineAnchor(locale, line.id)}
                  className="text-sm font-medium text-accent-signal underline underline-offset-4"
                >
                  {services.pricingCta}
                </Link>
                <Link
                  href={proyectosHref}
                  className="text-sm font-medium underline underline-offset-4"
                >
                  {services.proofCta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
