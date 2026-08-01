/**
 * Server-only readiness check for the brief form's email backend.
 *
 * See task 6.6/6.7 and this batch's overriding rule: `BRIEF_FROM_EMAIL`
 * requires DNS domain verification with Resend, and the studio has no owned
 * domain today (deploying to a `.vercel.app` subdomain) — every send fails at
 * the provider until that verification is done. A form the visitor can type
 * into but that can never deliver is worse than no form at all: the visitor
 * believes they contacted the studio, and the studio never receives
 * anything. `components/sections/brief.tsx` calls `isBriefFormConfigured()`
 * to decide whether to render the real form or the WhatsApp-only fallback —
 * the same `pending`/`set` discipline `lib/content/pricing.ts` and
 * `lib/content/contact.ts` already use, applied to a boolean gate instead of
 * a content value.
 *
 * `import "server-only"` — this must never leak into the client bundle.
 * Whether an API key is configured is operational information about the
 * deployment; `components/brief/brief-form.tsx` (the one Client Component
 * this change set permits) must never import this module, directly or
 * transitively.
 *
 * **Deviation from the literal 3-variable instruction**: extends
 * `RESEND_API_KEY` / `BRIEF_TO_EMAIL` / `BRIEF_FROM_EMAIL` with
 * `BRIEF_FORM_SECRET`. Without that fourth variable,
 * `lib/brief/abuse.ts`'s `checkAbuseSignals()` fails EVERY submission closed
 * with `"config-missing"` (see that module's own fail-closed guarantee) —
 * the exact "renders but cannot deliver" defect this module exists to
 * prevent, just triggered by the abuse layer instead of the notify layer.
 * Treated as the same class of prerequisite, not a new one.
 */

import "server-only";

const REQUIRED_ENV_VARS = [
  "RESEND_API_KEY",
  "BRIEF_TO_EMAIL",
  "BRIEF_FROM_EMAIL",
  "BRIEF_FORM_SECRET",
] as const;

/**
 * `true` only when every environment variable the brief form's send path
 * depends on is present and non-blank. Never throws — an absent variable is
 * an expected, honestly-rendered state (the WhatsApp-only fallback), not a
 * build failure.
 */
export function isBriefFormConfigured(): boolean {
  return REQUIRED_ENV_VARS.every((name) => {
    const value = process.env[name];
    return typeof value === "string" && value.length > 0;
  });
}
