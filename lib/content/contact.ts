/**
 * Business contact channels.
 *
 * See `openspec/changes/dev-services-website/design.md` D9 (content model
 * placement) and task 2.7. Supersedes PR 1's temporary `lib/contact.ts`,
 * which existed only until the full content model landed.
 *
 * The studio's WhatsApp business number has not been supplied yet (task
 * 1.H1, still open). This keeps the same `pending`-style discriminant used
 * for prices (`lib/content/pricing.ts`, design D8) and retainer commitments
 * (`lib/content/retainer.ts`): an unresolved contact channel renders
 * nothing rather than a dead `wa.me` link or an invented number.
 */

export type ContactChannel =
  | { readonly status: "set"; readonly url: string }
  | { readonly status: "pending" };

export const WHATSAPP: ContactChannel = { status: "pending" };
