/**
 * Pricing data module.
 *
 * See `openspec/changes/dev-services-website/design.md` D8 and
 * `specs/pricing/spec.md`. There is no `[PRICE:*]`/`[CURRENCY]` string token
 * anywhere in this design — a string token can only ever be caught by
 * scanning text, the weakest possible enforcement. Instead, every figure is
 * data with an explicit `pending`/`set` discriminant in the type system
 * itself.
 *
 * Task 4.1 (sdd-apply, PR 4) populates the 8 tokens with the studio's
 * launch-pricing figures, supplied directly by the user. Currency is PEN
 * (Peruvian sol), rendered `S/`. Every figure below is published as
 * **launch pricing for the studio's first 5 projects** — see
 * `LAUNCH_PRICING_SLOTS` — precisely so the studio can raise prices later
 * without that reading as a broken promise to an existing client: nothing
 * here is presented as a permanent floor, and there is deliberately no
 * crossed-out "normal price" next to any figure, because no higher figure has
 * been decided. Inventing one would be exactly the fabrication this content
 * model exists to prevent.
 *
 * **What each token is**, derived only from what the studio actually stated
 * (no invented scope beyond this):
 * - `landing-basic`: a single-page landing.
 * - `landing-standard`: a multi-section corporate site.
 * - `landing-premium`: a corporate site with a larger scope than
 *   `landing-standard`. The studio has not itemised what "larger" includes,
 *   so nothing beyond "larger scope" is claimed — see `PRICING_TIERS`'s own
 *   comment.
 * - `microsite-basic`: a biolink.
 * - `microsite-event`: an event-invitation microsite (e.g. a wedding).
 * - `app-from`: custom web apps and dashboards, quoted, starting from this
 *   floor — see `QUOTE_BLOCK`.
 * - `care-basic` / `care-standard`: the two maintenance-retainer plans (Line
 *   D) — see `RETAINER_PLANS`. Both months-recurring.
 *
 * **Not supplied, not invented**: turnaround time, per-tier exclusions
 * ("not included"), and payment schedule. `design.md` §5's table calls
 * `PricingTier.notIncluded` a required, non-empty tuple — a documented
 * deviation from that literal shape follows below, same discipline as
 * `lib/content/process.ts`'s and `lib/content/retainer.ts`'s own deviation
 * notes: rather than fabricate exclusions/turnaround/payment terms to satisfy
 * a required-tuple shape, those three facts are modeled as `Commitment<T>`
 * (promoted to `lib/content/types.ts` this task) and rendered as an honest
 * "pending" state — see `components/pricing/tier-card.tsx`,
 * `components/pricing/quote-block.tsx`, and `components/pricing/
 * terms-table.tsx`. `specs/pricing/spec.md`'s "A tier missing exclusions is
 * incomplete" requirement is honored in spirit, not by omission: the page
 * never silently drops the exclusions slot, it renders a visibly unresolved
 * one, exactly the same discipline `PricePending` already applies to prices.
 * This is tracked as an explicit open task (see apply-progress.md), not
 * closed by this batch.
 */

import type { Commitment, Localized } from "./types";
import type { ServiceLine } from "./service-lines";
import { PROCESS } from "./process";

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

/**
 * What the figure means. This lives on the DATA, not on a component's copy,
 * because the landing summary once rendered "Mantenimiento — S/80" while the
 * pricing page rendered "S/80 / mes" for the same token, and "Aplicaciones
 * web — S/1,500" for a figure that is a floor (verify-report-final.md, C3).
 * A visitor read a monthly retainer as a one-off and a starting point as a
 * fixed price.
 *
 * Attaching it here means a surface cannot render the number without also
 * rendering what it means — the qualifier travels with the amount.
 */
export type PriceQualifier =
  /** A recurring monthly charge. */
  | "per-month"
  /** A floor: the real figure is quoted and is at least this. */
  | "from";

export type Money = {
  readonly amount: number;
  readonly currency: Currency;
  readonly qualifier?: PriceQualifier;
};

export type PriceEntry =
  | { readonly status: "set"; readonly value: Money }
  | { readonly status: "pending"; readonly note?: string };

/** The studio's one currency decision for this launch (task 4.H1, closed). */
export const DISPLAY_CURRENCY: Currency = "PEN";

/** How many of the studio's first projects this pricing round applies to. */
export const LAUNCH_PRICING_SLOTS = 5;

/**
 * `satisfies Record<PriceToken, PriceEntry>` gives three compile-time
 * guarantees: no token can be missing, no unknown token can be added, and
 * no entry can be malformed. `as const` preserves each entry's literal
 * `status` so pending tokens are derivable at the type level (used by the
 * production-mode check in `invariants.ts`, active as of task 4.10).
 */
