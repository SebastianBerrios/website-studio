/**
 * Core content-model types shared by every `lib/content/**` data module.
 *
 * See `openspec/changes/dev-services-website/design.md` D9 and §5, and
 * `specs/content-model/spec.md`. Zero React imports — these are pure data
 * shapes, importable from anywhere (including a build-time checker) and
 * never bundled into a client component.
 */

import type { Locale } from "./locales";
import type { ServiceLine } from "./service-lines";
import type { StaticImageData } from "next/image";

/**
 * A value that must be supplied per locale. With `LOCALES = ['es']` this is
 * effectively a one-key object today — nearly free. The day a second locale
 * is added to `LOCALES`, every un-translated `Localized<T>` site becomes a
 * compile error, and the error list *is* the translation backlog.
 *
 * See design.md §5, "Why this is the load-bearing i18n decision".
 */
export type Localized<T> = Record<Locale, T>;

/**
 * One locally-imported media asset. `asset` is a static `import` of a file
 * under `public/`, never a string path — a missing file becomes a build
 * error instead of a silent runtime 404 (design.md §8).
 */
export type MediaAsset = {
  readonly asset: StaticImageData;
  readonly alt: Localized<string>;
};

/**
 * Whether/how a client may be identified in copy. Consent gates
 * identification, not the project's existence: a `withheld` project is
 * simply excluded from `publishableProjects()` (`lib/content/projections.ts`,
 * PR 2b) rather than rendered with blanked-out fields.
 *
 * See specs/content-model/spec.md, "Consent Field Semantics".
 */
export type Consent =
  | { readonly status: "granted"; readonly namedClient: boolean }
  | {
      readonly status: "anonymised";
      readonly industry: string;
      readonly size: string;
    }
  | { readonly status: "withheld" };

/**
 * A claimed result. `metric` requires a `source`, so a numeric or
 * percentage claim can never exist without one attached — see design.md §5,
 * "Never invent a metric" and `specs/case-study/spec.md`, "No Invented
 * Metric".
 */
export type Outcome =
  | { readonly kind: "metric"; readonly value: string; readonly source: string }
  | { readonly kind: "qualitative"; readonly statement: Localized<string> };

/**
 * What a visitor can actually see/reach for a project, and what that state
 * may honestly claim. Each variant's required fields make a half-filled
 * state unrepresentable:
 *
 * - `live`, `gated`, and `not-deployed` all require at least one media
 *   asset (`readonly [MediaAsset, ...MediaAsset[]]`) — a state claiming
 *   visual evidence must actually carry a picture.
 * - `no-visual` requires an empty media tuple — there is no way to smuggle
 *   a broken-image frame into this state.
 * - `gated` additionally requires a `disclosure` explaining the gate;
 *   `live` additionally requires the `externalUrl` it points at.
 *
 * See design.md §5, "Evidence state matches reality", and
 * `specs/content-model/spec.md`, "Evidence Field".
 */
export type Evidence =
  | {
      readonly state: "live";
      readonly externalUrl: string;
      readonly media: readonly [MediaAsset, ...MediaAsset[]];
    }
  | {
      readonly state: "gated";
      readonly disclosure: Localized<string>;
      readonly media: readonly [MediaAsset, ...MediaAsset[]];
    }
  | {
      readonly state: "not-deployed";
      readonly media: readonly [MediaAsset, ...MediaAsset[]];
    }
  | {
      readonly state: "no-visual";
      readonly media: readonly [];
    };

/**
 * A portfolio entry. Superset of the legacy `{ title, link, thumbnail }`
 * shape documented in `openspec/config.yaml` — `link` and `thumbnail` are
 * preserved verbatim so existing consumers (`HeroParallax`'s `ProductCard`)
 * keep working unchanged. See specs/content-model/spec.md, "Legacy shape is
 * preserved, not replaced".
 *
 * Two fields are deliberately absent from this shape, both per design.md §5:
 *
 * - `approach` (the long case-study prose) is NOT a field here. It is
 *   resolved separately via `getProjectApproach(slug)` (PR 2b's
 *   `projects/approach/loader.ts`), so swapping the prose storage mechanism
 *   (e.g. for MDX) later changes one loader file, never this type.
 * - A top-level `externalUrl`/`media` pair is NOT duplicated here. Both
 *   live inside the matching `Evidence` variant instead, because their
 *   required-ness differs per evidence state — keeping one field for two
 *   evidence states to disagree about would be its own integrity bug.
 */
export type Project = {
  readonly slug: string;
  readonly title: string;
  readonly client: string;
  readonly serviceLine: ServiceLine;
  readonly summary: Localized<string>;
  readonly problem: Localized<string>;
  readonly role: Localized<string>;
  readonly stack: readonly string[];
  readonly outcome: Outcome;
  readonly evidence: Evidence;
  readonly consent: Consent;
  readonly featured: boolean;
  readonly order: number;
  /**
   * Whether `/[locale]/proyectos/{slug}` actually exists as a real,
   * populated route. `false` for every project until PR 5 (or one of its
   * task 5.5 follow-ups) ships that project's write-up and the route itself.
   *
   * This is deliberately a field on the entity, not something derived from
   * membership in `PROJECTS` or from `featured`/`consent` — those answer
   * "is this project curated/publishable", a different question from "does
   * a case-study page exist for it right now". `toPortfolioCards()`
   * (`lib/content/projections.ts`) uses this flag, not the project list, to
   * decide whether a grid card renders as a link — see
   * `specs/landing-narrative/spec.md`, "Proyectos Section Contract", and
   * task 3.4's critical constraint in tasks.md.
   */
  readonly caseStudyPublished: boolean;
  /** Legacy field, preserved for `ProductCard`'s existing prop contract. */
  readonly link: string;
  /** Legacy field, preserved for `ProductCard`'s existing prop contract. */
  readonly thumbnail: string;
};
