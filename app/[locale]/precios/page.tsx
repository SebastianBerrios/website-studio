import { PRICING_TIERS, LAUNCH_PRICING_SLOTS } from "@/lib/content/pricing";
import { WHATSAPP } from "@/lib/content/contact";
import { getDictionary } from "@/lib/dictionaries";
import { assertLocale } from "@/lib/content/locales";
import { TierCard } from "@/components/pricing/tier-card";
import { QuoteBlock } from "@/components/pricing/quote-block";
import { RetainerPlans } from "@/components/pricing/retainer-plans";
import { TermsTable } from "@/components/pricing/terms-table";
import { Faq } from "@/components/pricing/faq";
import { canonicalFor } from "@/lib/seo";
import type { Metadata } from "next";

/**
 * This page's own canonical. Without it the page inherited the root layout's
 * and declared `/es` — the homepage — as its canonical version, which is an
 * instruction to search engines NOT to index the pricing page as itself. That
 * defeats the reason this route exists (proposal §5: shareable, sent directly
 * in DMs, SEO target). See `lib/seo.ts`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: { canonical: canonicalFor(assertLocale(locale), "precios") },
  };
}

/**
 * The pricing page. Task 4.6. Composes the 8 blocks `specs/pricing/
 * spec.md`'s "Page Block Order" requires, in order: (1) how pricing works,
 * (2) Line A fixed tiers, (3) Line C fixed tiers, (4) Line B quote-on-request,
 * (5) Line D retainer plans, (6) cross-cutting terms, (7) FAQ, (8) CTA into
 * the brief form.
 *
 * **Block 8 deviation, documented rather than silently applied** (same
 * discipline as `components/sections/services.tsx`'s CTA note): task 4.7
 * asks for the CTA to pre-tag `?line=<ServiceLine>` into `#brief`. Neither
 * `#brief` nor the brief form exist yet — both are PR 6b scope, explicitly
 * out of scope for this batch, and this batch's own hard constraints forbid
 * a CTA pointing at a target that does not exist when this commit lands. The
 * CTA below instead points at the one conversion path already live
 * (`WHATSAPP`, wired in a prior batch), with the visitor's line of interest
 * folded into the prefilled WhatsApp message text — the same "point at
 * what's live today, replace once the real target ships" pattern
 * `site-header.tsx`/`services.tsx` already established. PR 6b must replace
 * this with the real `?line=` pre-tag into `#brief` once the form exists —
 * tracked as an explicit follow-up in apply-progress.md, not closed here.
 *
 * `export const dynamic = 'force-static'`: no request-time data anywhere on
 * this page (design.md D11) — every figure and block above is build-time
 * content.
 */
export const dynamic = "force-static";

const LINE_A_TIERS = PRICING_TIERS.filter((tier) => tier.serviceLine === "A");
const LINE_C_TIERS = PRICING_TIERS.filter((tier) => tier.serviceLine === "C");

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = assertLocale(locale);
  const { pricing } = getDictionary(validLocale);

  return (
    <main className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold">{pricing.heading}</h1>

        {/* Block 1: how pricing works */}
        <section className="mt-8 max-w-2xl">
          <h2 className="text-xl font-semibold">{pricing.introHeading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {pricing.introBody}
          </p>
          <p className="mt-4 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            {pricing.launchNotePrefix} {LAUNCH_PRICING_SLOTS}{" "}
            {pricing.launchNoteSuffix}
          </p>
        </section>

        {/* Block 2: Line A fixed tiers */}
        <section id="linea-a" className="mt-16">
          <h2 className="text-2xl font-bold">{pricing.lineAHeading}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LINE_A_TIERS.map((tier) => (
              <TierCard key={tier.token} tier={tier} locale={validLocale} />
            ))}
          </div>
        </section>

        {/* Block 3: Line C fixed tiers */}
        <section id="linea-c" className="mt-16">
          <h2 className="text-2xl font-bold">{pricing.lineCHeading}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {LINE_C_TIERS.map((tier) => (
              <TierCard key={tier.token} tier={tier} locale={validLocale} />
            ))}
          </div>
        </section>

        {/* Block 4: Line B quote-on-request */}
        <section id="linea-b" className="mt-16">
          <h2 className="text-2xl font-bold">{pricing.lineBHeading}</h2>
          <div className="mt-6">
            <QuoteBlock locale={validLocale} />
          </div>
        </section>

        {/* Block 5: Line D retainer plans */}
        <section id="linea-d" className="mt-16">
          <h2 className="text-2xl font-bold">{pricing.lineDHeading}</h2>
          <div className="mt-6">
            <RetainerPlans locale={validLocale} />
          </div>
        </section>

        {/* Block 6: cross-cutting terms */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">{pricing.termsHeading}</h2>
          <div className="mt-6">
            <TermsTable locale={validLocale} />
          </div>
        </section>

        {/* Block 7: FAQ */}
        <section className="mt-16">
          <Faq locale={validLocale} />
        </section>

        {/* Block 8: CTA into the brief form — see doc comment above */}
        <section className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">{pricing.ctaHeading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{pricing.ctaBody}</p>
          {WHATSAPP.status === "set" ? (
            <a
              href={WHATSAPP.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium"
            >
              {pricing.ctaButtonLabel}
            </a>
          ) : null}
        </section>
      </div>
    </main>
  );
}
