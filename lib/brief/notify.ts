/**
 * Transactional email notification for a validated brief submission.
 *
 * See `openspec/changes/dev-services-website/design.md` D1 and §2 layer 4,
 * and task 6.3. This is the ONLY provider-aware module (design's own
 * architecture table) — the reversibility seam. Adding persistence later
 * means adding a second adapter behind `sendBriefNotification`'s call site
 * in `submit.ts`; nothing else changes.
 *
 * `import "server-only"` — this module reads secrets from the environment
 * and must never be reachable from a Client Component.
 *
 * No SDK. Uses `fetch` against the provider's REST endpoint, per D1's
 * explicit rejection of installing the `resend` npm package (keeps
 * `package.json` untouched and the provider swappable in one file). Cost,
 * stated by design: request/response shapes are hand-typed and can drift
 * with the provider's API — acceptable for a single endpoint.
 *
 * Provider: Resend, chosen implicitly by the `RESEND_API_KEY` env var name
 * design.md §2 already specifies. `https://api.resend.com/emails` is
 * Resend's own documented public API host — not a fabricated domain.
 * Verify the exact request field names against Resend's current API
 * reference before the first real send; this hand-typed shape is the
 * accepted drift risk design.md names explicitly.
 */

import "server-only";
import type { Brief } from "./schema";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type NotifyResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "config" | "provider" };

/**
 * Strips CR and LF from any field that will reach an email header. This is
 * header-injection defense, not cosmetic hygiene: `Reply-To` below carries
 * user-supplied input (the visitor's own email address field), and a
 * crafted value containing a raw newline could inject additional headers
 * (a second `Bcc:`, a forged `Subject:`, etc.) or terminate the header block
 * early. Applied unconditionally here regardless of what `schema.ts`'s
 * `validateBrief` already rejected — this module does not trust its caller,
 * per design.md §2 layer 4's own framing ("defense", not "redundant check").
 */
function stripCrlf(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function readRequiredEnv(name: string): string | null {
  const value = process.env[name];
  return value && value.length > 0 ? value : null;
}

function buildPlainTextBody(brief: Brief): string {
  const lines = [
    `Línea de servicio: ${brief.serviceLine}`,
    `Rango de presupuesto: ${brief.budgetBand}`,
    `Nombre: ${stripCrlf(brief.name)}`,
    `Email: ${stripCrlf(brief.email)}`,
  ];

  if (brief.phone.length > 0) {
    lines.push(`Teléfono: ${stripCrlf(brief.phone)}`);
  }

  lines.push("", "Descripción del proyecto:", brief.projectDescription);

  return lines.join("\n");
}

/**
 * Sends the brief as a transactional email. Never throws — every failure
 * mode (missing config, network error, non-2xx response) resolves to
 * `{ ok: false, reason }` so `submit.ts` can decide what to do without a
 * `try/catch` of its own wrapping a `redirect()` call (the documented
 * gotcha in task 6.4).
 */
export async function sendBriefNotification(brief: Brief): Promise<NotifyResult> {
  const apiKey = readRequiredEnv("RESEND_API_KEY");
  const toEmail = readRequiredEnv("BRIEF_TO_EMAIL");
  const fromEmail = readRequiredEnv("BRIEF_FROM_EMAIL");

  if (!apiKey || !toEmail || !fromEmail) {
    console.error(
      "[lib/brief/notify] Missing one or more required environment variables: " +
        "RESEND_API_KEY, BRIEF_TO_EMAIL, BRIEF_FROM_EMAIL.",
    );
    return { ok: false, reason: "config" };
  }

  // Subject carries no free-text user input (only the closed ServiceLine
  // union), so it needs no CR/LF stripping — but Reply-To below does.
  const subject = `Nuevo brief — Línea ${brief.serviceLine}`;
  const safeReplyTo = stripCrlf(brief.email);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: safeReplyTo,
        subject,
        text: buildPlainTextBody(brief),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "<unreadable body>");
      console.error(
        `[lib/brief/notify] Provider responded with ${response.status}: ${body}`,
      );
      return { ok: false, reason: "provider" };
    }

    return { ok: true };
  } catch (error) {
    console.error("[lib/brief/notify] Provider request failed:", error);
    return { ok: false, reason: "provider" };
  }
}
