/**
 * Pricing data module.
 *
 * See `openspec/changes/dev-services-website/design.md` D8 and
 * `specs/pricing/spec.md`, "Placeholder Discipline". There is no
 * `[PRICE:*]`/`[CURRENCY]` string token anywhere in this design — a string
 * token can only ever be caught by scanning text, the weakest possible
 * enforcement. Instead, every unresolved figure is a designed `pending`
 * state in the type system itself.
 *
 * No price figure or currency has been decided yet (blocked on task 4.H1),
 * so every entry below is honestly `{ status: 'pending' }`. No number and
 * no currency is invented anywhere in this file.
 */

export type Currency = "PEN" | "USD";

export type PriceToken =
  | "landing-basic"
  | "landing-standard"
  | "landing-premium"
  | "microsite-basic"
  | "microsite-event"
  | "app-from"
  | "care-basic"
  | "care-standard";

export type Money = {
  readonly amount: number;
  readonly currency: Currency;
};

export type PriceEntry =
  | { readonly status: "set"; readonly value: Money }
  | { readonly status: "pending"; readonly note?: string };

/**
 * `satisfies Record<PriceToken, PriceEntry>` gives three compile-time
 * guarantees: no token can be missing, no unknown token can be added, and
 * no entry can be malformed. `as const` preserves each entry's literal
 * `status` so pending tokens are derivable at the type level (used by the
 * production-mode check in `invariants.ts`, PR 2b/PR 4).
 */
export const PRICES = {
  "landing-basic": { status: "pending" },
  "landing-standard": { status: "pending" },
  "landing-premium": { status: "pending" },
  "microsite-basic": { status: "pending" },
  "microsite-event": { status: "pending" },
  "app-from": { status: "pending" },
  "care-basic": { status: "pending" },
  "care-standard": { status: "pending" },
} as const satisfies Record<PriceToken, PriceEntry>;
