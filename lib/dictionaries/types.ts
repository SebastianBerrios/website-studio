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

export type Dictionary = {
  readonly hero: HeroDictionary;
  readonly notFound: NotFoundDictionary;
};
