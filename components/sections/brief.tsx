import { WHATSAPP } from "@/lib/content/contact";
import { getDictionary } from "@/lib/dictionaries";
import { issueFormToken } from "@/lib/brief/abuse";
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
    <section id="brief" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold">{brief.heading}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{brief.intro}</p>

        {configured ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
            <BriefForm
              locale={locale}
              token={issueFormToken()}
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
                whatsappFallbackLabel: brief.whatsappFallbackLabel,
              }}
            />
            <div className="rounded-xl border border-border bg-card p-6">
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
          <div className="mt-10 max-w-xl rounded-xl border border-border bg-card p-8">
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
