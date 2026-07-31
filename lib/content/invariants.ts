/**
 * Build-time content-integrity assertion.
 *
 * See `openspec/changes/dev-services-website/design.md` §6, "Four
 * enforcement layers, and exactly what each cannot catch", and task 2.12.
 *
 * `import "server-only"` — this module is meant to run once per prerendered
 * locale (`app/[locale]/layout.tsx`, wired in PR 2c) and in `app/sitemap.ts`,
 * never in a Client Component.
 *
 * ---
 *
 * **What this file covers, and what it explicitly does NOT cover.**
 *
 * This is a data-integrity gate, not a rendering or visual gate. It answers
 * "is the content model internally consistent?", never "does the page look
 * right?". It cannot and does not catch: broken layouts, the parallax at
 * any given entry count, the form's no-JS path, responsive breakpoints, a11y
 * issues, or whether a stub `[PENDIENTE]` string has since become real,
 * plausible-looking prose. All of those need a human, a browser, or a test
 * runner this project does not have (design.md risk 8; proposal §2.2).
 *
 * The checks below:
 *
 * 1. **Unique slugs** — no two `PROJECTS` entries share a `slug`
 *    (specs/content-model/spec.md, "Slug Uniqueness").
 * 2. **No internal link resolves to `/` or `/{locale}`** — checked against
 *    every locale's `toHeroProducts()` output (project-portfolio spec, "No
 *    Self-Referential Links").
 * 3. **Every non-retainer service line has at least one project** — checked
 *    against the full `PROJECTS` list, not only the publishable subset, per
 *    the literal wording of "Every non-retainer line has proof".
 * 4. **No empty `Localized<string>` value** — every locale-keyed string
 *    field this module can see (`summary`, `problem`, `role`,
 *    `outcome.statement` when qualitative, `evidence.disclosure` when
 *    gated) must be non-blank for every configured locale. This catches an
 *    accidentally empty string; it does NOT catch a `[PENDIENTE]` stub
 *    still being a stub — that is a content-review concern, not a
 *    data-integrity one, and deliberately not what "empty" means here.
 * 5. **Non-empty `approach` per project** — same "empty string", not
 *    "still a stub", distinction as above; resolved via the async loader,
 *    so this check is itself `async`.
 * 6. **Hero projection has at least `HERO_FLOOR` entries** — per every
 *    locale's `toHeroProducts()` (design.md D4/§13 risk 1 introduced a floor
 *    of 4; the `fix/content-honesty` slice lowered it to 3 as a documented,
 *    temporary launch-quality signal — see the constant's own comment).
 * 7. **Evidence/media shape** — mostly a compile-time guarantee already
 *    (`Evidence`'s discriminated union in `lib/content/types.ts` makes a
 *    mismatched state/media pair a type error before this file ever runs).
 *    The runtime check here is deliberately redundant defense-in-depth in
 *    case a future dynamic content source bypasses the type system.
 * 8. **Pending price/currency reaching production** — the logic is written
 *    below but gated by `PRICE_INTEGRITY_CHECK_ACTIVE`. Every `PRICES`
 *    entry is honestly `pending` until task 4.H1 supplies real figures
 *    (`lib/content/pricing.ts`), and PR 2c/PR 3 must still build and ship to
 *    production in the meantime (`stacked-to-main`). A check that requires
 *    every price to be `set` before any price has been decided would fail
 *    every intermediate build — exactly the self-defeating assertion
 *    design.md §6 explicitly rejected. Task 4.10 flips the flag once PR 4
 *    populates real figures.
 */

import "server-only";

import { LOCALES } from "./locales";
import { PROJECTS } from "./projects";
import { toHeroProducts } from "./projections";
import { PRICES } from "./pricing";
import { SERVICE_LINES, type ServiceLine } from "./service-lines";
import { getProjectApproach } from "./projects/approach/loader";
import { isExternalHref } from "@/lib/links";
import type { ProjectSlug } from "./projects";

/**
 * Task 4.10 flips this to `true` once PR 4 populates real price figures in
 * `lib/content/pricing.ts`. See the file header, point 8.
 */
const PRICE_INTEGRITY_CHECK_ACTIVE = false;

