/**
 * Pure link-classification and path-building helpers.
 *
 * See `openspec/changes/dev-services-website/design.md` decisions D6, D9,
 * and task 2.16.
 */

import type { Locale } from "@/lib/content/locales";
import type { ServiceLine } from "@/lib/content/service-lines";

/**
 * Returns `true` when `href` points at an external destination — a URL with
 * an explicit protocol (`https://`, `//`, etc.) or a `mailto:`/`tel:` scheme —
 * and `false` for internal same-origin paths and anchors.
 */
export function isExternalHref(href: string): boolean {
  return (
    /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) ||
    /^(?:mailto|tel):/i.test(href)
  );
}

/**
 * The internal route for a project's case study. Routing itself
 * (`app/[locale]/proyectos/[slug]`) does not exist until PR 2c/PR 5 ship —
 * this helper only builds the path string that will resolve once it does.
 */
export function caseStudyPath(locale: Locale, slug: string): string {
  return `/${locale}/proyectos/${slug}`;
}

/**
 * The internal route for the pricing page. Return type is the template
 * literal type `` `/${Locale}/precios` ``, not widened to `string` — task
 * 4.6's hard constraint against adding a new `as Route` cast at any call
 * site meant fixing this function's typing instead (design.md's own
 * Next.js facts table: typed routes accept "matching template literals...
 * but not a bare `string`"). Every `<Link href={pricingPath(locale)}>` call
 * site type-checks against the generated `Route` union with no cast.
 */
export function pricingPath(locale: Locale): `/${Locale}/precios` {
  return `/${locale}/precios`;
}

/**
 * Maps each `ServiceLine` to its literal anchor-id fragment. A plain object
 * lookup keeps the union of possible ids at the type level (via `as const
 * satisfies`), the same discipline `SERVICE_LINES`/`PRICES` already use,
 * rather than computing the id at runtime with `.toLowerCase()` (which
 * TypeScript's `String.prototype.toLowerCase()` signature widens to plain
 * `string`, undoing the literal typing this whole function exists for).
 */
const PRICING_LINE_ANCHOR_IDS = {
  A: "linea-a",
  B: "linea-b",
  C: "linea-c",
  D: "linea-d",
} as const satisfies Record<ServiceLine, string>;

/**
 * The pricing page's per-service-line block anchor. See
 * `specs/service-catalog/spec.md`, "Line-to-Pricing Anchor Mapping" — each
 * Servicios card must deep-link to its own line's block on
 * `/[locale]/precios`, not the page's top. `app/[locale]/precios/page.tsx`
 * renders one block per line with the matching `id`. Same typing discipline
 * as `pricingPath()` above — no `as Route` cast needed at any call site.
 */
export function pricingLineAnchor(locale: Locale, line: ServiceLine) {
  return `${pricingPath(locale)}#${PRICING_LINE_ANCHOR_IDS[line]}` as const;
}

/**
 * A same-page anchor on the locale-prefixed landing (e.g. `/es#proyectos`).
 * Routing under `/[locale]` does not exist until PR 2c — until then, no
 * caller should render this without knowing the target route is not live
 * yet.
 */
export function landingAnchor(locale: Locale, id: string): string {
  return `/${locale}#${id}`;
}
