/**
 * Canonical URL helpers.
 *
 * Why this exists: `app/layout.tsx` used to declare
 * `alternates.canonical: "/es"`. Every route inherits root-layout metadata, so
 * that was correct while `/es` was the only page and silently became wrong the
 * moment `/es/precios` shipped — the pricing page then told search engines its
 * canonical version was the homepage, which is an instruction not to index it
 * as itself. That defeats the reason a pricing route exists (proposal §5:
 * "shareable, sent directly in DMs, SEO target").
 *
 * A canonical describes ONE page. It cannot live in a shared shell.
 *
 * Every route under `app/[locale]/` must export `generateMetadata` and set
 * `alternates.canonical` with `canonicalFor()`. A route that forgets emits no
 * canonical at all, and a search engine falls back to the request URL — the
 * right failure mode, since a missing canonical is recoverable and a wrong one
 * actively misdirects.
 *
 * Paths returned here are root-relative on purpose: `metadataBase` in the root
 * layout resolves them against `NEXT_PUBLIC_SITE_URL`, and a production build
 * fails outright if that variable is unset (`checkSiteUrlConfigured` in
 * `lib/content/invariants.ts`), so a canonical can never silently resolve
 * against localhost.
 */

import type { Locale } from "@/lib/content/locales";

/**
 * The canonical path for a page.
 *
 * @param locale  the active locale segment
 * @param segments further path segments below the locale, already
 *                 URL-safe — e.g. `canonicalFor("es", "precios")` yields
 *                 `/es/precios`, and `canonicalFor("es")` yields `/es`.
 */
export function canonicalFor(locale: Locale, ...segments: string[]): string {
  return segments.length === 0
    ? `/${locale}`
    : `/${locale}/${segments.join("/")}`;
}