/**
 * Minimum hero entry count. Lowered from the original design floor of 4 to
 * 3 by the `fix/content-honesty` remediation slice, which honestly demoted
 * `blu` to `no-visual` (unconsented capture, finding C1) and `atemporal` to
 * `not-deployed` (domain does not resolve, finding C2) rather than
 * fabricating a fourth entry to keep the old floor. This is a **launch-
 * quality signal, not a permanent target**: it exists so a future accidental
 * drop to 0-2 entries still fails the build loudly, not so 3 is treated as
 * good enough. Raise it back toward 4+ as real captures and consent (tasks
 * 3.H1/3.H2) land. See `sdd/dev-services-website/verify-report.md` §7.
 */
const HERO_FLOOR = 3;

/** The one service line that legitimately has no project proof. */
const LINE_EXEMPT_FROM_PROOF: ServiceLine = "D";

function isStrictMode(): boolean {
  if (process.env.SITE_CONTENT_GATE === "warn") return false;
  return process.env.VERCEL_ENV === "production";
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function checkUniqueSlugs(violations: string[]): void {
  const seen = new Set<string>();
  for (const project of PROJECTS) {
    if (seen.has(project.slug)) {
      violations.push(`Duplicate project slug: "${project.slug}".`);
    }
    seen.add(project.slug);
  }
}

function checkNoSelfReferentialLinks(violations: string[]): void {
  for (const locale of LOCALES) {
    for (const product of toHeroProducts(locale)) {
      if (product.link === "/" || product.link === `/${locale}`) {
        violations.push(
          `Project "${product.title}" resolves to a self-referential link ("${product.link}") for locale "${locale}".`,
        );
      }
    }
  }
}

/**
 * Every internal hero link must resolve to something that actually exists.
 *
 * This is the real compensating control for the `product.link as Route` cast
 * in `components/ui/hero-parallax.tsx`. The preserved `{ title, link,
 * thumbnail }` prop contract types `link` as `string` because it holds either
 * an external URL or an internal route, and no single `Route` type covers
 * both — so `typedRoutes` cannot check it structurally. That check has to
 * happen here instead.
 *
 * `checkNoSelfReferentialLinks` does NOT cover this. It only catches a link
 * equal to `/` or `/{locale}`. Route existence is a different property.
 *
 * LIVE_TARGETS must be extended as each slice lands: `/{locale}/precios` in
 * PR 4, `/{locale}/proyectos/{slug}` in PR 5, and the `#precios` anchor when
 * the pricing summary section ships in PR 3b. A link added before its target
 * fails the build — which is the point, since that exact mistake has already
 * been caught four times in this change set.
 */
function checkInternalLinksResolve(violations: string[]): void {
  for (const locale of LOCALES) {
    const liveTargets = new Set<string>([`/${locale}`, `/${locale}#proyectos`]);
    for (const product of toHeroProducts(locale)) {
      // External hrefs are deliberately NOT reachability-checked here. This
      // is the exact gap finding C2 (`sdd/dev-services-website/verify-report.md`)
      // exploited: `atemporalarq.com` was `evidence.state: "live"` with a
      // dead DNS entry, and this loop's `continue` never saw it. It stays
      // uncovered on purpose, not by oversight — a build-time DNS/HTTP probe
      // of a third party's domain is a NETWORK CALL during `next build`:
      // non-deterministic (the same build can pass or fail depending on
      // network conditions unrelated to any code change — S2 already
      // documents `next build` being flaky enough without adding a live
      // egress dependency), slow, and often unavailable in CI/build
      // sandboxes that block outbound network access entirely. A check that
      // sometimes fails for reasons that have nothing to do with the commit
      // being built is worse than no check — it teaches reviewers to retry
      // past red builds. External liveness is a periodic HUMAN/product
      // verification (see task 1.H2 and this same finding), not a
      // build-time gate; do not add automated coverage for it here without
      // first solving that non-determinism.
      if (isExternalHref(product.link)) continue;
      if (!liveTargets.has(product.link)) {
        violations.push(
          `Project "${product.title}" links to "${product.link}", which is not a live target for locale "${locale}". ` +
            `Either the route/anchor has not shipped yet, or LIVE_TARGETS in checkInternalLinksResolve needs updating.`,
        );
      }
    }
  }
}

function checkServiceLineProof(violations: string[]): void {
  const linesWithProof = new Set<ServiceLine>(PROJECTS.map((p) => p.serviceLine));
  for (const line of Object.keys(SERVICE_LINES) as ServiceLine[]) {
    if (line === LINE_EXEMPT_FROM_PROOF) continue;
    if (!linesWithProof.has(line)) {
      violations.push(`Service line "${line}" has no associated project.`);
    }
  }
}

function checkNoEmptyLocalizedValues(violations: string[]): void {
  for (const project of PROJECTS) {
    for (const locale of LOCALES) {
      if (isBlank(project.summary[locale])) {
        violations.push(`Project "${project.slug}" has an empty "summary" for locale "${locale}".`);
      }
      if (isBlank(project.problem[locale])) {
        violations.push(`Project "${project.slug}" has an empty "problem" for locale "${locale}".`);
      }
      if (isBlank(project.role[locale])) {
        violations.push(`Project "${project.slug}" has an empty "role" for locale "${locale}".`);
      }
      if (project.outcome.kind === "qualitative" && isBlank(project.outcome.statement[locale])) {
        violations.push(`Project "${project.slug}" has an empty qualitative "outcome.statement" for locale "${locale}".`);
      }
      if (project.evidence.state === "gated" && isBlank(project.evidence.disclosure[locale])) {
        violations.push(`Project "${project.slug}" has an empty "evidence.disclosure" for locale "${locale}".`);
      }
    }
  }
}

async function checkNonEmptyApproach(violations: string[]): Promise<void> {
  await Promise.all(
    PROJECTS.map(async (project) => {
      // `PROJECTS` is typed `readonly Project[]` (task 2.8), so `slug` is
      // widened to plain `string` at this module boundary even though every
      // entry is authored alongside `PROJECT_SLUGS` in the same file. The
      // cast below is safe under that authored-together invariant; the
      // `default` branch in `getProjectApproach()`'s switch is what catches
      // a slug drifting out of sync in practice.
      const { approach } = await getProjectApproach(project.slug as ProjectSlug);
      for (const locale of LOCALES) {
        if (isBlank(approach[locale])) {
          violations.push(`Project "${project.slug}" has an empty "approach" for locale "${locale}".`);
        }
      }
    }),
  );
}

function checkHeroFloor(violations: string[]): void {
  for (const locale of LOCALES) {
    const count = toHeroProducts(locale).length;
    if (count < HERO_FLOOR) {
      violations.push(
        `Hero projection for locale "${locale}" has only ${count} entries; the floor is ${HERO_FLOOR}.`,
      );
    }
  }
}

function checkEvidenceMediaShape(violations: string[]): void {
  // Redundant with the compile-time guarantee in `lib/content/types.ts`'s
  // `Evidence` union (see file header, point 7) — written for
  // defense-in-depth, not because it can currently fail.
  for (const project of PROJECTS) {
    const { evidence } = project;
    if (evidence.state === "no-visual" && evidence.media.length !== 0) {
      violations.push(`Project "${project.slug}" is "no-visual" but carries media.`);
    }
    if (evidence.state !== "no-visual" && evidence.media.length === 0) {
      violations.push(`Project "${project.slug}" is "${evidence.state}" but carries no media.`);
    }
  }
}

function checkPendingPricesInProduction(violations: string[]): void {
  if (!PRICE_INTEGRITY_CHECK_ACTIVE) return;
  for (const [token, entry] of Object.entries(PRICES)) {
    if (entry.status === "pending") {
      violations.push(`Price token "${token}" is still "pending" in a production build.`);
    }
  }
}

/**
 * Runs every check above. Throws in strict mode (`VERCEL_ENV === "production"`
 * unless `SITE_CONTENT_GATE=warn`); otherwise logs a warning and returns.
 *
 * `async` because approach resolution (point 5) is async.
 */
export async function assertContentInvariants(): Promise<void> {
  const violations: string[] = [];

  checkUniqueSlugs(violations);
  checkNoSelfReferentialLinks(violations);
  checkInternalLinksResolve(violations);
  checkServiceLineProof(violations);
  checkNoEmptyLocalizedValues(violations);
  await checkNonEmptyApproach(violations);
  checkHeroFloor(violations);
  checkEvidenceMediaShape(violations);
  checkPendingPricesInProduction(violations);

  if (violations.length === 0) return;

  const message = `Content integrity check failed:\n${violations.map((v) => `  - ${v}`).join("\n")}`;

  if (isStrictMode()) {
    throw new Error(message);
  }
  console.warn(message);
}
