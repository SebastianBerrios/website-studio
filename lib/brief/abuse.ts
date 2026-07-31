/**
 * Spam/abuse layer 1 for the brief form: honeypot + signed-timestamp dwell
 * check. See `openspec/changes/dev-services-website/design.md` §2, layer 1,
 * and task 6.2.
 *
 * `import "server-only"` — this module reads a server secret from the
 * environment and must never be reachable from a Client Component, even
 * though its only caller today is the `"use server"` action in `submit.ts`.
 * The design's architecture table only marks `notify.ts` as `server-only`
 * explicitly; adding the same guard here is a deliberate, stricter choice
 * for a secret-handling module, mirroring the existing precedent in
 * `lib/content/invariants.ts`.
 *
 * What this layer catches, and what it does not (design.md §2's own table):
 * naive bots and form-fillers that submit instantly or never render the
 * page at all. It does NOT catch a scripted client that renders the page,
 * waits out the dwell time, and leaves the honeypot empty — that is what
 * layers 2-4 (platform rate limiting, input caps, output hardening) exist
 * for.
 */

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Reject a submission faster than this — no honest human fills a form this fast. */
const MIN_DWELL_MS = 3_000;
/** Reject a submission this stale — an old signed token has likely been replayed. */
const MAX_DWELL_MS = 2 * 60 * 60 * 1000;

const HMAC_SECRET_ENV_VAR = "BRIEF_FORM_SECRET";

export type AbuseRejectionReason =
  | "honeypot"
  | "config-missing"
  | "token-missing"
  | "signature-invalid"
  | "dwell-too-fast"
  | "dwell-expired";

export type AbuseCheckResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: AbuseRejectionReason };

export type FormToken = {
  readonly issuedAt: string;
  readonly signature: string;
};

function getSecret(): string | null {
  const value = process.env[HMAC_SECRET_ENV_VAR];
  return value && value.length > 0 ? value : null;
}

function computeSignature(issuedAt: string, secret: string): string {
  return createHmac("sha256", secret).update(issuedAt).digest("hex");
}

/**
 * Issues a fresh `{ issuedAt, signature }` pair for a Server Component to
 * embed as hidden fields when it renders the brief form (PR 6b).
 *
 * Returns `null` — rather than throwing — when `BRIEF_FORM_SECRET` is
 * absent. Throwing here would fail the entire static build the moment a
 * page renders the form (this site is `force-static` everywhere), which is
 * a worse failure mode than the caller choosing not to render a live form.
 * Verification (`checkAbuseSignals` below) is where this design's honest
 * fail-closed behavior actually lives: with no secret configured, EVERY
 * submission is rejected, unconditionally, because a signature can never be
 * verified against a secret that does not exist.
 */
export function issueFormToken(): FormToken | null {
  const secret = getSecret();
  if (!secret) return null;

  const issuedAt = String(Date.now());
  return { issuedAt, signature: computeSignature(issuedAt, secret) };
}

export type AbuseCheckInput = {
  /** Raw value of the visually-hidden honeypot field. Must arrive empty. */
  readonly honeypot: string;
  /** Raw value of the hidden `issuedAt` field, or `null` if absent. */
  readonly issuedAt: string | null;
  /** Raw value of the hidden `signature` field, or `null` if absent. */
  readonly signature: string | null;
};

/**
 * Verifies the honeypot and the signed dwell-time token.
 *
 * Fail-closed guarantee: if `BRIEF_FORM_SECRET` is not configured, this
 * always returns `{ ok: false, reason: "config-missing" }` — a missing
 * secret can never be interpreted as "skip verification". There is no path
 * through this function that accepts a submission without a valid HMAC
 * signature.
 */
export function checkAbuseSignals(input: AbuseCheckInput): AbuseCheckResult {
  if (input.honeypot.trim().length > 0) {
    return { ok: false, reason: "honeypot" };
  }

  const secret = getSecret();
  if (!secret) {
    return { ok: false, reason: "config-missing" };
  }

  if (!input.issuedAt || !input.signature) {
    return { ok: false, reason: "token-missing" };
  }

  const expected = computeSignature(input.issuedAt, secret);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(input.signature, "hex");

  const signatureValid =
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer);

  if (!signatureValid) {
    return { ok: false, reason: "signature-invalid" };
  }

  const issuedAtMs = Number(input.issuedAt);
  if (!Number.isFinite(issuedAtMs)) {
    return { ok: false, reason: "signature-invalid" };
  }

  const dwellMs = Date.now() - issuedAtMs;

  if (dwellMs < MIN_DWELL_MS) {
    return { ok: false, reason: "dwell-too-fast" };
  }

  if (dwellMs > MAX_DWELL_MS) {
    return { ok: false, reason: "dwell-expired" };
  }

  return { ok: true };
}
