/**
 * Per-locale copy dictionary shape.
 *
 * See `openspec/changes/dev-services-website/design.md` §5, "Dictionary vs
 * content — the dividing line", and `specs/content-model/spec.md`, "Locale
 * Dictionary Structure". This is the chrome/copy layer: section headings,
 * labels, button text — never domain facts (those live in
 * `lib/content/**`).
 */

export type HeroDictionary = {
  /** The hero heading, as its two rendered lines (see hero-parallax.tsx's
   * original markup: a `<br />` between them). */
  readonly heading: readonly [string, string];
  readonly subtitle: string;
  readonly cta: string;
};

export type NotFoundDictionary = {
  readonly heading: string;
  readonly message: string;
  readonly backLink: string;
};

/**
 * Landing section 2, "Servicios" (landing-narrative spec, "Servicios Section
 * Contract"). `proofCta` is the single CTA every service card renders —
 * see `components/sections/services.tsx`'s doc comment for why this PR does
 * not also render a pricing-block link (`/[locale]/precios` and the landing's
 * Precios summary section both ship in slices excluded from this batch).
 */
export type ServicesDictionary = {
  readonly heading: string;
  readonly proofCta: string;
};

/**
 * Landing section 4, "Proyectos" (landing-narrative spec, "Proyectos Section
 * Contract"). `gatedNote`/`notDeployedNote` are the generic, state-level
 * labels `components/portfolio/evidence.tsx` renders alongside each
 * project's own specific `evidence.disclosure` text — structural UI copy,
 * not a domain fact, so it belongs here rather than in `lib/content/**`.
 */
export type PortfolioDictionary = {
  readonly heading: string;
  readonly gatedNote: string;
  readonly notDeployedNote: string;
};

export type Dictionary = {
  readonly hero: HeroDictionary;
  readonly services: ServicesDictionary;
  readonly portfolio: PortfolioDictionary;
  readonly notFound: NotFoundDictionary;
};
