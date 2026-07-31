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
 * Site chrome — `components/layout/site-header.tsx`. Renders on every route
 * under `app/[locale]/**`, not a landing section, so it is keyed separately
 * from the numbered sections below.
 */
export type SiteHeaderDictionary = {
  readonly brand: string;
  readonly projectsLink: string;
  readonly pricingLink: string;
  readonly whatsappLink: string;
};

/**
 * Site chrome — `components/layout/site-footer.tsx`. `brand`/`projectsLink`/
 * `whatsappLink` currently repeat `header`'s values; kept as separate keys
 * (rather than shared with `header`) because the header and footer are
 * independent components and either copy may diverge later without forcing
 * a shared-type refactor.
 */
export type SiteFooterDictionary = {
  readonly brand: string;
  readonly tagline: string;
  readonly projectsLink: string;
  readonly pricingLink: string;
  readonly whatsappLink: string;
};

/**
 * Landing section 2, "Servicios" (landing-narrative spec, "Servicios Section
 * Contract"). Each card renders two CTAs: `proofCta` (to the Proyectos grid)
 * and, as of task 4.8, `pricingCta` (to that line's block on
 * `/[locale]/precios`) — see `components/sections/services.tsx`'s doc
 * comment for why `pricingCta` was absent until PR 4 shipped the route.
 */
export type ServicesDictionary = {
  readonly heading: string;
  readonly proofCta: string;
  readonly pricingCta: string;
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

/**
 * Landing section 3, "Proceso" (landing-narrative spec, "Proceso Section
 * Contract", task 3.2). The phase names/descriptions, the
 * `requiresApproval` flag, and `clientApprovalDeadlineBusinessDays` are
 * domain facts and live in `lib/content/process.ts`; these keys are
 * structural UI labels around that data — the heading, the per-phase
 * approval badge, the sentence wrapping `PROCESS.revisionRoundsIncluded`,
 * and the prefix/suffix wrapping the approval-deadline number.
 */
export type ProcessDictionary = {
  readonly heading: string;
  readonly approvalBadge: string;
  readonly revisionsLabel: string;
  readonly revisionsExtra: string;
  readonly approvalDeadlinePrefix: string;
  readonly approvalDeadlineSuffix: string;
};

/**
 * Landing section 5, "Autoridad" (trust-signals spec, "Academy Block
 * Placement" / "Academy No-Link State While Undeployed"). The academy's
 * name/description are domain facts and live in `lib/content/authority.ts`;
 * `heading`/`intro` are structural framing copy around that data, and
 * `visitCta` is a UI label reserved for the `linked` state — unused today
 * because `ACADEMY.state` is `no-link`, but declared here so upgrading the
 * academy's state later needs no new dictionary key.
 */
export type AuthorityDictionary = {
  readonly heading: string;
  readonly intro: string;
  readonly visitCta: string;
};

/**
 * Landing section 7, "Retainer/Mantenimiento" (landing-narrative spec,
 * "Retainer Section Contract"; trust-signals spec, "Retainer Published
 * Commitments" / "Itemized Maintenance Scope"). The commitment values
 * themselves are domain facts and live in `lib/content/retainer.ts`'s
 * `RETAINER_COMMITMENTS`; these keys are the structural headings/labels
 * around that data.
 */
export type RetainerDictionary = {
  readonly heading: string;
  readonly responseHeading: string;
  readonly includedHeading: string;
  readonly excludedHeading: string;
  readonly cancellationLabel: string;
};

/**
 * The pricing page's FAQ block (`components/pricing/faq.tsx`), task 4.5.
 * `specs/pricing/spec.md`'s "FAQ Objection Coverage" names four mandatory
 * objections. Three are answered from settled facts; `codeOwnership` is
 * honestly `Pending*` — the studio has not been asked/has not supplied a
 * code-ownership policy this batch. See `components/pricing/faq.tsx`'s doc
 * comment and apply-progress.md's open items.
 */
export type PricingFaqDictionary = {
  readonly heading: string;
  readonly priceReasonQuestion: string;
  readonly priceReasonAnswer: string;
  readonly laterChangesQuestion: string;
  readonly laterChangesAnswer: string;
  readonly codeOwnershipQuestion: string;
  readonly codeOwnershipPendingAnswer: string;
  readonly howToLeaveQuestion: string;
  readonly howToLeaveAnswer: string;
};

/**
 * The pricing page (`/[locale]/precios`, `specs/pricing/spec.md`). Domain
 * facts (figures, tier anatomy, terms) live in `lib/content/pricing.ts`;
 * these keys are the structural headings/labels around that data, following
 * the same dividing line every other section already uses.
 */
export type PricingDictionary = {
  readonly heading: string;
  readonly introHeading: string;
  readonly introBody: string;
  readonly launchNotePrefix: string;
  readonly launchNoteSuffix: string;
  readonly lineAHeading: string;
  readonly lineCHeading: string;
  readonly lineBHeading: string;
  readonly lineDHeading: string;
  readonly audienceLabel: string;
  readonly deliverablesLabel: string;
  readonly notIncludedHeading: string;
  readonly notIncludedPendingNote: string;
  readonly turnaroundLabel: string;
  readonly turnaroundPendingNote: string;
  readonly revisionsPrefix: string;
  readonly revisionsSuffix: string;
  readonly quoteShapesHeading: string;
  readonly quoteVariablesHeading: string;
  readonly quoteProcessHeading: string;
  readonly quoteFloorPrefix: string;
  readonly termsHeading: string;
  readonly alwaysIncludedHeading: string;
  readonly alwaysExtraHeading: string;
  readonly paymentScheduleLabel: string;
  readonly paymentSchedulePendingNote: string;
  readonly ctaHeading: string;
  readonly ctaBody: string;
  readonly ctaButtonLabel: string;
  readonly faq: PricingFaqDictionary;
};

/**
 * Landing section 6, "Precios summary" (`components/sections/
 * pricing-summary.tsx`, task 3.8). `specs/landing-narrative/spec.md`'s
 * "Precios Summary Section Contract" requires this to show only a subset of
 * the full tier anatomy plus a link to `/[locale]/precios` — so this
 * dictionary is deliberately smaller than `PricingDictionary` above, not a
 * duplicate of it.
 */
export type PricingSummaryDictionary = {
  readonly heading: string;
  readonly intro: string;
  readonly viewFullPricingLink: string;
};

export type Dictionary = {
  readonly header: SiteHeaderDictionary;
  readonly footer: SiteFooterDictionary;
  readonly hero: HeroDictionary;
  readonly services: ServicesDictionary;
  readonly process: ProcessDictionary;
  readonly portfolio: PortfolioDictionary;
  readonly authority: AuthorityDictionary;
  readonly retainer: RetainerDictionary;
  readonly pricing: PricingDictionary;
  readonly pricingSummary: PricingSummaryDictionary;
  readonly notFound: NotFoundDictionary;
};
