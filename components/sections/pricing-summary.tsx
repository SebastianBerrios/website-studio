import Link from "next/link";
import { SERVICE_LINES } from "@/lib/content/service-lines";
import {
  PRICING_TIERS,
  QUOTE_BLOCK,
  RETAINER_PLANS,
  type PriceToken,
} from "@/lib/content/pricing";
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
 * True when a service line publishes more than one fixed tier, so its summary
 * figure is its entry point rather than its price. Derived from the data so a
 * tier added or removed later cannot leave the label lying.
 */
function isMultiTierLine(line: ServiceLine): boolean {
  return PRICING_TIERS.filter((tier) => tier.serviceLine === line).length > 1;
}

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
    <section id="precios" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4">
        <div className="reveal md:grid md:grid-cols-[1fr_1.4fr] md:gap-12">
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            {pricingSummary.heading}
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground md:mt-2">
            {pricingSummary.intro}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(SERVICE_LINES).map((line, index) => (
            <div
              key={line.id}
              style={{ animationDelay: `${index * 80}ms` }}
              className="reveal flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="font-display text-base font-medium text-card-foreground">
                {line.name[locale]}
              </h3>
              {/*
                A line with more than one tier shows its CHEAPEST tier here,
                so the bare figure would read as the price rather than the
                entry point (verify-report-final.md, C3: "Landing pages —
                S/500" is the lowest of 500/650/800). The "desde" is derived
                from how many tiers the line actually has, not hardcoded per
                line, so adding or removing a tier keeps the label truthful.
                Tokens that already carry their own qualifier — the retainer's
                "/ mes", the custom-app floor's "Desde" — are left alone.
              */}
              <p className="font-display text-2xl tabular-nums">
                {isMultiTierLine(line.id) ? `${pricingSummary.fromPrefix} ` : ""}
                <Price token={SUMMARY_TOKENS[line.id]} />
              </p>
            </div>
          ))}
        </div>
        <Link
          href={pricingPath(locale)}
          className="mt-8 inline-block text-sm font-medium text-accent-signal underline underline-offset-4"
        >
          {pricingSummary.viewFullPricingLink}
        </Link>
      </div>
    </section>
  );
}
