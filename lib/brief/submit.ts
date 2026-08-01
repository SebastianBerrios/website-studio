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
 *
 * **`BriefSubmissionState`/`initialBriefSubmissionState` moved to
 * `./submission-state`** (this batch, task 6.5): a `"use server"` module may
 * only export async functions as runtime values, and `submitBrief` below
 * must remain the only one here — see that file's doc comment for the
 * incident this fixes.
 */

"use server";

import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/lib/content/locales";
import { checkAbuseSignals } from "./abuse";
import { sendBriefNotification } from "./notify";
import { validateBrief, type BriefFieldName } from "./schema";
import type { BriefSubmissionState } from "./submission-state";

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

  // Task 6.9b: the `as Route` cast this call site carried through PR 6a is
  // gone. `typedRoutes: true` (design D7) narrows `redirect()`'s argument to
  // the generated route union, and PR 6a needed the cast only because
  // `/{locale}/gracias` did not exist as a page yet. Task 6.8 (this batch)
  // created `app/[locale]/gracias/page.tsx`, so `typedRoutes` now checks
  // this exact call site again — the whole point of the cast being temporary
  // rather than a second permanent waiver alongside `product.link as Route`
  // in `components/ui/hero-parallax.tsx`.
  redirect(`/${locale}/gracias`);
}
