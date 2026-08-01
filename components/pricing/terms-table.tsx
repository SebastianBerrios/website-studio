import { PRICING_TERMS } from "@/lib/content/pricing";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: cross-cutting terms, pricing page block 6. Task 4.4.
 *
 * `alwaysIncluded`/`alwaysExtra` restate the one settled process commitment
 * (`PROCESS.revisionRoundsIncluded`) rather than a longer, invented list.
 * `paymentSchedule` is `Commitment<T>` and honestly `pending` — not supplied
 * this batch; see `lib/content/pricing.ts`'s `PricingTerms` doc comment.
 * Currency is never hardcoded per site — every price on this page renders
 * through `<Price>`/`formatMoney()`, which both read `DISPLAY_CURRENCY`.
 */
export function TermsTable({ locale }: { locale: Locale }) {
  const { pricing } = getDictionary(locale);
  const { alwaysIncluded, alwaysExtra, paymentSchedule } = PRICING_TERMS;

  return (
    <div className="reveal grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.alwaysIncludedHeading}
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {alwaysIncluded.map((item) => (
            <li key={item[locale]}>{item[locale]}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.alwaysExtraHeading}
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {alwaysExtra.map((item) => (
            <li key={item[locale]}>{item[locale]}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.paymentScheduleLabel}
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          {paymentSchedule.status === "set"
            ? paymentSchedule.value[locale]
            : pricing.paymentSchedulePendingNote}
        </p>
      </div>
    </div>
  );
}
