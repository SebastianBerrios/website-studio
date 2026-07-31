/**
 * The brief form's Server Action. See
 * `openspec/changes/dev-services-website/design.md` §9, "Submission flow",
 * and task 6.4.
 *
 * Flow: abuse check → validate → notify → `redirect()`. `redirect()` is the
 * LAST statement in this function and sits OUTSIDE any `try`/`catch` — the
 * documented gotcha: `redirect()` works by throwing a special Next.js
 * control-flow error, and a `try` wrapping it would have its `catch`
 * silently swallow that throw, turning a successful submission into a
 * no-op. Every other step below returns early instead of throwing, so
 * nothing here needs a `try` around the redirect.
 *
 * On notification failure, this does NOT redirect: it returns an error
 * state with the submitted values preserved (so PR 6b's `useActionState`
 * can re-render the form without the visitor retyping anything) and logs
 * the payload to `stderr` — the only durability this design has, per
 * design.md §2's "honest cost of choosing email".
 */

"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { DEFAULT_LOCALE, isLocale } from "@/lib/content/locales";
import { checkAbuseSignals } from "./abuse";
import { sendBriefNotification } from "./notify";
import { validateBrief, type BriefErrors, type BriefFieldName } from "./schema";

export type BriefSubmissionStatus = "idle" | "invalid" | "send-failed" | "rejected";

export type BriefSubmissionState = {
  readonly status: BriefSubmissionStatus;
  readonly errors: BriefErrors;
  /** Submitted field values, preserved so a failed submission can
   * re-render without the visitor retyping anything. Never includes the
   * honeypot, `issuedAt`, or `signature` fields. */
  readonly values: Partial<Record<BriefFieldName, string>>;
};

export const initialBriefSubmissionState: BriefSubmissionState = {
  status: "idle",
  errors: {},
  values: {},
};

const USER_FACING_FIELDS: readonly BriefFieldName[] = [
  "serviceLine",
  "budgetBand",
  "name",
  "email",
  "phone",
  "projectDescription",
];

function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function extractUserFacingValues(
  formData: FormData,
): Partial<Record<BriefFieldName, string>> {
  const values: Partial<Record<BriefFieldName, string>> = {};
  for (const field of USER_FACING_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") {
      values[field] = value;
    }
  }
  return values;
}

function resolveLocale(formData: FormData): string {
  const raw = readFormString(formData, "locale");
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/**
 * The Server Action passed to `useActionState` (PR 6b). Signature matches
 * `useActionState`'s expected `(prevState, formData) => state` shape.
 */
export async function submitBrief(
  _previousState: BriefSubmissionState,
  formData: FormData,
): Promise<BriefSubmissionState> {
  const preservedValues = extractUserFacingValues(formData);
  const locale = resolveLocale(formData);

  const abuseResult = checkAbuseSignals({
    honeypot: readFormString(formData, "company"),
    issuedAt: formData.has("issuedAt") ? readFormString(formData, "issuedAt") : null,
    signature: formData.has("signature") ? readFormString(formData, "signature") : null,
  });

  if (!abuseResult.ok) {
    // Silent rejection per design.md §2 layer 1 / spec.md's honeypot
    // scenario — no error surfaced to the caller, no hint to an automated
    // submitter about why it failed. Still logged server-side for our own
    // visibility.
    console.error(`[lib/brief/submit] Rejected submission: ${abuseResult.reason}`);
    return { status: "rejected", errors: {}, values: preservedValues };
  }

  const validation = validateBrief(preservedValues);
  if (!validation.ok) {
    return { status: "invalid", errors: validation.errors, values: preservedValues };
  }

  const notifyResult = await sendBriefNotification(validation.brief);
  if (!notifyResult.ok) {
    console.error(
      `[lib/brief/submit] Notification failed (${notifyResult.reason}). Payload:`,
      validation.brief,
    );
    return {
      status: "send-failed",
      errors: {},
      values: preservedValues,
    };
  }

  // `typedRoutes: true` (design D7) narrows `redirect()`'s argument to the
  // generated route union. `/{locale}/gracias` does not exist as a page
  // until PR 6b ships `app/[locale]/gracias/page.tsx` — this PR is
  // deliberately server-logic-only and creates no route (see this batch's
  // explicit boundary). The cast is contained to this one call site, mirrors
  // the existing `product.link as Route` precedent in
  // `components/ui/hero-parallax.tsx` (PR 2c), and stops being necessary the
  // moment PR 6b's route lands.
  redirect(`/${locale}/gracias` as Route);
}
