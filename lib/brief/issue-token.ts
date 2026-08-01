/**
 * Server Action wrapper around `issueFormToken()`. Remediation of
 * `verify-report-final.md` finding C2.
 *
 * `/[locale]` is statically prerendered ONCE at build time (D11,
 * `force-static`, `dynamicParams = false`). A Server Component's render —
 * including `components/sections/brief.tsx`, which used to call
 * `issueFormToken()` directly — only ever runs during that single build, not
 * per visit. `Date.now()` captured there is therefore the BUILD clock, baked
 * into the HTML every visitor receives, which is exactly finding C2: every
 * submission more than `MAX_DWELL_MS` after the deploy fails, and
 * `MIN_DWELL_MS` can never fire at all, because the "issued" time never
 * moves.
 *
 * A Server Action is a distinct request-time invocation, independent of the
 * static/dynamic nature of the page that references it — the same fact
 * `lib/brief/submit.ts`'s `submitBrief` already relies on (design.md §11:
 * "the only request-time path is the Server Action POST"). Exposing token
 * issuance the same way lets `components/brief/brief-form.tsx` (the one
 * Client Component this change set permits) call it once, on mount, from the
 * VISITOR's own browser — so `issuedAt` reflects when that visitor actually
 * loaded the form, not when the site was built.
 *
 * `"use server"` modules may only export async functions as runtime values
 * (see `lib/brief/submission-state.ts`'s doc comment for the incident that
 * taught this project that rule) — `requestFormToken` is the only export
 * here, satisfying it.
 */

"use server";

import { issueFormToken, type FormToken } from "./abuse";

export async function requestFormToken(): Promise<FormToken | null> {
  return issueFormToken();
}
