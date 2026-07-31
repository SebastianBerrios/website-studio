import { RETAINER_COMMITMENTS } from "@/lib/content/retainer";
import { RETAINER_PLANS } from "@/lib/content/pricing";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";
import { Price } from "./price";

/**
 * Server Component: Line D's pricing block — the two named, priced
 * maintenance-retainer plans, plus the shared published commitments. Not
 * enumerated in design.md D10's component list (written before real figures
 * existed); added here because task 4.1 requires this block to render and
 * neither `tier-card.tsx` (fixed one-off tiers) nor `components/sections/
 * retainer.tsx` (the landing's full commitments section) has the right
 * shape for "two named, priced plans".
 *
 * Deliberately reuses `RETAINER_COMMITMENTS` (`lib/content/retainer.ts`) and
 * the existing `retainer` dictionary namespace instead of restating their
 * content as new hardcoded copy — the instruction this task was given
 * explicitly. See `lib/content/pricing.ts`'s `RetainerPlan` doc comment for
 * the open item: no scope difference between the two plans beyond price has
 * been supplied.
 */
export function RetainerPlans({ locale }: { locale: Locale }) {
  const { retainer } = getDictionary(locale);
  const { responseWindow, includedScope, excludedScope, cancellationTerms } =
    RETAINER_COMMITMENTS;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {RETAINER_PLANS.map((plan) => (
          <div
            key={plan.token}
            className="rounded-lg border border-border p-4"
          >
            <h4 className="text-base font-semibold text-card-foreground">
              {plan.name[locale]}
            </h4>
            <p className="mt-1 text-lg">
              <Price token={plan.token} /> / mes
            </p>
          </div>
        ))}
      </div>

      {responseWindow.status === "set" ? (
        <div className="mt-6">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {retainer.responseHeading}
          </h4>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            {responseWindow.value.map((tier) => (
              <div key={tier.severity[locale]} className="text-sm">
                <dt className="text-muted-foreground">{tier.severity[locale]}</dt>
                <dd className="font-medium text-card-foreground">
                  {tier.window[locale]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {includedScope.status === "set" ? (
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {retainer.includedHeading}
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {includedScope.value.map((item) => (
                <li key={item[locale]}>{item[locale]}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {excludedScope.status === "set" ? (
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {retainer.excludedHeading}
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {excludedScope.value.map((item) => (
                <li key={item[locale]}>{item[locale]}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {cancellationTerms.status === "set" ? (
        <p className="mt-6 text-sm font-medium text-card-foreground">
          {retainer.cancellationLabel} {cancellationTerms.value[locale]}
        </p>
      ) : null}
    </div>
  );
}