export const PRICES = {
  "landing-basic": { status: "set", value: { amount: 500, currency: "PEN" } },
  "landing-standard": { status: "set", value: { amount: 650, currency: "PEN" } },
  "landing-premium": { status: "set", value: { amount: 800, currency: "PEN" } },
  "microsite-basic": { status: "set", value: { amount: 100, currency: "PEN" } },
  "microsite-event": { status: "set", value: { amount: 150, currency: "PEN" } },
  "app-from": { status: "set", value: { amount: 1500, currency: "PEN", qualifier: "from" } },
  "care-basic": { status: "set", value: { amount: 80, currency: "PEN", qualifier: "per-month" } },
  "care-standard": { status: "set", value: { amount: 150, currency: "PEN", qualifier: "per-month" } },
} as const satisfies Record<PriceToken, PriceEntry>;

/**
 * Spanish qualifier wording. It sits here rather than in
 * `lib/dictionaries/es.ts` because it is inseparable from the formatted
 * figure — splitting them is exactly how the landing lost the qualifiers in
 * the first place. When a second locale ships, move BOTH the figure
 * formatting and these strings behind the dictionary together, not one
 * without the other.
 */
const QUALIFIER_ES: Record<PriceQualifier, { prefix?: string; suffix?: string }> =
  {
    "per-month": { suffix: " / mes" },
    from: { prefix: "Desde " },
  };

export function formatMoney(money: Money): string {
  const symbol = money.currency === "PEN" ? "S/" : "US$";
  const figure = `${symbol}${new Intl.NumberFormat("es-PE").format(money.amount)}`;
  if (money.qualifier === undefined) return figure;
  const { prefix = "", suffix = "" } = QUALIFIER_ES[money.qualifier];
  return `${prefix}${figure}${suffix}`;
}

/**
 * A fixed-price tier (Lines A and C). See `specs/pricing/spec.md`'s "Fixed
 * Tier Anatomy". `revisionRounds` is deliberately NOT a per-tier field here:
 * the studio's settled policy (`PROCESS.revisionRoundsIncluded`, 2 rounds
 * included then quoted) applies uniformly across every fixed tier, so
 * `components/pricing/tier-card.tsx` reads it from `PROCESS` directly rather
 * than duplicating the same number 5 times — same "one exported constant,
 * every consumer reads through it" discipline `lib/content/process.ts`
 * already established for the Proceso section.
 */
export type PricingTier = {
  readonly token: PriceToken;
  readonly serviceLine: ServiceLine;
  readonly name: Localized<string>;
  readonly audience: Localized<string>;
  readonly deliverables: readonly [Localized<string>, ...Localized<string>[]];
  readonly notIncluded: Commitment<
    readonly [Localized<string>, ...Localized<string>[]]
  >;
  readonly turnaround: Commitment<Localized<string>>;
};

export const PRICING_TIERS: readonly [PricingTier, ...PricingTier[]] = [
  {
    token: "landing-basic",
    serviceLine: "A",
    name: { es: "Landing" },
    audience: {
      es: "Negocios que necesitan presencia en una sola página.",
    },
    deliverables: [{ es: "Landing de una sola página" }],
    notIncluded: { status: "pending" },
    turnaround: { status: "pending" },
  },
  {
    token: "landing-standard",
    serviceLine: "A",
    name: { es: "Corporativo" },
    audience: {
      es: "Negocios que necesitan un sitio con varias secciones.",
    },
    deliverables: [{ es: "Sitio corporativo de varias secciones" }],
    notIncluded: { status: "pending" },
    turnaround: { status: "pending" },
  },
  {
    token: "landing-premium",
    serviceLine: "A",
    name: { es: "Corporativo Plus" },
    audience: {
      es: "Negocios que necesitan un sitio corporativo de mayor alcance que el plan Corporativo.",
    },
    // The studio has not itemised what "mayor alcance" includes beyond the
    // standard tier — no blog/SEO/integration claim is made here. See this
    // module's top doc comment.
    deliverables: [
      { es: "Sitio corporativo de mayor alcance (el detalle se conversa al cotizar)" },
    ],
    notIncluded: { status: "pending" },
    turnaround: { status: "pending" },
  },
  {
    token: "microsite-basic",
    serviceLine: "C",
    name: { es: "Biolink" },
    audience: {
      es: "Perfiles y negocios que necesitan un enlace único para redes sociales.",
    },
    deliverables: [{ es: "Página de biolink" }],
    notIncluded: { status: "pending" },
    turnaround: { status: "pending" },
  },
  {
    token: "microsite-event",
    serviceLine: "C",
    name: { es: "Microsite de evento" },
    audience: {
      es: "Personas organizando un evento puntual (por ejemplo, una boda).",
    },
    deliverables: [{ es: "Microsite de invitación para un evento" }],
    notIncluded: { status: "pending" },
    turnaround: { status: "pending" },
  },
];

