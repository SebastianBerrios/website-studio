import { RETAINER_COMMITMENTS } from "@/lib/content/retainer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: landing section 7, "Retainer/Mantenimiento". Task 3.6.
 *
 * See `openspec/changes/dev-services-website/proposal.md` §8.2 and
 * `specs/trust-signals/spec.md` ("Retainer Published Commitments", "Itemized
 * Maintenance Scope", "No Retainer Testimonial Without Consent") and
 * `specs/landing-narrative/spec.md` ("Retainer Section Contract" — this
 * section shows commitment values, never a project card, since Line D has no
 * possible case-study proof).
 *
 * Every field below renders only when its `Commitment` is `"set"` — a
 * `"pending"` commitment (today: `channels`) renders nothing rather than an
 * invented value or an empty placeholder row. This mirrors
 * `lib/content/retainer.ts`'s own discipline: a missing commitment key is a
 * compile error, but an undecided commitment's *value* stays honestly absent
 * from the page until it is actually decided.
 *
 * **No monthly price or hour figure appears anywhere in this section.**
 * `RETAINER_COMMITMENTS` has no price field at all (Precios/section 6 is out
 * of scope for this batch — see `app/[locale]/page.tsx`'s doc comment on the
 * gap), and `scopeModel` explicitly states the retainer is bounded by task
 * type, not by an hour allowance (`lib/content/retainer.ts`'s deviation
 * note).
 *
 * **No testimonial**: nothing has been collected with consent, so this
 * component simply has no testimonial markup to render — not a hidden or
 * commented-out placeholder.
 */
export function Retainer({ locale }: { locale: Locale }) {
  const { retainer } = getDictionary(locale);
  const {
    responseWindow,
    scopeModel,
    includedScope,
    excludedScope,
    bugVsFeatureBoundary,
    contentChangeScope,
    cancellationTerms,
  } = RETAINER_COMMITMENTS;

  const hasBoundaryNotes =
    bugVsFeatureBoundary.status === "set" || contentChangeScope.status === "set";

  return (
    <section id="retainer" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="reveal max-w-xl text-3xl font-medium tracking-tight md:text-5xl">
          {retainer.heading}
        </h2>

        {responseWindow.status === "set" ? (
          <div className="mt-10">
            <h3 className="font-display text-lg font-medium text-card-foreground">
              {retainer.responseHeading}
            </h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {responseWindow.value.map((tier) => (
                <div
                  key={tier.severity[locale]}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <dt className="text-sm font-medium text-muted-foreground">
                    {tier.severity[locale]}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-card-foreground">
                    {tier.window[locale]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {scopeModel.status === "set" ? (
          <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
            {scopeModel.value[locale]}
          </p>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {includedScope.status === "set" ? (
            <div>
              <h3 className="font-display text-lg font-medium text-card-foreground">
                {retainer.includedHeading}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {includedScope.value.map((item) => (
                  <li key={item[locale]}>{item[locale]}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {excludedScope.status === "set" ? (
            <div>
              <h3 className="font-display text-lg font-medium text-card-foreground">
                {retainer.excludedHeading}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {excludedScope.value.map((item) => (
                  <li key={item[locale]}>{item[locale]}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {hasBoundaryNotes ? (
          <div className="mt-6 max-w-2xl space-y-2 text-xs text-muted-foreground">
            {bugVsFeatureBoundary.status === "set" ? (
              <p>{bugVsFeatureBoundary.value[locale]}</p>
            ) : null}
            {contentChangeScope.status === "set" ? (
              <p>{contentChangeScope.value[locale]}</p>
            ) : null}
          </div>
        ) : null}

        {cancellationTerms.status === "set" ? (
          <p className="mt-8 text-sm font-medium text-card-foreground">
            {retainer.cancellationLabel} {cancellationTerms.value[locale]}
          </p>
        ) : null}
      </div>
    </section>
  );
}
