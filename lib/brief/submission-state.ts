/**
 * Plain state shape for the brief form's `useActionState` (task 6.5).
 *
 * Split out of `lib/brief/submit.ts` because of a real Next.js constraint
 * discovered while wiring `components/brief/brief-form.tsx`: a `"use
 * server"` module may only export async functions as runtime VALUES — type
 * exports are erased at compile time and exempt, but a plain object export
 * like `initialBriefSubmissionState` is not. `submit.ts` exported it anyway
 * (PR 6a), which compiled without error (TypeScript does not enforce this
 * Next-specific rule) but crashed at prerender the moment
 * `components/brief/brief-form.tsx` actually read `state.values` off it:
 * the value silently resolved to `undefined` across the Server Action
 * module boundary instead of the real object. See apply-progress.md for the
 * full incident. `lib/brief/submit.ts`'s `submitBrief` remains the ONLY
 * runtime export of that `"use server"` file, satisfying Next's constraint.
 */

import type { BriefErrors, BriefFieldName } from "./schema";

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
