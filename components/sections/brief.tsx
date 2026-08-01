import { WHATSAPP } from "@/lib/content/contact";
import { getDictionary } from "@/lib/dictionaries";
import { isBriefFormConfigured } from "@/lib/brief/config";
import { SERVICE_LINES } from "@/lib/content/service-lines";
import { BUDGET_BANDS } from "@/lib/brief/schema";
import { BriefForm } from "@/components/brief/brief-form";
import type { Locale } from "@/lib/content/locales";

/**
 * Server Component: landing section 8, the conversion section. Task 6.6,
 * and this batch's overriding rule.
 *
 * `BRIEF_FROM_EMAIL` needs DNS domain verification with the email provider,
 * and the studio has no owned domain today (deploying to a `.vercel.app`
 * subdomain) — every submission would fail at the provider until that is
 * done. `isBriefFormConfigured()` (`lib/brief/config.ts`, server-only) is
 * the single gate: when the required environment variables are absent, this
 * section renders the WhatsApp path ONLY — no form markup, no input a
 * visitor can type into that silently goes nowhere. Same fail-closed
 * discipline as `checkAbuseSignals()` without its HMAC secret, and as the
 * `pending`/`set` discriminant already used throughout `lib/content/**`.
 *
 * The WhatsApp link is rendered in BOTH branches — `specs/lead-capture/
 * spec.md`'s "WhatsApp Escape Hatch" requires it to function independently
 * of the brief form's backend, not only as a fallback for when the form is
 * absent.
 *
 * **No longer calls `issueFormToken()` (2026-07-31, remediation of
 * `verify-report-final.md` finding C2)**: this Server Component renders once,
 * at build time, on this statically prerendered route — so a token issued
 * here would be baked identically into every visitor's HTML, exactly the bug
 * C2 found. `components/brief/brief-form.tsx` now fetches its own token via
 * a Server Action (`lib/brief/issue-token.ts`) once mounted in the visitor's
 * browser. See that file's doc comment.
 */
export function Brief({ locale }: { locale: Locale }) {
  const { brief } = getDictionary(locale);
  const configured = isBriefFormConfigured();
  const whatsappUrl = WHATSAPP.status === "set" ? WHATSAPP.url : null;

  const serviceLines = Object.values(SERVICE_LINES).map((line) => ({
    id: line.id,
    label: line.name[locale],
  }));
  const budgetBands = Object.values(BUDGET_BANDS).map((band) => ({
    id: band.id,
    label: band.label[locale],
  }));

  return (
    <section id="brief" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4">
        <div className="reveal md:grid md:grid-cols-[1fr_1.4fr] md:gap-12">
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            {brief.heading}
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground md:mt-2">
            {brief.intro}
          </p>
        </div>

        {configured ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_1fr]">
            {/*
              Without JavaScript the form renders but cannot be submitted.
              The C2 remediation moved the dwell token from build time to a
              per-visit Server Action fetched on mount, which is what makes a
              submission six hours after a deploy work at all — but it also
              means `issuedAt`/`signature` are absent from the static HTML, and
              `checkAbuseSignals()` fails closed without them.

              That tradeoff is unavoidable: a per-visit timestamp on a
              statically prerendered page needs a client round-trip. What is
              avoidable is letting a no-JS visitor fill in eight fields and
              press a button that silently rejects them. So we say it, and
              point at the path that does work — the same fail-closed honesty
              the email-configuration gate above already applies.
            */}
            <noscript>
              <div
                role="alert"
                className="rounded-md border border-border bg-card p-4 text-sm"
              >
                <p className="font-medium">{brief.noscriptHeading}</p>
                <p className="mt-1 text-muted-foreground">
                  {brief.noscriptBody}
                </p>
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block font-medium text-accent-signal underline underline-offset-4"
                  >
                    {brief.whatsappFallbackLabel}
                  </a>
                ) : null}
              </div>
            </noscript>
            <BriefForm
              locale={locale}
              serviceLines={serviceLines}
              budgetBands={budgetBands}
              whatsappUrl={whatsappUrl}
              copy={{
                serviceLineLabel: brief.serviceLineLabel,
                serviceLinePlaceholder: brief.serviceLinePlaceholder,
                budgetBandLabel: brief.budgetBandLabel,
                budgetBandPlaceholder: brief.budgetBandPlaceholder,
                nameLabel: brief.nameLabel,
                emailLabel: brief.emailLabel,
                phoneLabel: brief.phoneLabel,
                phoneOptionalNote: brief.phoneOptionalNote,
                projectDescriptionLabel: brief.projectDescriptionLabel,
                submitLabel: brief.submitLabel,
                submittingLabel: brief.submittingLabel,
                errorSummaryHeading: brief.errorSummaryHeading,
                sendFailedHeading: brief.sendFailedHeading,
                sendFailedBody: brief.sendFailedBody,
                rejectedHeading: brief.rejectedHeading,
                rejectedBody: brief.rejectedBody,
                whatsappFallbackLabel: brief.whatsappFallbackLabel,
              }}
            />
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-medium text-card-foreground">
                {brief.whatsappAsideHeading}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{brief.whatsappAsideBody}</p>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium"
                >
                  {brief.whatsappCtaLabel}
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="reveal mt-10 max-w-xl rounded-2xl border border-border bg-card p-8">
            <p className="text-sm text-muted-foreground">{brief.whatsappOnlyBody}</p>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium"
              >
                {brief.whatsappCtaLabel}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
