/**
 * TEMPORARY contact module for PR 1 ("Truth pass").
 *
 * Superseded by `lib/content/contact.ts` once the full content model lands
 * (`openspec/changes/dev-services-website/tasks.md` task 2.7) — delete this
 * file then.
 *
 * The studio's WhatsApp business number has not been supplied yet (task
 * 1.H1). This mirrors the `pending` discriminant used for prices in
 * design.md D8: an unresolved contact channel renders nothing rather than a
 * dead `wa.me` link or an invented placeholder number.
 */

export type ContactChannel =
  | { readonly status: "set"; readonly url: string }
  | { readonly status: "pending" };

export const WHATSAPP: ContactChannel = { status: "pending" };
