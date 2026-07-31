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

export type Dictionary = {
  readonly hero: HeroDictionary;
  readonly services: ServicesDictionary;
  readonly process: ProcessDictionary;
  readonly portfolio: PortfolioDictionary;
  readonly authority: AuthorityDictionary;
  readonly retainer: RetainerDictionary;
  readonly notFound: NotFoundDictionary;
};
