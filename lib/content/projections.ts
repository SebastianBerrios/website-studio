/**
 * Projections from the content model onto specific rendering contracts.
 *
 * See `openspec/changes/dev-services-website/design.md` §5, "The hero
 * receives a projection", and task 2.11. Zero React imports — these are
 * pure functions over `lib/content/**` data.
 */

import type { Locale } from "./locales";
import type { Consent, Evidence, Project } from "./types";
import type { ServiceLine } from "./service-lines";
import { PROJECTS } from "./projects";
import { caseStudyPath, landingAnchor } from "@/lib/links";

/**
 * The exact prop shape `HeroParallax` has always consumed. Preserved
 * unchanged per `specs/project-portfolio/spec.md`, "Hero Projection
 * Preserves Prop Contract".
 */
export type HeroProduct = {
  readonly title: string;
  readonly link: string;
  readonly thumbnail: string;
};

/**
 * A grid card for the landing's portfolio section (PR 3a's consumer).
 *
 * `link` is `undefined` when the card must render as a non-link — see
 * `portfolioLink()`'s doc comment below and task 3.4's critical constraint
 * in tasks.md. A component consuming this MUST NOT render an `<a>`/`<Link>`
 * when `link` is `undefined`.
 */
export type PortfolioCard = {
  readonly slug: string;
  readonly title: string;
  readonly summary: Project["summary"];
  readonly serviceLine: ServiceLine;
  readonly evidence: Evidence;
  readonly link: string | undefined;
};

/**
 * The public-facing label for a project, honouring its `consent` state.
 * Never returns `client` for anything other than `granted` +
 * `namedClient: true` — see design.md §5, "Consent gates identification".
 *
 * Returns `project.title` (the PROJECT's name), not `project.client`, even
 * when the client may be named. Two projects can share one client — `blucafe`
 * (the public site) and `blu` (that client's internal management system) both
 * have `client: "Blu Café"` — so labelling by client produced two identical
 * hero cards. That was three defects from one root cause: ambiguous UI labels,
 * two images with identical `alt` text, and colliding React keys, since
 * `HeroParallax` keys its cards by `product.title`.
 *
 * The client is still named wherever the project's own title names it, e.g.
 * "Sistema de gestión interno de Blu Café". For the three projects whose
 * `title` equals their `client`, the rendered label is unchanged.
 *
 * `checkUniqueHeroTitles` in `lib/content/invariants.ts` makes a future
 * collision a build failure rather than something a reviewer has to notice.
 */
function publicTitle(project: Project): string {
  const { consent } = project;
  switch (consent.status) {
    case "granted":
      // `namedClient` is deliberately not branched on here. When it is false
      // the label must not identify the client, and a `title` that embeds the
      // client's name would leak it — so that guarantee belongs in a check
      // over the data, not in a ternary that silently picks the same value
      // either way. `checkGrantedTitlesDoNotLeakClient` enforces it.
      return project.title;
    case "anonymised":
      return `${consent.industry} — ${consent.size}`;
    case "withheld":
      // Unreachable in practice: `publishableProjects()` filters these out
      // before this function is ever called. Kept exhaustive so a future
      // caller that skips the filter fails loudly instead of leaking a
      // withheld client's `client`/`title` field.
      throw new Error(
        `publicTitle() called on a withheld project ("${project.slug}") — ` +
          "withheld projects must never reach a rendering function. Filter " +
          "with publishableProjects() first.",
      );
    default: {
      const exhaustiveCheck: never = consent;
      throw new Error(`Unhandled consent status: ${String(exhaustiveCheck)}`);
    }
  }
}

/**
 * The link a visitor should follow for this project, from any surface.
 *
 * **Deviation from design.md §5's literal table** (`link: externalUrl when
 * evidence.state === 'live', else caseStudyPath(locale, slug)`), flagged
 * rather than silently applied. `/[locale]/proyectos/[slug]` does not exist
 * until PR 5, which under `stacked-to-main` ships strictly AFTER this PR
 * (tasks.md "Delivery order correction" reorders PR 4/PR 5 ahead of PR 3, but
 * PR 3 is not where the hero is wired — PR 2c is, and the hero is wired
 * before PR 5 in every ordering). The curated set already includes
 * non-"live" evidence projects today (e.g. "blu", `evidence.state:
 * "gated"`), so applying the design's literal rule here would render a real
 * dead link on `main` the moment PR 2c merges — the exact class of defect
 * this change set exists to remove (see specs/site-shell/spec.md, "Zero Dead
 * Internal Links": the built output must have zero dead internal links at
 * every point in the chain, not only after the last merge).
 *
 * Falls back to the landing's portfolio anchor instead, following the same
 * pattern PR 1 already established for this exact situation (`app/page.tsx`'s
 * former "Blu Finances" entry, `link: "/#proyectos"`). PR 5 (or PR 3a's
 * published-state derivation, task 3.4) must replace this fallback with
 * `caseStudyPath(locale, project.slug)` once that project's case study is
 * actually published — tracked as a follow-up in apply-progress.md, not left
 * silently broken.
 */
