/**
 * Pure link-classification and path-building helpers.
 *
 * See `openspec/changes/dev-services-website/design.md` decisions D6, D9,
 * and task 2.16.
 */

import type { Locale } from "@/lib/content/locales";

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

/** The internal route for the pricing page (routing ships in PR 4). */
export function pricingPath(locale: Locale): string {
  return `/${locale}/precios`;
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
