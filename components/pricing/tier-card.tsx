import { PROCESS } from "@/lib/content/process";
import type { PricingTier } from "@/lib/content/pricing";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";
import { Price } from "./price";

/**
 * Server Component: one fixed tier's full anatomy (Lines A and C). Task 4.2.
 *
 * See `specs/pricing/spec.md`'s "Fixed Tier Anatomy": who it is for,
 * deliverables, turnaround, revision rounds, price, and what is NOT
 * included. `revisionRounds` is read from `PROCESS.revisionRoundsIncluded`
 * (`lib/content/process.ts`), not duplicated per tier — see
 * `lib/content/pricing.ts`'s `PricingTier` doc comment.
 *
 * `turnaround` and `notIncluded` are `Commitment<T>` (`lib/content/
 * pricing.ts`'s documented deviation from design.md's literal
 * required-non-empty-tuple shape): neither was supplied this batch. Both
 * render an honest "pending" note rather than a silently blank section or an
 * invented list — same discipline `PricePending` already applies one level
 * up, at the price itself.
 */
export function TierCard({ tier, locale }: { tier: PricingTier; locale: Locale }) {
  const { pricing } = getDictionary(locale);

  return (
    <article className="reveal flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/30">
      <div>
        <h3 className="font-display text-lg font-medium text-card-foreground">
          {tier.name[locale]}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {tier.audience[locale]}
        </p>
      </div>

      <p className="text-2xl">
        <Price token={tier.token} />
      </p>

      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.deliverablesLabel}
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {tier.deliverables.map((item) => (
            <li key={item[locale]}>{item[locale]}</li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        {pricing.revisionsPrefix} {PROCESS.revisionRoundsIncluded}{" "}
        {pricing.revisionsSuffix}
      </p>

      <div>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.turnaroundLabel}
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          {tier.turnaround.status === "set"
            ? tier.turnaround.value[locale]
            : pricing.turnaroundPendingNote}
        </p>
      </div>

      <div className="mt-auto">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pricing.notIncludedHeading}
        </h4>
        {tier.notIncluded.status === "set" ? (
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {tier.notIncluded.value.map((item) => (
              <li key={item[locale]}>{item[locale]}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            {pricing.notIncludedPendingNote}
          </p>
        )}
      </div>
    </article>
  );
}