/**
 * Line B, quote-on-request. See `specs/pricing/spec.md`'s "Line B
 * Quote-on-Request Contract" — no fixed tiers, only typical shapes, the
 * variables that move price, the process, and a starting-from floor.
 *
 * `typicalShapes` is derived directly from `SERVICE_LINES.B.description`
 * (`lib/content/service-lines.ts`), not a new claim. `variables` names the
 * four categories `specs/pricing/spec.md`'s own requirement text uses as the
 * example enumeration for this contract (integrations, roles/permissions,
 * data volume, auth) — a general, honest statement about what typically
 * moves the price of custom software, not a specific commitment about any
 * one project.
 *
 * **Structural note**: with fixed tiers at S/500–800 and this floor at
 * S/1,500, the gap between the fixed-price tiers and this quote-on-request
 * line is small — Line B reads as the next step up in scope, not a different
 * league. `components/pricing/quote-block.tsx` states this plainly rather
 * than overselling the distance.
 */
export type QuoteBlock = {
  readonly serviceLine: ServiceLine;
  readonly floorToken: PriceToken;
  readonly typicalShapes: readonly [Localized<string>, ...Localized<string>[]];
  readonly variables: readonly [Localized<string>, ...Localized<string>[]];
  readonly process: Localized<string>;
  readonly turnaround: Commitment<Localized<string>>;
};

export const QUOTE_BLOCK: QuoteBlock = {
  serviceLine: "B",
  floorToken: "app-from",
  typicalShapes: [
    { es: "Paneles de control internos" },
    { es: "Herramientas internas para un equipo" },
    { es: "Productos con lógica de negocio propia" },
  ],
  variables: [
    { es: "Cantidad de integraciones con otros sistemas" },
    { es: "Roles y permisos de usuario" },
    { es: "Volumen de datos a manejar" },
    { es: "Métodos de autenticación requeridos" },
  ],
  process: {
    es: "Conversamos el alcance y enviamos una cotización con el detalle de lo que incluye.",
  },
  turnaround: { status: "pending" },
};

/**
 * Line D, the two maintenance-retainer plans. Both share the studio-wide
 * commitments in `RETAINER_COMMITMENTS` (`lib/content/retainer.ts`) — this
 * module intentionally does NOT restate response window, scope model,
 * inclusions/exclusions, or cancellation terms; `components/pricing/
 * retainer-plans.tsx` reads them from that module directly, per this
 * task's own instruction to reuse rather than re-hardcode.
 *
 * **Open item, not invented**: the studio has not stated any difference in
 * scope, response priority, or hour allocation between `care-basic` and
 * `care-standard` beyond price. Both plans are modeled here as sharing
 * identical published commitments; if a real distinction exists, it is a
 * later addition to this array, not a fabricated one now.
 */
export type RetainerPlan = {
  readonly token: PriceToken;
  readonly name: Localized<string>;
};

export const RETAINER_PLANS: readonly [RetainerPlan, RetainerPlan] = [
  { token: "care-basic", name: { es: "Care Básico" } },
  { token: "care-standard", name: { es: "Care Estándar" } },
];

/**
 * Cross-cutting terms (pricing page block 6). `alwaysIncluded`/`alwaysExtra`
 * restate the one settled process commitment (`PROCESS.revisionRoundsIncluded`
 * — 2 rounds included, further rounds quoted per round) rather than inventing
 * a longer list of inclusions/extras the studio has not stated.
 * `paymentSchedule` is honestly `pending` — not supplied this batch.
 */
export type PricingTerms = {
  readonly alwaysIncluded: readonly [Localized<string>, ...Localized<string>[]];
  readonly alwaysExtra: readonly [Localized<string>, ...Localized<string>[]];
  readonly paymentSchedule: Commitment<Localized<string>>;
};

export const PRICING_TERMS: PricingTerms = {
  alwaysIncluded: [
    {
      es: `${PROCESS.revisionRoundsIncluded} rondas de revisión por proyecto`,
    },
  ],
  alwaysExtra: [
    { es: "Rondas de revisión adicionales a las incluidas, cotizadas por ronda" },
  ],
  paymentSchedule: { status: "pending" },
};
