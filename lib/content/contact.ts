/**
 * Business contact channels.
 *
 * See `openspec/changes/dev-services-website/design.md` D9 (content model
 * placement) and task 2.7. Supersedes PR 1's temporary `lib/contact.ts`,
 * which existed only until the full content model landed.
 *
 * The `pending`/`set` discriminant matches the one used for prices
 * (`lib/content/pricing.ts`, design D8) and retainer commitments
 * (`lib/content/retainer.ts`): an unresolved channel renders nothing rather
 * than a dead `wa.me` link or an invented number.
 *
 * Task 1.H1 is now closed — the user supplied the number on 2026-07-31.
 */

export type ContactChannel =
  | { readonly status: "set"; readonly url: string }
  | { readonly status: "pending" };

/**
 * `wa.me` takes the number in international format with no `+`, spaces, or
 * dashes. Peru is country code 51.
 *
 * The pre-filled `text` is intentionally short and neutral: it gives the
 * visitor a first line so the conversation does not start with a blank
 * message, without putting words in their mouth about budget or scope.
 */
const WHATSAPP_E164_NO_PLUS = "51977824787";
const WHATSAPP_PREFILL = encodeURIComponent(
  "Hola, vengo desde la web de ElectroCode Studio. Quisiera consultar por un proyecto.",
);

export const WHATSAPP: ContactChannel = {
  status: "set",
  url: `https://wa.me/${WHATSAPP_E164_NO_PLUS}?text=${WHATSAPP_PREFILL}`,
};
