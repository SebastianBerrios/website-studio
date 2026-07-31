import Link from "next/link";
import { SERVICE_LINES } from "@/lib/content/service-lines";
import { QUOTE_BLOCK, RETAINER_PLANS, type PriceToken } from "@/lib/content/pricing";
import type { ServiceLine } from "@/lib/content/service-lines";
import { getDictionary } from "@/lib/dictionaries";
import { pricingPath } from "@/lib/links";
import type { Locale } from "@/lib/content/locales";
import { Price } from "@/components/pricing/price";

/**
 * The entry-level (cheapest, or in Line B's case, the floor) published price
 * for each line — this summary's one headline figure per line. Deliberately
 * NOT the full tier anatomy (audience, deliverables, turnaround, exclusions)
 * — that lives only on `/[locale]/precios` (`specs/landing-narrative/
 * spec.md`'s "Precios Summary Section Contract": "it shows only a subset,
 * not the full tier anatomy, and a visible link to the full page").
 */
const SUMMARY_TOKENS = {
  A: "landing-basic",
  B: QUOTE_BLOCK.floorToken,
  C: "microsite-basic",
  D: RETAINER_PLANS[0].token,
} as const satisfies Record<ServiceLine, PriceToken>;

/**
 * Server Component: landing section 6, "Precios summary". Task 3.8 — moved
 * out of PR 3b's scope (blocked on price figures/task 4.0) and implemented
 * here, now that both exist.
 *
 * See `specs/landing-narrative/spec.md`'s "Precios Summary Section
 * Contract". Renders one headline figure per service line via `<Price>`
 * (`components/pricing/price.tsx`, task 4.0), never a hardcoded number, plus
 * a link to the full `/[locale]/precios` page for the complete tier anatomy.
 */
export function PricingSummary({ locale }: { locale: Locale }) {
  const { pricingSummary } = getDictionary(locale);

  return (
    <section id="precios" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold">
          {pricingSummary.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {pricingSummary.intro}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(SERVICE_LINES).map((line) => (
            <div
              key={line.id}
              className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-6"
            >
              <h3 className="text-base font-semibold text-card-foreground">
                {line.name[locale]}
              </h3>
              <p className="text-lg">
                <Price token={SUMMARY_TOKENS[line.id]} />
              </p>
            </div>
          ))}
        </div>
        <Link
          href={pricingPath(locale)}
          className="mt-8 inline-block text-sm font-medium underline underline-offset-4"
        >
          {pricingSummary.viewFullPricingLink}
        </Link>
      </div>
    </section>
  );
}
