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
 * **Exclusions (task 4.1's deviation, now closed) — 2026-07-31**: the user
 * supplied the four exclusions the studio applies uniformly to every fixed
 * tier (Lines A and C): the studio publishes content the client supplies
 * rather than writing copy or shooting photography, domain/hosting are
 * registered and paid for by the client, the studio designs the site rather
 * than the brand (logo/identity), and integrations with external systems are
 * quoted separately. With every tier now carrying a real, non-empty
 * exclusions list, `PricingTier.notIncluded` is restored to `design.md` §5's
 * original guarantee — a required non-empty tuple, so an empty list is a
 * compile error again, not merely an honestly-rendered "pending" state. See
 * this file's `FIXED_TIER_EXCLUSIONS` constant and `design.md`'s dated
 * amendment to §5.
 *
 * **Turnaround — supplied for 3 of 5 fixed tiers, still honestly pending for
 * 2 (plus Line B's quote turnaround)**: the user supplied real business-day
 * figures for the three Line A tiers (`landing-basic`: 5, `landing-standard`:
 * 10, `landing-premium`: 15 — see `PRICING_TIERS`). The two Line C microsite
 * tiers (`microsite-basic`, `microsite-event`) were NOT supplied, and no
 * business-day figure for them is derivable from anything the studio actually
 * stated — price is not turnaround, and inventing a number by, say,
 * interpolating from the tiers' relative prices would be exactly the
 * fabrication this content model exists to prevent (see
 * `sdd/dev-services-website/apply-progress` for the full reasoning). Both
 * stay `{ status: "pending" }`, same as Line B's quote turnaround
 * (`QUOTE_BLOCK.turnaround`) and `PRICING_TERMS.paymentSchedule` below —
 * `turnaround` therefore stays `Commitment<Turnaround>`, NOT a required
 * field, even though `notIncluded` was restored to required. These are two
 * independent facts with two different supply states; one being complete
 * does not imply the other is.
 *
 * **The qualifier travels with the value.** A bare "N días hábiles" is
 * uncheckable: `lib/content/process.ts`'s `PROCESS.clientApprovalDeadlineBusinessDays`
 * gates 3 of the studio's 5 phases on the CLIENT's own approval, so a
 * turnaround figure that does not say what it measures reads as a promise the
 * studio could breach through no fault of its own the moment a client sits on
 * a review. `Turnaround` (below) is therefore never rendered as a bare number
 * — `formatTurnaround()` always appends "de trabajo del estudio, sin contar
 * los plazos de aprobación del cliente", the same "qualifier lives on the
 * data, not on a component's copy" discipline `PriceQualifier`/`formatMoney()`
 * already established one section below, for exactly the reason C3/C4
 * (verify-report-final.md) both happened: splitting a figure from what it
 * means is how a studio ends up publishing a monthly retainer as a one-off.
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
 * How long a fixed tier or Line B quote takes, always expressed in business
 * days of the STUDIO's own work — never a calendar-day promise, and never a
 * bare number a future surface could render without its qualifier (see this
 * module's top doc comment, "The qualifier travels with the value"). Modeled
 * as its own type rather than `Localized<string>` for the same reason `Money`
 * is a type rather than a formatted string: the qualifying clause is fixed
 * Spanish policy text, not per-tier content, so it belongs in one function
 * every consumer calls through, not duplicated into five tiers' worth of
 * hand-written sentences that could drift out of sync with each other.
 */
export type Turnaround = {
  readonly businessDays: number;
};

/**
 * Spanish rendering. Lives here, not in `lib/dictionaries/es.ts`, for the
 * same reason `QUALIFIER_ES` above does — splitting a figure from what it
 * measures is exactly how C3/C4 (verify-report-final.md) happened. When a
 * second locale ships, move this behind the dictionary together with
 * `formatMoney()`.
 */
export function formatTurnaround(turnaround: Turnaround): string {
  return `${turnaround.businessDays} días hábiles de trabajo del estudio, sin contar los plazos de aprobación del cliente`;
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
  /**
   * Required, non-empty — restored to `design.md` §5's original guarantee
   * now that the studio has supplied real exclusions for every fixed tier
   * (see this module's top doc comment and `FIXED_TIER_EXCLUSIONS` below).
   * An empty list is a compile error again, not an honestly-rendered
   * "pending" state.
   */
  readonly notIncluded: readonly [Localized<string>, ...Localized<string>[]];
  /**
   * NOT restored alongside `notIncluded` — two of five tiers' turnaround
   * figures were not supplied and are not derivable from anything the
   * studio stated (see this module's top doc comment), so this stays an
   * honest `Commitment<Turnaround>` rather than a required field.
   */
  readonly turnaround: Commitment<Turnaround>;
};

/**
 * The four exclusions the studio applies uniformly to every fixed tier
 * (Lines A and C) — supplied directly by the user (2026-07-31), not derived
 * or invented. One exported constant every tier reads through, so the five
 * tiers cannot drift into five independently-worded (and possibly
 * inconsistent) exclusion lists — same discipline as
 * `PROCESS.revisionRoundsIncluded` above.
 */
const FIXED_TIER_EXCLUSIONS: readonly [Localized<string>, ...Localized<string>[]] = [
  {
    es: "Redacción de textos y producción de fotografías: se publica el contenido que el cliente entrega.",
  },
  {
    es: "Dominio y hosting: se configuran como parte del proyecto, pero se registran y se pagan a nombre del cliente.",
  },
  {
    es: "Diseño de logo e identidad visual: el estudio diseña el sitio, no la marca.",
  },
  {
    es: "Integraciones con sistemas externos (pasarela de pago, CRM, ERP, facturación electrónica): se cotizan por separado.",
  },
];

export const PRICING_TIERS: readonly [PricingTier, ...PricingTier[]] = [
  {
    token: "landing-basic",
    serviceLine: "A",
    name: { es: "Landing" },
    audience: {
      es: "Negocios que necesitan presencia en una sola página.",
    },
    deliverables: [{ es: "Landing de una sola página" }],
    notIncluded: FIXED_TIER_EXCLUSIONS,
    turnaround: { status: "set", value: { businessDays: 5 } },
  },
  {
    token: "landing-standard",
    serviceLine: "A",
    name: { es: "Corporativo" },
    audience: {
      es: "Negocios que necesitan un sitio con varias secciones.",
    },
    deliverables: [{ es: "Sitio corporativo de varias secciones" }],
    notIncluded: FIXED_TIER_EXCLUSIONS,
    turnaround: { status: "set", value: { businessDays: 10 } },
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
    notIncluded: FIXED_TIER_EXCLUSIONS,
    turnaround: { status: "set", value: { businessDays: 15 } },
  },
  {
    token: "microsite-basic",
    serviceLine: "C",
    name: { es: "Biolink" },
    audience: {
      es: "Perfiles y negocios que necesitan un enlace único para redes sociales.",
    },
    deliverables: [{ es: "Página de biolink" }],
    notIncluded: FIXED_TIER_EXCLUSIONS,
    // Not supplied by the user, and not derivable from the three Line A
    // figures — a biolink's scope is not "a smaller landing page" in any
    // stated ratio, and inferring one from price alone (S/100 vs S/500)
    // would be exactly the fabrication this content model exists to
    // prevent. See this module's top doc comment.
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
    notIncluded: FIXED_TIER_EXCLUSIONS,
    // Same reasoning as `microsite-basic` above: not supplied, and not
    // safely derivable from the Line A figures. See this module's top doc
    // comment.
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
  /** Not supplied — same `Turnaround` type as the fixed tiers, still pending. */
  readonly turnaround: Commitment<Turnaround>;
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