function publicLink(locale: Locale, project: Project): string {
  return project.evidence.state === "live"
    ? project.evidence.externalUrl
    : landingAnchor(locale, "proyectos");
}

/**
 * The portfolio grid's link derivation — deliberately different from the
 * hero's `publicLink()` above.
 *
 * `live` evidence always links externally, unconditionally: that URL is an
 * independently-verified third-party site (e.g. task 1.H2's checks), so it
 * is never gated by this project's OWN case-study route existing. This
 * matches `specs/project-portfolio/spec.md`'s "Evidence State Rendering"
 * table (`live` → "screenshot + external link").
 *
 * Every other evidence state (`gated`, `not-deployed`, `no-visual`) is a
 * candidate for an INTERNAL case-study link instead — but
 * `/[locale]/proyectos/[slug]` does not exist as a route in this repo state
 * at all (it ships in PR 5). Rendering a `<Link>`/`<a>` at that address
 * before the route exists is the exact class of defect this change set has
 * repeatedly had to fix (see this file's own `publicLink()` comment above,
 * and tasks.md's "Delivery order correction"). So this function returns
 * `undefined` — "no link" — unless `project.caseStudyPublished` is `true`.
 *
 * Today every project in `PROJECTS` has `caseStudyPublished: false`, so
 * every non-`live` grid card renders as a non-link — see tasks.md task 3.4's
 * critical constraint. `components/portfolio/project-card.tsx` is the
 * consumer that must not render an anchor when this returns `undefined`.
 */
function portfolioLink(locale: Locale, project: Project): string | undefined {
  if (project.evidence.state === "live") return project.evidence.externalUrl;
  return project.caseStudyPublished
    ? caseStudyPath(locale, project.slug)
    : undefined;
}

/** The primary media asset's `.src`, or `undefined` for `no-visual`. */
function primaryThumbnail(evidence: Evidence): string | undefined {
  return evidence.state === "no-visual" ? undefined : evidence.media[0].asset.src;
}

/**
 * Every project not `withheld`. This is the set case-study routes and the
 * sitemap enumerate over — broader than "featured" because a project can
 * be publishable without (yet) being in the curated hero/grid set.
 */
export function publishableProjects(): readonly Project[] {
  return PROJECTS.filter(
    (project): project is Project & { consent: Exclude<Consent, { status: "withheld" }> } =>
      project.consent.status !== "withheld",
  );
}

/**
 * The curated, `featured` project set — the same set the hero and the
 * portfolio grid both project from. See specs/project-portfolio/spec.md,
 * "Portfolio Grid Consistency With Hero".
 */
function featuredProjects(): readonly Project[] {
  return publishableProjects().filter((project) => project.featured);
}

/**
 * `HeroParallax`'s data source. Filters out `no-visual` projects — the
 * hero is an image grid, and a text-only card inside a parallax row is
 * incoherent (design.md §5). Those projects still appear in
 * `toPortfolioCards()`.
 */
export function toHeroProducts(locale: Locale): readonly HeroProduct[] {
  return featuredProjects()
    .filter((project) => project.evidence.state !== "no-visual")
    .toSorted((a, b) => a.order - b.order)
    .map((project) => {
      const thumbnail = primaryThumbnail(project.evidence);
      if (thumbnail === undefined) {
        // Unreachable given the filter above; kept as a loud runtime check
        // so a future edit to the filter fails immediately instead of
        // shipping an empty `thumbnail` to `next/image`.
        throw new Error(
          `Project "${project.slug}" has no media but was not filtered out of the hero projection.`,
        );
      }
      return {
        title: publicTitle(project),
        link: publicLink(locale, project),
        thumbnail,
      };
    });
}

/**
 * The landing's portfolio grid data source — the same curated set as the
 * hero, including `no-visual` entries the hero cannot show.
 */
export function toPortfolioCards(locale: Locale): readonly PortfolioCard[] {
  return featuredProjects()
    .toSorted((a, b) => a.order - b.order)
    .map((project) => ({
      slug: project.slug,
      title: publicTitle(project),
      summary: project.summary,
      serviceLine: project.serviceLine,
      evidence: project.evidence,
      link: portfolioLink(locale, project),
    }));
}
